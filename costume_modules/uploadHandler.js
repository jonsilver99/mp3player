'use strict';
const mediatags = require('jsmediatags');
const fs = require('fs');

module.exports = function mp3uploadHandler(mp3File) {

    // Name of the track which will be saved (both img and mp3file)
    let trackName = mp3File.name.slice(0, mp3File.name.indexOf('.mp3'));
    let fileName = mp3File.name
    // File Saving Paths 
    let mp3FileSavePath = `public/mp3tracks/files/${trackName}.mp3`;
    let ImgSavePath = `./public/mp3tracks/imgs/${trackName}`; // extension added while processing img;

    // File Loading Paths
    let mp3FileLoadPath = `/assets/mp3tracks/files/${trackName}.mp3`;
    let imgLoadPath = `/assets/mp3tracks/imgs/${trackName}`; // extension added while processing img;
    let defaultImgLoadPath = '/assets/mp3tracks/imgs/default.png';

    // This object will store the track object + any errors and successes along the upload process
    let ProcessStatus = {
        errs: [],
        success: [],
        trackData: null
    };

    function saveMp3File(path) {
        // Save mp3 file to server
        return new Promise((resolve, reject) => {
            return mp3File.mv(path, function (err) {
                if (err) {
                    reject('Failed to save file in server: ' + err.message);
                }
                else {
                    resolve(path);
                }
            })
        })
    }

    function createTrackObject(trackFilePath) {
        /* Read the saved mp3 file, extract its id3 tags and create a track meta-data object */
        return new Promise((resolve, reject) => {

            return mediatags.read(trackFilePath, {
                onSuccess: function (data) {

                    // let trackTitle = data.tags.title || trackFilePath.slice(trackFilePath.indexOf('files/')+6).replace('.mp3', ''); 
                    let trackTitle = data.tags.title || trackName;

                    let trackMeta = {
                        Artist: data.tags.artist,
                        Title: trackTitle,
                        Album: data.tags.album,
                        Year: data.tags.year,
                        TrackPath: mp3FileLoadPath,
                        ImgPath: null,
                        Rating: null,
                        size: null,
                        name: fileName
                    }
                    if (data.tags.picture) {
                        trackMeta.Picture = data.tags.picture;
                    }
                    resolve(trackMeta);
                },
                onError: function (error) {
                    reject(`Failed to read mp3 tags: ${error.type}, ${error.info}`);
                }
            });
        })
    }

    function saveMp3FileImg(trackMeta) {
        /* Save the track's image tag (album art) to server and append trackmeta to hold a path to the image */
        return new Promise((resolve, reject) => {

            if (!trackMeta.Picture) {
                trackMeta.ImgPath = defaultImgLoadPath;
                delete trackMeta.Picture;
                resolve(trackMeta);
            } else {
                // Sort and add img file extension
                let ext = trackMeta.Picture.format.replace('image/', '');
                if (ext == 'jpeg') { ext = 'jpg'; }
                ImgSavePath = `${ImgSavePath}.${ext}`;

                // Save image : get image's raw binary data [83, 81, 80, ...] and convert it to a base64-string format using a buffer            
                let picData = trackMeta.Picture.data;
                let base64dat = new Buffer(picData, 'binary').toString('base64');

                // Create the image file using the base64 string             
                fs.writeFile(ImgSavePath, base64dat, { encoding: 'base64' }, function (err) {
                    if (err) {
                        reject(`Failed to read mp3 tags: ${err.message}`);
                    } else {
                        trackMeta.ImgPath = `${imgLoadPath}.${ext}`;
                        // delete trackMeta.Picture here!! - binary data wont be needed
                        delete trackMeta.Picture;
                        resolve(trackMeta);
                    }
                });
            }
        })
    }

    return saveMp3File(mp3FileSavePath)
        .then(function (savedPath) {
            ProcessStatus.success.push(`File: '${trackName}.mp3' uploaded to server`);
            return createTrackObject(savedPath);
        })
        .then(function (trackMeta) {
            ProcessStatus.success.push('track meta object created');
            return saveMp3FileImg(trackMeta);
        })
        .then(function (completeTrackMeta) {
            ProcessStatus.success.push(`Image: '${trackName}' uploaded to server`);
            ProcessStatus.trackData = completeTrackMeta;
            return ProcessStatus;
        })
        .catch(function (errMessage) {
            console.log(errMessage);
            if (errMessage != null && typeof errMessage === "object") {
                ProcessStatus.errs.push(errMessage.message);
            } else {
                ProcessStatus.errs.push(errMessage);
            }
            return ProcessStatus;
        })
}