'use strict';

var helper = require('../helper/helperFunctions.js');

function Apps(server) {
    server.get('/apps', function (req, res, next) {
		  var returnObj = 'Welcome to test project for Apps route';
          helper.success(res,next,returnObj);
          return next();
   });
};

module.exports = Apps;