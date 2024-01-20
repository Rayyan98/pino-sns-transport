import { SNS } from "@aws-sdk/client-sns";
import { SnsTransportOptions } from "./types";

export class Publisher {
  private snsClient: SNS;
  private topicArn!: string;

  constructor(private readonly opts: SnsTransportOptions) {
    this.snsClient = new SNS(opts.snsClientConfig ?? {});
  }

  async init() {
    if (this.opts.topicArn) {
      this.topicArn = this.opts.topicArn;
    } else {
      const topics = await this.snsClient.listTopics({});
      const arnParts = topics.Topics?.[0]?.TopicArn?.split(":");
      this.topicArn = `${arnParts?.[0]}:${arnParts?.[1]}:${arnParts?.[2]}:${arnParts?.[3]}:${arnParts?.[4]}:${this.opts.topic}`;  
    }
  }

  async publish(message: string) {
    return await this.snsClient.publish({
      TopicArn: this.topicArn,
      Message: message,
    });
  }
}
