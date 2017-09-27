'use strict';

const uuidv1 = require('uuid/v1');

 function _respond(res, next, status, data, http_code) {
      var response = {
        'status': status,
        'data' : data
      };
      res.setHeader('Content-type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin','*');
      /*
      Access-Control-Allow-Credentials,
      Access-Control-Expose-Headers,
      Access-Control-Max-Age,
      Access-Control-Allow-Methods,
      Access-Control-Allow-Headers
      */
      res.writeHead(http_code);
      res.end(JSON.stringify(response));
}

function _respondArray(res, next, status, data, http_code) {
    var response = {
       'data' : [data]
      }
     res.setHeader('Content-type', 'application/json');
     res.setHeader('Access-Control-Allow-Origin','*');
     /*
     Access-Control-Allow-Credentials,
     Access-Control-Expose-Headers,
     Access-Control-Max-Age,
     Access-Control-Allow-Methods,
     Access-Control-Allow-Headers
     */
     res.writeHead(http_code);
     res.end(JSON.stringify(data));
}

module.exports.success = function success(res, next, data){
  _respond(res, next, 'success', data, 200);
}

module.exports.successArray = function successArray(res, next, data){
  _respondArray(res, next, 'success', data, 200);
}

module.exports.failure = function failure(res, next, data, http_code){
  console.log('Error: ' + http_code + ' ' + data);
  _respond(res, next, 'failure', data, http_code);
}

module.exports.generateUUID = function generateUUID() {
    /*
    //using own logic
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid.toUpperCase();*/
    //using npn package UUID Simple, fast generation of RFC4122 UUIDS
    return uuidv1();
}
