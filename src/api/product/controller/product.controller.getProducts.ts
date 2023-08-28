import { ApiSuccessResponse, catchAsyncRouteHandler } from '../../../utils';
import productModel from '../product.model';

import type { ProductSearchQuery, ProductSchema } from '../product.types';
import type {
  FilterQueryObject,
  SortQueryObject,
} from '../../../utils/db/MongoDb/types/FilterQueryObject';

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

    let allResults!: number;

    const products = await productModel
      .find(
        {},
        {
          countDocuments(count: number) {
            allResults = count;
          },
        }
      )
      .filter(productFilter)
      .sort(productSort)
      .toPage(req.query.page, req.query.resPerPage)
      .exec();

    new ApiSuccessResponse(res)
      .setData(products)
      .addToResBody({ results: products.length, allResults })
      .send();
  }
);

export default getProducts;
