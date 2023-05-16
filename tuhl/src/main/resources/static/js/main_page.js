function setSearchTerm(event) {
    event.preventDefault();
    let searchTerm;
    if(document.getElementById("searchTermEmpty") == null){
        searchTerm = $('#searchTerm').val();
    } else {
        searchTerm = $('#searchTermEmpty').val();
    }

    if (searchTerm != null) {
        $.get( "./tableview/getFirst", function( data ) {
            $ .ajax({
                type: 'POST',
                url: './search',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                dataType: 'text',
                data: searchTerm,

                success: function() {
                    location.href="./"
                }
            });
        });
    }
}
