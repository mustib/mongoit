import { Request, Response, NextFunction } from 'express';

function catchAsyncRouteHandler(
  routeHandler: (req: Request, res: Response) => Promise<void>
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
