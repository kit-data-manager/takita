################################################################################
# 0) Check WAP
################################################################################
GET {{host}}/wap/
HTTP 200

################################################################################
# 1) Create 'publisher' container
################################################################################
POST {{host}}/wap/
Content-Type: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
Link: <http://www.w3.org/ns/ldp\#BasicContainer>; rel="type"
Slug: self
{
  "@context": [ "http://www.w3.org/ns/anno.jsonld", "http://www.w3.org/ns/ldp.jsonld" ],
  "@type": [ "ldp:Container", "ldp:BasicContainer", "AnnotationCollection"],
  "label":"This container will contain data by publisher SELF"
}
HTTP *

################################################################################
# 1) Create takita container
################################################################################
POST {{host}}/wap/self/
Content-Type: application/ld+json; profile="http://www.w3.org/ns/anno.jsonld"
Link: <http://www.w3.org/ns/ldp\#BasicContainer>; rel="type"
Slug: takita
{
  "@context": [ "http://www.w3.org/ns/anno.jsonld", "http://www.w3.org/ns/ldp.jsonld" ],
  "@type": [ "ldp:Container", "ldp:BasicContainer", "AnnotationCollection"],
  "label":"This container will contain data by publisher SELF"
}
HTTP *