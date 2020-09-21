const fs = require('fs');
const jsonize = require('./lib/jsonize.js');
const error = require("./lib/error.js");
const { formatDate } = require('./lib/format.js'); 
const { termStyleCodePoints } = require("./lib/term");
const styleCodePoints = termStyleCodePoints;
const styles = {

    "bright": {
        "system": ["red"],
        "assert": ["red"],
        "error":  ["red"],
        "warn":   ["yellow"],
        "celebr": ["cyan"],
        "info":   ["black"],
        "debug":  ["brightBlack"],
        "dump":   ["blue"],
        "line":   ["white"]
    },

    "dark": {
        "system": ["magenta"],
        "assert": ["magenta"],
        "error":  ["red"],
        "warn":   ["yellow"],
        "celebr": ["green"],
        "info":   ["brightWhite"],
        "debug":  ["white"],
        "dump":   ["cyan"],
        "line":   ["brightBlack"]
    }

};

const logLevelDisplayMap = {
    "system": "[SYSTEM]",
    "assert": "[ASSERT]",
    "error":  " [ERROR]",
    "warn":   "  [WARN]",
    "info":   "  [INFO]",
    "celebr": "[CELEBR]",
    "debug":  " [DEBUG]",
    "dump":   "  [DUMP]"
};

const  getFileLine = function (type) {
    let line = " (unknow:0)";
    const errorStack = error.formatErrorStack(new Error());
    errorStack.forEach((item,index)=> {
        if(item.includes(`[as ${type}]`) || item.includes(`Log.${type}`)) {
            line = errorStack[index+1];
            return;
        }
    });
    if(line != " (unknow:0)") {
        return line.split(" ")[line.split(" ").length-1].split("/").slice(-3).join("/").split("(").join("").split(")").join("");
    }
    return line;
};

const formatValue = function (value)  {
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


const Log = function(){
    this.style = "dark";
};

Log.prototype.output = function(contents) {
    if (contents instanceof Array) {
        contents = contents.join("");
    }

    process.stdout.write(contents);
};

Log.prototype.formatMessage = function(type) {

    const prefix = formatDate(new Date(), "MM-DD hh:mm:ss.SSS") + " " + logLevelDisplayMap[type] + " ";
    const messages = [];
    let looper = 1;
    while (looper < arguments.length) {
        const formatted = formatValue(arguments[looper]);
        messages[messages.length] = formatted;
        ++looper;
    }

    const message = messages.join(", ").split("\n").map((line, index) => {
        if (index > 0) {
            return prewhitespaces + line;
        } else {
            return prefix + line;
        }
    }).join("\n");
    const opens = [];
    const outputs = [message];
    const closes = [];
    const messageStyles = styles[this.style][type];
    if (messageStyles) {
        messageStyles.forEach((style) => {
            if (styleCodePoints[style]) {
                opens[opens.length] = "\u001b[" + styleCodePoints[style][0] + "m";
                closes[closes.length] = "\u001b[" + styleCodePoints[style][1] + "m";
            }
        });
    }

    const recordFileLine = getFileLine(type);
    if (recordFileLine) {
        const fileLineStyles = styles[this.style]["line"];
        if (fileLineStyles) {
            fileLineStyles.forEach((style) => {
                if (styleCodePoints[style]) {
                    closes[closes.length] = " \u001b[" + styleCodePoints[style][0] + "m(";
                    closes[closes.length] = recordFileLine;
                    closes[closes.length] = ")\u001b[" + styleCodePoints[style][1] + "m";
                }
            });
        }
    }
    this.output(opens.concat(outputs).concat(closes).concat("\n"));
};

Log.prototype.dump = function() {
    const maximumLevel = 3;
    
    const objects = Array.prototype.slice.call(arguments);

    let message = undefined;
    if (objects.length === 1) {
        message = jsonize.jsonize(objects[0], maximumLevel);
    } else {
        message = jsonize.jsonize(objects, maximumLevel);
    }
    this.formatMessage("dump",message);
};
const levelArr = ["info", "celebr", "warn", "error"];
levelArr.forEach((level) => {
    Log.prototype[level] = function () {
        for(const index in arguments) {
            arguments[index] = jsonize.jsonize(arguments[index]);
        }
        switch (arguments.length) {
            case 0: { this.formatMessage(level); break; }
            case 1: { this.formatMessage(level, arguments[0]); break; }
            case 2: { this.formatMessage(level, arguments[0], arguments[1]); break; }
            case 3: { this.formatMessage(level, arguments[0], arguments[1], arguments[2]); break; }
            default: {
                const newArguments = Array.prototype.slice.call(arguments);
                newArguments.unshift(level);
                this.formatMessage.apply(this, newArguments);
                break;
            }
        }
    };
});

const defaultLogger = new Log();
const Logger = Object.create(null);
Logger.dump = defaultLogger.dump.bind(defaultLogger);
Logger.warn = defaultLogger.warn.bind(defaultLogger);
Logger.info = defaultLogger.info.bind(defaultLogger);
Logger.error = defaultLogger.error.bind(defaultLogger);
Logger.celebr = defaultLogger.celebr.bind(defaultLogger);


module.exports.Logger = Logger;
module.exports.dump = Logger.dump;
module.exports.warn = Logger.warn;
module.exports.info = Logger.info;
module.exports.error = Logger.error;
module.exports.celebr = Logger.celebr;