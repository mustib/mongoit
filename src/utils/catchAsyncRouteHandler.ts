import { Request, Response, NextFunction } from 'express';

function catchAsyncRouteHandler<ReqBody = any, ReqQuery = any>(
  routeHandler: (
    req: Request<any, any, ReqBody, ReqQuery>,
    res: Response
  ) => Promise<void>
) {
  const wrapper = async (
    req: Parameters<typeof routeHandler>[0],
    res: Response,
    next: NextFunction
  ) => {
    try {
      await routeHandler(req, res);
    } catch (err) {
      next(err);
    }
  };
  return wrapper;
}

export default catchAsyncRouteHandler;
