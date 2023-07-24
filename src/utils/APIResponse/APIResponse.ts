import { Response } from 'express';

abstract class ApiResponse {
  protected abstract message?: string;

  protected injectedResponseBody: UntypedObject = {};

  constructor(
    protected res: Response,
    protected statusCode: number,
    protected status: string
  ) {}

  protected setStatusMessage(statusMessage: string) {
    this.res.statusMessage = statusMessage;
  }

  send() {
    const responseBody: UntypedObject = {
      ...this.injectedResponseBody,
      status: this.status,
    };

    if (typeof this.message === 'string') responseBody.message = this.message;

    this.res.status(this.statusCode).json(responseBody);
  }
}

export default ApiResponse;
