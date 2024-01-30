# pino-sns-transport

[![NPM version](https://img.shields.io/npm/v/pino-sns-transport.svg?style=flat-square)](https://www.npmjs.com/package/pino-sns-transport)

A [pino v7+](https://github.com/pinojs/pino) transport for sending logs to [AWS SNS](https://aws.amazon.com/sns/).

It uses [@aws-sdk/client-sns](https://www.npmjs.com/package/@aws-sdk/client-sns) to
send logs to sns topics.

- Single required config

## Table of Contents

<!-- TOC -->

- [Installation](#installation)
- [Quick Usage](#quick-usage)
- [Configuration options](#configuration-options)
  - [SnsTransportOptions](#snstransportoptions)
  - [Description](#description)
  - [Nuances](#nuances)
  - [Example](#example)

<!-- TOC END -->

## Installation

`npm install pino-sns-transport`

## Quick Usage

```typescript
import pino, { TransportTargetOptions } from 'pino';
import type { SnsTransportOptions } from 'pino-sns-transport';

const transportTargets: TransportTargetOptions[] = [
  {
    target: 'pino-sns-transport',
    options: {
      topic: process.env.TOPIC,
    } as SnsTransportOptions,
    level: 'warn',
  },
];

const transport = pino.transport({
  targets: transportTargets,
});

const logger = pino(
  {
    /**
     * Set this to trace or the minimum from the logging
     * levels of the transports so that all logs are
     * forwarded to transports, each transport carries its
     * own level and therefore can decide whether it wants
     * to log or not
     */
    level: 'trace',
  },
  transport,
)
```

## Configuration options

### SnsTransportOptions

```typescript
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
}
```

### Description

- `topic` is the name of the sns topic to publish logs to. When provided the full arn of the sns topic is constructed by getting the region and aws account id from the aws sns client. The full arn is then passed to the publish method of the aws-sdk to push logs
- `topicArn` should be the arn of the sns topic to publish logs to. It is useful for scenarios where cross region or cross account logs need to be published. Either one of `topic` or `topicArn` must be provided. When both are provided `topicArn` is given preference
- `snsClientConfig` is optional and anything passed to it is forwarded directly to the aws-sdk thus making the underlying aws-sdk client transparently configurable
- `beautify` is true by default but will not take effect until the optional dependency [json-beautify](https://www.npmjs.com/package/json-beautify) is also installed, if you happen to have the dependency for unrelated reasons and don't want your logs to be formatted you can turn it off here
- `beautifyOptions` are parameters passed to [json-beautify](https://www.npmjs.com/package/json-beautify) and don't take effect until `beautify` is true and the dependency is met
- `excludeKeys` can be used to delete keys from the json log before publish. Also supports dot notation for removing nested keys, see full example below
- `keyExamineDepth` is the maximum depth level of json objects at which the keys will be examined for `excludeKeys`. The default value is 3.
- `includeLogs` can be used to filter for logs that need to published and discard the rest. Providing an empty array here has the same effect as not providing a value which is that all logs will be published unless filtered out by `excludeLogs`. Unlike `excludeKeys`, this does not support dot notation for now
- `excludeLogs` can be used to prevent certain logs from being published whose value at `key` matches the `pattern`. Unlike `excludeKeys`, this does not support dot notation for now

### Nuances

- If both `includeLogs` and `excludeLogs` are specified and a log matches both of them then it will be excluded.
- Any errors encountered in initialization or publishing logs are printed to stdout with the `context` key as `pino-sns-transport` in pino style compatible with pino-pretty. Also includes the error and the original log that could not be published.

### Example

```typescript
const transportTargets: TransportTargetOptions[] = [
  {
    target: 'pino-sns-transport',
    options: {
      topicArn: process.env.TOPIC_ARN,
      excludeKeys: [
        'pid',
        'hostname',
        'res.headers',
        'req.headers',
        'req.remoteAddress',
        'req.remotePort',
      ],
      excludeLogs: [
        {
          key: 'msg',
          pattern: /Request (Completed|Errored)/,
        },
        {
          key: 'context',
          pattern: /ExceptionsHandler/,
        },
      ],
    } as SnsTransportOptions,
    level: 'warn',
  },
];
```
