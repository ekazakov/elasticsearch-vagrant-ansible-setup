#!/usr/bin/env zx

import "zx/globals";
import csv from "csvtojson";
import { Client } from "@elastic/elasticsearch";

const client = new Client({
  node: "http://127.0.0.1:9200",
});

const tagsDeleteResult = await client.indices.delete(
  {
    index: "tags",
  },
  { ignore: [404] },
);
console.log("tagsDeleteResult:", tagsDeleteResult);

const response = await client.indices.create(
  {
    index: "tags",
    mappings: {
      properties: {
          movieId: { "type": "integer" },
          userId: { "type": "integer" },
          title: { type: "text" },
          tag: { "type": "keyword" },
          timestamp: { "type": "integer" },
      },
    },
  },
  {
    ignore: [400],
  },
);

console.log("tags index: ", response);

const tagsData = await csv().fromStream(
  fs.createReadStream("./../data/tags.csv"),
);
const moviesData = await csv().fromStream(fs.createReadStream("./../data/movies.csv"))

const moviesMap = moviesData.reduce((map, item) => {
    map.set(item.movieId, item);
    return map;
}, new Map())

const tagsOperations = tagsData.flatMap((doc) => [
  { index: { _id: doc.movieId } },
  {
    ...doc,
    title: moviesMap.get(doc.movieId)?.title ?? "<none>",
  },
]);

const tagsResult = await client.bulk(
  {
    index: "tags",
    refresh: true,
    operations: tagsOperations,
  },
  { ignore: [400] },
);

console.log("tags bulk Result:", tagsResult.errors);
