#!/usr/bin/env bash

echo "Adding movie:"
curl -H "Content-Type: application/json" -X PUT 127.0.0.1:9200/movies/_doc/109487?pretty -d '
{
     "genre": ["IMAX", "Sci-Fi"],
     "title": "Interstellar",
     "year": 2014
}
'
