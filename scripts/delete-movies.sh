#!/usr/bin/env bash

echo "Delete movie:"
curl -H "Content-Type: application/json" -X DELETE 127.0.0.1:9200/movies/_doc/109487