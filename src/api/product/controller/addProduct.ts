import {
  ApiSuccessResponse,
  catchAsyncRouteHandler,
} from '../../../utils/index.js';

import productModel, { type ProductSchema } from '../productModel.js';

const addProduct = catchAsyncRouteHandler<ProductSchema>(async (req, res) => {
  const productObj = req.sanitizeMongo.body.get([
    'name',
    'price',
    'description',
    'image',
    'stockQuantity',
  ]);

  const product = await productModel.insertOne(productObj).exec();

  new ApiSuccessResponse(res)
    .setMessage('Product has been added successfully')
    .setData(product)
    .send();
});

export default addProduct;
