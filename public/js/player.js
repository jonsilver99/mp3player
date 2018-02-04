const templates = require('./templates');

const player = {

    initialize_events: function () {

        // Link to dom playback element. <audio>
        this.audioElement = $('#playback')[0];

        // Subscribe to global events
        Emitter.on('loadPlaylist', function (playlist) {
            this.loadPlaylist(playlist.id);
        }.bind(this));

        Emitter.on('loaded_playlist_updated', (updated_pl) => {
            // this condition should always evaluate to true
            if (this.currentPlaylist._id == updated_pl._id) {
                this.currentPlaylist.Name = updated_pl.Name;
                this.currentPlaylist.Tracks = updated_pl.Tracks;
                this.render.entire_playlist(this.currentPlaylist);
            }
        });

        Emitter.on('loaded_playlist_deleted', (deleted_pl_id) => {

            // this condition should always evaluate to true
            if (this.currentPlaylist._id == deleted_pl_id) {
                this.unloadTrack();
                this.currentPlaylist = null;
                this.render.no_playlist_loaded();
            }
        });

        // local events
        $(this.audioElement).on('playing', function () {
            $('#albumArt').addClass('playing');
            Emitter.emit('playerIsPlaying');
        }.bind(this))

        $(this.audioElement).on('pause emptied', function () {
            $('#albumArt').removeClass('playing');
            Emitter.emit('playerIsPaused');
        }.bind(this))

        // Raise playlist
        $('#toggle_pl_view').on('click', function () {
            $(this).toggleClass('pl_raised');
            $('#playback-wrapper').slideToggle(100, 'linear')
            $('#current_playlist').toggleClass('playlist_raised');
            $('#albumArt > div.wave').toggleClass('raised_wave1');
            $('#albumArt > div.wave:nth-child(2)').toggleClass('raised_wave2');
            $('#albumArt > div.wave:nth-child(3)').toggleClass('raised_wave3');
        })

        // dbl click on track from playlist
        $('#container').on('dblclick', 'div.pl_track', (event) => {
            event.stopPropagation();
            this.trackIndex = $(event.target).attr('data-trackindex');
            this.loadTrack(this.trackIndex, event);
        });

        // When playback ended
        $('#playback').on('ended', () => {
            // if (!this.currentPlaylist) {
            //     console.log('Empty playlist or no playlist loaded');
            //     return;
            // }
            // if (this.trackIndex == this.currentPlaylist.Tracks.length - 1) {
            //     this.trackIndex = 0;
            // } else {
            //     this.trackIndex++;
            // }
            // this.loadTrack(this.trackIndex);
            this.next();
        });

        /*** Secondary playback controller ***/

        $('#play').on('click', () => {
            if (!this.isPlaying() && this.audioElement.readyState > 2) {
                this.audioElement.play();
            }
        })

        $('#pause').on('click', () => {
            if (this.isPlaying()) {
                this.audioElement.pause();
            }
        })

        $('#prev').on('click', () => {
            if (this.isPlaying()) {
                this.audioElement.pause();
            }
            this.previous();
        })

        $('#next').on('click', () => {
            if (this.isPlaying()) {
                this.audioElement.pause();
            }
            this.next();
        })
    },

    // Reference to html audio DOM element
    audioElement: null,

    isPlaying: function () {
        let playback = this.audioElement;
        return playback.currentTime > 0 && !playback.paused && !playback.ended
            && playback.readyState > 2;
    },

    currentPlaylist: null,

    trackIndex: null,

    loadPlaylist: function (plId) {
        for (let i = 0; i < GlobalPlayLists.length; i++) {
            if (GlobalPlayLists[i]._id == plId) {
                this.currentPlaylist = GlobalPlayLists[i];
                this.render.entire_playlist(this.currentPlaylist);
                this.trackIndex = 0;
                this.loadTrack(this.trackIndex);
                break;
            }
        }
    },

    loadTrack: function (index, event) {

        // if currently loaded playlist is empty - return
        if (this.currentPlaylist.Tracks.length == 0) {
            this.unloadTrack();
            console.log('Playlist is empty');
            return;
        }

        // if, as result of tracks deletion, the track index is larger than the playlist length - reset track index
        if (this.currentPlaylist.Tracks.length < this.trackIndex) {
            this.trackIndex = 0;
            index = this.trackIndex;
        }

        // load track url, load track art, load track info, control animation
        this.audioElement.src = this.currentPlaylist.Tracks[index].TrackPath;
        if (!this.audioElement.src) {
            console.log('Track path is undefined');
            return;
        }
        $('#albumArt').css({
            "background-image":
            `linear-gradient(to bottom, rgba(255, 0, 0, 0) 41%, rgb(238, 238, 238) 69%),
                url('${this.currentPlaylist.Tracks[index].ImgPath}')`
        })

        // current Track titles - display artist name and artist track
        $('#track_title, #track_artist').removeClass('opened_track_info')
        setTimeout(() => {
            $('#track_artist').text(this.currentPlaylist.Tracks[index].Artist);
            $('#track_title').text(this.currentPlaylist.Tracks[index].Title);
            $('#track_title, #track_artist').addClass('opened_track_info');
        }, 500)

        // current playlist item - color currently loaded track in dark blue
        $('#container > div.pl_track').removeClass('current_playing_track');
        $(`#container > div.pl_track:eq(${index})`).addClass('current_playing_track');

        $(this.audioElement).on('canplay', function () {
            this.audioElement.play();
        }.bind(this));
    },

    unloadTrack: function () {
        this.audioElement.pause();
        this.audioElement.src = '';
    },

    next: function () {
        if (!this.currentPlaylist) {
            console.log('Empty playlist or no playlist loaded');
            return;
        }
        if (this.trackIndex >= this.currentPlaylist.Tracks.length - 1) {
            this.trackIndex = 0;
        } else {
            this.trackIndex++;
        }
        this.loadTrack(this.trackIndex);
    },

    previous: function () {
        if (!this.currentPlaylist) {
            console.log('Empty playlist or no playlist loaded');
            return;
        }
        if (this.trackIndex <= 0) {
            this.trackIndex = this.currentPlaylist.Tracks.length - 1
        } else {
            this.trackIndex--;
        }
        this.loadTrack(this.trackIndex);
    },

    render: {

        playlist_track: function (track) {

        },

        entire_playlist: function (playlist, i) {
            $('#current_playlist>#container').empty();
            if (playlist.Tracks.length == 0) {
                return this.no_tracks_in_playlist();
            }
            let tracks = playlist.Tracks;
            tracks.forEach(function (track, index) {
                let html = templates.playlist_track(track, index);
                $('#current_playlist>#container').append(html);
            });
        },

        no_playlist_loaded: () => {
            $('#current_playlist>#container').empty();
            let html = templates.no_playlist_loaded();
            $('#current_playlist>#container').append(html);
        },

        no_tracks_in_playlist: () => {
            $('#current_playlist>#container').empty();
            let html = templates.no_tracks_in_playlist();
            $('#current_playlist>#container').append(html);
        },
    }
}
module.exports = player;