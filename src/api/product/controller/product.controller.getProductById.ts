import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';

const getProductById = catchAsyncRouteHandler(async (req, res) => {
  const productId = req.params.id;

  ApiSuccessResponse.send(res);
});

export default getProductById;
