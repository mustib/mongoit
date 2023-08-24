import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';

const getProducts = catchAsyncRouteHandler(async (req, res) => {
  ApiSuccessResponse.send(res);
});

export default getProducts;
