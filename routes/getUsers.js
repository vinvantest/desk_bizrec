'use strict';

var helper = require('../helper/helperFunctions.js');

function Users(server) {
    server.get('/users', function (req, res, next) {
		  var returnObj = 'Welcome to test project for Users route';
          helper.success(res,next,returnObj);
          return next();
    });
};

module.exports = Users;