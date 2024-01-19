import { SNSClientConfig } from "@aws-sdk/client-sns";

export type SnsTransportOptions = {
  snsClientConfig?: SNSClientConfig;
  topicArn?: string;
  beautify?: boolean;
  beautifyOptions?: {
    indentSize?: number;
    maxWidth?: number;
  };
  excludeKeys?: string[];
  excludeLogs?: {
    key: string;
    pattern: RegExp,
  }[];
  keyExamineDepth?: number;
}
