import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';

const deleteProduct = catchAsyncRouteHandler(async (req, res) => {
  const { id } = req.params;

  new ApiSuccessResponse(res).deleted();
});

export default deleteProduct;
