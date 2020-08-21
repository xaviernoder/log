# this is a beautiful node.js log library

1. you can git clone [https://github.com/XavierJava/log.git](https://github.com/XavierJava/log.git) this libray in your project,

    in this log you can get which file and line and log time

2. const { dump, error, info, warn, celebr } = require('log/index.js');
2. log number
```javascript
/**
 * log number
 */
info("log number");
dump(123);
error(123);
info(123);
warn(123);
celebr(123);
```
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2318016/1597974500955-ae67d196-4730-40cf-bde8-c2d20304ad27.png#align=left&display=inline&height=208&margin=%5Bobject%20Object%5D&name=image.png&originHeight=208&originWidth=1002&size=52729&status=done&style=none&width=1002)<br />

4. log string
```javascript
/**
 * log string
 */
info("log string");
dump("abc");
error("def");
info("abc");
warn("123123");
celebr("098765");
```
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2318016/1597974674583-edc0abc8-ec9f-4ef0-9afc-d86644ac7b70.png#align=left&display=inline&height=204&margin=%5Bobject%20Object%5D&name=image.png&originHeight=204&originWidth=1184&size=56083&status=done&style=none&width=1184)

5. log array
```javascript
/**
 * log array
 */
info("log array");
dump(["abc"]);
error(["def"]);
info(["abc"]);
warn(["123123"]);
celebr(["098765"]);
```
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2318016/1597974766609-ea028632-2b4f-46be-97cd-559e2d249277.png#align=left&display=inline&height=210&margin=%5Bobject%20Object%5D&name=image.png&originHeight=210&originWidth=1052&size=57358&status=done&style=none&width=1052)

6. log json
```javascript

/**
 * log json 
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
```
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2318016/1597974813534-06ac430f-ee38-43a5-821c-e1b25d13ec34.png#align=left&display=inline&height=318&margin=%5Bobject%20Object%5D&name=image.png&originHeight=318&originWidth=1622&size=79060&status=done&style=none&width=1622)

7. log error
```javascript
/**
 * log error
 */
info("log error");
void function() {
    error(new Error(),new Error());
}();
```
![image.png](https://cdn.nlark.com/yuque/0/2020/png/2318016/1597974859499-8c1599d1-7705-4e42-b222-cd4bf51bbdff.png#align=left&display=inline&height=904&margin=%5Bobject%20Object%5D&name=image.png&originHeight=904&originWidth=1640&size=203191&status=done&style=none&width=1640)
