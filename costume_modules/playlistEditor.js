'use strict';
const uploadHandler = require('./uploadHandler');
const playlistModel = require('../mongodb/schemaAndModel').playlistModel;
const trackModel = require('../mongodb/schemaAndModel').trackModel;
module.exports = function (updateData) {

    let response = {
        plErrors: [],
        playlist: null
    }

    return (async function () {

        if (updateData.newUploads) {

            let uploads = updateData.newUploads;
            for (let i = 0; i < uploads.length; i++) {
                // 1 - upload song image and return a track object, then push it on the playlist model
                let uploadResult = await uploadHandler(uploads[i]);
                if (uploadResult.errs.length > 0 || uploadResult.trackData == null) {
                    response.plErrors.push("failed to process file: " + uploads[i].name + " --> " + uploadResult.errs.toString());
                } else {
                    uploadResult.trackData.size = uploads[i].data.byteLength;
                    updateData.existingTracks.push(uploadResult.trackData)
                }
            }
        }

        return playlistModel.findByIdAndUpdate(
            updateData.playlistId,
            {
                "$set": {
                    Name: updateData.playlistName,
                    Tracks: updateData.existingTracks
                }
            },
            { new: true }
        )
            .then((edited_playlist) => {
                response.playlist = edited_playlist;
            })
            .catch((err) => {
                response.plErrors.push('Failed to save playlist updates:', err);
                response.failed = "All files failed to process. No track objects were created - check uploadHandler";
            })
            .then(() => {
                return response;
            });
    })();
}