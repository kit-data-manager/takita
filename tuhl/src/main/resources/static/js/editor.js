function selectAnnotation(annoId) {
    $.ajax({
        type: 'POST',
        url: '/editor/select',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        dataType: 'text',
        data: annoId,
        success: function (responseData) {
            $('#editor').replaceWith(responseData);
        }
    });
}

function goHome() {
    location.href="/"
}

function page(pageId) {
    location.href="/editor/" + pageId;
}