import build from 'pino-abstract-transport'
import { SnsTransportOptions } from './types';
import { Publisher } from './publisher';
import { MessageFormatter } from './message-formatter';
import { LogFilterer } from './log-filter';
import { ErrorHandler } from './error-handler';

export async function transport(opts: SnsTransportOptions) {
  const errorHandler = new ErrorHandler(opts);
  await errorHandler.init();

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
          errorHandler.log('Publishing Message Failed', {err, log});
        }
      }
    })
  } catch (err) {
    errorHandler.log('Transport Initialization Failed', err);
    
    return build(async function (source) {
      for await (let log of source) {
        errorHandler.log('Transport Initialization Failed', {err, log});
      }
    })
  }
}
