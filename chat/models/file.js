var mongoose    = require('mongoose'),
    Schema      = mongoose.Schema;
    
var File = new Schema({
    from: Schema.Types.ObjectId,
    to: Schema.Types.ObjectId,
    path: String,
    name: String
});

File.statics.getFile = function(userId, messageId, cb) {
    this.findOne({ $or: [ 
            {from: userId},
            {to: userId}
             ], _id: messageId }, cb);
}

File.statics.saveFile = function(from, to, path, name) {
    var FileModel = mongoose.model('files', File);
    var file = new FileModel({ from: from, to: to, path: path, name: name });
    file.save();
    
    return file;
}

module.exports = mongoose.model('files', File);