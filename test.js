/* eslint-env node, mocha */

const picklejs = require('./pickle');
const assert = require('chai').assert;

describe('', function() {
    it('should serialize Dates', function() {
        const srcDate = new Date(2018, 1, 1);

        let s = new picklejs.Serializer().serialize(srcDate);
        let loader = new picklejs.Loader();
        loader.initialize(s);
        let loaded = loader.buildObjects();

        assert.typeOf(loaded, 'Date');
        assert.equal(loaded.toJSON(), srcDate.toJSON());
    });
});
