export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export class Mogger {
  private static logLevels: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR',
  };
  private static currentLogLevel: LogLevel = LogLevel.DEBUG;
  private static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }
  private static log(level: LogLevel, message: string, functionName?: string) {
    const logLevelsOrder = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    if (logLevelsOrder.indexOf(level) < logLevelsOrder.indexOf(Mogger.currentLogLevel)) return;
    console.log(`${Mogger.getCurrentTimestamp()} [${level}] ${functionName ? '[' + functionName + ']' : ''} - ${message}`);
  }
  public static debug(message: string, functionName?: string): void {
    Mogger.log(LogLevel.DEBUG, message, functionName);
  }
  public static info(message: string, functionName?: string): void {
    Mogger.log(LogLevel.INFO, message, functionName);
  }
  public static warn(message: string, functionName?: string): void {
    Mogger.log(LogLevel.WARN, message, functionName);
  }
  public static error(message: string, functionName?: string): void {
    Mogger.log(LogLevel.ERROR, message, functionName);
  }
}
