mongoClient = require('mongodb').MongoClient;

connectionString = "mongodb://localhost:27017/";



module.exports = {

  Insert(collection, obj) {
    mongoClient.connect(connectionString, {useUnifiedTopology: true, useNewUrlParser: true}, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("chatdb");
	  dbo.collection(collection).insertOne(obj, function(err, res) {
		if (err) throw err;
		console.log("1 document inserted");
		db.close();
	  });
	});
  },
  
   Update(collection, id, pushObj) {
    mongoClient.connect(connectionString, {useUnifiedTopology: true, useNewUrlParser: true}, function(err, db) {
	  if (err) throw err;
	  var dbo = db.db("chatdb");
	  dbo.collection(collection).updateOne(id, pushObj, function(err, res) {
		if (err) throw err;
		console.log("1 document updated");
		db.close();
	  });
	});
  },
  
  async Find(collection, id){
	  const db =  await mongoClient.connect(connectionString, {useUnifiedTopology: true, useNewUrlParser: true});	  
	  const dbo = db.db("chatdb");
	  const result = await dbo.collection(collection).findOne(id);
	  db.close();
	  return result;
  },
  
    async Min(collection, sortObj){
	  const db =  await mongoClient.connect(connectionString, {useUnifiedTopology: true, useNewUrlParser: true});	  
	  const dbo = db.db("chatdb");
	  const result = await dbo.collection(collection).find({}).sort(sortObj).limit(1);
	  db.close();
	  return result;
  }
  
};