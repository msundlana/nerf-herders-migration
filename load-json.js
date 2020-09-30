const r = require('request');
const neo4jUrl = 'http://localhost:7474/db/data/transaction/commit';
const fs = require('fs');

const inputFile = 'nerf-herders-test-data.json';
const json = JSON.parse(fs.readFileSync(inputFile, 'utf8'));

function cypher(query, params, cb) {
    r.post(
        {
            uri: neo4jUrl,
            headers: {
                // change `bmVvNGo6YWRtaW4=` to match
                // the base64 the hash of your
                // neo4j username and password string
                // like this 'username:password'
                Authorization: 'Basic bmVvNGo6Qm90aGxhbGUyMDEyIQ=='
            },
            json: { statements: [{ statement: query, parameters: params }] }
        },
        (err, res) => {
            cb(err, res.body);
        }
    );
}
// console.log(JSON.stringify(json));

const query =
    `WITH $json as value UNWIND value.data AS node
MERGE (n:Node { name: node.name })
ON CREATE SET n.description = node.description
FOREACH ( i IN (CASE WHEN node.parent<>'' THEN [1] ELSE [] END) |
MERGE (p:Node { name: node.parent })
MERGE (p)-[:PARENT_OF]->(n)
)`;

cypher(query, { json }, (err, result) => {
    console.log(err, JSON.stringify(result));
});