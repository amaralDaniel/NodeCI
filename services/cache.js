const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');

//const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = function (options = {}) {
    this._cache = true;
    this._hashKey = JSON.stringify(options.key || '');

    //making it chainable
    return this;
}

mongoose.Query.prototype.exec = async function () {
    if (!this._cache) {
        console.log("Fetched from MongoDB");
        return exec.apply(this, arguments)
    }
    console.log("Cached", this.mongooseCollection.name);
    const key = JSON.stringify(Object.assign({}, this.getQuery(), {
        collection: this.mongooseCollection.name
    }));

    //hget is for nested hash
    const cacheValue = await client.hget(this._hashKey, key);


    //do we have a value for key?
    // yes -> return
    if (cacheValue) {
        //console.log(this);
        console.log("Fetched from redis")
        const doc = JSON.parse(cacheValue);
        return Array.isArray(doc) 
        ?  doc.map(d => new this.model(d))
        : new this.model(doc);
    }

    //no -> exec the query, store in redis 
    //console.log(key);
    const result = await exec.apply(this, arguments);

    client.hset(this._hashKey, key, JSON.stringify(result), 'EX', 10);
    return result;
}

module.exports = {
    clearHash(hashKey) {
        client.del(JSON.stringify(hashKey));
    }
};