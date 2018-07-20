
[![Build Status](https://travis-ci.org/lwoites/picklify.svg?branch=master)](https://travis-ci.org/lwoites/picklify)
[![codecov](https://codecov.io/gh/lwoites/picklify/branch/master/graph/badge.svg)](https://codecov.io/gh/lwoites/picklify) [![Greenkeeper badge](https://badges.greenkeeper.io/lwoites/picklify.svg)](https://greenkeeper.io/)

Install
=======
    npm install picklify

Basic Usage
=======

```javascript
const { picklify, unpicklify } = require('picklify');
let serializedData = picklify(someObject);
// serializedData is JSON object that can be saved or being sent through the network

let originalObject = unpicklify(serializedData);

// unpicklify need access to constructors for building the original objects.
// So they must be on the global scope or being passed as a second argument to // unpicklify
let originalObject = unpicklify(serializedData, [class1, class2]);
```

Examples
=======

Keep references
--------------

```javascript
const aSharedList = [4, 5, 6];
const object1 = {'a': 1, 'l1': aSharedList};
const object2 = {'b': 2, 'l2': aSharedList};
const input = [object1, object2, object1, object2];

const serializedData = picklify.picklify(input);
const reconstructedObject = picklify.unpicklify(serializedData);

reconstructedObject[0].l1 ==  reconstructedObject[1].l2 // true
reconstructedObject[0] == reconstructedObject[2]; // true
reconstructedObject[1] == reconstructedObject[3]; // true
```

Allow recursion
---------------

```javascript
let object1 = {'a': 1};
const object2 = {'b': 2, 'o1': object1}; //object2 references object1
object1['o2'] = object2; //object1 references object2


const serializedData = picklify.picklify(object1);
const reconstructedObject = picklify.unpicklify(serializedData);
```

Custom classes
--------------

```javascript

let slash = new Musician('Slash', 44);
let gnr = new Band('GnR', [slash]);
let velvetRevolver = new Band('Velvet Revolver', [slash]);

const bands = [gnr, velvetRevolver];
const serializedData = picklify.picklify(bands);

const reconstructedBands = picklify.unpicklify(
    serializedData, [Band, Musician]
);

// evaulates to true
reconstructedBands[0].members[0] == reconstructedBands[1].members[0]
```

Reference
=======
    see test.js