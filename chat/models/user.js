var mongoose                = require('mongoose'),
    Schema                  = mongoose.Schema,
    passportLocalMongoose   = require('passport-local-mongoose')
    
var User = new Schema({});

User.plugin(passportLocalMongoose);

User.statics.getAllUsers = function(myUserId, cb) {
    this.find({ _id: {$ne: myUserId}}, { username: true }, cb);
}

User.statics.getUser = function(userId, cb) {
    this.findOne({ _id: userId}, { username: true }, cb);
}

module.exports = mongoose.model('users', User);