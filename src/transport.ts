import build from 'pino-abstract-transport'
import { SnsTransportOptions } from './types';
import { Publisher } from './publisher';
import { MessageFormatter } from './message-formatter';
import { LogFilterer } from './log-filter';
import { ErrorHandler } from './error-handler';

export async function transport(opts: SnsTransportOptions) {
  const errorHandler = new ErrorHandler();

  try {
    const logFilterer = new LogFilterer(opts);
    const messageFormatter = new MessageFormatter(opts);
    const publisher = new Publisher(opts);
    
    await Promise.all([
      messageFormatter.init(),
      publisher.init(),
    ])
  
    return build(async function (source) {
      for await (let log of source) {
        try {
          if (logFilterer.check(log)) {
            await publisher.publish(messageFormatter.formatMessage(log));
          }
        } catch (err) {
          errorHandler.error('Publishing Message Failed', err, log);
        }
      }
    })
  } catch (err) {
    errorHandler.fatal('Transport Initialization Failed', err);
    
    return build(async function (source) {
      for await (let log of source) {
        errorHandler.fatal('Transport Initialization Failed', err, log);
      }
    })
  }
}
