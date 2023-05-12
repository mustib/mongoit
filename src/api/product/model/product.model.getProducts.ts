import getProductsCollection from './product.model.getCollection';

async function getProducts() {
  return getProductsCollection().find().toArray();
}

export default getProducts;
