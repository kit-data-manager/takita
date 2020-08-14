function searchTerm() {
    let searchTerm;
    if(document.getElementById("searchTermEmpty") == null){
        searchTerm = $('#searchTerm').val();
    } else {
        searchTerm = $('#searchTermEmpty').val();
    }

    if (searchTerm != null && searchTerm !== "") {
        $ .ajax({
            type: 'POST',
            url: '/search',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            dataType: 'text',
            data: searchTerm,

            success: function() {
                location.href="/"
            }
        });
    }

}