import * as ActionTypes from '../constants';

export function selectFilterSet(slug) {
  return {
    type: ActionTypes.SELECT_FILTER_SET,
    slug: slug
  }
}

export function closeFilterSet() {
  return {
    type: ActionTypes.CLOSE_FILTER_SET,
  }
}
