import { Request, Response, NextFunction } from 'express';

function catchAsyncRouteHandler<ReqBody = any, ReqQuery = any>(
  routeHandler: (
    req: Request<any, any, ReqBody, ReqQuery>,
    res: Response,
    next: NextFunction
  ) => Promise<void>
) {
  const wrapper = async (
    req: Parameters<typeof routeHandler>[0],
    res: Response,
    next: NextFunction
  ) => {
    try {
      await routeHandler(req, res, next);
    } catch (err) {
      next(err);
    }
  };
  return wrapper;
}

export default catchAsyncRouteHandler;
