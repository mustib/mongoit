import { Response } from 'express';
import ApiResponse from './APIResponse';

class ApiSuccessResponse extends ApiResponse {
  protected message?: string;

  constructor(res: Response) {
    super(res, 200, 'success');
  }

  static send(
    res: Response,
    data?: UntypedObject | UntypedObject[] | null,
    message?: string
  ) {
    const response = new ApiSuccessResponse(res);
    if (typeof data !== 'undefined') response.setData(data);
    if (typeof message !== 'undefined') response.setMessage(message);
    return response.send();
  }

  created() {
    this.statusCode = 201;
    return this.send();
  }

  deleted() {
    this.setStatusMessage('Deleted');
    return this.noContent();
  }

  noContent() {
    this.statusCode = 204;
    return this.send();
  }

  setData(data: UntypedObject | UntypedObject[] | null) {
    this.addToResBody({ data });
    return this;
  }
}
export default ApiSuccessResponse;
