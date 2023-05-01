import { addProduct as addProductModel } from '../model';
import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';

const addProduct = catchAsyncRouteHandler(async (req, res) => {
  const product = req.body; // TODO: SHOULD FILTER PRODUCT PROPERTIES FROM REQUEST

  await addProductModel(product);

  new ApiSuccessResponse(res)
    .setMessage('Product has been added successfully')
    .send();
});

export default addProduct;
