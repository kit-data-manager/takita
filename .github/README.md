# tAKITA - Annotation tool for WADM

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

tAKITA is an annotation tool to display, create and edit annotations compliant to the W3C recommendation [Web Annotation Data Model](https://www.w3.org/TR/annotation-model/).
    
Currently, tAKITA's features are limited to image annotation, annotation of text data is in development. tAKITA is designed to run in stack with other components from the KIT Data Manager Ecosystem.
    
## Prerequesites

### Services
- [KITDM base repo](https://github.com/kit-data-manager/base-repo/)
- [KITDM Web Annotation Protocol Server](https://github.com/kit-data-manager/wap-server) (other APIs compliant with Web Annotation Protocol may be applicable as well)
- Elasticsearch 

### Installation requirements (for native installation only)

- Java Runtime Environment 21 or higher
- node v24

## Setup

### Docker

As an alternative to native installation, we provide multiple docker compose setups for containerized installation.
- `docker-compose.yml`: default configuration, bundled with elastic, base-repo service and wap-server service
- `docker-compose.minimal.yml`: takita with elastic only (base-repo and wap-server have to be setup separately)

#### Bundled setup

For the bundled version, all services run behind a reverse proxy. Therefore, only the proxy can be configured (for example by .env file).
If left unconfigured, the bundled takita is reachable via `localhost:7777` after startup.

```
COMPOSE_PROXYHOST=...
COMPOSE_PROXYPORT=...
```

Starting the bundled compose stack:

```
git clone https://github.com/kit-data-manager/takita.git
cd takita
docker compose up
```

The different services can be reached under the following endpoints

```
COMPOSE_PROXYHOST:COMPOSE_PROXYPORT/ <- takita
COMPOSE_PROXYHOST:COMPOSE_PROXYPORT/repo/ <- base-repo
COMPOSE_PROXYHOST:COMPOSE_PROXYPORT/annoserver/ <- wap-server
```

#### Setup as Demo / Playground

The docker compose setup includes a `sampleData` service for ingesting a minimal dataset for annotations into the repo.

To run this service, start the docker bundle with

```
docker compose --profile playground up
```

The sampleData service will only run if the repo is currently empty. The service is based on `hurl`, the hurl files used by this service can be found  in `tuhl/src/intTest/resources/hurl`.

#### Minimal setup

To use the minimal docker setup, the following environment variables are needed (for example provided by an .env file):

```
TAKITA_REPOURL=http://<some-repo>/
TAKITA_WAPURL=http://<some wadm server>/
TAKITA_SPARQLURL=http://<some wadm server...>/sparql?query=
```

Starting the minimal compose stack:

```
git clone https://github.com/kit-data-manager/takita.git
cd takita
docker compose -f docker-compose.minimal.yml up
```

### Additional setup hints

#### Persist data

The current default configuration does not persist any data on the host. To do so, the data folders of the bundled services can be mounted into the docker containers as volumes. The docker compose config files contain commented out `volumes` sections as pointers.


#### Tweak elastic configuration

Configuration of elastic is highly dependent on the target system and on the planned usage. Good results have been reached by providing elastic with at least 8GB of RAM. However, this may overload local systems. The configuration can be changed in `docker-compose.override.yml` by setting the following parameters (sample values)

```
    environment:
      - "ES_JAVA_OPTS=-Xms256m -Xmx512m"
```

Since elastic is quite restrictive in regard to disk usage, the takita index may become read only (resulting in failing operations) on full disk systems.
Elastic default configuration can be tweaked like this in the es service (sample values):

```
    environment:
      - cluster.routing.allocation.disk.watermark.high=0.95
      - cluster.routing.allocation.disk.watermark.flood_stage=0.98
      - cluster.routing.allocation.disk.watermark.low=0.85
```

### Native Setup

native installation guide TBD

## Usage
### Executing the Program

```
java -jar takita-<version>.jar
```

### CLI arguments
    
* `buildIndex`  
The program will delete the old search index and rebuild it at the startup.

* `updateIndex` (experimental)   
The program will perform an index update. This will look for Annotations and Manuscripts that
 where added or modified after the last update or build of the index. 

* `scheduleIndex` (experimental) 
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
    
### CLI parameters / application properties
    
#### General
* `--server.port=<myPort>`  
Specify the port of the Spring server. The default port is `8080`.
    
* `--server.host=<myHost>`  
Specify the host of the Spring server. The default port is `localhost`.
    

#### Manuscript Repository & Annotation Store
* `--repository.baseUrl=<myBaseUrl>` (required, no default)
Provide the URL to the manuscript repository. 

* `--repository.staticPath=<myStaticPath>`  
Override the default path to the manuscript repository. The default path is `api/v1/dataresources/`.

* `--annotationStore.url=<myUrl>` (required, no default) 
Provide the url of the root annotation container.
  
* `--sparqlQuery.urlPrefix=<myPrefix>` (required, no default) 
Provide url prefix of the sparql endpoint of the annotation store.
  
#### Elasticsearch
* `--elasticsearch.ip=<myIp>` (required, no default) 
Provide io/hostname for the elasticsearch server.

* `--elasticsearch.port=<myPort>`  
Set a custom port for the elasticsearch server.

#### User Repository
* `--spring.datasource.url=<myUrl>`    
Set a custom source url for user repository. The default source url is `jdbc:h2:file:~/db/userdb`

###  Updating the index

tAKITA at the moment cannot auto-detect new data in the repository without additional setup (messaging). If the scheduled index updates described above are not sufficient, index updates (`operation=update`) and rebuilds (`operation=rebuild`) can also be triggered via HTTP request. This function at the moment is very limited (no info on success or failure) and should be handled with care

```
POST http://<takita host:port>/actuator/searchIndex?operation=rebuild'
```

## License

tAKITA is licensed under the Apache License, Version 2.0.
    
## Acknowledgement
    
Development of this software product was funded by the German Research Foundation (DFG)—CRC 980 Episteme in Motion, Project-ID 191249397
and by the CRC 1475 Metaphors of Religion. Religious Meaning-Making in Language Use, Project-ID 441126958.
