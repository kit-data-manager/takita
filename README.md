# Readme

#### Executing the Program
In order for the program to run properly there are two major requirements:
* Java Runtime Environment 11 or higher needs to be installed
* A server with the Elasticsearch image on version 7.6.2 must be running.
    * Use for example docker:  
    `docker run -d --name es762 -p 9200:9200 -e "discovery.type=single-node" elasticsearch:7.6.2` 

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

##### Search Index
* `buildIndex`  
The program will delete the old search index and rebuild it at the startup.

* `updateIndex`  
The program will schedule an index update. Per default the update will be at 03:00 
every 5 days. These parameters can be customized with the following arguments:
    * `--hour=<myHour>`  
    Perform the update at the specified hour.
    
    * `--dayInterval=<myDayInterval>`  
    Perform the update at the given interval of days.
    
##### Elasticsearch
* `--elasticsearch.ip=<myIp>`  
Set a custom ip for the elasticsearch server. The default ip is localhost.

* `--elasticsearch.port=<myPort>`  
Set a custom port for the elasticsearch server. The default port is 9200.