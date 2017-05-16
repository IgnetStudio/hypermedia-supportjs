#!/usr/bin/env node

let x = 0;
let y = 1;

const obj = {
    x,
    y: y + 2,
    z: y + 1,
    ["abc" + x]: y,
    func(x) {
        console.log("aaa");
        return {a: x + 1};
    }
};

obj["abc" + y] = 1;

x++;

console.log(obj);

function abc() {}

function foo() {}

module.exports = {
    abc, foo,
    get bar() {
        return obj.func(100);
    }
};
