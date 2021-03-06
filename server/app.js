const express = require('express')
const bodybuilder = require('bodybuilder')
const morgan = require('morgan')
const path = require('path')
const elasticsearch = require('elasticsearch')
const auth = require('http-auth')
const AWS = require('aws-sdk')
const s3 = new AWS.S3()
const request = require('request')
const bodyParser = require('body-parser')
const fs = require('fs')
const htpasswdFilePath = path.resolve(__dirname, '../.htpasswd')
const prerendercloud = require('prerendercloud')
const axios = require('axios')

// using this instead of ejs to template from the express routes after we fetch object data.
// because the webpack compiler is already using ejs.
const Handlebars = require('handlebars')
const canonicalRoot = process.env.REACT_APP_CANONICAL_ROOT || '/'

// todo #switchImportToRequire - consolidate with constants (can't use import yet.)
const META_TITLE = process.env.REACT_APP_META_TITLE || 'Barnes Collection Online'
const META_PLACENAME = process.env.REACT_APP_META_PLACENAME || ''
const META_DESCRIPTION = process.env.REACT_APP_META_DESCRIPTION || ''
const META_IMAGE = process.env.REACT_APP_META_IMAGE || ''

const clamp = (num, min, max) => Math.max(min, Math.min(max, num))

// todo #switchImportToRequire - consolidate with src/objectDataUtils.js
const generateObjectImageUrls = (object) => {
  const AWS_BUCKET = process.env.REACT_APP_AWS_BUCKET
  const IMAGES_PREFIX = process.env.REACT_APP_IMAGES_PREFIX

  if (!object) {
    return {}
  }

  if (!object.imageSecret) {
    return object
  }

  const awsUrlWithoutProt = `s3.amazonaws.com/${AWS_BUCKET}/${IMAGES_PREFIX}`
  const awsUrl = `https://${awsUrlWithoutProt}`
  const newObject = Object.assign({}, object)

  newObject.imageUrlSmall = `${awsUrl}/${object.id}_${object.imageSecret}_n.jpg`
  newObject.imageUrlOriginal = `${awsUrl}/${object.id}_${object.imageOriginalSecret}_o.jpg`
  newObject.imageUrlForWufoo = `${awsUrlWithoutProt}/${object.id}_${object.imageOriginalSecret}`
  newObject.imageUrlLarge = `${awsUrl}/${object.id}_${object.imageSecret}_b.jpg`

  return newObject
}

const getIndexHtmlPromise = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, '..', 'build', 'index.html'), 'utf8', (err, data) => {
      err ? reject(err) : resolve(data)
    })
  })
}

const BARNES_SETTINGS = {
  size: 50
}

const ALL_MORE_LIKE_THIS_FIELDS = [
  'tags.tag.*',
  'tags.category.*',
  'color.palette-color-*',
  'color.average-*',
  'color.palette-closest-*',
  'title.*',
  'people.*',
  'people',
  'medium.*',
  'shortDescription.*',
  'longDescription.*',
  'visualDescription.*',
  'culture.*',
  'space',
  'light_desc_*',
  'color_desc_*',
  'comp_desc_*',
  'generic_desc_*',
  'period',
  'curvy',
  'vertical',
  'diagonal',
  'horizontal',
  'light'
]

const MORE_LIKE_THIS_FIELDS = [
  'people',
  'generic_desc_*',
  'curvy',
  'vertical',
  'diagonal',
  'horizontal',
  'light',
  'line'
]

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
})

const signedUrlExpireSeconds = 60 * 5

const app = express()
const esClient = new elasticsearch.Client({
  host: [
    {
      host: process.env.ELASTICSEARCH_HOST,
      auth: `${process.env.ELASTICSEARCH_USERNAME}:${process.env.ELASTICSEARCH_PASSWORD}`,
      protocol: process.env.ELASTICSEARCH_PROTOCOL,
      port: process.env.ELASTICSEARCH_PORT
    }
  ]
})

// Setup logger
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// redirect http to https
if (process.env.NODE_ENV === 'production') {
  app.enable('trust proxy')
  app.use(function (req, res, next) {
    if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'].toLowerCase() === 'http') {
      return res.redirect('https://' + req.headers.host + req.url)
    }
    return next()
  })
}

app.get('/health', (req, res) => {
  res.json({ success: true })
})

// if in production, and .htpasswd file exists, set up authentication
if (process.env.NODE_ENV === 'production' && fs.existsSync(htpasswdFilePath)) {
  const basic = auth.basic({
    file: htpasswdFilePath
  })
  app.use(auth.connect(basic))
}

if (process.env.NODE_ENV === 'production' && process.env.PRERENDER_TOKEN) {
  prerendercloud.set('prerenderToken', process.env.PRERENDER_TOKEN)
  app.use(prerendercloud)
}

// Serve static assets
// let index fall through to the wild card route
app.use(express.static(path.resolve(__dirname, '..', 'build'), { index: false }))

app.get('/api/objects/:object_id', (req, res) => {
  const options = {
    index: process.env.ELASTICSEARCH_INDEX,
    type: 'object',
    id: req.params.object_id
  }
  esClient.get(options, function (error, esRes) {
    if (error) {
      console.error(`[error] esClient: ${error.message}`)
      res.json(error)
    } else {
      res.json(esRes._source)
    }
  })
})

app.get('/api/search', (req, res) => {
  esClient.search({
    index: process.env.ELASTICSEARCH_INDEX,
    body: req.query.body
  }, function (error, esRes) {
    if (error) {
      res.json(error)
    } else {
      res.json(esRes)
    }
  })
})

function getObjectDescriptors (objectID) {
  let body = bodybuilder()
    .filter('exists', 'imageSecret')
    .from(0).size(1)
    .query('match', '_id', objectID)
    .rawOption('_source', MORE_LIKE_THIS_FIELDS)
    .build()

  return axios
    .get(`${canonicalRoot}/api/search`, { params: { body } })
    .then(response => {
      const hits = response.data.hits.hits
      const hitSource = hits.length ? hits[0]._source : {}

      return hitSource
    })
    .catch((error) => {
      console.error(`[error] getObjectDescriptors:`, error.message)
    })
}

function getRelatedObjects (objectID) {
  let body = bodybuilder()
    .filter('exists', 'imageSecret')
    .from(0).size(1000)
    .query('more_like_this', {
      'like': [
        {
          '_index': process.env.ELASTICSEARCH_INDEX,
          '_type': 'object',
          '_id': objectID
        }
      ],
      'fields': ALL_MORE_LIKE_THIS_FIELDS,
      'min_term_freq': 1,
      'minimum_should_match': '10%'
    })
    .build()

  return axios
    .get(`${canonicalRoot}/api/search`, { params: { body } })
    .then(response => response.data.hits.hits)
    .catch((error) => console.error(error.message))
}

const getDistance = (from, to) => {
  const fromKeys = Object.keys(from)
  const toKeys = Object.keys(to)
  const commonKeys = fromKeys.filter(key => toKeys.includes(key))

  const descriptorKeys = MORE_LIKE_THIS_FIELDS.map((field) => {
    if (field.match(/(.*)[_-]\*$/)) {
      return field.slice(0, field.length - 1)
    } else if (field.match(/(.*)[\.]\*$/)) {
      return field.slice(0, field.length - 2)
    }
    return field
  })

  const distanceKeys = descriptorKeys.filter(descriptorKey => commonKeys.some(commonKey => commonKey.indexOf(descriptorKey) === 0))

  const distance = distanceKeys.reduce((sum, key) => {
    let absoluteDistance = 0
    switch(key) {
      case 'people': absoluteDistance = from[key] === to[key] ? 0 : 100; break;
      default: absoluteDistance = parseFloat(to[key]) - parseFloat(from[key]); break;
    }
    return sum + Math.pow(absoluteDistance, 2)
  }, 0)

  return distanceKeys.length > 0 ? distance / distanceKeys.length : Infinity
}

app.get('/api/related', (req, res) => {
  const {objectID, dissimilarPercent} = req.query
  const similarPercent = 100 - clamp(dissimilarPercent, 0, 100)
  const similarRatio = similarPercent / 100.0

  axios
    .all([getObjectDescriptors(objectID), getRelatedObjects(objectID)])
    .then(axios.spread((objectDescriptors, relatedObjects) => {
      const sources = relatedObjects.map(object => object._source)

      const sorted = sources.sort((a, b) => getDistance(a, objectDescriptors) - getDistance(b, objectDescriptors))

      const maxSize = Math.min(BARNES_SETTINGS.size, sorted.length)

      const similarItemCount = Math.floor(maxSize * similarRatio)

      const similarItems = sorted.slice(0, similarItemCount)

      const dissimilarItems = sorted.slice(-(maxSize - similarItemCount))

      const objects = similarItems.concat(dissimilarItems).map(object => ({
        _index: process.env.ELASTICSEARCH_INDEX,
        _type: 'object',
        _id: object.id,
        _source: object})
      )

      res.json({hits: {
        total: objects.length,
        hits: objects
      }})
    }))
    .catch((error) => {
      console.error(`[error] axios.all: ${error.message}`)
      res.json(error.message)
    })
})

const getSignedUrl = (invno) => {
  const url = s3.getSignedUrl('getObject', {
    Bucket: process.env.AWS_BUCKET,
    Key: `assets/${invno}.jpg`,
    Expires: signedUrlExpireSeconds
  })
  return url
}

app.post('/api/objects/:object_invno/download', (req, res) => {
  const field = req.body.field
  request({
    uri: `https://${process.env.WUFOO_SUBDOMAIN}.wufoo.com/api/v3/forms/${process.env.WUFOO_DOWNLOAD_FORM}/entries.json`,
    method: 'POST',
    auth: {
      username: process.env.WUFOO_USERNAME,
      password: process.env.WUFOO_PASSWORD,
      sendImmediately: false
    },
    form: {
      'Field1': field,
      'Field3': req.params.object_invno
    }
  }, (err, response, body) => {
    const parsedBody = JSON.parse(body)
    if (parsedBody.Success === 1) {
      res.json({url: getSignedUrl(req.params.object_invno)})
    } else {
      res.status(500).json({success: false})
    }
  })
})

// todo #switchImportToRequire - temp copy, move this / consolidate
const getObject = (id) => {
  let body = bodybuilder()
    .filter('exists', 'imageSecret')
    .from(0).size(25)

  body = body.query('match', '_id', id).build()

  return axios.get(`${canonicalRoot}/api/search`, {
    params: {
      body: body
    }
  }).then((response) => {
    const objects = response.data.hits.hits.map(object => Object.assign({}, object._source, { id: object._id }))
    const object = objects.find(object => {
      return parseInt(object.id, 10) === parseInt(id, 10)
    })

    return object
  })
}

const renderAppObjectPage = (req, res, next) => {
  const objectId = req.params.id
  const htmlFilePromise = getIndexHtmlPromise()

  return getObject(objectId).then((objectData) => {
    const canonicalUrl = canonicalRoot + req.originalUrl

    if (!objectData.id) {
      throw `bad object Id in url: ${objectId}`
    }

    objectData = generateObjectImageUrls(objectData)

    htmlFilePromise.then(htmlFileContent => {
      const template = Handlebars.compile(htmlFileContent)

      const artistOrCulture = objectData.culture || objectData.people;
      const metaTitle = `${META_TITLE} — ${artistOrCulture}: ${objectData.title}`;
      const metaImage = objectData.imageUrlSmall;
      const metaDescription = `Barnes Foundation Collection: ${artistOrCulture}. ${objectData.title} -- ${META_DESCRIPTION}`;

      const html = template({
        metaCanonical: canonicalUrl,
        metaDescription: metaDescription,
        metaPlacename: META_PLACENAME,
        metaImage: metaImage,
        metaTitle: metaTitle,
      })

      res.send(html)
    }).catch(next)
  }).catch((error) => {
    res.status(404).send('Page does not exist!')
  })
}

const renderAppLandingPage = (req, res, next) => {
  const htmlFilePromise = getIndexHtmlPromise()
  const canonicalUrl = canonicalRoot + '/'

  htmlFilePromise.then(htmlFileContent => {
    const template = Handlebars.compile(htmlFileContent)

    const html = template({
      metaCanonical: canonicalUrl,
      metaDescription: META_DESCRIPTION,
      metaPlacename: META_PLACENAME,
      metaImage: META_IMAGE,
      metaTitle: META_TITLE
    })

    res.send(html)
  }).catch(next)
}

app.get('/', (req, res, next) => {
  renderAppLandingPage(req, res, next)
})

app.get('/objects/:id', (req, res, next) => {
  if (!req.url.endsWith('/')) {
    return res.redirect(301, req.url + '/')
  }

  renderAppObjectPage(req, res, next)
})

app.get('/objects/:id/:panel', (req, res, next) => {
  renderAppObjectPage(req, res, next)
})

app.use(function (req, res) {
  res.status(404).send('Error 404: Page not Found')
})

app.use(function (error, req, res, next) {
  res.status(500).send('Error 500: Sorry, something went wrong.')
})

module.exports = app
