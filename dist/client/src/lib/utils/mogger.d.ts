export declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}
export declare class Mogger {
    private static logLevels;
    private static currentLogLevel;
    private static colors;
    private static getCurrentTimestamp;
    private static log;
    static debug(message: string, functionName?: string): void;
    static info(message: string, functionName?: string): void;
    static warn(message: string, functionName?: string): void;
    static error(message: string, functionName?: string): void;
}
