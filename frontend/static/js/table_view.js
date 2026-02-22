
$('#thumbnails').change(function () {
    if (document.getElementById("thumbnails").checked) {
        table.getRows().forEach(function (row) {
            let id = row.getData().id;
            if (document.getElementById('holder' + id) == null) {
                showThumbnails(row);
            }

        })
    } else {
        table.getRows().forEach(function (row) {
            let id = row.getData().id;
            if (document.getElementById('holder' + id) !== null) {
                hideThumbnails(row);
            }
        })
    }

    $.ajax({
        type: 'GET',
        url: window.CONTEXTPATH + "assistance/toggleCheckThumbs",
        dataType: 'text',
    });

})

//go to dashboard call
function backToDashboard() {
    $('#dashboard').load(window.CONTEXTPATH + 'dashboard/contentview/dashboard');
}