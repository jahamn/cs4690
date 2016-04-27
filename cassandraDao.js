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
    client.execute('SELECT id,subject from ent',function(err,result){
        if(err) throw err;
        console.log(result.rows);
        res.status(200).json(result.rows);
    });
});


// Create
router.post('/api/v2/entries.json', function(req, res){
    // Store new entry and return id.
    console.log(req.body);
    var uuid = cassandra.types.uuid();
    client.execute('INSERT INTO ent (id, subject, content) VALUES (?,?,?)',[uuid,req.body.subject,req.body.content],function(err,result){
        if(err) throw err;
        console.log(result);
        res.status(201).json(uuid);
    });
});

module.exports = router;
