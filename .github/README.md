# tAKITA - Annotation tool for WADM

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

tAKITA is an annotation tool to display, create and edit annotations compliant to the W3C recommendation [Web Annotation Data Model](https://www.w3.org/TR/annotation-model/).
    
Currently, tAKITA's features are limited to image annotation, annotation of text data is in development. tAKITA is designed to run in stack with other components from the KIT Data Manager Ecosystem.
    
## Prerequesites

### Services
- [KITDM base repo](https://github.com/kit-data-manager/base-repo/)
- [KITDM Web Annotation Protocol Server](https://github.com/kit-data-manager/wap-server) (other APIs compliant with Web Annotation Protocol may be applicable as well)
- Elasticsearch 

### Installation requirements
- Java Runtime Environment 17 or higher

## Installation

### Native

native installation guide TBD

### Docker

As an alternative to native installation, the provided Dockerfile can be used for containerized installation. To setup tAKITA together with the necessary elasticsearch API, the `docker-compose.yml`configuration can be used.
    
```
git clone https://github.com/kit-data-manager/takita.git
cd takita
docker compose up
```
    
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

## License

tAKITA is licensed under the Apache License, Version 2.0.
    
## Acknowledgement
    
Development of this software product was funded by the German Research Foundation (DFG)—CRC 980 Episteme in Motion, Project-ID 191249397
