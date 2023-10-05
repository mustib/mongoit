import getTypeof from '../getTypeof.js';
import AbstractAppError from './AbstractAppError.js';
import AppError from './AppError.js';
import type { AppErrorTypes } from './AppErrorTypes.js';

class AppErrorRoot extends AbstractAppError {
  length = 0;

  errors: Record<string, AppError> = {};

  static aggregate(
    aggregateFunc: (tryCatch: AppErrorRoot['tryCatch']) => void | never
  ) {
    const appErrorRoot = new AppErrorRoot();

    try {
      aggregateFunc(appErrorRoot.tryCatch.bind(appErrorRoot));
    } catch (error) {
      if (getTypeof(error) === 'object') {
        Error.captureStackTrace(error as object, AppErrorRoot.aggregate);
      }
      throw error;
    }

    appErrorRoot.end(AppErrorRoot.aggregate);
  }

  push(type: AppErrorTypes, error: string | string[]) {
    if (type in this.errors) {
      this.errors[type].push(error);
      return;
    }
    const appError = new AppError(type);
    appError.push(error);
    this.errors[type] = appError;
    this.length++;
  }

  protected pushRoot(appErrorRoot: AppErrorRoot) {
    const appErrorRootEntries = Object.entries(appErrorRoot.errors);

    appErrorRootEntries.forEach(([errType, error]) => {
      this.push(errType as AppErrorTypes, error.errors);
    });
  }

  toString(indentation = 4) {
    const errorsString = Object.values(this.errors)
      .map((error) => error.toString(indentation))
      .join('\n');

    return errorsString;
  }

  tryCatch(tryCatchFunc: () => void) {
    try {
      tryCatchFunc();
    } catch (error) {
      if (error instanceof AppError) this.push(error.type, error.errors);
      else if (error instanceof AppErrorRoot) this.pushRoot(error);
      else {
        if (getTypeof(error) === 'object') {
          Error.captureStackTrace(error as object, this.tryCatch);
        }
        throw error;
      }
    }
  }
}

export default AppErrorRoot;
