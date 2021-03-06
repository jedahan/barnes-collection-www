import bodybuilder from 'bodybuilder';
import { BARNES_SETTINGS } from './barnesSettings';
import { META_TITLE, META_DESCRIPTION } from './constants';
export const getArtObjectUrlFromId = (objectId, slug) => {
  slug = slug || '';

  return `/objects/${objectId}/${slug}`;
}

export const getMetaTagsFromObject = (object) => {
  const artistOrCulture = object.culture || object.people;
  const metaTitle = `${META_TITLE} — ${artistOrCulture}: ${object.title}`;
  const metaImage = object.imageUrlSmall;
  const metaDescription = `Barnes Foundation Collection: ${artistOrCulture}. ${object.title} -- ${META_DESCRIPTION}`;

  if (!object || !object.id) {
    return null;
  }

  return {
    title: metaTitle,
    image: metaImage,
    description: metaDescription,
  };
}

export const getObjectRequestBody = (object) => {
  let body = bodybuilder()
    .filter('exists', 'imageSecret')
    .from(0).size(25);

  return body;
}

export const getObjectsRequestBody = (fromIndex=0) => {
  let body = bodybuilder()
    .sort('_score', 'desc')
    .filter('exists', 'imageSecret')
    .from(fromIndex).size(BARNES_SETTINGS.size);
  return body;
}
