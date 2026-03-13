---
title: 01 - Repo Setup
layout: home
---

## Installation

For general information about installation and deployment, please refer to [https://kit-data-manager.github.io/webpage/base-repo/](https://kit-data-manager.github.io/webpage/base-repo/index.html)

## Data Structure

tAKITA expects data in the repository to follow a particular data structure. The general concept contains the following building blocks

- manuscript DO: contains metadata about a cultural heritage object
    - `manuscript_metadata.xml`: TEI XML file describing the object in a teiHeader element
    - `pages.json`: describes the sequence of page or part objects of the manuscript
- page DO: contains data describing a page or part (image data or text data in TEI XML (>= takita v2.0.0))

manuscript and page objects are linked to each other by the relation type `IS_METADATA_FOR` and `HAS_METADATA` respectively

## Data Creation Samples

This section describes sample requests to a base repo to create the data structure needed for tAKITA.
The description utilizes hurl syntax (similar to curl) to show which variables need to be reused from previous steps.
The sample adds one manuscript with name "Sample Manuscript" that contains one digitized page ("page1.jpg") and some text content ("text.xml")

### Image content

#### Create base metadata for page

```
POST {{repo}}/api/v1/dataresources/
Content-Type: application/json

{
    "resourceType": {
    "typeGeneral": "IMAGE",
    "value": "manuscriptPage",
    "publisher": "sampleproject",
    },
    "titles": [{"value": "Sample Manuscript, page1.jpg"}],
    "relatedIdentifiers": []
}
[Captures]
imgID: jsonpath "$.id"
```

Base metadata that is not specified here might be set to default values. "Publisher" defaults to "SELF".
The publisher value is utilized by tAKITA to determine the annotation container name.

#### Upload image data

```
POST {{repo}}/api/v1/dataresources/{{imgID}}/data/page1.master.jpg
[Multipart]
# field name is 'file', file path points to the local file you have on disk
file: file,page1.jpg; image/jpeg
```

#### Upload thumbnail

The need for thumbnails can be disabled in the tAKITA frontend (>= v2.0.0). In this case this can be skipped.

```
POST {{repo}}/api/v1/dataresources/{{imgID}}/data/page1.thumb.jpg
[Multipart]
# field name is 'file', file path points to the local file you have on disk
file: file,data/page1.thumb.jpg; image/jpeg
```

### Text content

Text content is only supported by tAKITA >= v2.0.0.

#### Create base metadata for part

```
POST {{repo}}/api/v1/dataresources/
Content-Type: application/json

{
    "resourceType": {
        "typeGeneral": "TEXT",
        "value": "manuscriptPage"
    },
    "titles": [{"value": "Sample Manuscript, text.xml"}],
    "relatedIdentifiers": []
}

[Captures]
textID: jsonpath "$.id"
```

#### Upload text data

```
POST {{repo}}/api/v1/dataresources/{{textID}}/data/text.xml
[Multipart]
file: file,text.xml; application/xml
```

### Create manuscript object

```
POST {{host}}/api/v1/dataresources/
Content-Type: application/json

{
    "resourceType": {
        "typeGeneral": "TEXT",
        "value": "manuscriptMetadata"
    },
    "titles": [{"value": "Sample Manuscript"}],
    "relatedIdentifiers": [
        {
            "identifierType": "URL",
            "value": "{{host}}/api/v1/dataresources/{{imgID}}",
            "relationType": "IS_METADATA_FOR"
        },
        {
            "identifierType": "URL",
            "value": "{{host}}/api/v1/dataresources/{{textID}}",
            "relationType": "IS_METADATA_FOR"
        }
    ]
}

[Captures]
manuscriptID: jsonpath "$.id"
```

### Upload manuscript metadata

````
POST {{repo}}/api/v1/dataresources/{{manuscriptID}}/data/manuscript_metadata.xml
[Multipart]
file: file,manuscript_metadata.xml; application/xml

### Add page / part sequence info

POST {{repo}}/api/v1/dataresources/{{manuscriptID}}/data/pages.json
Content-Type: multipart/form-data; boundary=pagesBoundary
```
--pagesBoundary
Content-Disposition: form-data; name="file"; filename="pages.json"
Content-Type: application/json

[
    {
        "resourceId": "{{imgID}}",
        "pageId": "page1"
    },
    {
        "resourceId": "{{textID}}",
        "pageId": "text"
    }
]
--pagesBoundary--
```
````