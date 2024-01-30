import stringify from 'json-stringify-safe';

export class ErrorHandler {
  private liftErrorProperties(error: any) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...error,
    };
  }

  private log(error: string, errorDetails: any, level: 'fatal' | 'error', log?: any) {
    try {
      const time = Date.now().valueOf();

      const logInfo = {
        msg: error,
        context: 'pino-sns-transport',
        level,
        time,
        error: this.liftErrorProperties(errorDetails),
        failedLog: log,
      };

      console.log(stringify(logInfo));
    } catch (error: any) {
      // Do nothing. It is what it is.
    }
  }

  error(error: string, errorDetails: any, log?: any) {
    this.log(error, errorDetails, 'error', log);
  }

  fatal(error: string, errorDetails: any, log?: any) {
    this.log(error, errorDetails, 'fatal', log);
  }
}
