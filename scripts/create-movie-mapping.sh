#!/usr/bin/env bash

curl -H "Content-Type: application/json" -X PUT 127.0.0.1:9200/movies -d '
{
    "mappings": {
        "properties": {
            "year": { "type": "date" }
        }
    }
}
'
