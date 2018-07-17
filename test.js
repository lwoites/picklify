/* eslint-env node, mocha */

const picklify = require('./picklify');
const assert = require('chai').assert;

describe('Basic objects serialization', function() {
    it('should serialize Dates', function() {
        const srcDate = new Date(2018, 1, 1);

        const serializedData = picklify.picklify(srcDate);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.typeOf(reconstructedObject, 'Date');
        assert.equal(reconstructedObject.toJSON(), srcDate.toJSON());
    });

    it.skip('should serialize strings', function() {
        const mixedArray = 'loveIsStrong';

        const serializedData = picklify.picklify(mixedArray);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.isString(reconstructedObject);
        assert.deepEqual(mixedArray, reconstructedObject);
    });

    it.skip('should serialize numbers', function() {
        const number = 1;

        const serializedData = picklify.picklify(number);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.isNumber(reconstructedObject);
        assert.equal(number, reconstructedObject);
    });

    it.skip('should serialize booleans', function() {
        const boolean = true;

        const serializedData = picklify.picklify(boolean);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.isBoolean(reconstructedObject);
        assert.equal(boolean, reconstructedObject);
    });
});


describe('compound objects serialization', function() {
    it('should serialize an empty array', function() {
        const input = [];

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.isArray(reconstructedObject);
        assert.deepEqual(input, reconstructedObject);
    });

    it('should serialize arrays', function() {
        const input = [1, 'b', 3.0, null, undefined, true, false, NaN, Infinity, -Infinity];

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.isArray(reconstructedObject);
        assert.deepEqual(input, reconstructedObject);
    });

    it('should serialize nested arrays', function() {
        const input = [
            [1],
            [2, 3],
            [4, 5],
            [6, [7, 8, [9, 10]]],
        ];

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.isArray(reconstructedObject);
        assert.deepEqual(input, reconstructedObject);
    });

    it('should serialize an empty object', function() {
        const input = {};

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.isObject(reconstructedObject);
        assert.deepEqual(input, reconstructedObject);
    });

    it('should serialize array of objects', function() {
        const input = [
            {
                a: 1, b: 'b',
            },
            {
                c: 1, d: 'b',
            },
        ];

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.isArray(reconstructedObject);
        assert.deepEqual(input, reconstructedObject);
    });

    it('should serialize objects', function() {
        const input = {
            a: 1, b: 'b', c: 3.0, d: null, e: undefined, f: true, g: false, h: NaN, i: Infinity, j: -Infinity,
        };

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.isObject(reconstructedObject);
        assert.deepEqual(input, reconstructedObject);
    });

    it('should serialize nested objects', function() {
        const input = {
            o1: {
                a: 1, b: 'b',
                o2: {
                    c: 3.0,
                },
            },
            o3: {
                d: null, e: undefined,
                o4: {
                    f: true, g: false, h: NaN, i: Infinity, j: -Infinity,
                },
            },
        };

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.isObject(reconstructedObject);
        assert.deepEqual(input, reconstructedObject);
    });

    it('should serialize objects with arrays', function() {
        const input = {
            a: [1, 2, 3],
            b: ['a', 'b', 'c'],
        };

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.isObject(reconstructedObject);
        assert.deepEqual(input, reconstructedObject);
    });
});

describe('Mantain references on serialization', function() {
    it('should keep references', function() {
        const aSharedList = [4, 5, 6];
        const object1 = {'a': 1, 'l1': aSharedList};
        const object2 = {'b': 2, 'l2': aSharedList};
        const input = [object1, object2, object1, object2];

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.equal(reconstructedObject[0], reconstructedObject[2]);
        assert.equal(reconstructedObject[1], reconstructedObject[3]);
        assert.equal(reconstructedObject[0].l1, reconstructedObject[1].l2);
    });

    it('should serialize recursive objects', function() {
        let object1 = {'a': 1};
        const object2 = {'b': 2, 'o1': object1};
        object1['o2'] = object2;

        const input = object1;

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.deepEqual(input, reconstructedObject);
        assert.equal(reconstructedObject, reconstructedObject.o2.o1);
    });
});


describe('Custom class serialization', function() {
    it('should serialize a custom class', function() {
        function buildClass() {
            class Musician {
                constructor() {
                    this.name = 'Freddy Mercury';
                    this.age = 33;
                }
            }

            return Musician;
        }

        let MusicianClass = buildClass();
        let input = new MusicianClass();

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData, [MusicianClass]);

        assert.instanceOf(reconstructedObject, MusicianClass);
        assert.deepEqual(reconstructedObject, input);
    });

    it('should raise Error when cannot find constructor', function() {
        function buildClass() {
            class Musician {
                constructor() {
                    this.name = 'Freddy Mercury';
                    this.age = 33;
                }
            }

            return Musician;
        }

        let MusicianClass = buildClass();
        let input = new MusicianClass();

        const serializedData = picklify.picklify(input);

        assert.throws(
            () => picklify.unpicklify(serializedData),
            Error, 'Cannot build object of type Musician'
        );
    });

    it('should keep object references', function() {
        function buildClasses() {
            class Band {
                constructor(name, members=[]) {
                    this.name = name;
                    this.members = members;
                }
            }

            class Musician {
                constructor(name, age) {
                    this.name = name;
                    this.age = age;
                }
            }

            return {Band, Musician};
        }
        const metadata = {haveGnrMembers: true};
        const {Band, Musician} = buildClasses();
        let slash = new Musician('Slash', 44);
        let gnr = new Band('GnR', [slash]);
        let velvetRevolver = new Band('Velvet Revolver', [slash]);

        gnr.metadata = metadata;
        velvetRevolver.metadata = metadata;

        const input = [gnr, velvetRevolver];
        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData, [Band, Musician]);

        assert.deepEqual(input, reconstructedObject);
        assert.instanceOf(input[0], Band);
        assert.instanceOf(input[0].members[0], Musician);

        assert.equal(input[0].members[0], input[1].members[0]);
        assert.equal(input[0].metadata, input[1].metadata);
    });
});

describe('Serialize only defined keys', function() {
    it('should work for plain objects', function() {
        let input = {
            propsToSerialize: () => [
                'prop1', 'prop2', 'prop3',
            ],
            prop1: [1, 2, 3],
            prop2: {'a': 1},
            prop3: 'prop3',
            prop4: 4,
            prop5: [5, 6],
        };

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData);

        assert.doesNotHaveAllKeys(reconstructedObject, ['propsToSerialize', 'prop4', 'prop5'] );

        delete input.prop4;
        delete input.prop5;
        delete input.propsToSerialize;
        assert.deepEqual(reconstructedObject, input);
    });

    it('should work for classes', function() {
        function buildClass() {
            class Example {
                constructor() {
                }

                propsToSerialize() {
                    return ['prop4', 'prop5'];
                }
            }
            return Example;
        }
        let Example = buildClass();
        let input = new Example();
        input.prop1 = [1, 2, 3];
        input.prop2 = 22;
        input.prop3 = 'abc';
        input.prop4 = new Date();
        input.prop5 = {'a': 1};

        const serializedData = picklify.picklify(input);
        const reconstructedObject = picklify.unpicklify(serializedData, [Example]);

        assert.doesNotHaveAllKeys(reconstructedObject, ['prop1', 'prop2', 'prop3'] );

        delete input.prop1;
        delete input.prop2;
        delete input.prop3;

        assert.deepEqual(reconstructedObject, input);
    });
});