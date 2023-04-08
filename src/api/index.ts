import { Router, Request, Response } from 'express';

const router = Router();

function demoAPIResponseHandler(req: Request, res: Response) {
  const { method } = req;
  res.send(`Your ${method} Request Has Been Successfully Received ✔`);
}

router.use('*', demoAPIResponseHandler);

export default router;
