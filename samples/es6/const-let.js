#!/usr/bin/env node

const node = 0;
   // ^- node poza scope pętli

for (let x = 0; x < 10; x++) {
    let node = 0;
     // ^- node poza scope pętli
    node += x;
}
