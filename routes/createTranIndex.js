'use strict';

var helper = require('../helper/helperFunctions.js');
var esClient = require('../controllers/elasticConnection.js');

function createTranIndex(server) {
    server.post('/createTranIndex/:indexName', function (req, res, next)
		{
		 req.assert('indexName', 'indexName is required and must be lowercase').notEmpty();//.isLowercase();
		 const errors = req.validationErrors();
		  if(errors) {
			helper.failure(res,next,errors[0],401);
			return next();
		  }
		  console.log('req.params.indexName = ' + JSON.stringify(req.params.indexName));
		  //get Query params
		  const queryParams = req.getQuery();
		  console.log('queryParams passed is -> {' + JSON.stringify(queryParams) + '} '
					  + 'where first param is: ' + JSON.stringify(req.query.first)
					  + 'second param is: ' + JSON.stringify(req.query.second)
					  + 'third param is: ' + JSON.stringify(req.query.third)
					);
		  //you can loop in the query object
		  for(const field in req.query){
			console.log('Field['+field+'] = '+req.query[field]);
		  }//for loop end

		 var indexName = req.params.indexName;
     indexName = indexName.replace(/[^a-zA-Z0-9_-]/g,'_').replace(/_{2,}/g,'_').toLowerCase();
     console.log('var indexName after conversion = [' + indexName + ']');
		 var res_msg = 'Index not created';

  //check if index creation is within data model
  if(!indexName.includes('tran'))
    helper.failure(res,next,res_msg + ' - ' + 'no template exists for the index name',404);

	 console.log('Checking if index Exists('+indexName+')');
	 esClient.indices.exists(indexName)
		 .then(function (resp) {//index exists
				console.log('Index ['+indexName+'] already exists in ElasticSearch. Response is ->'+resp);
				res_msg = 'Index ['+indexName+'] already exists in ElasticSearch'+JSON.stringify(resp);
				//check if mapping exists
				esClient.indices.getMapping({index: indexName})
					.then(function (response) {
							res_msg = 'Mapping ['+indexName+'] already exists. Start creating documents. ' + JSON.stringify(response);
							//esClient.close(); //close it in lambda only
							helper.success(res,next,res_msg);
					},function (error){//mapping doesn't exists
						console.log('Mapping ['+indexName+'] Not created. Before use create mapping' + JSON.stringify(error));
						res_msg = 'Mapping ['+indexName+'] Not created. Before use create mapping'+ JSON.stringify(error);
						//context.succeed(responder.success(JSON.stringify(res_msg)));
						//esClient.close(); //close it in lambda only
						helper.success(res,next,res_msg);
				});//end indices.getMapping()
	     }, function (err){ //index dosen't exist. Create one.
			console.log('Index does not Exists! ... Creating ['+indexName+'] now! Error value is ->'+JSON.stringify(err));
			res_msg = 'Creating ['+indexName+'] now!'+JSON.stringify(err);
			esClient.indices.create({index: indexName})
				.then(function (response) {
					    console.log('Index ['+indexName+'] Created! Before use create mapping -> '+ JSON.stringify(response));
						  res_msg = 'Index ['+indexName+'] Created with standard of template mapping.';
              /* Add alias to indexName before inserting documents */
              //you won't know what alias to use in the index ... do it at document insertion
						//context.succeed(responder.success(JSON.stringify(res_msg)));
						//esClient.close(); //close it in lambda only
						helper.success(res,next,res_msg);
					}, function (error) {
						console.log('Error: creating index ['+indexName+'] -> ' +JSON.stringify(error));
						res_msg = 'Error: creating index ['+indexName+']'+JSON.stringify(error);
						//context.fail(responder.internalServerError('Error: elasticsearch cannot create index and put mapping! -> '+error));
						//esClient.close(); //close it in lambda only
						helper.failure(res,next,res_msg + ' - ' + error,500);
					});
	    });//end then - indices.exists()
    });
};

module.exports = createTranIndex;
