import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';
import productModel from '../product.model';

const getProductById = catchAsyncRouteHandler(async (req, res) => {
  const productId = req.params.id;

  const product = await productModel.findById(productId);

  ApiSuccessResponse.send(res, product);
});

export default getProductById;
