import build from 'pino-abstract-transport'
import { SnsTransportOptions } from './types';
import { Publisher } from './publisher';
import { MessageFormatter } from './message-formatter';

export async function transport(opts: SnsTransportOptions) {
  const publisher = new Publisher(opts);
  const messageFormatter = new MessageFormatter(opts);
  const excludeLogs = opts.excludeLogs ?? [];
  await messageFormatter.init();

  return build(async function (source) {
    for await (let obj of source) {
      try {
        if (!excludeLogs.some((criteria) => criteria.pattern.test(obj[criteria.key]))) {
          await publisher.publish(messageFormatter.formatMessage(obj));
        }
      } catch (err) {
        console.error(err);
      }
    }
  })
}
