import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';
import { updateProduct as updateProductModel } from '../model';

const updateProduct = catchAsyncRouteHandler(async (req, res) => {
  const { id } = req.params;
  const data = await updateProductModel(id, req.body);
  new ApiSuccessResponse(res)
    .setData(data)
    .setMessage('product has been updated successfully')
    .send();
});

export default updateProduct;
