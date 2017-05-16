const x = [1,2,3];
const y = {x, y: 3, z: 4};

x.a = 10;

const z = function({x: {a}, z}) {
    console.log(a, z);
};

z(y);

const {abc, bar} = require("./extended-object");

console.log(abc, bar);
