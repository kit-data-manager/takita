# Readme

For some major changes from image-annotation takita to text-annoation check the end of the document.

#### Executing the Program
In order for the program to run properly there are two major requirements:
* Java Runtime Environment 11 or higher needs to be installed
* A server with the Elasticsearch image on version 7.6.2, or a compatible higher version must be
 running. 

##### Running an Elasticsearch server using Docker
In order for this to work, Docker must be installed and running.
The next step is to open a terminal in the same directory as the configuration file 
`docker-compose.yml` is located and execute the command `docker-compose up` to run the docker.

#### Program Arguments

##### General
* `--server.port=<myPort>`  
Specify the port of the Spring server. The default port is `8080`.

##### Manuscript Repository & Annotation Store
* `--repository.baseUrl=<myBaseUrl>`  
Override the default base URL of the manuscript repository. 
The default base URL is `http://samplerepo.edu/`.

* `--repository.saticPath=<myStaticPath>`  
Override the default path to the manuscript repository. The default path is `api/v1/dataresources/`.

* `--annotationStore.url=<myUrl>`  
Override the default url of the root annotation
 container containing the `validated` and `deinterpretatione` containers. The default url is
  `http://sampleannoserver.edu/wap/a04/`
  
* `--sparqlQuery.urlPrefix=<myPrefix>`   
Set the url prefix of the sparql query. The default prefix is 
`http://sampleannoserver-sparql.edu/wap/sparql?query=`.

##### Search Index
* `buildIndex`  
The program will delete the old search index and rebuild it at the startup.

* `updateIndex`   
The program will perform an index update. This will look for Annotations and Manuscripts that
 where added or modified after the last update or build of the index.

* `scheduleIndex`  
The program will schedule an index update. Per default the update will be at 03:00 
every 5 days. These parameters can be customized with the following arguments:
    * `--hour=<myHour>`  
    Perform the update at the specified hour.
    
    * `--dayInterval=<myDayInterval>`  
    Perform the update at the given interval of days.
    
* `buildDevIndex`   
The program will delete the old search index and build a small one based on a few manuscripts.  
This can be used for development purposes.
    * `--devIndex.size=<mySize>`   
    Sets the size of the dev index and therefore how many manuscripts will be obtained. The
    default value is 5.
  
##### Elasticsearch
* `--elasticsearch.ip=<myIp>`  
Set a custom ip for the elasticsearch server. The default ip is localhost.

* `--elasticsearch.port=<myPort>`  
Set a custom port for the elasticsearch server. The default port is 9200.

##### User Repository
* `--spring.datasource.url = <myUrl>`    
Set a custom source url for user repository. The default source url is `jdbc:h2:file:~/db/userdb`

## Changes from image annotation

Chronologically ordered from oldest to latest changes:

- tAkita now distinguishes between manuscript and page DO´s by its "resourceType"/"value" instead of "resourceType"/"typeGeneral" (see [084d25f9b9ee34efc7849bdd0198d873be1ab0dc](https://git.scc.kit.edu/sfb980/takita/-/commit/084d25f9b9ee34efc7849bdd0198d873be1ab0dc))
  - previously it used to handle DO´s with `"typeGeneral": "IMAGE"` as page and DO´s withs `"typeGeneral": "TEXT"` as manuscript DO´s
- tAkita's js doesn't access the base-repo directly any longer to get the data of a page DO´s, but uses an endpoint provided by the java code(see [commit b07b7f10229619f1fa9881aae06790ea839c97a1](https://git.scc.kit.edu/sfb980/takita/-/commit/b07b7f10229619f1fa9881aae06790ea839c97a1)))
  - this currently only is true for text/xml files
- since [commit b18196b0e71206d42a62b50c2a0df9827d4d554a](https://git.scc.kit.edu/sfb980/takita/-/commit/b18196b0e71206d42a62b50c2a0df9827d4d554a) you need to a reference to a SKOMSOS instance in the application properties. You don't need to run a SKOSMOS instacne somewhere, but can just copy the following lines:

```
thesaurus.baseUrl = https://URL
thesaurus.searchPath = rest/v1/ct/search
```

- commits 965e93d57fd5d140146548388c3539799efe6c72 till 762dc9c2d7c491394bd0198e9ef7f54ccdf58a65 are relevant for the context-path changes and most of them adjust the paths in the html and js to the endpoints. You can now use `server.servlet.context-path = /context/path` (note the leading `/`) in your application.properties to change the context-path of takita. 762dc9c2d7c491394bd0198e9ef7f54ccdf58a65 can act as a guide to find all the paths that have been adjusted.
  - after this change, `server.servlet.session.tracking-modes = COOKIE` needs to be added to the application.properties as early on in the lifecycle of a user's session there seems to be no cookie available to store the session ID. When this happens, thymeleaf puts the session ID in the URL itself as a fallback. As tAkitas html and js now uses the contextpath to access endpoints, the path to the endpoints will have the session ID attached to them on the first opening of any page, if you dont store the session ID in the cookie with `server.servlet.session.tracking-modes = COOKIE`.
  - further relevant commits: 
    - a668c5762c68de62ec7575ce1ee5cd4ff7b40db6
    - 790ec870686b0bbea5fcdc84bbc1e6fd87ba50d8
    - 69e50a9afd7d27203caf86362d9b61daa2ba2a03
    - 5916b97eaeca82eba99715c10fba1d876dbb20c0
    - 2e32b9a3bce89637061f5fc5968d16df8678689e
    - 273d825305ada628e4cbdc77b03b65eb529beb49
    - b2c83eaf3c137bc3aa127e493fc30f70a499c993 (see https://gitlab.kit.edu/kit/scc/dem/sfb980/takita/-/issues/53 as well)
- since commit 3c452d150f1538250b017e151e9e3cbde54b3c05 you need to specify the "colors" used by tAkita in various files.
  - Start by adding an entry to the enum in the **java** code (`tuhl/src/main/java/edu/kit/scc/dem/tuhl/model/Color.java`) according to this: `ENTRY_NAME("#colorHex", "value")` schema, eg. `MRW_DIRECT("#000011", "mrw (direct)")`. Adapt the `buildColor`-function in `tuhl/src/main/java/edu/kit/scc/dem/tuhl/dataaccess/AnnotationConverter.java`, which chooses the body used for retrieving the "color"
  - Then add the values from the enum to the **js** code at multiple places (once at `tuhl/src/main/resources/static/js/creation_templates(_text).js`, three times at `tuhl/src/main/resources/static/js/editor_xml.js`). 
- **All points in the code needed to be modified are marked with `TODO: CUSTOMISE` or `TODO: CUSTOMIZE` (this applies to points, where you can customise some things)**

#### customization

- **All points in the code needed to be modified are marked with `TODO: CUSTOMISE` or `TODO: CUSTOMIZE` (this applies to points, where you can customise some things)**
- after the modularisation (d2b7400743445edb5ccc36df0da16dcda0f9c4a0) you only need to touch `/js-src/projectspecific` to adapt **text** tAkita to your use case (for image tAkita you still need to adjust the files in `/js`)
- procedure:
  - you should checkout the `modularisation` branch (`git checkout modularisation`) 
  - then create your own branch from that state (`git checkout -b $YOUR_USE_CASE`)
  - adjust tAkita to your needs
  - push your changes to the branch you just created; please do not push your changes to `modularisation` as it serves as a "`main`"-branch for text tAkita
- commit d852e893e6d726b49973d64ce199627f8e359c56 enables the "questionmark" (get help)-button in the topbar leading to CRC 1475 annotation guidelines. This behavior should be adapted for each tAkita installation.