#!/usr/bin/env zx

import 'zx/globals';
import csv from 'csvtojson';
import { Client } from "@elastic/elasticsearch";

const client = new Client({
    node: "http://127.0.0.1:9200"
});

const moviesDeleteResult = await client.indices.delete({
    index: "movies"
}, { ignore: [404]})
console.log('moviesDeleteResult:', moviesDeleteResult);

const response = await client.indices.create({
    index: "movies",
    mappings: {
        properties: {
            "movieId": { "type": "integer" },
            "year": { "type": "integer" },
            "genre": { "type": "keyword"},
            "title": {
                "type": "text",
                "analyzer": "english",
                // keep raw version of the field to enable sorting by title
                "fields": {
                    "raw": {
                        "type": "keyword"
                    }
                }
            }
        }
    }
}, {
    ignore: [400]
})

console.log('movies index: ', response);


const moviesData = await csv().fromStream(fs.createReadStream("./../data/movies.csv"))
const ratingsData = await csv().fromStream(fs.createReadStream("./../data/ratings.csv"))

const moviesMap = moviesData.reduce((map, item) => {
    map.set(item.movieId, item);
    return map;
}, new Map())
const moviesOperations = moviesData.flatMap(doc => [{ index: { _id: doc.movieId }}, doc]);
const ratingsOperations = ratingsData.flatMap(doc => [{ index: { }}, {
    ...doc, title: moviesMap.get(doc.movieId)?.title ?? "<none>"
}]);
// console.dir(ratingsOperations);

// process.exit(1);


const moviesResult = await client.bulk({
    index: "movies",
    refresh: true,
    operations: moviesOperations
}, { ignore: [400]})

console.log('movies bulk Result:', moviesResult.errors);

const ratingsDeleteResult = await client.indices.delete({
    index: "ratings"
}, { ignore: [404]});

console.log("ratingsDeleteResult:", ratingsDeleteResult);
const ratings = await client.indices.create({
    index: "ratings",
    mappings: {
        properties: {
            movieId: { "type": "integer" },
            userId: { "type": "integer" },
            title: { type: "text" },
            rating: { "type": "float" },
            timestamp: { "type": "integer" },
        }
    }
});

console.log("ratings:", ratings);


const ratingsResult = await client.bulk({
    index: "ratings",
    refresh: true,
    operations: ratingsOperations
}, { ignore: [400]})

console.dir(ratingsResult.errors, { depth: 4 });
console.log('Ratings bulk Result:', ratingsResult.errors);

if (ratingsResult.errors) {
    console.dir(ratingsResult, { depth: 10 });
}
