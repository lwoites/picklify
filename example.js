
const pickle = require('./pickle');
const assert = require('assert');

let sharedObj = {'nested': {'nested': {'morenested': 'value'}}};
let sharedArray = [1.2, 2, 3, 4, 5, 6];

class A {
    constructor() {
        this.n = 10,
        this.config = {
            'a': 1,
            'b': null,
            'c': sharedArray,
            'sharedObj': sharedObj,
        };
        this.b= new B(this);
        this.sharedArray = sharedArray;
    }
}

class B {
    constructor(a) {
        this.aaa = 'asdasd';
        this.a = a;
        this.sharedArray = sharedArray;
        this.sharedObj = sharedObj;
    }
}

class Base {
    constructor() {
        this.base = 'base';
    }
}

class C extends Base {
    constructor(a) {
        super();
        this.a = a;
    }
}


let originalRoot = new A();
originalRoot.c = new C();
originalRoot.c.b = new B(originalRoot);

let fs = new pickle.FileSerializer();
fs.registerClasses(A, B, C);
fs.serialize('serialized.json', originalRoot);

let recoveredRoot = fs.load('serialized.json');
fs.serialize('serialized_2.json', recoveredRoot);


assert.equal(recoveredRoot.b.a, recoveredRoot);
assert.equal(recoveredRoot.config.sharedObj, recoveredRoot.b.sharedObj);
assert.equal(recoveredRoot.config.b, null);
assert.equal(recoveredRoot.sharedArray, recoveredRoot.b.sharedArray);
assert.equal(recoveredRoot.sharedArray.length, originalRoot.sharedArray.length);

assert.notEqual(recoveredRoot.c.b, recoveredRoot.b);
assert.equal(recoveredRoot.c.b.a, recoveredRoot);

assert.equal(recoveredRoot.c.base, 'base');
