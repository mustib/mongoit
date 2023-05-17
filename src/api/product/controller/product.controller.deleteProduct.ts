import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';
import { deleteProduct as deleteProductModel } from '../model';

const deleteProduct = catchAsyncRouteHandler(async (req, res) => {
  const { id } = req.params;
  await deleteProductModel(id);
  new ApiSuccessResponse(res).deleted();
});

export default deleteProduct;
