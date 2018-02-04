module.exports = {

    upload_candidate: (fileInfo) => {

        return `<div id='${fileInfo._id}' class="flexRow spread-content">
                    <div class='fileName'>${fileInfo.name}</div>
                    <div class="flexRow spread-content">
                        <div>${fileInfo.size} mb</div>
                        <div id='${fileInfo.name}' class="delete_upload_candidate"></div>
                    </div>
                </div>`;
    },

    playlist_vinyle: (pl) => {
        return `<div class="loadPlaylist" id="${pl._id}" data-plname='${pl.Name}'>
                    <div id="${pl._id}" data-plname='${pl.Name}' class='pl-vinyle'></div> 
                    <div data-plId='${pl._id}' data-plname='${pl.Name}' class="editButton"></div>
                    <span>${pl.Name}</span>
                </div>`;
    },

    playlist_track: (track, index) => {
        return `<div id='${track._id}' data-trackindex=${index} data-title =${track.Title} class="flexRow pl_track">
                    <div data-trackindex=${index}>${index + 1}</div>
                    <div data-trackindex=${index}>${track.Artist}&nbsp&nbsp&nbsp-</div>
                    <div data-trackindex=${index}>${track.Title}</div>
                </div>`;
    },

    no_playlist_loaded: () => {
        return `<div  class="flexRow center-content">
                    <h3>No Playlist Loaded</h3>
                </div>`;
    },

    no_tracks_in_playlist: () => {
        return `<div  class="flexRow center-content">
                    <h3>This playlist is empty - Add tracks to playlist</h3>
                </div>`;
    }
}