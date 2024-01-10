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
    $('#filterSelection').parent().load(window.CONTEXTPATH + 'filter/clear', function () {
        $('.selectpicker').selectpicker();
        // the submit()-call should be inside this callback, so it gets excecuted AFTER
        // the load()-call is finished
        $('#filterInput').submit();
    });
}

// annotation filter functions
// rendering the needed input fields based on the filters selected by the user
function addAnnotationFilter(){

    const $selectedFilters = $('#addAnnotationFilterSelect option:selected');

    [...$selectedFilters].forEach($selectedFilter => {
        const filterType = $selectedFilter.getAttribute("data-subtext");
        const selectedFilterText = $selectedFilter.text;
        const selectedFilterValue = $selectedFilter.value;

        if (!document.getElementById("containerDiv" + selectedFilterValue)){
            let $containerDiv = document.createElement("div");
            $containerDiv.classList.add("container-fluid");
            $containerDiv.classList.add("mb-2");
            $containerDiv.classList.add("filterContainer");
            // storing the field to be filtered on
            $containerDiv.setAttribute("data-field", selectedFilterValue)
            $containerDiv.id = "containerDiv" + selectedFilterValue;
        
            let $labelRowDiv = document.createElement("div");
            $labelRowDiv.classList.add("row");
        
            let $label = document.createElement("label");
            $label.classList.add("col");
            $label.classList.add("pl-0");
            $label.innerHTML = selectedFilterText;
        
            let $labelRowInput = document.createElement("input");
            $labelRowInput.id = selectedFilterValue;
            $labelRowInput.type = "hidden";
            $labelRowInput.value = selectedFilterText;
        
            let $span = document.createElement("span");
            $span.classList.add("badge");
            $span.classList.add("badge-secondary");
            $span.classList.add("m-auto");
            $span.dataset.field = selectedFilterText;
            $span.innerHTML = "X";
            $span.setAttribute("type", "button");
            $span.addEventListener("click", removeAnnotationFilter);//$span.getAttribute('data-field')));
        
            $labelRowDiv.appendChild($label);
            $labelRowDiv.appendChild($labelRowInput);
            $labelRowDiv.appendChild($span);
            $containerDiv.appendChild($labelRowDiv);
        
            if (filterType === "range"){
                // storing the type of filter
                $containerDiv.classList.add("rangeFilter");

                let $rangeRowDiv = document.createElement("div");
                $rangeRowDiv.classList.add("row");
                $rangeRowDiv.id = "rangeInput";
        
                let $rangeFromInput = document.createElement("input");
                $rangeFromInput.type="date";
                $rangeFromInput.classList.add("form-control");
                $rangeFromInput.placeholder="From";
                $rangeFromInput.id="rangeFrom" + selectedFilterValue;
                //$rangeFromInput.name="filterConfigs[2].values[0]"
                let $rangeFromLabel = document.createElement("label");
                $rangeFromLabel.innerHTML = "From";
                $rangeFromLabel.htmlFor = "rangeFrom" + selectedFilterValue;

                let $rangeToInput = document.createElement("input");
                $rangeToInput.type="date";
                $rangeToInput.classList.add("form-control");
                $rangeToInput.classList.add("mt-1");
                $rangeToInput.placeholder="To";
                $rangeToInput.id="rangeTo" + selectedFilterValue;
                //$rangeToInput.name="filterConfigs[2].values[1]"
                let $rangeToLabel = document.createElement("label");
                $rangeToLabel.innerHTML = "To";
                $rangeToLabel.htmlFor = "rangeTo" + selectedFilterValue;

                $rangeRowDiv.appendChild($rangeFromLabel);
                $rangeRowDiv.appendChild($rangeFromInput);
                $rangeRowDiv.appendChild($rangeToLabel);
                $rangeRowDiv.appendChild($rangeToInput);
                $containerDiv.appendChild($rangeRowDiv);
            }
        
            if (filterType === "match"){
                // storing the type of filter
                $containerDiv.classList.add("matchFilter");

                let $matchRowDiv = document.createElement("div");
                $matchRowDiv.classList.add("row");
                $matchRowDiv.id = "matchInput";
        
                let $matchInput = document.createElement("input");
                $matchInput.type="text";
                $matchInput.classList.add("form-control");
                $matchInput.placeholder="Match term";
                $matchInput.id="match" + selectedFilterValue;
                //$matchInput.name="filterConfigs[2].values[0]"
        
                $matchRowDiv.appendChild($matchInput);
                $containerDiv.appendChild($matchRowDiv);
            }
            document.getElementById("annotationFilterbar").insertBefore($containerDiv, document.getElementById("annotationFilterInput"));
        }
    });
}

// collect all filters enterd by the user and pass them to tabulator.js to apply them
function applyAnnotationFilters(){
    // filters holds the filters passed to tabulator.js
    let matchFilters = [];
    let $annotationFilterbar = document.getElementById("annotationFilterbar");
    let $matchFilters = $annotationFilterbar.querySelectorAll(".matchFilter")
    let $rangeFilters = $annotationFilterbar.querySelectorAll(".rangeFilter")

    // adding all match filters
    if ($matchFilters){
        [...$matchFilters].forEach($matchFilter => {
            // getting the field to be filtered on
            const field = $matchFilter.getAttribute("data-field");
            // getting the value to be filtered on
            const value = $matchFilter.lastChild.lastChild.value;
            matchFilters.push({
                field: field,
                type: "like",
                value: value
            });
        });
    }

    // applying the match filters; as filters is an array, tabulator will use "OR" filters
    window.annotable.setFilter(matchFilters);

    // adding all range filters
    if ($rangeFilters){
        [...$rangeFilters].forEach($rangeFilter => {
            // getting the field to be filtered on
            const field = $rangeFilter.getAttribute("data-field");
            // getting the value to be filtered on
            const fromValue = $rangeFilter.lastChild.childNodes[1].value;
            const toValue = $rangeFilter.lastChild.lastChild.value;

            window.annotable.addFilter(dateFilterFunction, {
                fromValue: fromValue,
                toValue: toValue,
                field: field
            });
        });
    }

}

// remove ONE filter and its input field
function removeAnnotationFilter(event){
    const $target = event.target;
    const filters = window.annotable.getFilters();
    // find the filter, that the users want to remove
    const filter = filters.filter(filter => filter.field === $target.parentElement.parentElement.getAttribute("data-field"))[0];
    
    // remove the filter
    // if it wasn't applied earlier catch the exception
    try {
        window.annotable.removeFilter(filter.field, filter.type, filter.value);
    } catch (error){
        console.error("Could not remove filter ", filter, ". If it is undefined, it was not applied previously. Error: " , error);
    }
    
    // remove the rendered input field
    $target.parentElement.parentElement.remove();
}

// remove ALL filters and their input fields
function clearAnnotationFilters(){
    document.querySelectorAll(".filterContainer").forEach(div => div.remove());
    window.annotable.clearFilter();
}

// custom tabulator filter to filter data ranges
// for the filter logic see https://github.com/olifolkerd/tabulator/issues/1011
function dateFilterFunction(data, filterParams){
    //data - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property

   	const fromValue = new Date(filterParams.fromValue);
   	const toValue = new Date(filterParams.toValue);

    if (filterParams.field  === "created") {
        return dateFilterHelper(data.created, fromValue, toValue);
    }

    if (filterParams.field === "lastModified") {
        return dateFilterHelper(data.lastModified, fromValue, toValue);
    }

    return false; //must return a boolean, true if it passes the filter.
}

function dateFilterHelper(field, fromValue, toValue){
    if(field){
        const value = new Date(field);
        // checking if the date is valid see https://www.freecodecamp.org/news/how-to-validate-a-date-in-javascript/
        // TODO: improve this check
        if(!isNaN(fromValue)){
            if(!isNaN(toValue)){
                return value >= fromValue && value <= toValue;
            }else{
                return value >= fromValue;
            }
        }else{
            if(!isNaN(toValue)){
                return value <= toValue;
            }
        }
    }
}