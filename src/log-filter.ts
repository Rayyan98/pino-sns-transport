import { LogFilter, SnsTransportOptions } from "./types";

export class LogFilterer {
  private readonly includeLogs: LogFilter[] | undefined;
  private readonly excludeLogs: LogFilter[] | undefined;
  
  constructor(private readonly opts: SnsTransportOptions) {
    this.excludeLogs = opts.excludeLogs;
    this.includeLogs = opts.includeLogs;
  }

  private doesLogMatchFilters(obj: any, filters: LogFilter[]) {
    return filters.some((filter) => filter.pattern.test(obj[filter.key]));
  }

  private isIncluded(obj: any) {
    return !this.includeLogs?.length || this.doesLogMatchFilters(obj, this.includeLogs);
  }

  private isExcluded(obj: any) {
    return this.excludeLogs && this.doesLogMatchFilters(obj, this.excludeLogs);
  }

  public check(obj: any) {
    return this.isIncluded(obj) && !this.isExcluded(obj);
  }
}
