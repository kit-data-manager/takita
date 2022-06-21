#!/bin/bash

BASEDIR=$(dirname "$0")
echo "Building project from source."
cd $BASEDIR/tuhl
./gradlew build -x test
echo "Build done."
