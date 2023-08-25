import ApiResponse from './APIResponse';
import type { Response } from 'express';

class ApiFailResponse extends ApiResponse {
  protected message?: string | undefined;

  constructor(res: Response) {
    super(res, 400, 'fail');
  }

  notFound() {
    this.statusCode = 404;
    this.send();
  }
}

export default ApiFailResponse;
