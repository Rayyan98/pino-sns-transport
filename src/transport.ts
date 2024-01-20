import build from 'pino-abstract-transport'
import { SnsTransportOptions } from './types';
import { Publisher } from './publisher';
import { MessageFormatter } from './message-formatter';
import { LogFilterer } from './log-filter';

export async function transport(opts: SnsTransportOptions) {
  const logFilterer = new LogFilterer(opts);
  const messageFormatter = new MessageFormatter(opts);
  const publisher = new Publisher(opts);
  
  await Promise.all([
    messageFormatter.init(),
    publisher.init(),
  ])

  return build(async function (source) {
    for await (let obj of source) {
      try {
        if (logFilterer.check(obj)) {
          await publisher.publish(messageFormatter.formatMessage(obj));
        }
      } catch (err) {
        console.error(err);
      }
    }
  })
}
