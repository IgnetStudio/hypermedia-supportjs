
const foo = Symbol("foo");

class Stratus {
    constructor() {
        this[foo]();
    }

    [foo]() {
        this.foo = 1;
    }

    static get isCumulus() {

    }
}

module.exports = {
    Stratus,
    foo
};
