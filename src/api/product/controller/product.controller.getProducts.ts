import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';
import { getProducts as getProductsModel } from '../model';

const getProducts = catchAsyncRouteHandler(async (req, res) => {
  const products = await getProductsModel();
  ApiSuccessResponse.send(res, products);
});

export default getProducts;
