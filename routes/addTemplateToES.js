'use strict';

var helper = require('../helper/helperFunctions.js');
var esClient = require('../controllers/elasticConnection.js');

function addTemplatetoES(server) {
  server.post('/addTemplatetoES', function (req, res, next)
	{templateName
   console.log('Inside serer.post(addTranTemplate)');
   req.assert('templateName', 'templateName is required and must be alphanumeric string').notEmpty();//.isAlphanumeric();
   req.assert('templateType', 'templateType is required and must be alpha string').notEmpty().isAlpha();
   const errors = req.validationErrors();
   if(errors) {
       helper.failure(res,next,errors[0],401);
       return next();
   }
   console.log('req.params.templateName = ' + JSON.stringify(req.params.templateName));
   console.log('req.params.templateType = ' + JSON.stringify(req.params.templateType));
   var templateName = req.params.templateName;
   var templateType = req.params.templateType;
   var tranTemplateBody;
   console.log('loading template.json file ....');
   switch (templateType) {
     case "banks":
       tranTemplateBody = require('../config/templates/banks_template.json');
       break;
      case "coa":
         tranTemplateBody = require('../config/templates/chartofaccounts_template.json');
         break;
         case "customers":
           tranTemplateBody = require('../config/templates/customers_template.json');
           break;
           case "invoices":
             tranTemplateBody = require('../config/templates/invoices_template.json');
             break;
             case "notes":
               tranTemplateBody = require('../config/templates/notes_template.json');
               break;
               case "payments":
                 tranTemplateBody = require('../config/templates/payments_template.json');
                 break;
                 case "rules":
                   tranTemplateBody = require('../config/templates/rules_template.json');
                   break;
                   case "suppliers":
                     tranTemplateBody = require('../config/templates/suppliers_template.json');
                     break;
                     case "transactions":
                       tranTemplateBody = require('../config/templates/transactions_template.json');
                       break;
                       case "users":
                         tranTemplateBody = require('../config/templates/users_template.json');
                         break;
     default:
       helper.failure(res,next,'Error: no matching templateType specified',404);
   }
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

module.exports = addTemplatetoES;
