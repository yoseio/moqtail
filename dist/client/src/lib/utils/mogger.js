export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (LogLevel = {}));
export class Mogger {
    static getCurrentTimestamp() {
        return new Date().toISOString();
    }
    static log(level, message, functionName) {
        const logLevelsOrder = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        if (logLevelsOrder.indexOf(level) < logLevelsOrder.indexOf(Mogger.currentLogLevel))
            return;
        const color = Mogger.colors[level];
        console.log(`%c[${Mogger.getCurrentTimestamp()}] [${level}] ${functionName ? '[' + functionName + ']' : ''} - ${message}`, color);
    }
    static debug(message, functionName) {
        Mogger.log(LogLevel.DEBUG, message, functionName);
    }
    static info(message, functionName) {
        Mogger.log(LogLevel.INFO, message, functionName);
    }
    static warn(message, functionName) {
        Mogger.log(LogLevel.WARN, message, functionName);
    }
    static error(message, functionName) {
        Mogger.log(LogLevel.ERROR, message, functionName);
    }
}
Mogger.logLevels = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR',
};
Mogger.currentLogLevel = LogLevel.DEBUG;
Mogger.colors = {
    [LogLevel.DEBUG]: 'gray',
    [LogLevel.INFO]: 'green',
    [LogLevel.WARN]: 'orange',
    [LogLevel.ERROR]: 'red',
};
