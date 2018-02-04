const player = require('./player');
const playlist_container = require('./playlist_container');


console.log(GlobalPlayLists); // this param comes from an ejs generated javascript - make sure to sanitize every post request to server!

$(document).ready(function () {

    playlist_container.initialize_events();
    player.initialize_events();

    Emitter.on('playerIsPlaying', function (playlist) {
        $("#beats").addClass('beating');
    });

    Emitter.on('playerIsPaused', function () {
        $("#beats").removeClass('beating');        
    });
    
    // on Toggle between player view and playlist container view
    $('#component-toggle').on('change', () => {
        $('#playlists-container')
            .toggleClass('flex0Animate flex1Animate');

        $('#player')
            .toggleClass('flex1Animate flex0Animate');

        let widgetCaption = ($('#player').hasClass('flex1Animate')) ? 'Widget' : 'Playlists';
        $('#widget-caption').text(widgetCaption);
    })
});