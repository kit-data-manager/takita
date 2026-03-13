---
title: 02 - Annoserver Setup
layout: home
---

## Installation

For general information about installation and deployment, please refer to https://kit-data-manager.github.io/webpage/wap-server/index.html

## Data Structure

tAKITA can read annotations from all available annotation containers, but it will write to a specific container based on the DO metadata in the repository.

If the "publisher" in the base metadata of a repo manuscript is set to "projectName", the annotation container to write to is `/projectName/takita/`.
If the "publisher" in the base metadata of a repo manuscript is set to "project - subproject", the annotation container to write to is `/subproject/takita/`.

If the expected container isn't found, tAKITA will try to write to `/takitadefault/` (configurable >= v2.0.0)

## Data Creation Samples

### Create containers for <my_project>

```
POST {{annoserver}}/wap/
Content-Type: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
Link: <http://www.w3.org/ns/ldp\#BasicContainer>; rel="type"
Slug: my_project
{
    "@context": [ "http://www.w3.org/ns/anno.jsonld", "http://www.w3.org/ns/ldp.jsonld" ],
    "@type": [ "ldp:Container", "ldp:BasicContainer", "AnnotationCollection"],
    "label":"This container will contain data by publisher my_project"
}
```

```
POST {{annoserver}}/wap/my_project/
Content-Type: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
Link: <http://www.w3.org/ns/ldp\#BasicContainer>; rel="type"
Slug: takita
{
    "@context": [ "http://www.w3.org/ns/anno.jsonld", "http://www.w3.org/ns/ldp.jsonld" ],
    "@type": [ "ldp:Container", "ldp:BasicContainer", "AnnotationCollection"],
    "label":"This container will contain data by publisher my_project"
}
```