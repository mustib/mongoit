import { getDB } from '../../../config';

function getProductsCollection() {
  return getDB().collection('products');
}

export default getProductsCollection;
