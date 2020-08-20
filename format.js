/** [API: Format] 格式化时间
 * @function <@.format.date>
 * @call {(date, format) -> string}
 * @call {(date, format, utc) -> string}
 * @param <date> {Date} 需要格式化的时间
 * @param <format> {String} 格式化遵从的模板
 *    * `YY`, `YYYY`: 年份
 *    * `M`, `MM`: 月份
 *    * `D`, `DD`: 日期
 *    * `h`, `hh`: 小时
 *    * `m`, `mm`: 分钟
 *    * `s`, `ss`: 秒钟
 *    * `S`, `SSS`: 毫秒
 * @param <utc> {Boolean} 是否格式化成UTC时间
 */
const formatDate = function (date, format, utc) {


    var toString = function (number, length) {

        number = number + "";
        while (number.length < length) {
            number = "0" + number;
        }

        return number;
    };

    if (!date) {
        date = new Date();
    }

    if (!format) {
        format = "YYYY-MM-DD hh:mm:ss.SSS";
    }

    var result = [];

    var looper = 0;
    while (looper < format.length) {
        switch (format[looper]) {

            case "Y": {
                if (format[looper + 1] == "Y") {
                    if ((format[looper + 2] == "Y") && (format[looper + 3] == "Y")) {
                        result.push(("000" + (utc ? date.getUTCFullYear() : date.getFullYear())).slice(-4));
                        looper += 4;
                    } else {
                        result.push(("0" + ((utc ? date.getUTCFullYear() : date.getFullYear()) % 100)).slice(-2));
                        looper += 2;
                    }
                } else {
                    result.push((utc ? date.getUTCFullYear() : date.getFullYear()) + "");
                    ++looper;
                }
                break;
            };

            case "M": {
                if (format[looper + 1] == "M") {
                    result.push(("0" + ((utc ? date.getUTCMonth() : date.getMonth()) + 1)).slice(-2));
                    looper += 2;
                } else {
                    result.push(((utc ? date.getUTCMonth() : date.getMonth()) + 1) + "");
                    ++looper;
                }
                break;
            };

            case "D": {
                if (format[looper + 1] == "D") {
                    result.push(("0" + (utc ? date.getUTCDate() : date.getDate())).slice(-2));
                    looper += 2;
                } else {
                    result.push((utc ? date.getUTCDate() : date.getDate()) + "");
                    ++looper;
                }
                break;
            };

            case "h": {
                if (format[looper + 1] == "h") {
                    result.push(("0" + (utc ? date.getUTCHours() : date.getHours())).slice(-2));
                    looper += 2;
                } else {
                    result.push((utc ? date.getUTCHours() : date.getHours()) + "");
                    ++looper;
                }
                break;
            };

            case "m": {
                if (format[looper + 1] == "m") {
                    result.push(("0" + (utc ? date.getUTCMinutes() : date.getMinutes())).slice(-2));
                    looper += 2;
                } else {
                    result.push((utc ? date.getUTCMinutes() : date.getMinutes()) + "");
                    ++looper;
                }
                break;
            };

            case "s": {
                if (format[looper + 1] == "s") {
                    result.push(("0" + (utc ? date.getUTCSeconds() : date.getSeconds())).slice(-2));
                    looper += 2;
                } else {
                    result.push((utc ? date.getUTCSeconds() : date.getSeconds()) + "");
                    ++looper;
                }
                break;
            };

            case "S": {
                if ((format[looper + 1] == "S") && (format[looper + 2] == "S")) {
                    result.push(("00" + (utc ? date.getUTCMilliseconds() : date.getMilliseconds())).slice(-3));
                    looper += 3;
                } else {
                    result.push((utc ? date.getUTCMilliseconds() : date.getMilliseconds()) + "");
                    ++looper;
                }
                break;
            };

            case "\"":
            case "'": {
                var offset = 1;
                while ((format[looper + offset] != format[looper]) &&
                    (looper + offset < format.length)) {
                    if (format[looper + offset] == "\\") {
                        result.push(format[looper + offset + 1]);
                        offset += 2;
                    } else {
                        result.push(format[looper + offset]);
                        ++offset;
                    }
                }
                looper += offset + 1;
                break;
            };

            default: {
                result.push(format[looper]);
                ++looper;
                break;
            }

        }
    }

    return result.join("");

};

/** [API: Format] 格式化数字，在数字左侧自动填充一定的0，保持长度一致
 * @function <@.format.zero>
 * @call {(value, count) -> string}
 */
const prepadZeros = function (value, count) {

    value = value.toString();
    if (value.length >= count) {
        return value;
    }

    while (value.length < count) {
        value = "00000000" + value;
    }

    return value.slice(-count);

};

module.exports.formatDate = formatDate;
module.exports.prepadZeros = prepadZeros;
