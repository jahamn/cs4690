var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({contactPoints:['127.0.0.1:9042'],keyspace:'siq'});

/*
client.execute('SELECT * from ent',function(err,result){
    if(err) throw err;
    console.log(result.rows);
});
*/

// List
router.get('/api/v2/entries.json', function(req, res) {
    client.execute('SELECT * from ent',function(err,result){
        if(err) throw err;
        console.log(result.rows);
        res.status(200).json(result.rows);
    });
});

module.exports = router;
