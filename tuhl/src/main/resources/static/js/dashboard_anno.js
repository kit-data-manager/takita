/* eslint-disable no-undef */
function getNumberOfAnnotations(url) {
  // counts the number of annotations in the WAP server
  let query = `
        PREFIX oa: <http://www.w3.org/ns/oa#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT (COUNT(?anno) as ?annos) {
          GRAPH ?g {
            ?anno a oa:Annotation.
            FILTER NOT EXISTS { ?anno <http://dem.scc.kit.edu/wapserv/ns#deleted> "true"^^xsd:boolean}
          }
        }`;

  $.ajax({
    type: 'POST',
    url: url,
    data: btoa(query),
    headers: {
      'Content-Type': 'application/sparql-query',
    },

    success: function (responseData) {
      // adds the returned number to the specified div
      $('#annoNumber').text(responseData.results.bindings[0].annos.value);
    },

    error: function (errorData) {
      console.log(errorData);
    },
  });
}

function getPersonalStats(url, annotator) {
  // counts the number of annotations of the specified annotator
  let query = `
        PREFIX oa: <http://www.w3.org/ns/oa#>
        PREFIX dcterms: <http://purl.org/dc/terms/>
        PREFIX foaf:   <http://xmlns.com/foaf/0.1/>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
    
        SELECT (COUNT(?anno) as ?annos) {
          GRAPH ?g {
            ?anno a oa:Annotation.
                ?anno dcterms:creator/foaf:name "${annotator}".
            FILTER NOT EXISTS { ?anno <http://dem.scc.kit.edu/wapserv/ns#deleted> "true"^^xsd:boolean}
          }
        }`;

  $.ajax({
    type: 'POST',
    url: url,
    data: btoa(query),
    headers: {
      'Content-Type': 'application/sparql-query',
    },

    success: function (responseData) {
      let personalNumber = responseData.results.bindings[0].annos.value;
      $('#personalNumber').text(personalNumber);
    },

    error: function (errorData) {
      console.log(errorData);
    },
  });
}

function getAnnotationStreak(url, annotator) {
  // returns the date of the newest annotation of the specified annotator
  let query = `
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX dcterms: <http://purl.org/dc/terms/>
    
        SELECT ?date {
          GRAPH ?g {           
                  ?anno dcterms:creator/foaf:name "${annotator}".
            FILTER NOT EXISTS { ?anno <http://dem.scc.kit.edu/wapserv/ns#deleted> "true"^^xsd:boolean}
              ?anno dcterms:created ?created.
              BIND(xsd:date(concat(str(year(?created)),"-", str(month(?created)),"-", str(day(?created)))) as ?date).
          }
        } GROUP BY ?date
        ORDER BY desc(?date) LIMIT 1`;

  $.ajax({
    type: 'POST',
    url: url,
    data: btoa(query),
    headers: {
      'Content-Type': 'application/sparql-query',
    },

    success: function (responseData) {
      let date = new Date();
      let icon = document.getElementById('annoStreakIcon');
      icon.classList.add('bx');
      icon.classList.add('bx-md');

      // if the result date is today, indicate a streak
      if (responseData.results.bindings[0].date.value === date.toISOString().split('T')[0]) {
        $('#annoStreak').text(" You're on a streak! Good job annotating today!");
        icon.classList.add('bx-happy');
      } else {
        $('#annoStreak').text(" Oh no! I didn't find any annotations from you today. Why not start annotating now?");
        icon.classList.add('bx-sad');
      }
    },

    error: function (errorData) {
      console.log(errorData);
    },
  });
}

function getTopAnnotators(url) {
  let date = new Date();
  // date object for today - 30 days
  let date30 = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - 30,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );

  let result = date30.toISOString().split('T')[0];

  // returns the count of annotations within the last 30 days for each annotator
  // TODO: include a limit of 3 in the query
  let queryCombined = `
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX dcterms: <http://purl.org/dc/terms/>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX oa: <http://www.w3.org/ns/oa#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT ?creatorName (COUNT(?anno) as ?annos)  {
          GRAPH ?g {
            ?anno a oa:Annotation.
              ?anno dcterms:creator ?creator.
              ?creator foaf:name ?creatorName.
                ?anno dcterms:created ?created.
                FILTER(xsd:date(?created) > "${result}"^^xsd:date)
            FILTER NOT EXISTS { ?anno <http://dem.scc.kit.edu/wapserv/ns#deleted> "true"^^xsd:boolean}
          } 
        } GROUP BY ?creatorName ORDER BY DESC(?annos)
        `;

  $.ajax({
    type: 'POST',
    url: url,
    data: btoa(queryCombined),
    headers: {
      'Content-Type': 'application/sparql-query',
    },

    success: function (responseData) {
      for (result in responseData.results.bindings) {
        $('#annotator' + result).text(responseData.results.bindings[result].creatorName.value);
        $('#annotations' + result).text(responseData.results.bindings[result].annos.value);
      }
    },

    error: function (errorData) {
      console.log(errorData);
    },
  });
}

function getAnnotationCreators(url) {
  let series = [];
  let labels = [];
  let colors = [];

  // returns all annotation creators and their respective annotation count
  let query = `
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX dcterms: <http://purl.org/dc/terms/>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX oa: <http://www.w3.org/ns/oa#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT ?creatorName (COUNT(?anno) as ?annos)  {
            GRAPH ?g {
              ?anno a oa:Annotation.
                ?anno dcterms:creator ?creator.
                ?creator foaf:name ?creatorName.
              FILTER NOT EXISTS { ?anno <http://dem.scc.kit.edu/wapserv/ns#deleted> "true"^^xsd:boolean}
            } 
        } GROUP BY ?creatorName ORDER BY ?annos
      `;

  $.ajax({
    type: 'POST',
    url: url,
    data: btoa(query),
    headers: {
      'Content-Type': 'application/sparql-query',
    },

    success: function (responseData) {
      for (result in responseData.results.bindings) {
        series.push(parseInt(responseData.results.bindings[result].annos.value));
        labels.push(responseData.results.bindings[result].creatorName.value);
        colors.push(tabler.getColor('primary', 1 - 0.02 * result));
      }

      // mostly example from tabler & ApexChart
      window.ApexCharts &&
        new ApexCharts(document.getElementById('annoCreators'), {
          chart: {
            type: 'donut',
            fontFamily: 'inherit',
            height: 180,
            sparkline: {
              enabled: true,
            },
            animations: {
              enabled: false,
            },
          },
          fill: {
            opacity: 1,
          },
          series: series,
          labels: labels,
          tooltip: {
            theme: 'dark',
            fillSeriesColor: false,
          },
          grid: {
            strokeDashArray: 4,
          },
          //colors: colors,
          legend: {
            show: false,
            position: 'bottom',
            offsetY: 12,
            markers: {
              width: 10,
              height: 10,
              radius: 100,
            },
            itemMargin: {
              horizontal: 8,
              vertical: 8,
            },
          },
        }).render();
    },

    error: function (errorData) {
      console.log(errorData);
    },
  });
}

function getAnnotationProgress(url) {
  let dates = [];
  let series = [];

  // returns all dates when annotations were created and their respective annotation count
  let query = `
        PREFIX foaf: <http://xmlns.com/foaf/0.1/>
        PREFIX dcterms: <http://purl.org/dc/terms/>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX oa: <http://www.w3.org/ns/oa#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT ?date (COUNT(?anno) as ?annos){
          GRAPH ?g {
            ?anno a oa:Annotation.
              ?anno dcterms:created ?created.
              BIND(xsd:date(concat(str(year(?created)),"-",
              str(month(?created)),"-",
              str(day(?created)))) as ?date).
            FILTER NOT EXISTS { ?anno <http://dem.scc.kit.edu/wapserv/ns#deleted> "true"^^xsd:boolean}
          } 
        } GROUP BY ?date ORDER BY ?date`;

  $.ajax({
    type: 'POST',
    url: url,
    data: btoa(query),
    headers: {
      'Content-Type': 'application/sparql-query',
    },

    success: function (responseData) {
      for (result in responseData.results.bindings) {
        series.push(parseInt(responseData.results.bindings[result].annos.value));
        if (result > 0) {
          series[result] += series[result - 1];
        }
        dates.push(responseData.results.bindings[result].date.value);
      }

      // mostly example from tabler & ApexChart
      window.ApexCharts &&
        new ApexCharts(document.getElementById('annoProgress'), {
          chart: {
            type: 'line',
            fontFamily: 'inherit',
            height: 240,
            parentHeightOffset: 0,
            toolbar: {
              show: false,
            },
            animations: {
              enabled: false,
            },
          },
          fill: {
            opacity: 1,
          },
          stroke: {
            width: 2,
            lineCap: 'round',
            curve: 'straight',
          },
          series: [
            {
              name: 'Annotations',
              data: series,
            },
          ],
          tooltip: {
            theme: 'dark',
          },
          grid: {
            padding: {
              top: -20,
              right: 0,
              left: -4,
              bottom: -4,
            },
            strokeDashArray: 4,
          },
          xaxis: {
            labels: {
              padding: 0,
            },
            tooltip: {
              enabled: false,
            },
            type: 'datetime',
          },
          yaxis: {
            labels: {
              padding: 4,
            },
          },
          labels: dates,
          colors: [tabler.getColor('primary')],
          legend: {
            show: true,
            position: 'bottom',
            offsetY: 12,
            markers: {
              width: 10,
              height: 10,
              radius: 100,
            },
            itemMargin: {
              horizontal: 8,
              vertical: 8,
            },
          },
        }).render();
    },

    error: function (errorData) {
      console.log(errorData);
    },
  });
}
function initializeAnnoDash(url, annotator) {
  getNumberOfAnnotations(url);
  getPersonalStats(url, annotator);
  getAnnotationStreak(url, annotator);
  getTopAnnotators(url);
  getAnnotationCreators(url);
  getAnnotationProgress(url);
}
