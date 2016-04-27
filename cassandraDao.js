var express = require('express');
var router = express.Router();
var cassandra = require('cassandra-driver');
var client = new cassandra.Client({contactPoints:['127.0.0.1:9042'],keyspace:'siq'});
var _ = require('underscore');

var fs = require('fs');

//var nextFile = 'next.txt';

//function init(){
//    var nextId = fs.readFileSync('next.txt');
//    console.log(nextId.toString());
//}

function getNextId(){
    var id_str = fs.readFileSync('next.txt').toString(); 
    var id = parseInt(id_str);
    fs.writeFileSync('next.txt',id + 1);
    return id_str;
}

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
        var lst = _.map(result.rows,function(value){
            return {_id:value.id,subject:value.subject};
        });
        console.log(lst);
        res.status(200).json(lst);
    });
});


// Create
router.post('/api/v2/entries.json', function(req, res){
    // Store new entry and return id.
    console.log(req.body);
    var id = getNextId();
    client.execute('INSERT INTO ent (id, subject, content) VALUES (?,?,?)',[id,req.body.subject,req.body.content],function(err,result){
        if(err) throw err;
        console.log(result);
        res.status(201).json(id);
    });
});


// Read
router.get('/api/v2/entries/:id.json', function(req, res){
    var id = req.params.id;
    console.log(req.params);

    client.execute('SELECT * FROM ent WHERE id = ?',[id],function(err,result){
        if(err) throw err;
        var item = result.rows[0];
        var obj = {_id:item.id, subject:item.subject, content:item.content};
        console.log(obj);
        res.status(201).json(obj);
    });
    
    /*
    mongoClient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }
        console.log(`Checking mongodb for _id:${id}`);
        //find({_id:ObjectId("56fab77f6ab3ead947e97973")})
        db.collection('entries').find({_id:id}).toArray(function(err, result) {
            if (err) {
                console.log(`Reading _id ${id} failed: ${err}`)
                throw err;
            }
            console.log(`Reading _id succeeded with result: ${result[0]}`)
            res.status(201).json(result[0]);
            db.close();
        });
    });
    */
});

//init();
module.exports = router;
