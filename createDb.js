var mongoose = require('./libs/mongoose');
// var User = require('./models/user').User;


openDb()
  .then(dropDatabase)
  .then(requireModels)
  .then(createUsers)
  .then(function(results) {
      console.log(results);
      mongoose.disconnect();
    })
  .catch(function(err) {
    mongoose.disconnect();
    console.log(err);
  });

function openDb() {
  return new Promise( function(resolve, reject){
    mongoose.connection.on('open', function() {
      resolve();
    });
  });
}

function dropDatabase() {
  return  new Promise( function(resolve, reject){
    var db = mongoose.connection.db;
    db.dropDatabase(function(err) {
      if (err) reject(err);
      resolve();
    });
  });
}

function requireModels() {
  require('./models/user');
  return new Promise( function(resolve, reject){
    Object.keys(mongoose.models).forEach(function(modelName){
      mongoose.models[modelName].ensureIndexes(resolve);
    });
  });
}

function createUsers() {
  var users = [
    {username: 'mike', password: 'supervasya', email: '123@123.com'},
    {username: 'pit', password: '123', email: '1234@123.com'},
    {username: 'admin', password: 'thetruehero', email: '12345@123.com'}
  ];
  var usersMap = users.map(function(userData){
    var user = new mongoose.models.User(userData);
    return user.save();
  });
  return Promise.all(usersMap);
}












  // mongoose.connection.on('open', function() {
  //   var db = mongoose.connection.db;
  //   db.dropDatabase(function(err) {
  //     if (err) throw err;
  //
  //     var users = createUsers();
  //     users.then(function(results) {
  //         console.log(results);
  //         mongoose.disconnect();
  //       });
  //
  //   });
  // });



// var user = new User({
//   username: "Tester",
//   password: "secret"
// });
//
// user.save(function(err, user, affected) {
//   if (err) {
//     throw err;
//   }
//   console.log(arguments);
//   User.findOne({username: "Tester"}, function(err, tester) {
//     console.log(tester);
//   });
// });
