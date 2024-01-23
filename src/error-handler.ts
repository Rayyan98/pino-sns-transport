import { once } from "node:events";
import { SnsTransportOptions } from "./types";
import type { SonicBoom } from "sonic-boom";

export class ErrorHandler {
  errorLogStream?: SonicBoom;

  constructor(private readonly opts: SnsTransportOptions) {}

  async init() {
    const writeBackEnabled = this.opts.writeBackEnabled ?? true;

    if (writeBackEnabled) {
      try {
        const { pino } = await import('pino');
        const errorLogStream = pino.destination({
          fd: 1,
          sync: true,
        });
        await once(errorLogStream, 'ready');
        this.errorLogStream = errorLogStream;
      } catch (error: any) {
        // Do nothing. It is what it is.
      }
    }
  }

  log(error: string, details: any) {
    try {
      this.errorLogStream?.write(JSON.stringify({context: 'pino-sns-transport', error, details}) + '\n');
    } catch (error: any) {
      // Do nothing. It is what it is.
    }
  }
}
