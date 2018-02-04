'use strict';
const uploadHandler = require('./uploadHandler');
const playlistModel = require('../mongodb/schemaAndModel').playlistModel;
const trackModel = require('../mongodb/schemaAndModel').trackModel;
module.exports = function (httpRequest) {

    let uploads = httpRequest.files.uploads;

    let response = {
        plErrors: [],
        playlist: null
    }

    // playlist mongoose model
    let playlist = new playlistModel({
        Name: httpRequest.body.playlistName,
        Tracks: []
    });

    return (async function () {

        for (let i = 0; i < uploads.length; i++) {
            // 1 - upload song image and return a track object, then push it on the playlist model
            let uploadResult = await uploadHandler(uploads[i]);
            if (uploadResult.errs.length > 0 || uploadResult.trackData == null) {
                response.plErrors.push("failed to process file: " + uploads[i].name + " --> " + uploadResult.errs.toString());
            } else {
                console.log(uploads[i].data.byteLength)        
                uploadResult.trackData.size = uploads[i].data.byteLength;
                playlist.Tracks.push(uploadResult.trackData)
            }
        }

        // 2 - if no track objects were successfuly created - return a failure
        if (playlist.Tracks.length === 0) {
            response.failed = "All files failed to process. No track objects were created - check uploadHandler";
            return response;
        }

        // 3 - save playlist to db
        return playlist.save()
            .then((savedPl) => {
                response.playlist = savedPl;
            })
            .catch((err) => {
                response.failed = "failed to save playlist to db:";
            })
            .then(() => {
                return response;
            })
    })();
}