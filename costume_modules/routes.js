'use strict';
const fs = require('fs');
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false }); // parser for POST req (application/x-www-form-urlencoded)
const jsonParser = bodyParser.json(); // parser for POST req (json)
const playlistModel = require('../mongodb/schemaAndModel').playlistModel;
const trackModel = require('../mongodb/schemaAndModel').trackModel;
const inputValidator = require('./inputValidator');
const playlistCreator = require('./playlistCreator');
const playlistEditor = require('./playlistEditor');
const playlistRemover = require('./playlistRemover');


module.exports = function (server) {

    /*** load site ***/
    server.get('/', function (req, res, next) {
        playlistModel.find({})
            .then((dbPlaylists) => {
                res.render('index', { Playlists: dbPlaylists })
            })
            .catch((err) => {
                res.status(500).send("failed to load playlists from db");
            })
    });


    /*** Create new playlist ***/
    server.post('/playlists', function (req, res, next) {
        let report = {
            status: null,
            errors: [],
            data: null
        };
        (async function () {
            // Validate & Sanitize input
            try {
                let inputValidation = inputValidator(req, 'new_playlist');
            } catch (errorMsgs) {
                if (Array.isArray(errorMsgs)) {
                    report.errors = report.errors.concat(errorMsgs);
                } else if (errorMsgs != null && typeof errorMsgs === "object") {
                    report.errors.push(errorMsgs.message);
                } else {
                    report.errors.push(errorMsgs);
                }
                req.report = report;
                return next();
            }
            // create a playlist object, save it to db and return it 
            let playlist = await playlistCreator(req);
            if (playlist.failed) {
                report.errors.push(playlist.failed);
                report.errors = (playlist.errors.length > 0) ? report.errors.concat(playlist.errors) : report.errors;
                req.report = report;
                return next();
            }
            // If save was successfull
            report.data = playlist;
            req.report = report;
            next();
        })();
    },
        // finalize report && respond with a detailed report
        function (req, res) {
            console.log(req.report);
            req.report.status = (req.report.errors.length > 0) ? 400 : 200; // fail : success
            res.status(req.report.status).send(req.report);
        }
    );


    /*** update playlist ***/
    server.post('/playlists/:id', function (req, res, next) {
        console.log(req.params.id);
        req.body.existingTracks = JSON.parse(req.body.existingTracks);
        // console.log(req.body.existingTracks);

        let report = {
            status: null,
            errors: [],
            data: null
        };
        (async function () {
            // Validate & Sanitize input
            try {
                let inputValidation = inputValidator(req, 'edit_existing_playlist');
            } catch (errorMsgs) {
                if (Array.isArray(errorMsgs)) {
                    report.errors = report.errors.concat(errorMsgs);
                } else if (errorMsgs != null && typeof errorMsgs === "object") {
                    report.errors.push(errorMsgs.message);
                } else {
                    report.errors.push(errorMsgs);
                }
                req.report = report;
                return next();
            }
            let updateData = {
                playlistId: req.params.id,
                playlistName: req.body.playlistName,
                existingTracks: req.body.existingTracks,
                newUploads: (req.files) ? req.files.uploads : null
            }
            let edited_playlist = await playlistEditor(updateData);
            if (edited_playlist.failed) {
                report.errors.push(edited_playlist.failed);
                report.errors = (edited_playlist.errors.length > 0) ? report.errors.concat(edited_playlist.errors) : report.errors;
                req.report = report;
                return next();
            }
            // If update was successfull
            report.data = edited_playlist;
            req.report = report;
            next();
        })();
    },
        // finalize report && respond with a detailed report
        function (req, res) {
            console.log(req.report);
            req.report.status = (req.report.errors.length > 0) ? 400 : 200; // fail : success
            res.status(req.report.status).send(req.report);
        }
    );


    /*** delete playlist ***/
    server.delete('/playlists/:id', function (req, res, next) {
        let report = {
            status: null,
            errors: [],
            data: null,
            deleted: null
        };

        (async function () {

            let delResponse = await playlistRemover(req.params.id);
            if (delResponse.failed) {
                report.errors.push(delResponse.failed);
            } else {
                report.data = delResponse.playlist;
                report.deleted = delResponse.deleted;
            }
            report.status = (report.errors.length > 0) ? 400 : 200; // fail : success
            res.status(report.status).send(report);
        })();
    });
}