import { combineReducers } from 'redux';
import objects from './reducers/objects';
import relatedObjects from './reducers/relatedObjects';
import ensembleObjects from './reducers/ensembleObjects';
import object from './reducers/object';
import filterSets from './reducers/filterSets';
import mobileFilters from './reducers/mobileFilters';
import filters from './reducers/filters';
import search from './reducers/search';
import htmlClassManager from './reducers/htmlClassManager';
import prints from './reducers/prints';
import modal from './reducers/modal';
import objectsQuery from './reducers/objectsQuery';
import relatedObjectsQuery from './reducers/relatedObjectsQuery';
import ensembleObjectsQuery from './reducers/ensembleObjectsQuery';

export default combineReducers({
  object,
  objects,
  relatedObjects,
  ensembleObjects,
  filterSets,
  mobileFilters,
  filters,
  search,
  htmlClassManager,
  prints,
  modal,
  objectsQuery,
  relatedObjectsQuery,
  ensembleObjectsQuery,
});
