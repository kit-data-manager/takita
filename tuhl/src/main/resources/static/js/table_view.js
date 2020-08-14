
// todo: show all thumbnails
//function of alwaysShowThumbnails checkbox
function onChangeCheckbox(checkbox) {
    if (checkbox.checked) {
        table.getRows().forEach(function (row) {
            const id = row.getData().id;
            $(".subTable" + id + "").show();
        })
    } else {
        table.getRows().forEach(function (row) {
            const id = row.getData().id;
            $(".subTable" + id + "").hide();
        })
    }

        $.ajax({
            type: 'GET',
            url: "assistance/toggleCheckThumbs",
            dataType: 'text',
        });

}



//reset columns function
function resetColumns() {
    table.setColumns(window.cols);
}

//go to dashboard call
function backToDashboard() {
    $('#dashboard').load('/dashboard/contentview/dashboard');
}

//--- change page calls ---

// got to first page call
function goToFirstPage() {
    callPage(1);
}

function setResultsPerPage(event) {
    event.preventDefault();
    $.ajax({
        type: 'GET',
        url: '/tableview/results_per_page/' + $('#resultsPerPage').val(),
        dataType: 'text',
        success: function () {
            $('#dashboard').load('/tableview/flag');
        }
    })
}