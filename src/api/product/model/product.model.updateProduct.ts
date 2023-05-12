import { Document, ObjectId } from 'mongodb';
import getProductsCollection from './product.model.getCollection';

async function updateProduct(id: string, data: Document) {
  const _id = ObjectId.isValid(id) ? new ObjectId(id) : id;
  const result = await getProductsCollection().findOneAndUpdate(
    { _id: _id as ObjectId },
    { $set: data },
    { returnDocument: 'after' }
  );
  return result.value;
}

export default updateProduct;
