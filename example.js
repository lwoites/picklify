
const pickle = require('./pickle');


let nonreferenceable = {'nested': {'nested': {'morenested': 'value'}}};
let ref = {
    'caro': 'laucha',
    // c: new C(new A()),
};

class A {
    constructor() {
        this.n = 10,
        this.config = {
            'a': 1,
            'b': null,
            'c': [1.2, 2, 3, 4, 5, 6],
            'd': nonreferenceable,
        };
        this.b= new B(this);
        this.ref = ref;
    }
}

class B {
    constructor(a) {
        this.aaa = 'asdasd';
        this.a = a;
        this.ref = ref;
        this.d = nonreferenceable;
    }
}

class C {
    constructor(a) {
        this.a = a;
    }
}


let originalRoot = new A();
let fs = new pickle.FileSerializer();
fs.registerClasses(A, B, C);
fs.serialize('serialized.json', originalRoot);

let recoveredRoot = fs.load('serialized.json');
fs.serialize('serialized_2.json', recoveredRoot);


console.log(
    recoveredRoot.b.a === recoveredRoot,
    recoveredRoot.ref === recoveredRoot.b.ref,
    recoveredRoot.b.ref.a !== recoveredRoot,
    recoveredRoot.config.d.length === originalRoot.config.d.length
);

recoveredRoot.config.c.forEach((element) => {
    console.log(element);
});
