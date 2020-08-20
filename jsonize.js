const error = require('./error.js');
const format = require('./format.js');
const handlers = new Map();

const indentUnit = "    ";
const defaultMaximumLevel = 3;

const maxLength = 15;

const clone = function (object) {
    return JSON.parse(JSON.stringify(object));
};

const insensitiveNaturalComparator = function (a, b) {

    var re = /(^([+\-]?(?:\d*)(?:\.\d*)?(?:[eE][+\-]?\d+)?)?$|^0x[\da-fA-F]+$|\d+)/g,
        sre = /^\s+|\s+$/g,   // trim pre-post whitespace
        snre = /\s+/g,        // normalize all whitespace to single ' ' character
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function (s) {
            return (true && ('' + s).toLocaleLowerCase() || '' + s).replace(sre, '');
        },
        // convert all to strings strip whitespace
        x = i(a) || '',
        y = i(b) || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre), 16) || (xN.length !== 1 && Date.parse(x)),
        yD = parseInt(y.match(hre), 16) || xD && y.match(dre) && Date.parse(y) || null,
        normChunk = function(s, l) {
            if (!s) return 0;
            // normalize spaces; find floats not starting with '0', string or 0 if not defined (Clint Priest)
            return (!s.match(ore) || l == 1) && parseFloat(s) || s.replace(snre, ' ').replace(sre, '') || 0;
        },
        oFxNcL, oFyNcL;

    // first try and sort Hex codes or Dates
    if (yD) {
        if ( xD < yD ) { return -1; }
        else if ( xD > yD ) { return 1; }
    }

    // natural sorting through split numeric strings and default strings
    for(var cLoc=0, xNl = xN.length, yNl = yN.length, numS=Math.max(xNl, yNl); cLoc < numS; cLoc++) {
        oFxNcL = normChunk(xN[cLoc], xNl);
        oFyNcL = normChunk(yN[cLoc], yNl);
        // handle numeric vs string comparison - number < string - (Kyle Adams)
        if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
        // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
        else if (typeof oFxNcL !== typeof oFyNcL) {
            oFxNcL += '';
            oFyNcL += '';
        }
        if (oFxNcL < oFyNcL) { return -1; }
        if (oFxNcL > oFyNcL) { return 1; }
    }

    return 0;

};

const jsonize = function (content, maximumLevel, showAll, indent, caches) {

    if (!caches) {
        caches = new Map();
        caches.nextID = 1;
    }

    if (!indent) {
        indent = "";
    }

    maximumLevel = parseInt(maximumLevel);
    if (!isFinite(maximumLevel)) {
        maximumLevel = defaultMaximumLevel;
    }

    if (content === null) {
        return "null";
    } else if (content === undefined) {
        return "undefined";
    }

    let prototype = content;
    while ((prototype !== null) && (prototype !== undefined)) {
        if (handlers.has(prototype)) {
            return handlers.get(prototype)(content, maximumLevel, showAll, indent, caches);
        }
        prototype = Object.getPrototypeOf(prototype);
    }

    return handlers.get(Object.prototype)(content, maximumLevel, showAll, indent, caches);

};

const registerJsonizeHandler = function (prototype, handler) {

    if ((typeof prototype === "function") && (prototype !== Function.prototype)) {
        prototype = prototype.prototype;
    }

    handlers.set(prototype, handler);

};

registerJsonizeHandler(Boolean, function (content, maximumLevel, showAll, indent, caches) {

    return (content && true) ? "true" : "false";

});

registerJsonizeHandler(Number, function (content, maximumLevel, showAll, indent, caches) {

    return content + "";

});

registerJsonizeHandler(String, function (content, maximumLevel, showAll, indent, caches) {

    let suffix = "";
    if ((content.length > 256) && (!showAll)) {
        suffix = ` /* Length ${content.length} */`;
        content = content.slice(0, 253) + "...";
    }

    return "\"" + content.replace(/\\/gim, "\\\\").replace(/\n/gim, "\\n").replace(/\r/gim, "\\r").replace(/"/gim, "\\\"") + "\"" + suffix;

});

registerJsonizeHandler(Symbol, function (content, maximumLevel, showAll, indent, caches) {

    let label = content.toString().slice("Symbol(".length, -1);

    return "Symbol(\"" + label.replace(/\\/gim, "\\\\").replace(/\n/gim, "\\n").replace(/\r/gim, "\\r").replace(/"/gim, "\\\"") + "\")";

});

registerJsonizeHandler(RegExp, function (content, maximumLevel, showAll, indent, caches) {

    return "/" + content.source + "/" + (content.global ? "g" : "") + (content.ignoreCase ? "i" : "") + (content.multiline ? "m" : "");

});

registerJsonizeHandler(Function, function (content, maximumLevel, showAll, indent, caches) {

    let args = [];
    let looper = 0;
    while (looper < content.length) {
        args.push(String.fromCharCode("a".charCodeAt() + looper));
        ++looper;
    }

    if (content.name && (typeof content.name === "string")) {
        return `function ${content.name.split(" ").slice(-1)[0]}(${args.join(", ")}) { /* code */ }`;
    } else {
        return `function (${args.join(", ")}) { /* code */ }`;
    }

});

registerJsonizeHandler(Buffer, function (content, maximumLevel, showAll, indent, caches) {

    var maxLength = 8;

    var buffer = Array.prototype.map.call(content.slice(0, maxLength), function (number, index) {
        return "0x" + number.toString(16);
    }).join(", ");

    if (content.length < maxLength) {
        return "Buffer.from( /* " + content.length + " bytes */ [" + buffer + "])";
    } else {
        return "Buffer.from( /* " + content.length + " bytes */ [" + buffer + " /* , ... */ ])";
    }

});

registerJsonizeHandler(Date, function (content, maximumLevel, showAll, indent, caches) {

    if (isNaN(content.getTime())) {
        return "new Date(\"Invalid Date\")";
    } else {
        return "new Date(\"" + format.formatDate(content) + "\")";
    }

});

registerJsonizeHandler(Error, function (content, maximumLevel, showAll, indent, caches) {

    let message = "";
    if (content.message) {
        message = "\"" + content.message.replace(/\\/gim, "\\\\").replace(/\n/gim, "\\n").replace(/\r/gim, "\\r").replace(/"/gim, "\\\"") + "\"";
    }
    return "new " + content.name + "(" + message + ") /*\n" +
        error.formatErrorStack(content).map((line) => indent + indentUnit + line).join("\n") + "\n" +
        indent + "*/";

});


const jsonizeArray = function (content, maximumLevel, showAll, indent, caches) {

    let elementsName = "elements";
    let constructorName = Array.isArray(content) ? "Array" : typeof content;
    if (constructorName === "Array") {
        constructorName = "";
    } else {
        if (constructorName.slice(-5) === "Array") {
            elementsName = constructorName.slice(0, -5) + " values";
            elementsName = elementsName[0].toLowerCase() + elementsName.slice(1);
        }
        constructorName = constructorName + " ";
    }

    if (caches.has(content)) {
        return "[ /* Circular */ ]";
    }

    if (content.length === 0) {
        if (constructorName) {
            return "[ /*" + constructorName + "*/ ]";
        } else {
            return "[]";
        }
    }

    let id = caches.nextID;
    caches.set(content, caches.nextID);
    ++caches.nextID;

    if (indent && (indent.length / indentUnit.length >= maximumLevel)) {
        return "[ /* " + content.length + " " + elementsName + " ... */ ]";
    }

    const nextIndent = indent + indentUnit;

    var nextIndentPlaceholder = {};
    var returnPlaceholder = {};

    let result = ["["];

    let hasLineBreaks = false;
    let contentLength = 0;

    let lineBreaks = 0;
    let overflowed = false;
    let index = 0;
    while ((showAll || (!overflowed)) && 
           (index < (showAll ? content.length : Math.min(maxLength, content.length)))) {

        let element = content[index];

        result.push(nextIndentPlaceholder);

        let jsonized = jsonize(element, maximumLevel, showAll, nextIndent, caches);

        if (!showAll) {
            lineBreaks += jsonized.split("\n").length - 1;
        }
        if ((!hasLineBreaks) && (jsonized.indexOf("\n") !== -1)) {
            hasLineBreaks = true;
        }
        contentLength += jsonized.length;
        result.push(jsonized);

        if (index < content.length - 1) {
            result.push(", ");
            contentLength += 2;
        }

        result.push(returnPlaceholder);

        if ((!showAll) && 
            ((content.length > maxLength * 4 * 80) ||
             (lineBreaks > maxLength * 3))) {
            overflowed = true;
        }

        ++index;

    };

    if ((overflowed || (content.length > maxLength)) && (!showAll)) {
        result.push(nextIndentPlaceholder);
        result.push("/* ... */");
        contentLength += 9;
        result.push(returnPlaceholder);
    }

    if ((contentLength + indent > 80) || hasLineBreaks) {

        result.splice(1, 0, " ", "/* ", content.length, " ", elementsName, " */", "\n");

        result = result.map(function (item) {
            if (item === nextIndentPlaceholder) {
                return nextIndent;
            } else if (item === returnPlaceholder) {
                return "\n";
            } else {
                return item;
            }
        });

        if (indent) {
            result.push(indent);
        }

    } else {

        if ((content.length > maxLength) && (!showAll)) {
            result.splice(1, 0, " ", "/* ", content.length, " ", elementsName, " */ ");
        } else {
            if (constructorName) {
                result.splice(1, 0, " ", "/* ", constructorName, " */ ");
            } else {
                result.splice(1, 0, " ");
            }
        }

        result = result.filter(function (item) {
            return (item !== nextIndentPlaceholder) && (item !== returnPlaceholder);
        });

        result.push(" ");

    }

    result.push("]");

    return result.join("");

};

registerJsonizeHandler(Array, jsonizeArray);
registerJsonizeHandler(Uint8Array, jsonizeArray);
registerJsonizeHandler(Uint16Array, jsonizeArray);
registerJsonizeHandler(Uint32Array, jsonizeArray);
registerJsonizeHandler(Int8Array, jsonizeArray);
registerJsonizeHandler(Int16Array, jsonizeArray);
registerJsonizeHandler(Int32Array, jsonizeArray);
registerJsonizeHandler(Float32Array, jsonizeArray);


const getPropertyDescriptor = function (object, key) {

    let descriptor = Object.getOwnPropertyDescriptor(object, key);
    if (!descriptor) {
        let prototype = Object.getPrototypeOf(object);
        if ((prototype !== null) && (prototype !== undefined)) {
            return getPropertyDescriptor(prototype, key);
        }
        return;
    }

    return descriptor;

};

registerJsonizeHandler(Object, function (content, maximumLevel, showAll, indent, caches) {

    let properties = [];
    let methods = [];

    let possibleKeys = [];
    for (let key in content) {
        let descriptor = getPropertyDescriptor(content, key);
        if (descriptor && descriptor.enumerable) {
            if (typeof content[key] === "function") {
                methods[methods.length] = key;
            } else if (content[key] !== undefined) {
                properties[properties.length] = key;
            }
        }
    }

    if (caches.has(content)) {
        return "{ /* Circular */ }";
    }

    let id = caches.nextID;
    caches.set(content, caches.nextID);
    ++caches.nextID;

    properties = properties.sort(insensitiveNaturalComparator);
    methods = methods.sort(insensitiveNaturalComparator);

    const protecteds = Object.create(null);
    if (content["!protectedFields"] && (content["!protectedFields"] instanceof Array)) {
        content["!protectedFields"].forEach((key) => protecteds[key] = true);
    }

    var contentPrototype = Object.getPrototypeOf(content);
    var constructorName = "";
    if ((contentPrototype !== Object.prototype) && (contentPrototype !== null)) {
        if ((!constructorName) || (constructorName === "Object")) {
            let constructor = content.constructor;
            if (typeof constructor === "function") {
                constructorName = constructor.name;
            }
        }
        if (constructorName) {
            constructorName = "/* " + constructorName;
        }
    }

    if ((properties.length === 0) && (methods.length === 0)) {
        if (constructorName) {
            return "{ " + constructorName + " */ }";
        } else {
            return "{}";
        }
    }

    if (indent && (indent.length / indentUnit.length >= maximumLevel)) {
        if (constructorName) {
            return "{ " + constructorName + " ... */ }";
        } else {
            return "{ /* ... */ }";
        }
    }

    var result = null;
    if (constructorName) {
        result = ["{ " + constructorName + " */ "];
    } else {
        result = ["{ "];
    }

    const nextIndentPlaceholder = {};
    const returnPlaceholder = {};

    const nextIndent = (indent ? indent : "") + indentUnit;

    let hasLineBreaks = false;
    let contentLength = 0;

    for (let key of properties) {
        result.push(nextIndentPlaceholder);
        let jsonizedKey = jsonize(key, maximumLevel, showAll, indent, caches);
        result.push(jsonizedKey);
        result.push(": ");
        contentLength += jsonizedKey.length + 2;
        if (protecteds[key]) {
            result.push("{ /* Protected */ }");
            contentLength = 19;
        } else {
            let jsonized = jsonize(content[key], maximumLevel, showAll, nextIndent, caches);
            if ((!hasLineBreaks) && jsonized.indexOf("\n") !== -1) {
                hasLineBreaks = true;
            }
            contentLength += jsonized.length;
            result.push(jsonized);
        }
        if ((key !== properties[properties.length - 1]) || (methods.length > 0)) {
            result.push(", ");
            contentLength += 2;
        }
        result.push(returnPlaceholder);
    };

    if ((properties.length === 0) || showAll) {
        for (let key of methods) {
            result.push(nextIndentPlaceholder);
            let jsonizedKey = jsonize(key, maximumLevel, showAll, indent, caches);
            result.push(jsonizedKey);
            result.push(": ");
            contentLength += jsonizedKey.length + 2;
            let jsonized = jsonize(content[key], maximumLevel, showAll, nextIndent, caches);
            if ((!hasLineBreaks) && jsonized.indexOf("\n") !== -1) {
                hasLineBreaks = true;
            }
            result.push(jsonized);
            contentLength += jsonized.length;
            if (key !== methods[methods.length - 1]) {
                result.push(", ");
                contentLength += 2;
            }
            result.push(returnPlaceholder);
        }
    } else if (methods.length > 0) {
        result.push(nextIndentPlaceholder);
        result.push("/* ... */");
        contentLength += 9;
        result.push(returnPlaceholder);
    }

    if ((contentLength + indent > 80) || hasLineBreaks) {
        result = result.map(function (item) {
            if (item === nextIndentPlaceholder) {
                return nextIndent;
            } else if (item === returnPlaceholder) {
                return "\n";
            } else {
                return item;
            }
        });
        result.splice(1, 0, "\n");
        if (indent) {
            result.push(indent);
        }
    } else {
        result = result.filter(function (item) {
            return (item !== nextIndentPlaceholder) && (item !== returnPlaceholder);
        });
        result.push(" ");
    }

    result.push("}");

    return result.join("");

});


module.exports.registerJsonizeHandler = registerJsonizeHandler;
module.exports.clone = clone;
module.exports.jsonize = jsonize;
