function selectAnnotation(event, anno) {
    event.preventDefault();
    let params = {
        id: anno.getAttribute('data-field')
    }
    postEditorController("select_annotation", params);
}

function postEditorController(endpoint, params) {
    $ .ajax({
        type: 'POST',
        url: '/editor/' + endpoint,
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        dataType: 'text',
        data: JSON.stringify(params),

        success: function(responseData) {
            $('#viewerHolder').html(responseData);
        }
    });
}

function goHome() {
    location.href="/"
}