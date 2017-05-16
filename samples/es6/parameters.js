#!/usr/bin/env node

const test = (a, ...bcd) => console.log(a, ...bcd);
              // ^- reszta                 ^- rozwinięcie

let y = [1,2,3];
let x = [...y];
console.log('x', x);

test(1, 2, ...[3, 4], 5);
        // ^- rozwinięcie

const test2 = (a, b = [3, 4], c = test) => console.log(a, ...b, c);
                 // ^- domyślna wartość

test2(3, [1, 2, 4]);
