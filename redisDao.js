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

//client.set('keyV','valueV',redis.print);
/*
client.set('keyV','valueV',(key, value)=>{
   console.log('inserted'); 
   console.log(key);
   console.log(value);
});
*/

module.exports = router;

console.log('testing');
client.smembers('keyset',function(err,values){
    console.log(values); 
});
