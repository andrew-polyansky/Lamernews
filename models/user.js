var crypto = require('crypto');
var util = require('util');

var mongoose = require('./../libs/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  },
  email: {
    type: String,
    unique: true,
    required: true
  },
  comments: {
    type: Number,
    default: 0
  },
  articles: {
    type: Number,
    default: 0
  }
});

schema.methods.encryptPassword = function(password) {
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password')
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + '';
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword; });


schema.methods.checkPassword = function(password) {  // methods for user = new User => user.checkPassword
  return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(username, password, email, next) {
  var User = this;
   return User.findOne({username: username}).exec()
    .then(function(user){
      if (user) {
        if (user.checkPassword(password)) { //... 200 OK
          return user;
        } else { //... 403 Forbidden
          next(new AuthError("Пароль неверен"));
        }
      } else {
        user = new User({username: username, password: password, email: email});
        return user.save()
                .then(function(user){ //... 200 OK
                  return user;
                })
                .catch(function(err){
                  console.log(err);
                  next(err);
               });
      }
    });
};

exports.User = mongoose.model('User', schema);


function AuthError(message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, AuthError);

  this.message = message;
}

util.inherits(AuthError, Error);

AuthError.prototype.name = 'AuthError';

exports.AuthError = AuthError;
