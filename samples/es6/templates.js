
const quux = (strings, ...values) => console.log(strings, values);

let node = {x:1};

quux `foo\n${ 42 }${node.x}bar`;
