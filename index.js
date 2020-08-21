const fs = require('fs');
const jsonize = require('./lib/jsonize.js');
const error = require("./lib/error.js");
const { formatDate } = require('./lib/format.js'); 
const { Console } = console;

const styles = {
    'bold'          : ['\x1B[1m',  '\x1B[22m'],
    'italic'        : ['\x1B[3m',  '\x1B[23m'],
    'underline'     : ['\x1B[4m',  '\x1B[24m'],
    'inverse'       : ['\x1B[7m',  '\x1B[27m'],
    'strikethrough' : ['\x1B[9m',  '\x1B[29m'],
    'white'         : ['\x1B[37m', '\x1B[39m'],
    'grey'          : ['\x1B[90m', '\x1B[39m'],
    'black'         : ['\x1B[30m', '\x1B[39m'],
    'blue'          : ['\x1B[34m', '\x1B[39m'],
    'cyan'          : ['\x1B[36m', '\x1B[39m'],
    'green'         : ['\x1B[32m', '\x1B[39m'],
    'magenta'       : ['\x1B[35m', '\x1B[39m'],
    'red'           : ['\x1B[31m', '\x1B[39m'],
    'yellow'        : ['\x1B[33m', '\x1B[39m'],
    'whiteBG'       : ['\x1B[47m', '\x1B[49m'],
    'greyBG'        : ['\x1B[49;5;8m', '\x1B[49m'],
    'blackBG'       : ['\x1B[40m', '\x1B[49m'],
    'blueBG'        : ['\x1B[44m', '\x1B[49m'],
    'cyanBG'        : ['\x1B[46m', '\x1B[49m'],
    'greenBG'       : ['\x1B[42m', '\x1B[49m'],
    'magentaBG'     : ['\x1B[45m', '\x1B[49m'],
    'redBG'         : ['\x1B[41m', '\x1B[49m'],
    'yellowBG'      : ['\x1B[43m', '\x1B[49m']
}

const logColorMap = {
    "error":    "red",
    "dump":     "cyan",
    "info":     "white",
    "warn":     "yellow",
    "celebr":   "green"
}

const logLevelDisplayMap = {
    "error":    "[ERROR]",
    "dump":     "[DUMP]",
    "info":     "[INFO]",
    "warn":     "[WARN]",
    "celebr":   "[CELEBR]"
}

const  getFileLine = function () {
    let line = " (unknow:0)";
    let errorStack = new Error("test").stack.split("\n");
    for(let index in errorStack) {
        if(errorStack[index].includes('Module._compile')) {
            line = errorStack[index-1];
            break;
        }
    }
    line = " ("+line.split("/").slice(-3).join("/");
    return line;
};

const formatValue = function (value) {
    if (value === null) {
        return "null";
    } else if (value === undefined) {
        return "undefined";
    } else if (typeof value === "string") {
        return value;
    } else if (value instanceof Error) {
        return error.getErrorReport(value);
    } else {
        return jsonize.jsonize(value);
    }

};

const prewhitespaces = ("MM-DD hh:mm:ss.SSS " + logLevelDisplayMap["info"] + " ").replace(/./g, function () {
    return " ";
});


function Log({ out = false, logDir = "./" }) {
    if(out) {
        if(!logDir.endsWith('/')) {
            logDir += "/";
        }
    
        if( logDir != "./" && !fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }
        let output = fs.createWriteStream(`${this.logDir}${formatDate(new Date(),"YYYY-MM-DD")}.log`,{
            "encoding": "utf8",
            "flags": "a"
        });
        const logger = new Console({ stdout: output, stderr: output });
        this.logger = logger;
    } 
    this.out = out;
}

Log.prototype.output = function(prefix,...message) {
    this.logger.log(prefix,...message)
}

Log.prototype.formatMessage = function(type) {

    const prefix = formatDate(new Date(), "MM-DD hh:mm:ss.SSS") + " " + logLevelDisplayMap[type] + " ";
    const messages = [];
    let looper = 1;
    while (looper < arguments.length) {
        let formatted = formatValue(arguments[looper]);
        messages[messages.length] = formatted;
        ++looper;
    }

    let message = messages.join(", ").split("\n").map((line, index) => {
        if (index > 0) {
            return prewhitespaces + line;
        } else {
            return prefix + line;
        }
    }).join("\n");

    console.log(styles[logColorMap[type]].join("%s").concat(styles['grey'].join('%s')),message,getFileLine())
    if(this.out) {
        this.output(styles[logColorMap[type]].join("%s").concat(styles['grey'].join('%s')),message,getFileLine());
    }
}

Log.prototype.dump = function() {
    let maximumLevel = 3;
    
    let objects = Array.prototype.slice.call(arguments);

    let message = undefined;
    if (objects.length === 1) {
        message = jsonize.jsonize(objects[0], maximumLevel);
    } else {
        message = jsonize.jsonize(objects, maximumLevel);
    }
    this.formatMessage("dump",message)
}
const levelArr = ["info", "celebr", "warn", "error"];
const maximumLevel = 3;
levelArr.forEach((level) => {
    Log.prototype[level] = function () {
        for(let index in arguments) {
            arguments[index] = jsonize.jsonize(arguments[index]);
        }
        switch (arguments.length) {
            case 0: { this.formatMessage(level); break; };
            case 1: { this.formatMessage(level, arguments[0]); break; };
            case 2: { this.formatMessage(level, arguments[0], arguments[1]); break; };
            case 3: { this.formatMessage(level, arguments[0], arguments[1], arguments[2]); break; };
            default: {
                let newArguments = Array.prototype.slice.call(arguments);
                newArguments.unshift(level);
                this.formatMessage.apply(this, newArguments);
                break;
            };
        }
    };
});

const defaultLogger = new Log({});
module.exports.defaultLogger = Log;
module.exports.dump = defaultLogger.dump.bind(defaultLogger);
module.exports.warn = defaultLogger.warn.bind(defaultLogger);
module.exports.info = defaultLogger.info.bind(defaultLogger);
module.exports.error = defaultLogger.error.bind(defaultLogger);
module.exports.celebr = defaultLogger.celebr.bind(defaultLogger);