abstract class AbstractAppError extends Error {
  abstract length: number;

  abstract push(...args: any[]): void;

  abstract toString(indentation?: number): string;

  throw(stackTraceConstructor?: Func) {
    Error.captureStackTrace(this, stackTraceConstructor ?? this.throw);

    this.message = this.toString();

    throw this;
  }

  end(stackTraceConstructor?: Func) {
    if (this.length > 0) this.throw(stackTraceConstructor ?? this.end);
  }
}

export default AbstractAppError;
