const { dump, error, info, warn, celebr } = require('../index.js');

/**
 * log number
 */
info("log number");
info("test,12312312");
void function() {
    dump(123);
    error(123);
    info(123);
    warn(123);
    celebr(123);
}();

/**
 * log string
 */
info("log string");
void function() {
    dump("abc");
    error("def");
    info("abc");
    warn("123123");
    celebr("098765");
}();


/**
 * log array
 */
info("log array");
void function() {
    dump(["abc"]);
    error(["def"]);
    info(["abc"]);
    warn(["123123"]);
    celebr(["098765"]);
}();


/**
 * log with json 
 */
info("log json");
void function() {
    dump(["abc"],{
        "a":"1312312312312312312123123"
    });
    error(["abc"],{
        "a":"1312312312312312312123123",
        "b":"1312312312312312312123123123123123123123123"
    });
    info(["abc"],{
        "a":"1312312312312312312123123"
    });
    warn(["abc"],{
        "a":"1312312312312312312123123"
    });
    celebr(["abc"],{
        "a":"1312312312312312312123123"
    });
}();


/**
 * log error
 */
info("log error");
void function() {
    error(new Error(),new Error());
}();

