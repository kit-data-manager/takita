function remove(field) {
    $ .ajax({
        type: 'POST',
        url: window.CONTEXTPATH + 'filter/remove',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        dataType: 'text',
        data: field,

        success: function(responseData) {
            $('#filterSelection').replaceWith(responseData)
            $('.selectpicker').selectpicker();
        }
    });
}

function clearFilters() {
    $('#filterSelection').parent().load('/filter/clear', function () {
        $('.selectpicker').selectpicker();
    });
    $('#filterInput').submit();
}