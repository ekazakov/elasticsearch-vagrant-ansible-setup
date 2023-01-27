#!/usr/bin/env bash

echo "Update movie:"
curl -H "Content-Type: application/json" -X POST 127.0.0.1:9200/movies/_update/109487 -d '
{
    "doc": {
        "titile": "Interstellar",
        "year": 2014
    }
}
'
