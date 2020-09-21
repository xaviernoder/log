const termStyleCodePoints = {

    "white": [37, 39],
    "black": [30, 39],
    "blue": [34, 39],
    "cyan": [36, 39],
    "green": [32, 39],
    "magenta": [35, 39],
    "red": [31, 39],
    "yellow": [33, 39],

    "brightBlack": [90, 39],
    "brightRed": [91, 39],
    "brightGreen": [92, 39],
    "brightYellow": [93, 39],
    "brightBlue": [94, 39],
    "brightMagenta": [95, 39],
    "brightCyan": [96, 39],
    "brightWhite": [97, 39],

    "bold": [1, 22],
    "dim": [2, 22],
    "italic": [3, 23],
    "underline": [4, 24],
    "inverse": [7, 27],
    "hidden": [8, 28],
    "strikethrough": [9, 29]

};

/**
 * [API:Terminal] 返回带样式的Terminal文本
 * @function <@.term.text>
 * @call {(text, styles) -> text}
 * @param <text> {String} 文本内容
 * @param <styles> {[String ...]} 文本样式
 *     * `"white"`: 白色
 *     * `"black"`: 黑色
 *     * `"blue"`: 蓝色
 *     * `"cyan"`: 青色
 *     * `"green"`: 绿色
 *     * `"magenta"`: 紫色
 *     * `"red"`: 红色
 *     * `"yellow"`: 黄色
 */
const styleTermText = function (text, styles) {

    if (!styles) {
        return text;
    }

    if (!(styles instanceof Array)) {
        styles = [styles];
    }

    for (let style of styles) {
        text = (("\u001b[" + termStyleCodePoints[style][0] + "m") +
                text +
                ("\u001b[" + termStyleCodePoints[style][1] + "m"));
    }

    return text;

};

const getTerminalSize = function () {

    if (process.stdout.rows) {
        return {
            "rows": process.stdout.rows,
            "columns": process.stdout.columns,
        };
    } else {
        return {
            "rows": 26,
            "columns": 80
        };
    }

};

/**
 * [API: Terminal] 去除文本中的终端样式设置
 * @function <@.term.strip>
 * @call {(text) -> text}
 */
const stripTermStyles = function (text) {

    return text.replace(/\u001b\[[^m]+m/g, "");

};

/**
 * [API: Terminal] 返回左对齐的样式文本
 * @function <@.term.rightPad>
 * @call {(text, length) -> text}
 */
const rightPadTermText = function (text, length) {

    let stripped = stripTermStyles(text);

    let padded = "                                        ";
    while (padded.length + stripped.length < length) {
        padded += padded;
    }
    padded = padded.slice(0, length - stripped.length);

    return text + padded;

};

/**
 * [API: Terminal] 返回右对齐的样式文本
 * @function <@.term.leftPad>
 * @call {(text, length) -> text}
 */
const leftPadTermText = function (text, length) {

    let stripped = stripTermStyles(text);

    let padded = "                                        ";
    while (padded.length + stripped.length < length) {
        padded += padded;
    }
    padded = padded.slice(0, length - stripped.length);

    return padded + text;

};

module.exports.stripTermStyles = stripTermStyles;
module.exports.leftPadTermText = leftPadTermText;
module.exports.rightPadTermText = rightPadTermText;

module.exports.termStyleCodePoints = termStyleCodePoints;
module.exports.styleTermText = styleTermText;
module.exports.getTerminalSize = getTerminalSize;