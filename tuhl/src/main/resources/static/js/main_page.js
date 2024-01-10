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

function setAnnotationSearchTerm(event) {
    event.preventDefault();
    let searchTerm;
    if(document.getElementById("annotationSearchTermEmpty") == null){
        searchTerm = $('#annotationSearchTerm').val();
    } else {
        searchTerm = $('#annotationSearchTermEmpty').val();
    }
    if (searchTerm != null) {
        // use "OR" filters on every column to "search"
        // creating the filters
        let filters = window.annocolumns.filter(column => column.field !== undefined)
                                        .map(column => {
                                                return {field:column.field, type:"like", value:searchTerm};
                                            });
        // applying the filters; as filters is an array, tabulator will use "OR" filters
        window.annotable.setFilter([filters]);
    }
}