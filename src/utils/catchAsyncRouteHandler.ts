import { Request, Response, NextFunction } from 'express';

function catchAsyncRouteHandler<ReqBody>(
  routeHandler: (
    req: Request<any, any, ReqBody>,
    res: Response
  ) => Promise<void>
) {
  const wrapper = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await routeHandler(req, res);
    } catch (err) {
      next(err);
    }
  };
  return wrapper;
}

export default catchAsyncRouteHandler;
