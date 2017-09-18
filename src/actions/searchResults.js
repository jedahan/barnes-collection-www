import * as ActionTypes from '../constants';

export const setLastIndex = (lastIndex) => {
  return {
    type: ActionTypes.SEARCH_SET_LAST_INDEX,
    lastIndex: lastIndex
  };
}

export const setMaxHits = (maxHits) => {
  return {
    type: ActionTypes.SEARCH_SET_MAX_HITS,
    maxHits: maxHits
  };
}

export const setIsPending = (isPending) => {
  return {
    type: ActionTypes.SEARCH_SET_IS_PENDING,
    isPending: isPending
  };
}
