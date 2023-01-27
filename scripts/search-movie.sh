#!/usr/bin/env bash

echo "Searcu movie:"
curl -H "Content-Type: application/json" -X GET 127.0.0.1:9200/movies/_search?q=Interstellar
