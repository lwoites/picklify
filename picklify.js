function _pad(num, size) {
    let s = num+'';
    while (s.length < size) s = '0' + s;
    return s;
}

function _getObjectType(object) {
    return object?object.constructor.name:'Null';
}

function _isSimpleObject(object) {
    return ['Boolean', 'String', 'Number', 'Null'].includes(_getObjectType(object));
}

function _isDate(object) {
    return _getObjectType(object) === 'Date';
}

function _isReference(object) {
    return (_getObjectType(object) == 'String' && /__\d{5}__/.test(object));
}

// TODO: support regular expresions

class Serializer {
    constructor() {
        this.clean();
    }

    clean() {
        this.objects = {};
        this.types = {};
        this.rootObjects = [];
        this.lastId = 0;
    }

    serialize(rootObject, objectName=null) {
        this.clean();
        let rootOid = this._getOrCreateId(rootObject);
        this.rootObjects.push({
            'id': rootOid,
            'name': objectName,
        });
        this.objectsFound = {[rootOid]: rootObject};
        this.toSerialize = [rootObject];
        while (this.toSerialize.length > 0) {
            let obj = this.toSerialize.shift();
            let oid = this._getOrCreateId(obj);
            // console.log(`Serializing ${oid} of type ${obj.constructor.name}`);
            this.objects[oid] = this._serializeObject(obj, true);
            this.types[oid] = obj.constructor.name;
        }

        return {
            rootObjects: this.rootObjects,
            objects: this.objects,
            types: this.types,
        };
    }

    _serializeObject(object, firstCall=false) {
        if (_isSimpleObject(object)) {
            return object;
        } else {
            // compound object // Array, Object or class
            return this._serializeCompoundObject(object, firstCall);
        }
    }

    _serializeCompoundObject(object, firstCall) {
        let oid = this._getOrCreateId(object);
        if (this.objectsFound[oid] === undefined) {
            // console.log(`${object.constructor.name} ${oid} found`);
            this.objectsFound[oid] = object;
            this.toSerialize.push(object);
        }
        if (!firstCall) {
            return object.__id__;
        }

        let objectData = {};
        if (_isDate(object)) {
            objectData.milliseconds = object.valueOf();
        } else {
            let keysToSerialize = this._keysToSerialize(object);
            keysToSerialize.forEach((key) => {
                objectData[key] = this._serializeObject(object[key]);
            });
        }
        return objectData;
    }

    _getOrCreateId(object) {
        if (object.__id__ === undefined) {
            Object.defineProperty(
                object,
                 '__id__',
                {
                    enumerable: false,
                    writable: false,
                    value: this._getNewId(),
                }
            );
        }
        return object.__id__;
    }

    _getNewId() {
        this.lastId = this.lastId + 1;
        let paddedId = _pad(this.lastId, 5);
        return `__${paddedId}__`;
    }

    _keysToSerialize(object) {
        if (object.propsToSerialize && object.propsToSerialize()) {
            return object.propsToSerialize();
        } else {
            return Object.keys(object);
        }
    }
}


class Loader {
    constructor() {
        this.built = {
            rootObjects: [],
            objects: {},
            types: {},
        };
        this.savedData = null;
    }

    registerClasses(...classes) {
        classes.forEach((_class) => {
            this.built.types[_class.name] = _class;
        });
    }

    initialize(objectDataOrJSON) {
        this.savedData = objectDataOrJSON;
    }

    buildObjects() {
        let rootObjectId = this.savedData.rootObjects[0].id;
        this.toBuild = [];
        this.buildObject(rootObjectId);

        this.built.rootObjects.push(this.built.objects[rootObjectId]);
        return this.built.objects[rootObjectId];
    }

    getClass(classString) {
        if (this.built.types[classString] === undefined) {
            // if class is not registered build it from global scope
            try {
                this.built.types[classString] = eval(classString);
            } catch (error) {
                throw new Error(`Cannot build object of type ${classString}. Have you registered it?`);
            }
        }
        return this.built.types[classString];
    }

    instanceObject(oid) {
        let ObjConstructor = this.getClass(this.savedData.types[oid]);
        let values = this.savedData.objects[oid];

        let instance = null;
        if (ObjConstructor === Date) {
            instance = new Date(values.milliseconds);
            this.built.objects[oid] = instance;
        } else {
            instance = new ObjConstructor();
            this.built.objects[oid] = instance;
            Object.keys(values).forEach( (key) => {
                instance[key] = this.buildObject(values[key]);
            });
        }

        return instance;
    }

    buildObject(objData) {
        if (_isReference(objData)) {
            // replace object id for the object itself
            let oid = objData;

            let instance = this.built.objects[oid];
            if (instance === undefined) {
                // if the object doesn't exist, create it
                instance = this.instanceObject(oid);
            }
            return instance;
        } else if (_isSimpleObject(objData)) {
            return objData;
        } else {
            throw new Error(`Unsupported object type: ${objData}`);
        }
    }
}

function picklify(rootObject) {
    return new Serializer().serialize(rootObject);
}

function unpicklify(serializedData, externalClasses=[]) {
    const loader = new Loader();
    loader.registerClasses(...externalClasses);
    loader.initialize(serializedData);

    return loader.buildObjects();
}

module.exports = {
    picklify,
    unpicklify,
};
