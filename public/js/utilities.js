module.exports = {

    notifications: {

        respond_to_client_success: (report) => {
            if (report.errors && report.errors.length > 0) {
                console.log(report.errors);
            }
            if (report.data.plErrors && report.data.plErrors.length > 0) {
                console.log(report.data.plErrors);
            }
            console.log("success");
            console.log(report);
        },

        respond_to_client_err: (report) => {
            let errors = report.responseJSON.errors || null;
            if (errors && errors.length > 0) {
                errors.forEach((errMsg) => { console.log(errMsg) })
            } else {
                console.log(report);
            }
        },

        log_form_data: function (formData) {
            for (var pair of formData.entries()) {
                console.log(pair[0])
                console.log(pair[1])
            }
        }
    },

    visual_indication: {

        reveal_progress_bar: () => {
            $('div.progress-bar').empty();
            $('#uploadProgress').fadeIn(250);
            $('div.progress-bar').css('background', 'linear-gradient(to right, #bcddf9 , #1e6aa2)');
        },
        
        clear_progress_bar: (duration) => {
            $('#uploadProgress').fadeOut(duration || 500);
        },

        request_failed: function () {
            $('div.progress-bar').css('background', '#c41212');
            $('div.progress-bar').html('<span>Error</span>');
            this.clear_progress_bar(5000);
        },

        request_progrss: () => {
            // create an XMLHttpRequest
            var xhr = new XMLHttpRequest();
            // listen to the 'progress' event
            xhr.addEventListener('progress', function (evt) {
                if (evt.lengthComputable) {
                    // calculate the percentage of upload completed
                    var percentComplete = evt.loaded / evt.total;
                    percentComplete = parseInt(percentComplete * 100);

                    // update the Bootstrap progress bar with the new percentage
                    $('div.progress-bar').css('width', percentComplete.toString() + '%');

                    // once the upload reaches 100%, set the progress bar text to done
                    if (percentComplete === 100) {
                        $('div.progress-bar').html('<span>Done</span>');
                    }
                }
            }, false);
            return xhr;
        },

        upload_request_progress: () => {
            var xhr = new XMLHttpRequest();
            xhr.upload.addEventListener('progress', function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    percentComplete = parseInt(percentComplete * 100);
                    $('div.progress-bar').css('width', percentComplete.toString() + '%');
                    if (percentComplete === 100) {
                        $('div.progress-bar').html('<span>Done</span>');
                    }
                }
            }, false);
            return xhr;
        },
    }
}