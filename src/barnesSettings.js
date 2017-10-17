const OBJECT_SET_SIZE = 50

export const BARNES_SETTINGS = {
  min2D: Math.floor(OBJECT_SET_SIZE * 0.4),
  minMetalworks: Math.floor(OBJECT_SET_SIZE * 0.3),
  min3D: Math.floor(OBJECT_SET_SIZE * 0.2),
  minKnickKnacks: Math.floor(OBJECT_SET_SIZE * 0.1),
  terms2D: ['Architecture', 'Paintings', 'Drawings', 'Works on Paper', 'Prints', 'Enamels', 'Manuscripts', 'Photographs'],
  termsMetalworks: ['Metalworks'],
  terms3D: ['Sculptures', 'Furniture', 'Timepieces'],
  termsKnickKnacks: ['Flatware', 'Jewelry', 'Lighting Devices', 'Textiles', 'Tools and Equipment', 'Vessels'],
  size: OBJECT_SET_SIZE,
  line_threshhold: 0.7,
  broken_threshhold: 0.5,
  objectsTemplate: {
    twoD: [],
    metalworks: [],
    threeD: [],
    knickknacks: []
  }
}

export const SEARCH_FIELDS = [
  'tags.tag.*',
  'tags.category.*',
  'people.*',
  'culture.*',
  'title.*',
  'invno',
  'medium.*',
  'period',
  'shortDescription.*',
  'longDescription.*',
  'visualDescription.*',
  'exhHistory.*',
  'bibliography.*'
]

export const MORE_LIKE_THIS_FIELDS = [
  'tags.tag.*',
  'tags.category.*',
  'color.palette-color-*',
  'color.average-*',
  'color.palette-closest-*',
  'title.*',
  'people.*',
  'medium.*',
  'shortDescription.*',
  'longDescription.*',
  'visualDescription.*',
  'period',
  'culture.*',
  'curvy',
  'vertical',
  'diagonal',
  'horizontal',
  'light',
  'line',
  'space',
  'light_desc_*',
  'color_desc_*',
  'comp_desc_*',
  'generic_desc_*'
]
