import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';

const addProduct = catchAsyncRouteHandler(async (req, res) => {
  new ApiSuccessResponse(res)
    .setMessage('Product has been added successfully')
    .send();
});

export default addProduct;
