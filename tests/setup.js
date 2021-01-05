jest.setTimeout(25000);
const keys = require('../config/keys');
require('../models/User');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
//useMongoClient -> avoids a deprecation warning
mongoose.connect(keys.mongoURI, { useMongoClient: true});

