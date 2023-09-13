#!/bin/bash

#check existance of ES search index
curl --silent --show-error --fail es:9200/search_index/_stats

#check exit status - curl returns with status 22 on http code 404 (or any other error code)
if [ $? -eq 22 ]
then
  echo "No success finding search index"
  echo "Building new search index"
  java --add-opens=java.base/java.time=ALL-UNNAMED -jar tuhl-0.0.2-SNAPSHOT.jar buildIndex scheduleIndex
else
  echo "Found existing search index"
  echo "Starting application"
  java --add-opens=java.base/java.time=ALL-UNNAMED -jar tuhl-0.0.2-SNAPSHOT.jar updateIndex scheduleIndex
fi
