import {
  ApiFailResponse,
  ApiSuccessResponse,
  catchAsyncRouteHandler,
} from '../../../utils';

import productModel from '../productModel';

const deleteProductById = catchAsyncRouteHandler(async (req, res) => {
  const { id } = req.params;

  const { deletedCount } = await productModel.deleteById(id);

  if (deletedCount > 0) {
    new ApiSuccessResponse(res).deleted() as never;
    return;
  }

  new ApiFailResponse(res).setMessage('Product has not found').notFound();
});

export default deleteProductById;