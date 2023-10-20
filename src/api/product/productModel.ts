import path from 'path';

import { existsSync, mkdirSync } from 'fs';

import sharp from 'sharp';

import { envVars } from '../../config/index.js';

import { MongoDb } from '../../utils/index.js';

const mongoDb = MongoDb.getMongoDb('main');

const productCollection = mongoDb.getCollection<ProductSchema>('products');

export type ProductSchema = {
  _id: 'id';
  name: string;
  price: number;
  description: string;
  image?: 'image';
  stockQuantity?: number;
};

export type ProductSearchQuery = {
  price: number;
  stockQ: number; // stockQuantity
  page: number;
  resPerPage: number; // resultsPerPage
  sort: string;
};

productCollection.createSchema({
  _id: 'id',
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
  image: {
    type: 'image',
    fileName: 'mainImage.webp',
    maxSize: {
      value: 256 * 1024, // 256 bytes
      message(value, validatorValue) {
        return `maximum size for product image is ${
          validatorValue / 1024
        } bytes`;
      },
    },
    extensions: {
      value: ['jpg', 'png', 'webp', 'gif', 'avif', 'tif'],
      message(value, validatorValue) {
        return `${
          value.ext
        } images are not supported only (${validatorValue.join(
          ', '
        )}) are supported`;
      },
    },
    saveSignal: {
      afterInsert(data) {
        const filePath = path.join(
          envVars.PRODUCTS_STATIC_PATH,
          data.validated._id.toString()
        );

        if (!existsSync(filePath)) {
          mkdirSync(filePath, { recursive: true });
        }

        return sharp(data.buffer)
          .resize(500, 500)
          .webp({ quality: 100 })
          .toFile(path.join(filePath, data.fileName));
      },
    },
  },
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
