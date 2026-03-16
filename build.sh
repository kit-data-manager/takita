#!/bin/bash

BASEDIR=$(dirname "$0")
echo "Building project from source."
cd $BASEDIR/backend
./gradlew build -x integrationTest
echo "Build done."
