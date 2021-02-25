function selectAnnotation(event, anno) {
    event.preventDefault();
    let params = {
        id: anno.getAttribute('title')
    }
    postEditorController("select_annotation", params);
}

function showSvgs(annotations) {
    console.log("show svgs " + annotations)
    annotations.forEach(element => {
        drawSvg(element.getSvgCode());
    });
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