import { Response } from 'express';

abstract class ApiResponse {
  protected abstract message?: string;

  private injectedResponseBody: UntypedObject = {};

  addToResBody(data: UntypedObject) {
    Object.assign(this.injectedResponseBody, data);
    return this;
  }

  constructor(
    protected res: Response,
    protected statusCode: number,
    protected status: string
  ) {}

  protected setStatusMessage(statusMessage: string) {
    this.res.statusMessage = statusMessage;
  }

  setMessage(message: string) {
    this.message = message;
    return this;
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
