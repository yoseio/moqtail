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

  private static colors: Record<LogLevel, string> = {
    [LogLevel.DEBUG]: 'gray',
    [LogLevel.INFO]: 'green',
    [LogLevel.WARN]: 'orange',
    [LogLevel.ERROR]: 'red',
  };

  private static getCurrentTimestamp(): string {
    return new Date().toISOString();
  }

  private static log(level: LogLevel, message: string, functionName?: string) {
    const color = Mogger.colors[level];
    console.log(`%c[${Mogger.getCurrentTimestamp()}] [${level}] ${functionName ? '[' + functionName + ']' : ''} - ${message}`, color);
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
