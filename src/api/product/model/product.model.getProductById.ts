import { ObjectId } from 'mongodb';
import getProductsCollection from './product.model.getCollection';

async function getProductById(productId: string) {
  const id = ObjectId.isValid(productId)
    ? new ObjectId(productId)
    : (productId as unknown as ObjectId);

  return getProductsCollection().findOne({
    _id: id,
  });
}

export default getProductById;
