'use strict';
const playlistModel = require('../mongodb/schemaAndModel').playlistModel;
const trackModel = require('../mongodb/schemaAndModel').trackModel;
const txtHandler = require('./txtHandler');
module.exports = function (playlistId) {

    let response = {
        plErrors: null,
        playlist: null,
        deleted: null
    }

    return (async function () {

        return playlistModel.findByIdAndRemove(playlistId)
            .then((deleted_pl) => {
                response.deleted = deleted_pl.id;
                return playlistModel.findById(playlistId)
            })
            .then((searchRes) => {
                if (searchRes != null) {
                    response.failed = "Failed to delete playlist";
                } else {
                    response.playlist = "Playlist deleted";
                }
            })
            .catch((err) => {
                response.failed = "Error in delete process";
            })
            .then(() => {
                return response;
            })
    })();

}