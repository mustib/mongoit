import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';
import productModel from '../productModel';

import type { ProductSchema } from '../productTypes';

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
