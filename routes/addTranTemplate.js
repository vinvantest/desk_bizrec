'use strict';

var helper = require('../helper/helperFunctions.js');
var esClient = require('../controllers/elasticConnection.js');

function addTranTemplate(server) {
  server.post('/addTranTemplate', function (req, res, next)
	{
   console.log('Inside serer.post(addTranTemplate)');
   req.assert('templateName', 'templateName is required and must be alphanumeric string').notEmpty();//.isAlphanumeric();
   const errors = req.validationErrors();
   if(errors) {
       helper.failure(res,next,errors[0],401);
       return next();
   }
   console.log('req.params.templateName = ' + JSON.stringify(req.params.templateName));
   var templateName = req.params.templateName;

   console.log('loading template.json file ....');
	 var tranTemplateBody = require('../config/templates/tran_template_index_v1.json');
   console.log('template.json file Loaded !');

   //console.log(JSON.stringify(tranTemplateBody));
   var res_msg = 'Error - Template Not Created !';
	 console.log('Checking if template Exists');

	 esClient.indices.getTemplate({name: templateName})
		 .then(function (resp) {//template exists
      				console.log('Template ['+templateName+'] already exists in ElasticSearch. Response is ->'+JSON.stringify(resp));
              res_msg = 'Template ['+templateName+'] already exists in ElasticSearch';
              //esClient.close(); //close it in lambda for local host don't close it
              helper.success(res,next,res_msg);
     }, function (err){ //template dosen't exist. Create one.
			console.log('Creating ['+templateName+'] now! Error value is ->'+JSON.stringify(err));
			res_msg = 'Creating ['+templateName+'] now!'+JSON.stringify(err);
				esClient.indices.putTemplate({name: templateName, body: tranTemplateBody})
				.then(function (response) {
					  console.log('template ['+templateName+'] Created! '+ JSON.stringify(response));
						res_msg = 'Template ['+templateName+'] Created!';
						//esClient.close(); //close it in lambda for local host don't close it
						helper.success(res,next,res_msg);
					}, function (error) {
						console.log('Error: putting template ['+templateName+'] -> ' +JSON.stringify(err));
						res_msg = 'Error:  putting template ['+templateName+']'+JSON.stringify(err);
						//esClient.close(); //close it in lambda for local host don't close it
						helper.failure(res,next,res_msg + ' - ' + error,500);
					});
	    });//end then - indices.getTemplate()
    }); //end server.post()
};

module.exports = addTranTemplate;
