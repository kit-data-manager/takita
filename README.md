# Readme

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
* `--spring.datasource.url = <myUrl>
Set a custom source url for user repository. The default source url is jdbc:h2:file:~/db/userdb
