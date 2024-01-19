import { SNS } from "@aws-sdk/client-sns";
import { SnsTransportOptions } from "./types";

export class Publisher {
  private snsClient: SNS;

  constructor(private readonly opts: SnsTransportOptions) {
    this.snsClient = new SNS(opts.snsClientConfig ?? {});
  }

  async publish(message: string) {
    return await this.snsClient.publish({
      TopicArn: this.opts.topicArn,
      Message: message,
    });
  }
}
