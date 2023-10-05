import {
  ApiFailResponse,
  ApiSuccessResponse,
  catchAsyncRouteHandler,
} from '../../../utils/index.js';

import productModel, {
  type ProductSearchQuery,
  type ProductSchema,
} from '../productModel.js';

import type {
  FilterQueryObject,
  SortQueryObject,
} from '../../../utils/db/MongoDb/types/FilterQueryObject.js';

const getProducts = catchAsyncRouteHandler<ProductSchema, ProductSearchQuery>(
  async (req, res) => {
    const productFilter: FilterQueryObject<ProductSearchQuery> = {
      allowedTargetKeys: ['price', 'stockQ: stockQuantity'],
      target: req.sanitizeMongo.query,
      allowedOperators: ['gt', 'lt', 'gte', 'lte'],
    };

    const productSort: SortQueryObject<ProductSearchQuery> = {
      target: req.query.sort,
      allowedTargetKeys: ['price'],
    };

    const {
      allResultsCount,
      documents,
      currentResultsCount,
      pageNumber,
      remainingResults,
      resultsPerPage,
      numberOfPages,
    } = await productModel
      .find()
      .filter(productFilter)
      .sort(productSort)
      .toPage(req.query.page, req.query.resPerPage)
      .exec();

    if (pageNumber > numberOfPages && currentResultsCount > 0) {
      new ApiFailResponse(res).setMessage('product page not found').notFound();
      return;
    }

    new ApiSuccessResponse(res)
      .setData(documents)
      .addToResBody({
        currentResultsCount,
        allResultsCount,
        pageNumber,
        remainingResults,
        resultsPerPage,
        numberOfPages,
      })
      .send();
  }
);

export default getProducts;
