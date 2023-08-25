import { MongoDb } from '../../utils';

export type ProductSchema = {
  name: string;
  price: number;
  description: string;
  image: string;
  stockQuantity: number;
};

const mongoDb = MongoDb.getMongoDb('main');
const productCollection = mongoDb.getCollection<ProductSchema>('products');

productCollection.setConfigOptions({
  insertOneOptions: { returnInserted: true },
});

productCollection.createSchema({
  name: {
    type: 'string',
    required: [true, 'Product name is a required field'],
    validator: {
      value(value) {
        return /^[A-z ]{5,}$/.test(value.replace(/  +/g, ' '));
      },
      message() {
        return 'Product name must be at least 5 characters containing only English alphabets and spaces';
      },
    },
  },
  description: {
    type: 'string',
    required: [true, 'Product description is a required field'],
    validator: {
      value(value) {
        return value.replace(/  +/g, ' ').length >= 25;
      },
      message() {
        return 'Product description must be at least 25 characters long';
      },
    },
  },
  image: 'string',
  price: {
    type: 'number',
    required: [true, 'Product price is a required field'],
    validator: {
      value(value) {
        return value > 0;
      },
      message(value) {
        return `Product price must be a positive number but instead got ${value}`;
      },
    },
  },
  stockQuantity: {
    type: 'number',
    default: 0,
  },
});

const productModel = productCollection;

export default productModel;
