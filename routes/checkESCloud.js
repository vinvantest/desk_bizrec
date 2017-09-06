'use strict';

var helper = require('../helper/helperFunctions.js');
var esClient = require('../controllers/elasticConnection.js');

function checkESCloud(server) {
    server.get('/checkESCloud', function (req, res, next)
		{

	esClient.ping({ requestTimeout: 30000 }, function(error)
		{
			if (error) {
				console.trace('Error: elasticsearch cluster is down!', error);
				helper.failure(res,next,error,500);
			} else {
				console.log('Elasticsearch Instance on ObjectRocket Connected!');
			}
			// on finish
			//esClient.close();
	});
	//check elasticsearch health
	esClient.cluster.health({},function(err,resp,status) {
		  console.log("-- esClient Health --",resp);
      console.log('UUID ['+helper.generateUUID()+']');
		  helper.success(res,next,resp);
	});
  });
};

module.exports = checkESCloud;
