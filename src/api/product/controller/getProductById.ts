import {
  ApiFailResponse,
  ApiSuccessResponse,
  catchAsyncRouteHandler,
} from '../../../utils/index.js';
import productModel from '../productModel.js';

const getProductById = catchAsyncRouteHandler(async (req, res) => {
  const productId = req.params.id;

  const product = await productModel.findById(productId);

  if (product === null) {
    new ApiFailResponse(res).setMessage("product hasn't been found").notFound();
    return;
  }

  ApiSuccessResponse.send(res, product);
});

export default getProductById;
