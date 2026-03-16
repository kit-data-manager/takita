## How to use hurl for setup of dockerized takita for setting

### Prerequisite

- install hurl

### Start compose stack

```
docker compose up -d
```

### Add sample data to base repo

```
hurl --variable host=http://localhost:7777/repo --file-root . --test repo_setup.hurl -v
```

### Add correct container structure to wap server

```
hurl --variable host=http://localhost:7777/annoserver --file-root . --test wap_setup.hurl -v
```

### Trigger index update

```
curl -X POST \
  'http://localhost:7777/actuator/searchIndex?operation=update' \
  -H 'Content-Type: application/json'
```