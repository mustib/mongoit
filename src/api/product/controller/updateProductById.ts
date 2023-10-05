import {
  ApiFailResponse,
  ApiSuccessResponse,
  catchAsyncRouteHandler,
} from '../../../utils/index.js';
import productModel, { type ProductSchema } from '../productModel.js';

const updateProductById = catchAsyncRouteHandler<ProductSchema>(
  async (req, res) => {
    const { id } = req.params;

    const updateDocument = req.sanitizeMongo.body.get([
      'price',
      'name',
      'description',
    ]);

    const { matchedCount, modifiedCount } = await productModel.updateById(id, {
      _useFieldsFromSchema: updateDocument,
    });

    if (matchedCount === 0) {
      new ApiFailResponse(res).setMessage('product not found').notFound();
      return;
    }

    const updateMessage = 'product has been updated successfully';
    const notUpdateMessage = 'product found but nothing has updated';

    new ApiSuccessResponse(res)
      .setMessage(modifiedCount > 0 ? updateMessage : notUpdateMessage)
      .send();
  }
);

export default updateProductById;
