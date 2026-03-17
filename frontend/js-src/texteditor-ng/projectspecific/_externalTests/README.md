# Readme

Usually you should put all the tests in the same module were the function is implemented. You can put tests, that test functions from outside the `projectspecifc`-module in this folder (`js-src/projectspecific/externalTest`). This is helpful as sometimes hooks or others functions influence the results of functions from other modules (eg. `selectAnnotation()` from `common/annotationCard/annotationCard.js` will create a jsonForm according to the implementations of some functions from the projectspecific module).
