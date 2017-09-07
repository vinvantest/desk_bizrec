'use strict';

var helper = require('../helper/helperFunctions.js');
var esClient = require('../controllers/elasticConnection.js');

function createIndexAliasByRounting(server) {
  server.post('/createIndexAliasByRounting/:indexName/:routingValue', function (req, res, next)
	{
   console.log('Inside serer.post(createIndexAliasByRounting)');
   req.assert('indexName', 'indexName is required and must be lowercase').notEmpty();//.isAlphanumeric();
   req.assert('routingValue', 'routingValue is required').notEmpty();
   const errors = req.validationErrors();
   if(errors) {
       helper.failure(res,next,errors[0],401);
       return next();
   }
   console.log('req.params.indexName = ' + JSON.stringify(req.params.indexName));

   //get Query params
   const queryParams = req.getQuery();
   console.log('queryParams passed is -> {' + JSON.stringify(queryParams) + '} '
         + 'where first param routingValue is: ' + JSON.stringify(req.query.routingValue)
         + 'second param is: ' + JSON.stringify(req.query.second)
         + 'third param is: ' + JSON.stringify(req.query.third)
       );
   //you can loop in the query object
   for(const field in req.query){
   console.log('Field['+field+'] = '+req.query[field]);
   }//for loop end

   var indexName = req.params.indexName.trim().toLowerCase();
   var routingValue_customer_uuid = req.params.routingValue.trim();
   var aliasToken = null;
   var termValue = null;
   console.log('Index ['+indexName+'] and routingValue ['+routingValue_customer_uuid+']');
   //if(routingValue.isEmail())
   //routingValue_customer_uuid = routingValue_customer_uuid.replace(/[^a-zA-Z0-9_-]/g,'_').replace(/_{2,}/g,'_');
   var res_msg = 'Error - No Alias Created for ['+indexName+']';
	 console.log('Checking if ['+indexName+'] Exists');
   if(indexName.includes('banks'))
     { aliasToken = '_banks_'; termValue = "bank_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
   if(indexName.includes('coa'))
     { aliasToken = '_coa_'; termValue = "coa_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
   if(indexName.includes('customers'))
     { aliasToken = '_customers_'; termValue = "cust_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
   if(indexName.includes('invoices'))
     { aliasToken = '_invoices_'; termValue = "inv_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
   if(indexName.includes('notes'))
     { aliasToken = '_notes_'; termValue = "note_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
   if(indexName.includes('payments'))
     { aliasToken = '_payments_'; termValue = "pymt_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
   if(indexName.includes('rules'))
     { aliasToken = '_rules_'; termValue = "rule_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
   if(indexName.includes('suppliers'))
     { aliasToken = '_suppliers_'; termValue = "supp_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
   if(indexName.includes('transactions'))
     { aliasToken = '_transactios_'; termValue = "tran_userId_routingAliasId"; console.log('aliasToken ['+aliasToken+' termValue ['+termValue+']'); }
    if(termValue === '' || termValue === null)
      {
      //esClient.close();
      console.log('ERROR - IndexName does not contain valid term');
      helper.failure(res,next,'indexName does not contain valid term',500);
     }

  console.log('AliasToken considered ['+aliasToken+'] and termValue considered ['+termValue+']');
  console.log('Checking if index exists');
  esClient.indices.exists({index: indexName})
		 .then(function (exists)
            {
              console.log('inside function(exists) with exists value ->'+exists+'<-');
              if(exists)
              { //index exists //Create Alias on routing & term filter customer_eid_for_alias
                console.log('Index ['+indexName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists));
                res_msg = 'Index ['+indexName+'] exists in ElasticSearch. Exists value is ->'+JSON.stringify(exists);
                //check if UUID exists in users index using global_alisas_for_search_users_index
                var queryBody = { index : indexName, type : 'base_type', id : routingValue_customer_uuid };
                //now search for the record
                esClient.get(queryBody)
                  .then(function (resp){
                    console.log('index ['+indexName+'] includes user with UUID ['+routingValue_customer_uuid+']. Creating Alias!');
                    var aliasBodyWrite = {
                        "actions": [{
                            "add": {
                                    "filter": {"term": { termValue : routingValue_customer_uuid}},
                                    "routing": routingValue_customer_uuid
                                   }
                        }]
                    };
                    var aliasBodySearch =
                        {
                          "actions" : [{
                            "add": {
                                  "filter": {"term": { termValue : routingValue_customer_uuid}},
                                  "routing": routingValue_customer_uuid
                                  }
                        }]
                    };

                    esClient.indices.existsAlias({index: indexName, name: routingValue_customer_uuid + aliasToken + 'read'})
                      .then( function (respReadExists) {
                        if(respReadExists)
                        {
                          console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read exists checking if write exists'+respReadExists);
                          //checking wirte alias exists
                          esClient.indices.existsAlias({index: indexName, name: routingValue_customer_uuid + aliasToken + 'write'})
                                .then( function (respWriteExists) {
                                  if(respWriteExists)
                                  {
                                    console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read and Write already EXISTS '+respWriteExists);
                                    res_msg = 'Index ['+indexName+'] exists in ElasticSearch AND Both Alias read and Write already EXISTS = '+respWriteExists;
                                     //esClient.close();
                                    helper.success(res,next,res_msg);
                                  }
                                  else {
                                    console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias write DOES NOT EXISTS '+respWriteExists);
                                    //put write alias
                                    esClient.indices.putAlias({index: indexName, name: routingValue_customer_uuid + aliasToken + 'write', body: aliasBodyWrite })
                                      .then(function (resp){
                                          console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias write created as read already existed = '+resp);
                                          res_msg = 'Index ['+indexName+'] exists in ElasticSearch AND Alias write created as read already existed = '+resp;
                                           //esClient.close();
                                          helper.success(res,next,res_msg);
                                        }, function (error) {
                                          console.log('Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created by read exists -'+JSON.stringify(error));
                                          res_msg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created by read exists -'+JSON.stringify(error);
                                           //esClient.close();
                                          helper.failure(res,next,res_msg,500);
                                        }); //end putAlias(write)
                                  }
                                });
                        }
                        else {
                          console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read DOES NOT EXISTS'+respReadExists);
                          //put read alias
                          esClient.indices.putAlias({index: indexName, name: routingValue_customer_uuid + aliasToken + 'read', body: aliasBodySearch })
                            .then(function (resp){
                                    console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read newly created now checking if write exists = '+resp);
                                    res_msg = 'Index ['+indexName+'] exists in ElasticSearch AND Alias read newly created now checking if write exists = '+resp;
                                    //now check if write exists
                                    esClient.indices.existsAlias({index: indexName, name: routingValue_customer_uuid + aliasToken + 'write'})
                                          .then( function (respWriteEx) {
                                            if(respWriteEx)
                                            {
                                              console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read newly created and write already exits '+respWriteEx);
                                              res_msg = 'Index ['+indexName+'] exists in ElasticSearch AND Both Alias read newly created and write already exits = '+respWriteEx;
                                               //esClient.close();
                                              helper.success(res,next,res_msg);
                                            }
                                            else {
                                              console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias read newly created but write DOES NOT EXISTS '+respWriteEx);
                                              //put write alias
                                              esClient.indices.putAlias({index: indexName, name: routingValue_customer_uuid + aliasToken + 'write', body: aliasBodyWrite })
                                                .then(function (resp){
                                                    console.log('Index ['+indexName+'] exists in ElasticSearch AND Alias Both read and write newly created = '+resp);
                                                    res_msg = 'Index ['+indexName+'] exists in ElasticSearch AND Alias Both read and write newly created = '+resp;
                                                     //esClient.close();
                                                    helper.success(res,next,res_msg);
                                                  }, function (error) {
                                                    console.log('Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created but read newly created -'+JSON.stringify(error));
                                                    res_msg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias write not created but read newly created -'+JSON.stringify(error);
                                                     //esClient.close();
                                                    helper.failure(res,next,res_msg,500);
                                                  }); //end putAlias(write)
                                            }
                                          });
                                  }, function (error) {
                                    console.log('Error: Index ['+indexName+'] exists in ElasticSearch but Alias read not created so did not check write-'+JSON.stringify(error));
                                    res_msg = 'Error: Index ['+indexName+'] exists in ElasticSearch but Alias read created so did not check write-'+JSON.stringify(error);
                                     //esClient.close();
                                    helper.failure(res,next,res_msg,500);
                                  }); //end put read alias
                                }
                            }); //end existsAlias(read)
                  }, function (error) {
                    console.log('Error: Index ['+indexName+'] exists in ElasticSearch but get(UUID) failed error -'+JSON.stringify(error));
                    res_msg = 'Error: Index ['+indexName+'] exists in ElasticSearch but get(UUID) failed error -'+JSON.stringify(error);
                     //esClient.close();
                    helper.failure(res,next,res_msg,404);
                  }); //end search()
              }//end if index Exists -- to be deleted
              else {
                //index dosen't exist
           			console.log('Index ['+indexName+'] does not exist! Error value is ->'+JSON.stringify(exists));
           			res_msg = 'Index ['+indexName+'] does not exists!'+JSON.stringify(exists);
                 //esClient.close();
                 helper.failure(res,next,res_msg,404);
              }//end else index exists
            }); //end then - indices.exists()
    }); //end server.post()
};

module.exports = createIndexAliasByRounting;
