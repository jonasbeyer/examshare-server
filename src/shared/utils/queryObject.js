class QueryObject {

    constructor(object) {
        for (const property in object) {
            if (object[property] !== undefined)
                this[property] = object[property];
        }
    }

    toObject() {
        return Object.assign({}, this);
    }

}

module.exports = QueryObject;