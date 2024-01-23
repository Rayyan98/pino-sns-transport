import { SNSClientConfig } from "@aws-sdk/client-sns";

export type LogFilter = {
  key: string;
  pattern: RegExp,
}

export type SnsTransportOptions = {
  snsClientConfig?: SNSClientConfig;
  topic?: string;
  topicArn?: string;
  beautify?: boolean;
  beautifyOptions?: {
    indentSize?: number;
    maxWidth?: number;
  };
  excludeKeys?: string[];
  keyExamineDepth?: number;
  includeLogs?: LogFilter[];
  excludeLogs?: LogFilter[];
  writeBackEnabled?: boolean;
}
