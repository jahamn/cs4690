var express = require('express');
var redis = require('redis');
var client = redis.createClient();
var router = express.Router();
var _ = require('underscore');

client.on('error', function(err){
    console.log('Got Error: ' + err);
});

router.get('/api/v2/entries.json', function(req, res){
    console.log(req.body);
    client.smembers('keyset',function(err,values){
        console.log(values); 
        var all_list = [];
        var do_res = _.after(values.length,function(){
            console.log('Ended Call');
            res.status(200).json(all_list);
        });
        
        values.forEach(function(key){
            client.hgetall(key,function(err,obj){
                if(err){throw err};
                console.log(obj);
                all_list.push(obj);
                do_res();
            });
        });
    });
});

// Create
router.post('/api/v2/entries.json', function(req,res){
    console.log(req.body);
    var newObj = {};
    newObj.subject = req.body.subject;
    newObj.content = req.body.content;
    
    client.get('nextkey',function(err,nextKey){
        if(err){throw err};
        newObj._id = nextKey;
        client.hmset(nextKey,newObj);
        client.sadd('keyset',nextKey,redis.print);
        client.incr('nextkey',redis.print);
        res.status(201).json(nextKey);
    });
});

// Read
router.get('/api/v2/entries/:id.json', function(req, res){
    var id = req.params.id;
    client.hgetall(id,function(err,obj){
        if(err){throw err};
        res.status(201).json(obj);
    });
});

// Update
router.put('/api/v2/entries/:id.json', function(req, res){
    var object = {};
    var id = req.params.id;
    var subject = req.body.subject;
    var content = req.body.content;
    
    object._id = id;
    object.subject = subject;
    object.content = content;
    client.hmset(id,object,function(err,result){
        if(err){throw err};
        console.log('Updated: ' + id);
        res.status(204);
    });
});

// Delete 
router.delete('/api/v2/entries/:id', function(req, res){
    var id = req.params.id;
    client.del(id,function(err){
        if(err){throw err};
    });
    client.srem('keyset',id,function(err){
        if(err){throw err};
    });
});


module.exports = router;

console.log('testing');
client.smembers('keyset',function(err,values){
    console.log(values); 
});
