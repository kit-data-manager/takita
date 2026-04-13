#!/bin/bash

BASEDIR=$(dirname "$0")
echo "Building project from source."
cd $BASEDIR/backend
echo "SKIP_TESTS=${SKIP_TESTS:-true}"

if [ "${SKIP_TESTS:-true}" = "true" ]; then
  echo "Running build WITHOUT tests"
  ./gradlew build -x test -x integrationTest -x npmTest
else
  echo "Running build WITH tests"
  ./gradlew build
fi

echo "Build done."
