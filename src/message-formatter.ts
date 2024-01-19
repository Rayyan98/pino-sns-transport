import { SnsTransportOptions } from "./types";

export class MessageFormatter {
  private excludeKeys;
  private keyExamineDepth;
  private stringifyer!: (message: unknown) => string;

  constructor(private readonly opts: SnsTransportOptions) {
    this.excludeKeys = new Set(opts.excludeKeys ?? []);

    const maxKeyParts = Math.max(...[...this.excludeKeys.values()].map((key) => key.split(".").length));

    this.keyExamineDepth = Math.min(opts.keyExamineDepth ?? 3, maxKeyParts);
  }

  async init() {
    const beautifyEnable = this.opts.beautify ?? true;
  
    if (beautifyEnable) {
      try {
        const beautify = await import("json-beautify");
        this.stringifyer = (message: unknown) => beautify.default(message, null as never, this.opts.beautifyOptions?.indentSize ?? 4, this.opts.beautifyOptions?.maxWidth ?? 150);
        return;
      } catch (error: any) {
        if (error?.code !== "MODULE_NOT_FOUND") {
          throw error;
        }
      }
    }

    this.stringifyer = (message: unknown) => JSON.stringify(message);
  }

  isExaminableObject(possibleObject: unknown) {
    return typeof possibleObject === 'object' && !Array.isArray(possibleObject) && possibleObject !== null
  };

  private removeKeysHelper(currentPath: string, message: any, depth: number) {
    if (!this.isExaminableObject(message) || depth > this.keyExamineDepth) {
      return;
    }

    for (const key of Object.keys(message)) {
      const fullPath = `${currentPath}${key}`;
      if (this.excludeKeys.has(fullPath)) {
        delete message[key];
      } else {
        this.removeKeysHelper(`${fullPath}.`, message[key], depth + 1);
      }
    }
  }

  private removeKeys(message: unknown) {
    if (this.excludeKeys.size !== 0) {
      return this.removeKeysHelper("", message, 0);
    }
    return message;
  }

  formatMessage(message: unknown) {
    this.removeKeys(message);
    return this.stringifyer(message);
  }
}
