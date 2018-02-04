const templates = require('./templates');
const utilities = require('./utilities');

const playlist_container = {

    initialize_events: function () {
        // Subscribe to global events
        Emitter.on('loadPlaylist', function (playlist) {
            
            if (this.currently_loaded) {
                $(this.currently_loaded).removeClass('vinylePlaying');
                $(this.currently_loaded).parent().removeClass('loaded');
            }
            this.currently_loaded = playlist;
            $(this.currently_loaded).parent().addClass('loaded');
        }.bind(this));

        Emitter.on('playerIsPlaying', function (playlist) {
            $(this.currently_loaded).addClass('vinylePlaying');
        }.bind(this));

        Emitter.on('playerIsPaused', function () {
            $(this.currently_loaded).removeClass('vinylePlaying');
        }.bind(this));

        // Load a playlist - Emit event
        $('#playlists-container').on('dblclick', 'div.pl-vinyle', function (event) {
            let spinVinyle = $(event.target).find('div.pl-vinyle');
            Emitter.emit('loadPlaylist', event.target);
        });

        // on searching playlist
        $('#search_pl').on('keyup', function (event) {
            
            event.preventDefault();
            let searchParam = event.target.value.toLowerCase();
            if (searchParam) {
                $.each($('div.vinyles div.loadPlaylist'), function () {
                    
                    if ($(this).attr('data-plname').toLowerCase().indexOf(searchParam) != 0) {
                        $(this).hide();
                    } else {
                        $(this).show();
                    }
                });
            } else {
                $('div.vinyles div.loadPlaylist').show();
            }
        });

        // toggle playlist creation form
        $('#playlists-container').on('click', '#add-new-pl, #close_new_pl_form', (event) => {
            (event.target.id == 'add-new-pl') ? this.toggle_new_pl_form("set-header") : this.toggle_new_pl_form();
        })

        // toggle playlist edit form
        $('div.vinyles').on('click', 'div.editButton, #close_edit_pl_form', (event) => {
            event.stopPropagation();
            (event.target.id == 'close_edit_pl_form') ? this.toggle_pl_edit_form(event) : this.toggle_pl_edit_form(event, "set-header");
        });

        // restrict 'playlistName' input length
        $('#create-pl-form, #edit-pl-form').find("input[name='playlistName']").on('keypress', (event) => {
            (event.target.value.length + 1) > 15 ? event.preventDefault() : null;
        })

        // on opening file upload dialog
        $("button.open-uploads").on('click', function (event) {
            $(event.target).siblings('input.uploads:first').click();
        });

        // on selecting files to upload
        $("input.uploads").on('change', function (event) {
            
            let existing_pl = ($(event.target).closest('form').attr('id') == 'edit-pl-form') ? true : false;
            this.file_handler.set_upload_candidates(event, existing_pl);
        }.bind(this));

        // on deleting file from upload preview list
        $("div.uploadCandidates").on('click', 'div.delete_upload_candidate', function (event) {
            this.file_handler.delete_preview_file(event);
        }.bind(this));

        // on submit playlist creation form
        $('#create-pl-form').on('submit', function (event) {
            this.createNewPlaylist(event);
        }.bind(this));

        // on submit playlist edit form
        $('#edit-pl-form').on('submit', (event) => {
            this.editPlaylist(event);
        });

        // on click delete playlist button
        $('#delete_pl_button').on('click', (event) => {
            this.deletePlaylist(event);
        });
    },

    currently_loaded: null,

    set_dynamic_header: function (header) {

        switch (header) {

            case 'create-form': {
                $('#header-browse, #search_pl, #header-edit').addClass('hidden');
                $('#header-create').removeClass('hidden');
                break;
            }

            case 'edit-form': {
                $('#header-browse, #search_pl, #header-create').addClass('hidden');
                $('#header-edit').removeClass('hidden');
                break;
            }

            default: {
                $('#header-edit, #header-create').addClass('hidden');
                $('#header-browse, #search_pl').removeClass('hidden');
                break;
            }
        }
    },

    toggle_new_pl_form: function (header) {
        
        $('div.form-wrapper')
            .toggleClass('flex0Animate flex1Animate');
        $('div.vinyles')
            .toggleClass('flex1Animate flex0Animate');

        (header == "set-header") ? this.set_dynamic_header('create-form') : this.set_dynamic_header();
        this.file_handler.reset_upload_status_variables('clear creation form');
    },

    toggle_pl_edit_form: function (event, header) {
        
        $('#edit-pl-form-wrapper').toggleClass('opened closed');
        $('div.vinyles').toggleClass('scroll-overflow');
        (header == "set-header") ? this.set_dynamic_header('edit-form') : this.set_dynamic_header();

        this.file_handler.reset_upload_status_variables('clear edit form');
        if (event.target.id == "close_edit_pl_form" || event.target.id == "edit_request_sent") {
            return;
        }
        // Initialize view
        // Gather playlist info
        let playlist = event.target || '';
        let playlistId = $(playlist).attr('data-plId');
        let playlistName = $(playlist).attr('data-plname')
        let playlistTracks;
        for (i = 0; i < GlobalPlayLists.length; i++) {
            if (GlobalPlayLists[i]._id == playlistId) {
                playlistTracks = GlobalPlayLists[i].Tracks;
                break;
            }
        }
        // render playlist info
        $('#edit-pl-form').find("input[name='playlistId']").val(playlistId);
        $('#edit-pl-form').find("input[name='playlistName']").val(playlistName);
        this.file_handler.set_upload_candidates(null, playlistTracks);
    },

    file_handler: {

        upload_candidates: [],

        current_upload_size: 0,

        reset_upload_status_variables: function (target_form) {

            this.upload_candidates = [];
            this.current_upload_size = 0;

            if (target_form == "clear creation form") {
                $('#create-pl-form div.uploadCandidates').empty();
                this.validate_current_upload_size('#create-pl-form');
            }

            if (target_form == "clear edit form") {
                $('#edit-pl-form div.uploadCandidates').empty();
                this.validate_current_upload_size('#edit-pl-form');
            }
        },

        set_upload_candidates: function (event, existing_pl) {

            if (existing_pl) {
                // when first clicked on a playlist to edit
                if (Array.isArray(existing_pl)) {
                    this.upload_candidates = existing_pl;
                    this.preview_files(this.upload_candidates, '#edit-pl-form div.uploadCandidates', true);
                    return;
                }
                else if (!Array.isArray(existing_pl)) {
                    
                    this.current_upload_size = 0;
                    $('#edit-pl-form div.uploadCandidates').empty();
                    this.validate_current_upload_size('#edit-pl-form');

                    this.upload_candidates = this.upload_candidates.filter((file) => {
                        return file.hasOwnProperty('_id');
                    })

                    let selectedFiles = $(event.target)[0].files;
                    for (let i = 0; i < selectedFiles.length; i++) {
                        this.upload_candidates.push(selectedFiles[i]);
                    }

                    this.preview_files(this.upload_candidates, '#edit-pl-form div.uploadCandidates', true);
                    return;
                }
            }
            else if (!existing_pl) {
                this.reset_upload_status_variables("clear creation form");
                let selectedFiles = $(event.target)[0].files;
                if (!selectedFiles.length > 0) {
                    throw "No files selected!";
                    return;
                }
                for (let i = 0; i < selectedFiles.length; i++) {
                    this.upload_candidates.push(selectedFiles[i]);
                }
                this.preview_files(this.upload_candidates, '#create-pl-form div.uploadCandidates', false);
            }
        },

        update_current_upload_size: function () {
            this.current_upload_size = 0;
            this.upload_candidates.forEach((file) => {
                this.current_upload_size += file.size;
            });
            console.log("new upload size is " + this.current_upload_size.toString());
        },

        validate_current_upload_size: function (target_form) {

            let target_caption = target_form + ' span.total-upload-size';
            let target_sub_button = target_form + ' button.submit_button';

            let sizeInMB = this.current_upload_size / 1000000;
            $(target_caption).text(sizeInMB.toString().slice(0, sizeInMB.toString().indexOf('.') + 3) + ' mb');

            if (sizeInMB > 70) {
                $(target_caption).addClass('upload-size-exceeded');
                $(target_sub_button).attr('disabled', true).addClass('disabled');
            } else {
                ($(target_caption).hasClass("upload-size-exceeded")) ? $(target_caption).removeClass('upload-size-exceeded') : null;
                $(target_sub_button).attr('disabled', false).removeClass('disabled');
            }
        },

        preview_files: function (upload_candidates, target_container, existing_pl) {
            let target_form = (existing_pl) ? '#edit-pl-form' : '#create-pl-form'
            for (let i = 0; i < upload_candidates.length; i++) {

                var reader = new FileReader();
                reader.onloadend = (function (file) {
                    
                    this.current_upload_size += file.size;
                    let fileSize = (file.size / 1000000).toString();

                    let fileDiv = templates.upload_candidate({
                        _id: (file._id) ? file._id : 'newfile',
                        name: file.name,
                        size: fileSize.slice(0, fileSize.indexOf('.') + 3)
                    });

                    $(target_container).append(fileDiv);
                    this.validate_current_upload_size(target_form);

                }.bind(this))(upload_candidates[i]);
                if (upload_candidates[i] instanceof Blob) {
                    reader.readAsDataURL(upload_candidates[i]);
                }
            }
        },

        delete_preview_file: function (event) {
            
            let target_form = '#' + $(event.target).closest('form').attr('id');
            
            let nameToRemove = event.target.id;
            this.upload_candidates = this.upload_candidates.filter((file) => {
                
                return file.name != nameToRemove;
            });
            $(event.target).parents('div').eq(1).remove();
            this.update_current_upload_size();
            this.validate_current_upload_size(target_form);
        },
    },

    createNewPlaylist: function () {
        
        event.preventDefault();
        let plData = new FormData();
        let playlistName = $('#create-pl-form').find("input[name='playlistName']").val();
        let uploads = this.file_handler.upload_candidates;

        plData.append('playlistName', playlistName);
        for (let i = 0; i < uploads.length; i++) {
            plData.append('uploads', uploads[i], uploads[i].name);
        }
        utilities.notifications.log_form_data(plData)
        this.toggle_new_pl_form();
        utilities.visual_indication.reveal_progress_bar();

        $.ajax({
            enctype: 'multipart/form-data',
            method: 'POST',
            url: '/playlists',
            data: plData,
            processData: false,
            contentType: false,
            xhr: utilities.visual_indication.upload_request_progress,
        })
            .then((report) => {
                debugger;
                GlobalPlayLists.push(report.data.playlist);
                console.log(GlobalPlayLists);
                utilities.notifications.respond_to_client_success(report);
                this.render.new_vinyle(report.data.playlist);
                utilities.visual_indication.clear_progress_bar();
            })
            .catch((report) => {
                utilities.notifications.respond_to_client_err(report);
                utilities.visual_indication.request_failed();
            });
    },

    editPlaylist: function (playlist) {
        event.preventDefault();
        let plData = new FormData();

        let playlistId = $('#edit-pl-form').find("input[name='playlistId']").val();
        let playlistName = $('#edit-pl-form').find("input[name='playlistName']").val();
        let newUploads = this.file_handler.upload_candidates;
        let existingTracks = JSON.stringify(this.file_handler.upload_candidates.filter((file) => {
            return file.hasOwnProperty('_id');
        }));

        plData.append('playlistName', playlistName);
        plData.append('playlistId', playlistId);
        plData.append('existingTracks', existingTracks);
        for (let i = 0; i < newUploads.length; i++) {
            plData.append('uploads', newUploads[i], newUploads[i].name);
        }
        this.toggle_pl_edit_form({ target: { id: "edit_request_sent" } });
        utilities.visual_indication.reveal_progress_bar();

        $.ajax({
            enctype: 'multipart/form-data',
            method: 'POST',
            url: `/playlists/${playlistId}`,
            data: plData,
            processData: false,
            contentType: false,
            xhr: utilities.visual_indication.upload_request_progress
        })
            .then((report) => {
                utilities.notifications.respond_to_client_success(report);
                utilities.visual_indication.clear_progress_bar();
                let edited_pl = report.data.playlist;
                for (let i = 0; i < GlobalPlayLists.length; i++) {
                    if (GlobalPlayLists[i]._id == edited_pl._id) {
                        // replace old playlist with updated one in the global playlists array
                        GlobalPlayLists[i] = edited_pl;
                        // render updated playlist and get back the new spining vinyle dom element. then set that vinyle to this.currently_loaded
                        let updated_pl_vinyle = this.render.edited_vinyle(edited_pl);
                        this.currently_loaded = updated_pl_vinyle;
                        // emit the 'updated playlist event' globally
                        Emitter.emit('loaded_playlist_updated', edited_pl);
                        break;
                    }
                }
            })
            .catch((report) => {
                utilities.notifications.respond_to_client_err(report);
                utilities.visual_indication.request_failed();
            });
    },

    deletePlaylist: function (event) {
        
        let playlistId = $('#edit-pl-form').find("input[name='playlistId']").val();
        this.toggle_pl_edit_form({ target: { id: "edit_request_sent" } });
        utilities.visual_indication.reveal_progress_bar();

        $.ajax({
            method: 'DELETE',
            url: `/playlists/${playlistId}`,
            xhr: utilities.visual_indication.request_progrss
        })
            .then((report) => {
                
                utilities.notifications.respond_to_client_success(report);
                utilities.visual_indication.clear_progress_bar();
                let deleted_pl_id = report.deleted;
                for (let i = 0; i < GlobalPlayLists.length; i++) {
                    if (GlobalPlayLists[i]._id == deleted_pl_id) {
                        GlobalPlayLists.splice(i, 1);
                        this.render.delete_vinyle(deleted_pl_id);
                        Emitter.emit('loaded_playlist_deleted', deleted_pl_id);
                        break;
                    }
                }
            })
            .catch((report) => {
                utilities.notifications.respond_to_client_err(report);
                utilities.visual_indication.request_failed();
            });
    },


    /***********************
        Render function 
    ***********************/
    // (upload candidates rendering code should be relocated to here!)
    render: {

        new_vinyle: function (playlist) {
            let vinyle = templates.playlist_vinyle(playlist);
            $(vinyle).hide().insertAfter("#add-new-pl").fadeIn(2000);
            $('#edit-pl-form-wrapper').css('z-index', '1');
        },

        edited_vinyle: function (edited_playlist, is_currently_loaded) {
            
            let new_vinyle = templates.playlist_vinyle(edited_playlist);
            let old_vinyle = $("div.vinyles > #" + edited_playlist._id);
            $(new_vinyle).insertAfter(old_vinyle)
                .addClass('loaded')
                .find('div.pl-vinyle')
                .addClass('vinylePlaying');
            $(old_vinyle).remove();
            // return the new spining vinyle dom element
            return $("div.vinyles > #" + edited_playlist._id).find('div.pl-vinyle')[0];
        },

        delete_vinyle: function (pl_to_delete) {
                        
            $("div.vinyles > #" + pl_to_delete).fadeOut(500, function () {
                $(this).remove();
            })
        },
    }
}

module.exports = playlist_container;