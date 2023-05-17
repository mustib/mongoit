import { ObjectId } from 'mongodb';
import getProductsCollection from './product.model.getCollection';

async function deleteProduct(id: string) {
  const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;

  const product = await getProductsCollection().deleteOne({
    _id: _id as ObjectId,
  });

  return product;
}

export default deleteProduct;
