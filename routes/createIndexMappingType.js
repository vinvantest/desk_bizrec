'use strict';

var helper = require('../helper/helperFunctions.js');
var esClient = require('../controllers/elasticConnection.js');

function createIndexMappingType(server) {
    server.post('/createIndexMappingType', function (req, res, next)
		{
		 req.assert('indexName', 'indexName is required and must be lowercase').notEmpty();//.isLowercase();
		 req.assert('typName', 'typeName is required and must be alphanumeric string').notEmpty().isAlphanumeric();
		 req.assert('mapping', 'payload is required and not be empty or null').notEmpty();

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
		 var typeName = req.params.typeName;
		 var res_msg = 'Index not created';

	 console.log('Checking if index Exists('+indexName+')');
	 esClient.indices.exists(indexName)
		 .then(function (resp) {//index exists
				console.log('Index ['+indexName+'] already exists in ElasticSearch. Response is ->'+resp);
				res_msg = 'Index ['+indexName+'] already exists in ElasticSearch'+JSON.stringify(resp);
				//check if mapping exists
				esClient.indices.getMapping({index: indexName})
					.then(function (response) {
							res_msg = 'Mapping ['+indexName+'] already exists. Start calling Index.save()';
							esClient.close();
							helper.success(res,next,res_msg);
					},function (error){//mapping doesn't exists
						console.log('Mapping ['+indexName+'] Not created. Creating Now! -> ' + JSON.stringify(error));
						res_msg = 'Mapping ['+indexName+'] Not created. Creating Now!'+ JSON.stringify(error);
						esClient.indices.putMapping({
									index: indexName,
									type: typeName,  //docType,
									body: //payload //below not required if JSON object passed to create mapping
										{
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
								}); //.then( function (resp) {}, function (err) {}).catch(err) {};
						//context.succeed(responder.success(JSON.stringify(res_msg)));
						esClient.close();
						helper.success(res,next,res_msg);
				});//end indices.getMapping()
	     }, function (err){ //index dosen't exist. Create one.
			console.log('Creating ['+indexName+'] now! Error value is ->'+JSON.stringify(err));
			res_msg = 'Creating ['+indexName+'] now!'+JSON.stringify(err);

																		/*esClient.index({
																		  index: indexName,
																		  type: 'posts',
																		  id: '1',
																		  body: {
																			user: 'me',
																			post_date: new Date(),
																			message: 'Hello World!'
																		  },
																		  refresh: true
																		})*/
				esClient.indices.create({index: indexName})
				.then(function (response) {
					console.log('Index ['+indexName+'] Created! Now putting mapping -> '+ JSON.stringify(response));
						res_msg = 'Index ['+indexName+'] Created! Now putting mapping'+JSON.stringify(resp);
						//now create mapping
						esClient.indices.putMapping({
									index: indexName,
									type: typeName, //docType,
									body: //paylod //below not required if JSON object passed to create mapping
										{
										properties: {
											title: { type: "string" },
											content: { type: "string" },
											suggest: {
												type: "completion",
												analyzer: "simple",
												search_analyzer: "simple",
												//payloads: true
											}
										}
									}
								}); //.then( function (resp) {}, function (err) {}).catch(err) {};
						res_msg = 'Index ['+indexName+'] Created with mapping';
						//context.succeed(responder.success(JSON.stringify(res_msg)));
						esClient.close();
						helper.success(res,next,res_msg);
					}, function (error) {
						console.log('Error: creating index ['+indexName+'] -> ' +JSON.stringify(err));
						res_msg = 'Error: creating index ['+indexName+']'+JSON.stringify(err);
						//context.fail(responder.internalServerError('Error: elasticsearch cannot create index and put mapping! -> '+error));
						esClient.close();
						helper.failure(res,next,res_msg + ' - ' + error,500);
					});
				/*.catch(error) {
						console.log('Error: Unexpected error occured in create() call ->'+error);
						res_msg = 'Error: creating index ['+indexName+'] -> ' +error;
				};*/
	    });//end then - indices.exists()
		/*.catch(error){
			console.log('Error: Unexpected error occured in create() call ->'+error);
			res_msg = 'Error: creating index ['+indexName+'] -> ' +error;
		}; //end catch - indices.exists()*/
	 esClient.close();
     helper.success(res,next,res_msg);
     return next();
    });
};

module.exports = createIndexMappingType;
