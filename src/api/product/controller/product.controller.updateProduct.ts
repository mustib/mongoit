import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';

const updateProduct = catchAsyncRouteHandler(async (req, res) => {
  const { id } = req.params;

  new ApiSuccessResponse(res)
    .setMessage('product has been updated successfully')
    .send();
});

export default updateProduct;
