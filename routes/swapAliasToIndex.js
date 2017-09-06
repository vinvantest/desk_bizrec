'use strict';

var helper = require('../helper/helperFunctions.js');
var esClient = require('../controllers/elasticConnection.js');

function swapAliasToIndex(server) {
  server.post('/swapAliasToIndex/:indexName/:customer_eid/:newIndexName', function (req, res, next)
	{
   console.log('Inside serer.post(swapAliasToIndex)');
   req.assert('indexName', 'indexName is required and must be lowercase').notEmpty();//.isAlphanumeric();
   req.assert('customer_eid', 'indexName is required').notEmpty();
   req.assert('newIndexName', 'newIndexName is required').notEmpty();
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
   var newIndexName = req.params.newIndexName;
   var routingValue_customer_eid = req.params.customer_eid;
   console.log('Index ['+indexName+'] and routingValue ['+routingValue_customer_eid+'] and newIndexName ['+newIndexName+']');
   //if(routingValue.isEmail())
   newIndexName = newIndexName.replace(/[^a-zA-Z0-9_-]/g,'_').replace(/_{2,}/g,'_').toLowerCase();
   console.log('Index ['+indexName+'] and routingValue ['+routingValue_customer_eid+'] and newIndexName ['+newIndexName+']');

   var res_msg = 'Error - No Alias Created for ['+newIndexName+']';
	 console.log('Checking if ['+indexName+'] Exists');

   esClient.indices.exists({index: indexName})
   .then(function (exists)
          {
            if(exists)
            {
              esClient.indices.exists({index: newIndexName})
              .then(function (existsNewIndex)
                     {
                       if(existsNewIndex)
                       {
                         if(indexName.includes('tran-') && newIndexName.includes('tran-'))
                         {
                           //check if alias read exists
                           esClient.indices.existsAlias( { index: indexName, name: routingValue_customer_eid + '_transactions_' + 'read'})
                             .then( function (respReadExists) {
                                     if(respReadExists)
                                     {
                                       //check wirte Alias exists
                                       esClient.indices.existsAlias( { index: indexName, name: routingValue_customer_eid + '_transactions_' + 'write'})
                                         .then( function (respWriteExists)
                                         {
                                           if(respWriteExists)
                                           {
                                                 console.log('both alias Read & Write exists. Swaping now!');
                                                 var aliasBodySearch =
                                                     {
                                                       "actions" : [{
                                                         "add": {
                                                               "filter": {"term": {"customer_eid_for_alias": routingValue_customer_eid}},
                                                               "routing": routingValue_customer_eid
                                                               }
                                                     }]
                                                 };
                                                 esClient.indices.putAlias({index: newIndexName, name: routingValue_customer_eid + '_transactions_' + 'read', body: aliasBodySearch })
                                                   .then(function (resp){
                                                       console.log('Index ['+newIndexName+'] exists in ElasticSearch AND Alias read created for newIndexName = '+resp);
                                                       res_msg = 'Index ['+newIndexName+'] exists in ElasticSearch AND Alias read created for newIndexName = '+resp;
                                                       var aliasBodyDelete =
                                                           {
                                                             "actions" : [{
                                                               "remove": {
                                                                     "filter": {"term": {"customer_eid_for_alias": routingValue_customer_eid}},
                                                                     "routing": routingValue_customer_eid
                                                                     }
                                                           }]
                                                       };
                                                       esClient.indices.deleteAlias({index: indexName, name: routingValue_customer_eid + '_transactions_' + 'write'}) //, body: aliasBodyDelete })
                                                        .then(function (resp) {
                                                          console.log('Delete alias successful..!');
                                                          var aliasBodySearch =
                                                              {
                                                                "actions" : [{
                                                                  "add": {
                                                                        "filter": {"term": {"customer_eid_for_alias": routingValue_customer_eid}},
                                                                        "routing": routingValue_customer_eid
                                                                        }
                                                              }]
                                                          };
                                                          esClient.indices.putAlias({index: newIndexName, name: routingValue_customer_eid + '_transactions_' + 'write', body: aliasBodySearch })
                                                            .then(function (resp){
                                                                console.log('Index ['+newIndexName+'] exists in ElasticSearch AND Alias write created for newIndexName = '+resp);
                                                                res_msg = 'Index ['+newIndexName+'] exists in ElasticSearch AND Alias write created for newIndexName = '+resp;
                                                                 //esClient.close();
                                                                helper.success(res,next,res_msg);
                                                              }, function (error) {
                                                                console.log('Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not added to newIndexName -'+JSON.stringify(error));
                                                                res_msg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not added to newIndexName -'+JSON.stringify(error);
                                                                 //esClient.close();
                                                                helper.failure(res,next,res_msg,500);
                                                              }); //end putAlias(write)
                                                        }, function (err) {
                                                          console.log('Error: Index ['+indexName+'] Alias could not be delted -'+JSON.stringify(error));
                                                          res_msg = 'Error: Index ['+indexName+'] Alias could not be delted -'+JSON.stringify(error);
                                                           //esClient.close();
                                                          helper.failure(res,next,res_msg,500);
                                                        }); //end deleteAlias
                                                     }, function (error) {
                                                       console.log('Error: Index ['+indexName+'] exists in ElasticSearch but Alias read not added to newIndexName -'+JSON.stringify(error));
                                                       res_msg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not added to newIndexName -'+JSON.stringify(error);
                                                        //esClient.close();
                                                       helper.failure(res,next,res_msg,500);
                                                     }); //end putAlias(write)
                                                 /* //updateAliases only works for 1 actions
                                                 var aliasBodyUpdate =
                                                     {
                                                       "actions" : [{
                                                               /*"remove" : {
                                                                 "alias": routingValue_customer_eid + '_transactions_' + 'write',
                                                                 "index": indexName
                                                               },
                                                               "add" : {
                                                                 "alias": routingValue_customer_eid + '_transactions_' + 'write',
                                                                 "index": newIndexName
                                                               },
                                                               "add": {
                                                                     "alias": routingValue_customer_eid + '_transactions_' + 'read',
                                                                     "index": newIndexName
                                                                   }
                                                      }]
                                                 };
                                                 //updateAliases
                                                 esClient.indices.updateAliases({ body: aliasBodyUpdate })
                                                     .then(function (resp){
                                                         console.log('Index ['+newIndexName+'] exists in ElasticSearch AND Alias read created = '+resp);
                                                         res_msg = 'Index ['+newIndexName+'] exists in ElasticSearch AND Alias read created  = '+resp;
                                                         //esClient.close();
                                                         helper.success(res,next,res_msg);
                                                       }, function (error) {
                                                         console.log('Error: Index ['+newIndexName+'] exists in ElasticSearch but Alias read not created due to Update Failure - '+JSON.stringify(error));
                                                         res_msg = 'Error: Index ['+newIndexName+'] exists in ElasticSearch but Alias read not created due to Update Failure - '+JSON.stringify(error);
                                                          //esClient.close();
                                                         helper.failure(res,next,res_msg,500);
                                                       }); //end putAlias(write)
                                                */
                                           } //end if(respWriteExists)
                                           else {
                                             console.log('Alias ['+routingValue_customer_eid + '_transactions_' + 'write'+'] does not exists in ElasticSearch. Cannot create aliases!');
                                             res_msg = 'Index ['+routingValue_customer_eid + '_transactions_' + 'write'+'] does not exists in ElasticSearch. Cannot create aliases!';
                                              //esClient.close();
                                             helper.failure(res,next,res_msg,404);
                                           }//end else respWriteExists
                                         }); //end then().respWriteExists
                                     } //end if(respReadExists)
                                     else {
                                       console.log('Alias ['+routingValue_customer_eid + '_transactions_' + 'read'+'] does not exists in ElasticSearch. Cannot create aliases!');
                                       res_msg = 'Index ['+routingValue_customer_eid + '_transactions_' + 'read'+'] does not exists in ElasticSearch. Cannot create aliases!';
                                        //esClient.close();
                                       helper.failure(res,next,res_msg,404);
                                     } //end else respReadExists
                                   });//esClient.indices.existsAlias
                           } //end exists.ReadAlias
                         } //if(existsNewIndex)
                         else {
                           //newIndexName doesn't exist
                           console.log('Index ['+newIndexName+'] does not exists in ElasticSearch. Cannot create aliases = '+existsNewIndex);
                           res_msg = 'Index ['+newIndexName+'] does not exists in ElasticSearch. Cannot create aliases = '+existsNewIndex;
                            //esClient.close();
                           helper.failure(res,next,res_msg,404);
                         }
                       });//end if newIndexName constains
              } //end if exists
              else {
               //indexName doesn't exist
               console.log('Index ['+indexName+'] does not exists in ElasticSearch. Cannot create aliases = '+exists);
               res_msg = 'Index ['+indexName+'] does not exists in ElasticSearch. Cannot create aliases = '+exists;
              //esClient.close();
               helper.failure(res,next,res_msg,404);
             }//end else if exists indexName
            });


    }); //end server.post()
};

module.exports = swapAliasToIndex;
