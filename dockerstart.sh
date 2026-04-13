#!/bin/sh
set -e

if curl --silent --show-error --fail es:9200/search_index/_stats > /dev/null; then
  echo "Found existing search index"
  echo "Starting application"
  exec java -jar takita.jar
else
  status=$?
  if [ "$status" -eq 22 ]; then
    echo "Search index not found (404)"
    echo "Building new search index"
    exec java -jar takita.jar buildIndex
  else
    echo "Elasticsearch not reachable (curl exit code $status)"
    exit 1
  fi
fi