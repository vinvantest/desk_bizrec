'use strict';

module.exports = function(server, restify, plugins, restifyValidator)
{
  server.use(plugins.acceptParser(server.acceptable));
  server.use(plugins.queryParser());
  server.use(plugins.bodyParser({ mapParams: true }));
  server.use(restifyValidator);
  server.pre(restify.pre.sanitizePath());
  /* Above line removes /
  $ curl localhost:8080/users <- Returns all users
  $ curl localhost:8080/users/ <- Returns all users
  $ curl localhost:8080/users/1 <- Returns user with id 1
  $ curl localhost:8080/users?name=sean <- Logs querystring
  $ curl localhost:8080/users/?name=sean <- Logs querystring
  */
}