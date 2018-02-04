'use strict';
const mongoose = require('mongoose');

// Schemas
const trackSchema = new mongoose.Schema({
    Artist: { type: String, default: 'N/A' },
    Title: { type: String, required: true },
    Album: { type: String, default: 'N/A' },
    Year: { type: String, default: 'N/A' },
    TrackPath: { type: String, required: true },
    ImgPath: { type: String, default: '/assets/mp3tracks/imgs/default.png' },
    Rating: { type: Number, default: null },
    size: { type: Number, required: true },    
    name: { type: String, required: true }    
});

const playlistSchema = new mongoose.Schema({
    Name: { type: String, required: true },
    Tracks: [trackSchema]
});


// Models 
module.exports = {
    trackModel: mongoose.model('trackModel', trackSchema),
    playlistModel: mongoose.model('playlistModel', playlistSchema)
}