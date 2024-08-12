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

/**
 * Show/hide search/filter bars for the various views. Only one parameter
 * should be "true" as only one view can be shown. Eg.: to show the bars for the
 * manuscript table call this function like "showBars(false, false, true)"
 *
 * @param {Boolean} annoDash
 * @param {Boolean} annoView
 * @param {Boolean} manuscriptView
 */
function showBars(annoDash, annoView, manuscriptView) {
    const $annotationSearchbar = document.getElementById('annotationSearchbar');
    const $annotationFilterbar = document.getElementById('annotationFilterbar');
    const $manuscriptSearchbar = document.getElementById('manuscriptSearchbar');
    const $manuscriptFilterbar = document.getElementById('manuscriptFilterbar');
  
    if (annoDash) {
      // hiding the annotation view bars
      $annotationSearchbar.classList.add('d-none');
      $annotationFilterbar.classList.add('d-none');
      // hiding the manuscriptview bars
      $manuscriptSearchbar.classList.add('d-none');
      $manuscriptFilterbar.classList.add('d-none');
    }
  
    if (manuscriptView) {
      // hiding the annotation view bars
      $annotationSearchbar.classList.add('d-none');
      $annotationFilterbar.classList.add('d-none');
      // showing the manuscriptview bars
      if ($manuscriptSearchbar.classList.contains('d-none')) {
        $manuscriptSearchbar.classList.remove('d-none');
      }
      if ($manuscriptFilterbar.classList.contains('d-none')) {
        $manuscriptFilterbar.classList.remove('d-none');
      }
    }
  
    if (annoView) {
      // hiding the manuscript view bars
      $manuscriptSearchbar.classList.add('d-none');
      $manuscriptFilterbar.classList.add('d-none');
      // showing the annotation view bars
      if ($annotationSearchbar.classList.contains('d-none')) {
        $annotationSearchbar.classList.remove('d-none');
      }
      if ($annotationFilterbar.classList.contains('d-none')) {
        $annotationFilterbar.classList.remove('d-none');
      }
    }
  }
  
  