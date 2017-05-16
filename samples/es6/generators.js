function* foo(...n) {
    yield 1;
    yield 3;

    const x = [...n, 2,3,4];
    for (let i = 0; i < x.length; i++) {
        yield x[i];
    }

    return;
}

for(let x of foo(1,2,3)) {
    console.log(x);
}
