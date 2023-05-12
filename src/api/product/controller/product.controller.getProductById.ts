import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';
import { getProductById as getProductByIdModel } from '../model';

const getProductById = catchAsyncRouteHandler(async (req, res) => {
  const productId = req.params.id;
  const product = await getProductByIdModel(productId);
  ApiSuccessResponse.send(res, product);
});

export default getProductById;
