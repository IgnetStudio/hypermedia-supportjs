"use strict";

class MyException extends Error {

    constructor(...args) {
        super(...args);
    }

}

const otherFunc = (arg, cb) => {
    console.log("otherfunc");
    if (arg === 2) {
        arg.test2.my = 10;
    } else if (arg === 4) {
        console.log(arg, cb);
        process.nextTick(
            () => {
                try {
                    arg.fun.my = 1;
                } catch(e) {
                    cb(e);
                }
                cb(null, 1);
            }
        );
    } else if (arg === 3) {
        throw new MyException("Should not be three!");
    } else if (arg === 1) {
        return new Promise((res, rej) => {
            //throw new Error("Abc");
            process.nextTick(
                () => {
                    try {
                        arg.fun.my = 1;
                    } catch(e) {
                        rej(e);
                    }
                    res(1);
                }
            );
        }).catch(
            (e) => {
                throw new Error(e.message);
            }
        );
    }
    // some other code here

    return 2;
};

const func = (arg, cb) => {
    try {
        return otherFunc(arg, cb);
    } catch(e) {
        if (e instanceof MyException) {
            console.log("Someone passed 3 again!!!");
            return -3;
        }
        console.log("function error", e.stack);
        throw e;
    } finally {
        console.log("function executed");
    }

    return 1;
};

console.log("1", func(1)
    .then(() => console.log("func done"))
    .catch((e) => console.log("function async error", e.stack))
);
console.log("3", func(3));
//console.log("2", func(2));
console.log("4", func(4, (err, result) => {
    if (err) {
        console.log("Asynchronous error", err.stack);
    }
    console.log("Asynchronous success", result);
}));
