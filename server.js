'use strict';

var restify = require('restify');
var plugins = require('restify-plugins');
var restifyValidator = require('restify-validator');
const corsMiddleware = require('restify-cors-middleware');

var server = restify.createServer({
  name: '[Vin Elasticsearch]',
  version: '1.0.0'
});


//var elasticsearch = require('elasticsearch');
var setupController = require('./controllers/setupController.js');
var client = require('./controllers/elasticConnection.js');

setupController(server, restify, plugins, restifyValidator);

function checkElasticSearchHealth(){
client.cluster.health({},function(err,resp,status) {
  console.log("-- Client Health --",resp);
});
}

checkElasticSearchHealth();

//require and init
function requireAndInit(handlers) {
    handlers.map((handler) => {
        require(handler).call(null, server);
    });
}

requireAndInit([
  './routes/addDataViaAlias.js',
  './routes/addTemplatetoES.js',
  './routes/checkESCloud.js',
  './routes/createIndex.js',
  './routes/createIndexAliasByRounting.js',
  './routes/getAliasDataCountForIndex.js',
  './routes/getIndexDataById.js',
  './routes/getUserById.js',
  './routes/getUsers.js',
  './routes/swapAliasToIndex.js',
    // Assuming this list gets long
]);




const cors = corsMiddleware({
  preflightMaxAge: 5, //Optional
  origins: ['*'],
  allowHeaders: ['API-Token'],
  exposeHeaders: ['API-Token-Expiry']
});

server.pre(cors.preflight);
server.use(cors.actual);

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
