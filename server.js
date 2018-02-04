'use strict';
/** Requires **/
const express = require('express');
const dbConnection = require('./mongodb/dbConnection');
const routes = require('./costume_modules/routes')
const expressUpload = require('express-fileupload'); // parses files and show them on req.files

/** Server setup **/
const server = express();
const PORT = process.env.PORT || 4000;

// connect mongodb via mongoose
dbConnection.connect();

// Set template engine
server.set('view engine', 'ejs');

// Log each request url
server.use(function (req, res, next) {
    console.log('url request:' + req.url)
    next();
});

// Resolve static files and assets
server.use('/assets', express.static(__dirname + '/public'));
// Use this middlewate for fileUploads
server.use(expressUpload());

// Listen
server.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`)
});

// Routing
routes(server);