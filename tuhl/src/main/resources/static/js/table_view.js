

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

//hide all thumbnails in beginning
function checkThumb() {
    let b = document.getElementById("thumbnails").checked;
    if (!b) {
        table.getRows().forEach(function (row) {
            const id = row.getData().id;
            $(".subTable" + id + "").toggle();
        })
    }
};


//reset columns function
function resetColumns() {
    table.setColumns(window.cols);
    checkThumb();
}

//go to dashboard call
function backToDashboard() {
    $('#dashboard').load('/dashboard/contentview/dashboard');
}

//--- change page calls ---
// change page call
function changePage() {
    let input = $('#pageNumberInput').val();
    callPage(input);
}

// got to first page call
function goToFirstPage() {
    callPage(1);
}

function setResultsPerPage() {
    $.ajax({
        type: 'GET',
        url: '/tableview/results_per_page' + $('#resultsPerPage').val(),
        dataType: 'text',
        success: function () {
            updateData();
        }
    })
}