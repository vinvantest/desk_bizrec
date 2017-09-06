'use strict';

var helper = require('../helper/helperFunctions.js');
var esClient = require('../controllers/elasticConnection.js');

function getIndexDataCount(server) {
  server.get('/getIndexDataCount/:indexAliasName', function (req, res, next)
	{
   console.log('Inside serer.post(getIndexDataCount)');
   req.assert('indexAliasName', 'indexAliasName is required and must be lowercase string').notEmpty();//.isAlphanumeric();
   const errors = req.validationErrors();
   if(errors) {
       helper.failure(res,next,errors[0],401);
       return next();
   }
   console.log('req.params.indexAliasName = ' + JSON.stringify(req.params.indexAliasName));
   var indexAliasName = req.params.indexAliasName;
   var res_msg = 'Error - Document Not Indexed in ['+indexAliasName+']';
	 console.log('Checking if ['+indexAliasName+'] Exists');

   esClient.indices.exists({index: indexAliasName})
		 .then(function (exists)
            {
              console.log('inside function(exists)');
              if(exists)
              { //index exists
                console.log('Index ['+indexAliasName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists));
                res_msg = 'Index ['+indexAliasName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists);
                esClient.count({index: indexAliasName, type: 'type_name'})
                  .then(function (resp){
                    console.log('Index ['+indexAliasName+'] exists in ElasticSearch AND count = '+resp.count);
                    res_msg = 'Index ['+indexAliasName+'] exists in ElasticSearch AND count = '+resp.count;
                     //esClient.close();
                    helper.success(res,next,res_msg);
                  }, function (error) {
                    console.log('Error: Index ['+indexAliasName+'] exists in ElasticSearch but count error -'+JSON.stringify(error));
                    res_msg = 'Error: Index ['+indexAliasName+'] exists in ElasticSearch but count error -'+JSON.stringify(error);
                     //esClient.close();
                    helper.failure(res,next,res_msg,500);
                  }); //end count()
              }//end if index Exists
              else {
                //index dosen't exist
           			console.log('Index ['+indexAliasName+'] does not exist! Error value is ->'+JSON.stringify(exists));
           			res_msg = 'Index ['+indexAliasName+'] does not exists!'+JSON.stringify(exists);
                 //esClient.close();
                 helper.failure(res,next,res_msg,404);
              }//end else index exists
            }); //end then - indices.exists()
    }); //end server.post()
};

module.exports = getIndexDataCount;
