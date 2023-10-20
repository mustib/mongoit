import { MongoSchemaDocument } from '../../../utils/db/MongoDb/MongoDbSchema/types/MongoDBSchema.js';

import {
  ApiSuccessResponse,
  catchAsyncRouteHandler,
} from '../../../utils/index.js';

import productModel, { type ProductSchema } from '../productModel.js';

const addProduct = catchAsyncRouteHandler<MongoSchemaDocument<ProductSchema>>(
  async (req, res) => {
    const productObj = {
      name: req.body.name,
      price: req.body.price,
      description: req.body.description,
      stockQuantity: req.body.stockQuantity,
      image: req.file?.buffer,
    };

    const product = await productModel.insertOne(productObj).exec();

    new ApiSuccessResponse(res)
      .setMessage('Product has been added successfully')
      .setData(product)
      .send();
  }
);

export default addProduct;
