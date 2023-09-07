import getTypeof from '../getTypeof';
import AbstractAppError from './AbstractAppError';
import AppError from './AppError';
import type { AppErrorTypes } from './AppErrorTypes';

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

  toString(indentation = 4) {
    const errorsString = Object.values(this.errors)
      .map((error) => error.toString(indentation))
      .join('\n');

    return errorsString;
  }

  tryCatch(tryCatchFunc: () => void): void;

  tryCatch(catchErrorTypes: AppErrorTypes[], tryCatchFunc: () => void): void;

  tryCatch(
    _catchErrorTypes: AppErrorTypes[] | (() => void),
    _tryCatchFunc?: Func
  ) {
    const catchErrorTypes = Array.isArray(_catchErrorTypes)
      ? _catchErrorTypes
      : undefined;

    const tryCatchFunc = (
      typeof _catchErrorTypes === 'function' ? _catchErrorTypes : _tryCatchFunc
    ) as () => void;

    try {
      tryCatchFunc();
    } catch (error) {
      const shouldCatchAppError =
        error instanceof AppError &&
        (catchErrorTypes === undefined || catchErrorTypes.includes(error.type));

      if (shouldCatchAppError) this.push(error.type, error.errors);
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
