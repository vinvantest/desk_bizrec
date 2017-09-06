'use strict';

var elasticsearch = require('elasticsearch');

var auth = 'vintest:test1234';
var port = 20914;
var protocol = 'https';
var log = 'trace';
var hostUrls = [ 
            'iad1-10914-0.es.objectrocket.com', 
            'iad1-10914-1.es.objectrocket.com', 
            'iad1-10914-2.es.objectrocket.com', 
            'iad1-10914-3.es.objectrocket.com'
      ];
var hosts = hostUrls.map(function(host) {
    return {
        protocol: protocol,
        host: host,
        port: port,
        auth: auth,
		log: log
    };
});

var client = new elasticsearch.Client({
    //hosts: hosts
	host: 'localhost:9200',
	log: 'trace'
});

client.ping({
    requestTimeout: 30000
}, function(error) {
    if (error) {
        console.trace('Error: elasticsearch cluster is down!', error);
    } else {
        console.log('Elasticsearch Instance on ObjectRocket Connected!');
    }
    // on finish
    //client.close();
});

module.exports = client;