import axios from 'axios';
import bodybuilder from 'bodybuilder';
import * as ActionTypes from '../constants';

const buildRequestBody = () => {
  let body = bodybuilder()
    .filter('exists', 'imageSecret')
    .from(0).size(25);

  return body;
}

const fetchResults = (body, dispatch) => {
  axios.get('/api/search', {
    params: {
      body: body,
    }
  }).then((response) => {
    console.log(response.data);
    const objects = response.data.hits.hits.map(object => Object.assign({}, object._source, { id: object._id }));
    dispatch(setObjects(objects));
  });
}

const setObjects = (objects) => {
  return {
    type: ActionTypes.SET_OBJECTS,
    payload: objects
  };
}

export const getAllObjects = () => {
  const body = buildRequestBody().build();
  return (dispatch) => {
    fetchResults(body, dispatch);
  }
};

export const findFilteredObjects = (filters) => {
  return (dispatch) => {
    if (filters.length === 0) {
      return getAllObjects()(dispatch);
    }

    let body = buildRequestBody();
    for (let i = 0; i < filters.length; i++) {
      const filter = filters[i];
      switch (filter.method) {
        case 'query':
          body = body.query(filter.type, filter.field, filter.term);
          break;
        default:
          break;
      }
    }
    body = body.build();
    fetchResults(body, dispatch);
  }
}

const multiMatch = (body, term) => {
  const fields = [
    'people^3',
    'culture^3',
    'title^3',
    'medium^3',
    'invno',
    'shortDescription^2',
    'longDescription^2',
    'visualDescription^2',
    'exhHistory',
    'bibliography',
    'provenance',
    'copyright',
    'period',
    // 'displayDate',
    // 'dimexnsions',
    // 'locations',
  ];
  body = body.query('multi_match', {
    'query': term,
    'fields': fields
  });
  return body;
}

export const searchObjects = (term) => {
  return (dispatch) => {
    if (term.length === 0) {
      return getAllObjects()(dispatch);
    }

    let body = buildRequestBody();
    body = multiMatch(body, term);
    // body = body.query('match', '_all', term);
    body = body.build();

    fetchResults(body, dispatch);
  }
}
