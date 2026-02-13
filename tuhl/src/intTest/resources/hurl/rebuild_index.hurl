# Wait until takita is healthy (retry up to 30 times with 2s intervals)
GET {{host}}/actuator/health
retry: 30
retry-interval: 2s

HTTP/1.1 200

# Then trigger the rebuild via POST
POST {{host}}/actuator/searchIndex?operation=rebuild
Content-Type: application/json

{}  # body can be empty JSON if your endpoint accepts it (remove if not needed)
HTTP/1.1 200
