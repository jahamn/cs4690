console.log('Loading Server');
var fs = require('fs');
var express = require('express');

//modules below are express middleware
var bodyParser = require('body-parser');
var logger = require('morgan');
var compression = require('compression');
var favicon = require('serve-favicon');
var _ = require('underscore');
var mongo = require('mongodb');
var mongoclient = mongo.MongoClient;
/*
 var mysql = require('mysql');
 var connection = mysql.createConnection({ // CHANGE YOUR DATABASE INFORMATION HERE ***
 host     : 'localhost',
 user     : 'root',
 password : 'root',
 database : 'siq' });

 connection.connect();
 */
//var url = 'mongodb://localhost:27017/myproject';
mongoclient.connect('mongodb://localhost:27017/test', function(err, db) {
    if (err) {
        throw err;
    }
    db.collection('entries').find().toArray(function(err, result) {
        if (err) {
            throw err;
        }
        console.log(result);
    });
});

var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};

app.use(bodyParser.json());

app.use(logger('dev'))

app.use(compression());

app.use(allowCrossDomain);

var db = [
    { id:1, "subject":"Foo", "content":"All your base are belong to us!" },
    { id:2, "subject":"Bar", "content":"I can haz cheesburger?" },
    { id:3, "subject":"Baz", "content":"Hooked on phonics worked for me!" }
];

//REST API calls go here.
app.get('/api/v1/entries.json', function(req, res) {
    // find({},{content:0})
    mongoclient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }db.collection('entries').find({},{subject:1}).toArray(function(err, result){
            if (err) {
                throw err;
            }
            console.log(result);
            res.status(201).json(result);
            db.close();
        })
    });
});

// IDEMPOTENT - You can repeat the operation as many times as you want without changing state.
// Create
app.post('/api/v1/entries.json', function(req, res){
    console.log(req.body);
    var subject = req.body.subject;
    var content = req.body.content;
    mongoclient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }db.collection('entries').insert(req.body, function(err, result) {
            if (err) {
                throw err;
            }
            console.log('inserted ' + result.insertedIds[0]);
            res.status(201).json(result.insertedIds[0]);
            db.close();
        });
    });
});

// Read
app.get('/api/v1/entries/:id.json', function(req, res){
    // find({_id:${id}}, {content:1})
    var id = new mongo.ObjectId(req.params.id);
    mongoclient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }db.collection('entries').find({_id:id}).toArray( function(err, result) {
            if (err) {
                throw err;
            }
            console.log('db get ' + result[0]);
            res.status(201).json(result[0]);
            db.close()
        });
    });
});

// Update
app.put('/api/v1/entries/:id.json', function(req, res){
    // insert({})
    var id = mongo.ObjectId(req.params.id);
    var _subject = req.body.subject;
    var _content = req.body.content;
    mongoclient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }db.collection('entries').update({_id:id}, {subject:_subject, content:_content}, function(err, result) {
            if (err) {
                throw err;
            }
            console.log('db update');
            res.status(204);
            db.close();
        });
    });
});

// Delete
app.delete('/api/v1/entries/:id', function(req, res){
    var id = mongo.ObjectId(req.params.id);
    mongoclient.connect('mongodb://localhost:27017/test', function(err, db) {
        if (err) {
            throw err;
        }db.collection('entries').remove({_id:id}, true, function(err, result) {
            if (err) {
                throw err;
            }
            console.log('db delete ' + id);
            res.status(204);
            db.close();
        });
    });
});

/*
 //REST API calls go here.
 app.get('/api/v1/entries.json', function(req, res) {
 connection.query("select subject, id from entries", function(err, rows, fields) {
 if (err) throw err;
 //console.log('The solution is: ', rows[0].solution);
 res.status(200).json(rows);
 });
 });

 // IDEMPOTENT - You can repeat the operation as many times as you want without changing state.
 // Create
 app.post('/api/v1/entries.json', function(req, res){
 // Store new entry and return id.
 console.log(req.body);
 // {"subject":"Two","content":"content2"}
 var subject = connection.escape(req.body.subject);
 var content = connection.escape(req.body.content);

 connection.query(`INSERT INTO entries (subject, content) VALUES( ${subject}, ${content})`, function(err, rows, fields) {
 if (err) throw err;
 res.status(201).json(rows.insertId);
 });
 });

 // Read
 app.get('/api/v1/entries/:id.json', function(req, res){
 var id = connection.escape(req.params.id);
 //var id = req.params.id;
 console.log(`select * from entries where id = ${id}`);
 connection.query(`select * from entries where id = ${id}`, function(err, rows, fields) {
 if (err) throw err;
 res.status(200).json(rows[0]);
 });
 });

 // Update
 app.put('/api/v1/entries/:id.json', function(req, res){
 var id = connection.escape(req.params.id);
 console.log(req.body);
 // {"subject":"Two","content":"content2"}
 var subject = connection.escape(req.body.subject);
 var content = connection.escape(req.body.content);
 //UPDATE siq.entries SET content = 'foo', subject = 'bar' WHERE id = 12
 connection.query(`update entries set subject = ${subject}, content = ${content} where id = ${id}`, function(err, rows, fields) {
 if (err) throw err;
 });
 console.log("server update");
 res.sendStatus(204);
 });

 // Delete
 app.delete('/api/v1/entries/:id', function(req, res){
 var id = connection.escape(req.params.id);
 connection.query(`delete from entries where id = ${id}`, function(err, rows, fields) {
 if (err) throw err;
 });
 console.log("server delete");
 res.sendStatus(204);
 });

 */

//traditional webserver stuff for serving static files
var WEB = __dirname + '/web';
app.use(favicon(WEB + '/favicon.ico'));
app.use(express.static(WEB, {maxAge:'12h'}));
app.get('*', function(req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.status(404).sendFile(WEB + '/404Error.png');
});

//var config = JSON.parse(fs.readFileSync("/dev/nodejs/resumeServer.json"));
var port = process.env.port || 3000;
var server = app.listen(port);

function gracefulShutdown(){
    console.log('\nStarting Shutdown');
    server.close(function(){
        console.log("before end call");
        //connection.end();
        console.log('\nShutdown Complete');
    });
}

process.on('SIGTERM', function(){
    gracefulShutdown();
});

process.on('SIGINT', function(){
    gracefulShutdown();
});

console.log(`Listening on port ${port}`);