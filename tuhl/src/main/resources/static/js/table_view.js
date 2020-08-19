// todo: show all thumbnails
//function of alwaysShowThumbnails checkbox
$('#thumbnails').change(function () {
    console.log("checkbox");
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
        url: "assistance/toggleCheckThumbs",
        dataType: 'text',
    });

})


//go to dashboard call
function backToDashboard() {
    $('#dashboard').load('/dashboard/contentview/dashboard');
}

