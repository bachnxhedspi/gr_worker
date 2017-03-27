var neo4j = require('node-neo4j');
var db = new neo4j('http://neo4j:root@fbneo4j:7474');


function standardNode(data){
    return new Promise(function(resolve, reject) {
      try{
        if(data.hasOwnProperty('created_time'))
        {
            var myDate = new Date(data.created_time);
            var postTime = myDate.getTime() / 1000;
            data.created_time = postTime;
        }
        
        if(data.hasOwnProperty('updated_time'))
        {
            var myDate = new Date(data.updated_time);
            var postTime = myDate.getTime() / 1000;
            data.updated_time = postTime;
        }
        
        for(var attributename in data)
        if (typeof(data[attributename])!='string'){
            data[attributename] = JSON.stringify(data[attributename]);
        }
        resolve(data);
      }
      catch(err){
        console.log(err);
        reject(data.id);
      }
    });
}

exports.createNode = function(postType,data){
    
    return new Promise(function(resolve, reject) {
        standardNode(data).then(function(success){
            db.insertNode(success,[postType,'Node'], function (err, result) {
                 if (err) {reject(err);}
                 else{
                     resolve(result._id);
                 };
              });    
        }, function(error){
            reject(error);
        });    
    });
    
}

exports.createReaction = function(data,toId,type){
    return new Promise(function(resolve, reject) {
        var userData = '{id:"'+ data.id+'",name:"'+ data.name+ '"}';
        var query = 'MATCH (v:Node{id:"' + toId + '"}) MERGE (u:User:Node' + userData + ') CREATE UNIQUE (u) -[:REACTION{type:"'+type+'"}]->(v)';
        
        db.cypherQuery(query, function(err, result){
            if(err) {reject(err); return;};
            resolve('done');
        });
    });
}


exports.createCommentRelationship= function(fromId,commentId,toId){
    return new Promise(function(resolve, reject) {
        
        var query = 'MERGE (u:Node{id:"'+ commentId  + '"}) MERGE (v:Node{id:"' + toId + '"})';
        query = query + 'MERGE (t:Node{id:"' +fromId + '"}) CREATE (t)-[:COMMENT_FROM]->(u)-[:COMMENT_TO]->(v)';
        console.log(query);
        db.cypherQuery(query, function(err, result){
            if(err) {reject(err); return;};
            resolve('done');
        });
    });
}