'use strict';

var helper = require('../helper/helperFunctions.js');
var esClient = require('../controllers/elasticConnection.js');

function addDataViaAlias(server) {
  server.post('/addDataViaAlias/:indexAliasName', function (req, res, next)
	{
   console.log('Inside serer.post(addDataViaAlias)');
   console.log('---******************--------');
   console.log(req.body);
   console.log('---******************--------');
   req.assert('indexAliasName', 'indexAliasName is required and must be alphanumeric string').notEmpty();//.isAlphanumeric();
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
         + 'where first param is: ' + JSON.stringify(req.query.first)
         + 'second param is: ' + JSON.stringify(req.query.second)
         + 'third param is: ' + JSON.stringify(req.query.third)
       );
   //you can loop in the query object
   for(const field in req.query){
   console.log('Field['+field+'] = '+req.query[field]);
   }//for loop end

   var res_msg = 'Error - Document Not Indexed in ['+indexAliasName+']';
	 console.log('Checking if ['+indexAliasName+'] Exists');

   esClient.indices.existsAlias({name: indexAliasName})
		 .then(function (exists)
            {
              console.log('inside function(exists)');
              if(exists)
              { //index exists
                console.log('Index ['+indexAliasName+'] exists in ElasticSearch. Response is ->'+exists);
                res_msg = 'Index ['+indexAliasName+'] exists in ElasticSearch';
                esClient.indices.getMapping({index: indexAliasName})
                  .then(function (response) {
                      res_msg = 'Mapping ['+indexAliasName+'] already exists. Start calling Index.save()';
                      //insert document from here
                      console.log('loading sample_data_tran_v1.json file ....');
                      var tranDataBody = req.body; //require('../test_data/sample_data_tran_v1.json');
                      console.log('sample_data_tran_v1.json file Loaded !');
                      esClient.index({
                            index: indexAliasName,
                            type: 'type_name',
                            //id: '1', //auto generate one id = AV42nEv9o_vzDBnnlJzI
                            body: tranDataBody
                          })
                          .then(function (resp) {
                            res_msg = 'Document inserted in ['+indexAliasName+']';
                            //esClient.close(); //use in lambda only
                            helper.success(res,next,res_msg);
                          },
                          function (error) {
                            res_msg = 'Error : Document insert ['+indexAliasName+'] Failed' + JSON.stringify(error);
                            //esClient.close(); //use in lambda only
                            helper.failure(res,next,res_msg,500);
                          });
                  },function (error){//mapping doesn't exists
                    console.log('Mapping ['+indexAliasName+'] Not created. ' + JSON.stringify(error));
                    res_msg = 'Mapping ['+indexAliasName+'] Not created. '+ JSON.stringify(error);
                    //context.succeed(responder.success(JSON.stringify(res_msg)));
                    //esClient.close();
                    helper.failure(res,next,res_msg,500);
                });//end indices.getMapping()
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

module.exports = addDataViaAlias;
