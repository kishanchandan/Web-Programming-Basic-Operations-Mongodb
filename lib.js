'use strict';

const assert = require('assert');
const mongo = require('mongodb').MongoClient;


//used to build a mapper function for the update op.  Returns a
//function F = arg => body.  Subsequently, the invocation,
//F.call(null, value) can be used to map value to its updated value.
function newMapper(arg, body) {
  return new (Function.prototype.bind.call(Function, Function, arg, body));
}

//print msg on stderr and exit.
function error(msg) {
  console.error(msg);
  process.exit(1);
}


//export error() so that it can be used externally.
module.exports.error = error;


//auxiliary functions; break up your code into small functions with
//well-defined responsibilities.

//perform op on mongo db specified by url.
function dbOp(url, op) {
	//console.log(url);
	var json = JSON.parse(op);
	var operation = json.op;
	var collect = json.collection;
	var argu = json.args;
	if(operation==="create"){console.log("Create operation is used");}
	mongo.connect(url,function(err,db) {
	if(err) { return console.log(err);}
	console.log("Connected");
	var collecti = db.collection(collect);
	switch (operation) {
		case "read" :
			console.log("Performing Read Operation");	
			collecti.find(argu).toArray(function(err, docs) {
    			assert.equal(err, null);
    			console.log("Found the following records");
    			console.log(docs)
      			});
			break;
		
		case "create" :	
			console.log(argu);
			collecti.insert(argu, function(error,result){
			if(error) { return console.log(error);}
			console.log("Inserted Element Successfully");
			});
			break;

		case "delete" :
			console.log(argu);
			collecti.deleteOne(argu, function(error,result){
			if(error) { return console.log(error);}
			console.log("Deleted Element Successfully");
			});
			break;

		case "update" :
			var length = 0;
			var function_argument = json.fn;
			var mappers = newMapper(function_argument[0],function_argument[1]);
			collecti.find(argu).toArray(function(err, docs) {
    			assert.equal(err, null);
    			console.log(docs);
			var max_length = docs.length;
			docs.forEach(doc=> {
			var mapping = mappers.call(null,doc);	
			console.log(mapping);
			collecti.save(mapping).then(()=> {
					length++;
					if(length===max_length){
					db.close();
					process.exit();
					}
				}).catch(err=>{consolpdae.error(err); process.exit();}) //then termination			
			}); //for each termination
      			
						
			}); // read termination
			break;
		
	}	
	



	

});

}

//make main dbOp() function available externally
module.exports.dbOp = dbOp;

