'use strict';
const txtHandler = require('./txtHandler');

module.exports = function (data, reqType) {

    let errorMsgs = [];

    (function () {

        let playlistName = data.body.playlistName || null;

        // validate playlist name
        if (txtHandler.hasNoValue(playlistName)) {
            errorMsgs.push('No Playlist name given');
        }
        if (txtHandler.ilegalValue(playlistName)) {
            errorMsgs.push('Playlist name contains Ilegal chars!');
        }

        // check if any files were uploaded - and validate them
        if (!data.files && reqType == "new_playlist") {
            errorMsgs.push('No mp3 Files were uploaded');
        }

        if (errorMsgs.length > 0) { throw errorMsgs };

        if (data.files) {
            if (!Array.isArray(data.files.uploads)) {
                data.files.uploads = [data.files.uploads];
            }
            let uploads = data.files.uploads;
            for (let i = 0; i < uploads.length; i++) {
                if (uploads[i].mimetype != "audio/mp3") {
                    errorMsgs.push('Invalid file type found - all upload files must be of type mp3');
                    throw errorMsgs;
                }
                uploads[i].name = txtHandler.sanitizeValue(uploads[i].name, '');
            }
        }

        if (reqType === 'edit_existing_playlist') {
            if (txtHandler.ilegalValue(data.body.playlistId)) {
                errorMsgs.push('Playlist id contains Ilegal chars!');
                throw errorMsgs;
            }
            let existingTracks = data.body.existingTracks;
            existingTracks.forEach((track) => {
                if (txtHandler.ilegalValue(track._id)) {
                    errorMsgs.push('Playlist Tracks contain Ilegal chars in _id field!');
                    throw errorMsgs;
                }
            });
        }
        return;
    })();

    return (errorMsgs.length > 0) ? 'invalid' : 'valid';

}