###############################################################################
# This script ingests sample data into the base repo for takita to annotate
# Metadata + Image Data + Text Data
################################################################################
################################################################################
# 0) Check Repo
# this script is intended to only run on an empty repsitory to avoid misuse on production data etc.
# If you really need to change this behaviour, remove the assertion
################################################################################
GET {{host}}/api/v1/dataresources/
HTTP 200
[Asserts]
jsonpath "$" isEmpty

################################################################################
# 1) POST Image DO (JSON)
################################################################################
POST {{host}}/api/v1/dataresources/
Content-Type: application/json

# Example structure shown as placeholder (replace with your real payload):
{
  "resourceType": {
    "typeGeneral": "IMAGE",
    "value": "manuscriptPage"
  },
  "titles": [{"value": "MANUSCRIPTNAME, page1234.jpg"}],
  "relatedIdentifiers": []
}
# ---------------------------------------------------------

HTTP *
[Asserts]
status >= 200
status < 300
[Captures]
imgID: jsonpath "$.id"

################################################################################
# 2) Upload image data as multipart to .../{imgID}/data/page1234.master.jpg
################################################################################
POST {{host}}/api/v1/dataresources/{{imgID}}/data/page1234.master.jpg
[Multipart]
# field name is 'file', file path points to the local file you have on disk
file: file,data/page1234.jpg; image/jpeg

HTTP *
[Asserts]
status >= 200
status < 300

################################################################################
# 2b) Upload image data as multipart to .../{imgID}/data/page1234.thumb.jpg
################################################################################
POST {{host}}/api/v1/dataresources/{{imgID}}/data/page1234.thumb.jpg
[Multipart]
# field name is 'file', file path points to the local file you have on disk
file: file,data/page1234.thumb.jpg; image/jpeg

HTTP *
[Asserts]
status >= 200
status < 300

################################################################################
# 3) Upload text DO
################################################################################
POST {{host}}/api/v1/dataresources/
Content-Type: application/json

# Example structure shown as placeholder (replace with your real payload):
{
  "resourceType": {
    "typeGeneral": "TEXT",
    "value": "manuscriptPage"
  },
  "titles": [{"value": "MANUSCRIPTNAME, text.xml"}],
  "relatedIdentifiers": []
}
# ---------------------------------------------------------

HTTP *
[Asserts]
status >= 200
status < 300
[Captures]
textID: jsonpath "$.id"

################################################################################
# 4) Upload text data
################################################################################
POST {{host}}/api/v1/dataresources/{{textID}}/data/text.xml
[Multipart]
# field name is 'file', file path points to the local file you have on disk
file: file,data/text.xml; application/xml

HTTP *
[Asserts]
status >= 200
status < 300

################################################################################
# 5) POST Manuscript DO (JSON) with {{imgID}} and {{textID}} injected
################################################################################
POST {{host}}/api/v1/dataresources/
Content-Type: application/json

# --- Paste the content of manuscriptPayload.json_PLACEHOLDER here, but:
#     replace the string token 'IMAGEDO' with {{imgID}} so Hurl will inject the
#     actual image id at runtime. Example:
{
  "resourceType": {
    "typeGeneral": "TEXT",
    "value": "manuscriptMetadata"
  },
  "titles": [{"value": "Example Manuscript DO"}],
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
# ---------------------------------------------------------

HTTP *
[Asserts]
status >= 200
status < 300
[Captures]
manuscriptID: jsonpath "$.id"

################################################################################
# 6) Upload manuscript XML to .../{manuscriptID}/data/manuscript_metadata.xml
################################################################################
POST {{host}}/api/v1/dataresources/{{manuscriptID}}/data/manuscript_metadata.xml
[Multipart]
file: file,data/manuscript_metadata.xml; application/xml

HTTP *
[Asserts]
status >= 200
status < 300

################################################################################
# 7) Upload pages.json inline as multipart (no local file needed)
################################################################################
POST {{host}}/api/v1/dataresources/{{manuscriptID}}/data/pages.json
Content-Type: multipart/form-data; boundary=pagesBoundary
```
--pagesBoundary
Content-Disposition: form-data; name="file"; filename="pages.json"
Content-Type: application/json

[
{
"resourceId": "{{imgID}}",
"pageId": "page1234"
},
{
"resourceId": "{{textID}}",
"pageId": "text"
}
]
--pagesBoundary--
```
HTTP *
[Asserts]
status >= 200
status < 300

################################################################################
# 8) PATCH Image DO (JSON Patch + If-Match etag)
#    First GET the resource to capture ETag, then PATCH with Content-Type:
#    application/json-patch+json and If-Match: <etag>
################################################################################

# 6.a) Fetch current representation to read ETag
GET {{host}}/api/v1/dataresources/{{imgID}}

HTTP *
[Asserts]
status >= 200
status < 300
[Captures]
etag: header "ETag"

# 6.b) Apply JSON Patch to add relatedIdentifiers[0] pointing to manuscriptID
PATCH {{host}}/api/v1/dataresources/{{imgID}}
Content-Type: application/json-patch+json
If-Match: {{etag}}

[
  {
    "op": "add",
    "path": "/relatedIdentifiers/0",
    "value": {
      "identifierType": "URL",
      "value": "{{host}}/api/v1/dataresources/{{manuscriptID}}",
      "relationType": "HAS_METADATA"
    }
  }
]

HTTP *
[Asserts]
status >= 200
status < 300
