var express = require('express');
var redis = require('redis');
var client = redis.createClient();
var router = express.Router();

client.on('error', function(err){
    console.log('Got Error: ' + err);
});

router.get('/api/v2/entries.json', function(req, res){
    // TODO
    console.log(req.body);
    
    /*
    client.keys("*", function(err,keylst){
        if(err){throw err}
        client.mget(keylst,function(err, valuelst){
            if(err){throw err}
            console.log(valuelst); 
            var lst = []
            //for(i = 0; i < keylst.length; i++){
                //var obj = {'_id':keylst[i],'subject':,'content':}
            //}
            //res.status(200).json();
            
        });
        console.log(keylst);
    */
    client.smembers('keyset',function(err,values){
    console.log(values); 
    });
    //})
});

// Create
router.post('/api/v2/entries.json', function(req,res){
    //console.log(req.body);
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
