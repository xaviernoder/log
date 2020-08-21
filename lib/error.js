Error.stackTraceLimit = 50;

const errorCodes = Object.create(null);

/**
 * [API: Error] 产生一个固定错误编号的错误
 * @function <@.error.code>
 * @call {(code) -> Error}
 * @call {(code, message) -> Error}
 * @param <code> {Number} 错误编号
 * @param <message> {String} 错误编号所代表的错误，如果不提供则按照系统注册的内容
 */
const createCodeError = function (code, message) {

    if (!message) {
        message = errorCodes[code];
    }

    if (!message) {
        message = `Code[${code}]`;
    } else {
        message = `Code[${code}], ` + message;
    }

    const result = new Error(message);

    result.code = code;

    return result;

};

/**
 * [API: Error] 注册一个错误编号
 * @function <@.error.reg>
 * @call {(code, message) -> Void}
 * @param <code> {Number} 错误编号
 * @param <message> {String} 错误编号所代表的错误
 */
const registerErrorCode = function (code, message) {

    if (errorCodes[code]) {
        throw new Error("Error code has already been occupied: " + code);
    }

    if (!message.trim()) {
        throw new Error("Error code with no message: " + code);
    }

    errorCodes[code] = message;

};

/**
 * [API: Error] 产生一个执行外部程序的描述错误
 * @function <@.error.exec>
 * @call {(command, switches, code, stdout, stderr) -> Error}
 * @param <command> {String} 执行的命令程序
 * @param <switches> {[String ...]} 执行的命令行参数
 * @param <code> {Number} 执行返回的错误码
 * @param <stdout> {String} 执行过程中的输出
 * @param <stderr> {String} 执行过程中的错误`输出
 */
const createExecutionError = function (command, switches, code, stdout, stderr) {

    let error = new Error("Failed to execute command");

    error.command = command;
    error.switches = switches;
    error.code = code;
    error.stdout = stdout;
    error.stderr = stderr;

    return error;

};

/**
 * [API: Error] 确保返回一个Error对象
 * @function <@.error>
 * @call {(message) -> Error}
 * @call {(message, appends) -> Error}
 * @call {(error) -> Error}
 * @call {(error, appends) -> Error}
 * @call {(errorLike) -> Error}
 * @call {(errorLike, appends) -> Error}
 * @param <message> {String} Error的文本信息
 * @param <error> {Error} Error
 * @param <errorLike> {{message, stack}} 与Error结构类似的对象
 * @param <appends> {Object} 在返回的Error上附加的内容字典
 */
const ensureError = function (error, appends) {

    if (!error) {
        error = new Error("Unknown error");
    }

    if (typeof error === "string") {
        error = new Error(error);
    } else if (!(error instanceof Error)) {

        let message = error.message;
        if (!message) { message = error.msg; }

        let code = error.code;

        let object = error;

        if (typeof code === "number") {
            error = createCodeError(code, message);
        } else {
            error = new Error(message);
        }

        for (let key in object) {
            if ((key !== "stack") && (key !== "msg") && (key !== "message") && (key !== "code")) {
                error[key] = object[key];
            }
        }

    }

    if (appends) {
        for (let key in appends) {
            error[key] = appends[key];
        }
    }

    return error;
};

/**
 * [API: Error] 格式化重新整理Error的stack信息
 * @function <@.error.stack>
 * @call {(error) -> stack}
 * @param <error> {Error} 需要处理的Error对象
 * @result <stack> {String} 错误发生时的栈信息
 */
const formatErrorStack = function (error) {

    if (!error.stack) {
        return [];
    }

    let stack = error.stack.split("\n");
    while (stack[0] && (stack[0].slice(0, 7) !== "    at ")) {
        stack.shift();
    }

    return stack.map((line) => {
        return line.trim().replace(/\.[^\.]+\.mew\-([^\\\/:]+)/g, (x) => {
            let extname = x.split(".mew-").slice(-1)[0];
            if (extname === "union") { // union fs specified on dir
                return "";
            } else {
                return "." + extname;
            }error
        });
    });

};

/**
 * [API: Error] 获得完整的错误描述
 * @function <@.error.desc>
 * @call {(error) -> description}
 * @param <error> {Error} 需要处理的Error对象
 * @result <description> {String} 错误的完整描述
 */
const getErrorReport = function (error) {

    let prefix = (error.name + ": ").replace(/./g, " ");

    return error.name + ": " + error.message.split("\n").map((line, index) => {
        if (index > 0) { return prefix + line; }
        return line;
    }).join("\n") + "\n" + formatErrorStack(error).map((line) => {
        return "    " + line;
    }).join("\n");

};

module.exports.createExecutionError = createExecutionError;
module.exports.createCodeError = createCodeError;

module.exports.registerErrorCode = registerErrorCode;
module.exports.ensureError = ensureError;

module.exports.formatErrorStack = formatErrorStack;
module.exports.getErrorReport = getErrorReport;
