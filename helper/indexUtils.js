'use strict';

var client = require('../controllers/elasticConnection.js');

/**
* Delete an existing index
*/
function deleteIndex(indexName) {  
    return client.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;

/**
* create the index
*/
function createIndex(indexName) {  
   // return client.indices.create({
   //     index: indexName
   // });
	console.log('Inside createIndex('+indexName+')');
   	return client.indices.create({  
			  index: indexName
			},function(err,resp,status) {
			  if(err) {
				console.log(err);
			  }
			  else {
				console.log('created ['+indexName+'] index ->',resp);
			  }
			});
}
exports.createIndex = createIndex;

/**
* check if the index exists
*/
function indexExists(indexName) {  
	console.log('Inside indexExists('+indexName+')');
    return client.indices.exists({
        index: indexName
    });
}
exports.indexExists = indexExists; 

/**
* prepare the index and its mapping
*/
 
function initMapping(indexName) {  
	console.log('Inside initMapping('+indexName+')');
    return client.indices.putMapping({
        index: indexName,
        type: "document",
        body: {
            properties: {
                title: { type: "string" },
                content: { type: "string" },
                suggest: {
                    type: "completion",
                    analyzer: "simple",
                    search_analyzer: "simple",
                    payloads: true
                }
            }
        }
    });
}
exports.initMapping = initMapping;
