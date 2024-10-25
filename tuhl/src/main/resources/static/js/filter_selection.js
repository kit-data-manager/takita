function remove(field) {
    $ .ajax({
        type: 'POST',
        url: '/filter/remove',
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
        // the submit()-call should be inside this callback, so it gets excecuted AFTER
        // the load()-call is finished
        $('#filterInput').submit();
    });
}