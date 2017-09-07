'use strict';

var helper = require('../helper/helperFunctions.js');
var esClient = require('../controllers/elasticConnection.js');
var queryBuilder = require('elastic-builder');

function getUserById(server) {
  server.get('/getUserById/:indexAliasName', function (req, res, next)
	{
   console.log('Inside serer.post(getIndexDataById)');
   req.assert('indexAliasName', 'indexAliasName is required and must be lowercase string').notEmpty();//.isAlphanumeric();
   const errors = req.validationErrors();
   if(errors) {
       helper.failure(res,next,errors[0],401);
       return next();
   }
   console.log('req.params.indexAliasName = ' + JSON.stringify(req.params.indexAliasName));
   var indexAliasName = req.params.indexAliasName;
   //get Query params
   const queryParams = req.getQuery();
   console.log('queryParams passed is -> {' + JSON.stringify(queryParams) + '} '
         + 'where first param id is: ' + JSON.stringify(req.query.id)
         + 'second param is: ' + JSON.stringify(req.query.second)
         + 'third param is: ' + JSON.stringify(req.query.third)
       );
   //you can loop in the query object
   for(const field in req.query){
   console.log('Field['+field+'] = '+req.query[field]);
   }//for loop end

   var userUUID = req.query.id;
   userUUID = userUUID.trim();
   console.log('docmentId to be found in index ['+indexAliasName+'] -'+userUUID);
   var res_msg = 'Error - Document Not Indexed in ['+indexAliasName+']';
	 console.log('Checking if ['+indexAliasName+'] Exists');

   esClient.indices.exists({index: indexAliasName})
		 .then(function (exists)
            {
              console.log('inside function indices.exists())');
              if(exists)
              { //index exists
                console.log('Index ['+indexAliasName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists));
                res_msg = 'Index ['+indexAliasName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists);
                 //if you want to search ... but best use get() for quicker results
                var queryBody = {
                      query : {
                        match : {
                            _id : userUUID
                        }
                      }
                };
                //now get the document id by uuid
                //var queryBody = { index : indexAliasName, type : 'base_type', id : userUUID };
                //now search for the record
                //esClient.get(queryBody)
                esClient.search({index: indexAliasName, type: 'type_name', body: queryBody})
                  .then(function (resp){
                    console.log('Index ['+indexAliasName+'] exists in ElasticSearch AND response is = '+JSON.stringify(resp));
                    //res_msg = 'Index ['+indexAliasName+'] exists in ElasticSearch AND count = '+resp.count;
                     //esClient.close();
                    helper.success(res,next,JSON.stringify(resp));
                  },function (error) {
                    console.log('Error: Index ['+indexAliasName+'] exists in ElasticSearch but search() error -'+JSON.stringify(error));
                    res_msg = 'Error: Index ['+indexAliasName+'] exists in ElasticSearch but search() error -'+JSON.stringify(error);
                     //esClient.close();
                    helper.failure(res,next,res_msg,500);
                  }); //end search()
              }//end if index Exists
              else {
                //index dosen't exist
           			console.log('Index ['+indexAliasName+'] does not exist! Error value is ->'+exists);
           			res_msg = 'Index ['+indexAliasName+'] does not exists!'+exists;
                 //esClient.close();
                 helper.failure(res,next,res_msg,404);
              }//end else index exists
            }); //end then - indices.exists()
    }); //end server.post()
};

module.exports = getUserById;
