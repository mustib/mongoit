import getProductSCollection from './product.model.getCollection';

async function addProduct(productData: Document) {
  const product = await getProductSCollection().insertOne(productData);
  return product;
}

export default addProduct;
