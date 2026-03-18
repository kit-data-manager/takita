/**
 * sends SPARQL query to SPARQL endpoint
 *
 * @param {String} query SPARQL query to be posted
 * @param {String} url of the SPARQL endpoint to be used
 * @throws the response object, if the request was not sucessfull
 * @returns {Object} result of the query
 */
async function postSPARQLQuery(query, url) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/sparql-query' },
    body: query,
  });
  if (response.status == 200) {
    return await response.json();
  } else {
    console.error(`Executing the query failed with response code: ${response.status}`);
    throw response;
  }
}

async function getNumberOfAnnotations(url, $dashboard) {
  try {
    // counts the number of annotations in the WAP server
    const query = `
        PREFIX oa: <http://www.w3.org/ns/oa#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        SELECT (COUNT(?anno) as ?annos) {
          GRAPH ?g {
            ?anno a oa:Annotation.
            FILTER NOT EXISTS { ?anno <http://dem.scc.kit.edu/wapserv/ns#deleted> "true"^^xsd:boolean}
          }
        }`;
    const responseData = await postSPARQLQuery(query, url);
    $dashboard.querySelector('#annoNumber').textContent = responseData.results.bindings[0].annos.value;
  } catch (e) {
    console.error('Could not display the total number of annotations, because: ', e);
  }
}

async function getPersonalStats(url, annotator, $dashboard) {
  try {
    // counts the number of annotations of the specified annotator
    const query = `
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
    const responseData = await postSPARQLQuery(query, url);
    $dashboard.querySelector('#personalNumber').textContent = responseData.results.bindings[0].annos.value;
  } catch (e) {
    console.error('Could not display the personal stats, because: ', e);
  }
}

async function getAnnotationStreak(url, annotator, $dashboard) {
  try {
    // returns the date of the newest annotation of the specified annotator
    const query = `
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
    const responseData = await postSPARQLQuery(query, url);
    const date = new Date();
    const $icon = $dashboard.querySelector('#annoStreakIcon');
    const $contentTrue = $dashboard.querySelector('#annoStreakTrue');
    const $contentFalse = $dashboard.querySelector('#annoStreakFalse');
    $icon.classList.add('fa');
    $icon.classList.add('fa-2x');

    // if the result date is today, indicate a streak
    if (responseData.results.bindings[0]?.date) {
      if (responseData.results.bindings[0].date.value === date.toISOString().split('T')[0]) {
        $contentFalse.style.display = "none"
        $icon.classList.add('fa-smile-o');
      } else {
        $contentTrue.style.display = "none"
        $icon.classList.add('fa-frown-o');
      }
    } else {
      $contentTrue.style.display = "none"
      $icon.classList.add('fa-frown-o');
    }
  } catch (e) {
    console.error('Could not display the annotation streak, because: ', e);
  }
}

async function getTopAnnotators(url, $dashboard) {
  try {
    const date = new Date();
    // date object for today - 30 days
    const date30 = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - 30,
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds(),
    );

    const day = date30.toISOString().split('T')[0];

    // returns the count of annotations within the last 30 days for each annotator
    // TODO: include a limit of 3 in the query
    const queryCombined = `
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
                FILTER(xsd:date(?created) > "${day}"^^xsd:date)
            FILTER NOT EXISTS { ?anno <http://dem.scc.kit.edu/wapserv/ns#deleted> "true"^^xsd:boolean}
          } 
        } GROUP BY ?creatorName ORDER BY DESC(?annos)
        `;
    const responseData = await postSPARQLQuery(queryCombined, url);
    for (let result in responseData.results.bindings) {
      // we are only interested in the first 3 annotators, stopping afterwards
      if (result > 2) {
        break;
      }
      $dashboard.querySelector('#annotator' + result).textContent =
        responseData.results.bindings[result].creatorName.value;
      $dashboard.querySelector('#annotations' + result).textContent = responseData.results.bindings[result].annos.value;
    }
  } catch (e) {
    console.error('Could not display the top annotators of the last 30 days, because: ', e);
  }
}

async function getAnnotationCreators(url, $dashboard) {
  try {
    const series = [];
    const labels = [];
    const colors = [];
    // returns all annotation creators and their respective annotation count
    const query = `
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
    const responseData = await postSPARQLQuery(query, url);
    for (let result in responseData.results.bindings) {
      series.push(parseInt(responseData.results.bindings[result].annos.value));
      labels.push(responseData.results.bindings[result].creatorName.value);
      // eslint-disable-next-line no-undef
      colors.push(tabler.getColor('primary', 1 - 0.02 * result));
    }
    // mostly example from tabler & ApexChart
    window.ApexCharts &&
      // eslint-disable-next-line no-undef
      new ApexCharts($dashboard.querySelector('#annoCreators'), {
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
  } catch (e) {
    console.error('Could not display diagram showing the annotation creators');
  }
}

async function getAnnotationProgress(url, $dashboard) {
  try {
    const dates = [];
    const series = [];
    // returns all dates when annotations were created and their respective annotation count
    const query = `
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
    const responseData = await postSPARQLQuery(query, url);
    for (let result in responseData.results.bindings) {
      series.push(parseInt(responseData.results.bindings[result].annos.value));
      if (result > 0) {
        series[result] += series[result - 1];
      }
      dates.push(responseData.results.bindings[result].date.value);
    }
    // mostly example from tabler & ApexChart
    window.ApexCharts &&
      // eslint-disable-next-line no-undef
      new ApexCharts($dashboard.querySelector('#annoProgress'), {
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
        // eslint-disable-next-line no-undef
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
  } catch (e) {
    $dashboard.querySelector('#annoProgress').textContent =
      'Something went wrong while displaying the annotation progress.';
    console.error('Could not display annotation prgoress, because: ', e);
  }
}
async function initializeAnnoDash(url, annotator, $dashboard) {
  getNumberOfAnnotations(url, $dashboard);
  getPersonalStats(url, annotator, $dashboard);
  getAnnotationStreak(url, annotator, $dashboard);
  getTopAnnotators(url, $dashboard);
  getAnnotationCreators(url, $dashboard);
  getAnnotationProgress(url, $dashboard);
}
