var mongoose    = require('mongoose'),
    Schema      = mongoose.Schema;

var Message = new Schema({
    from: Schema.Types.ObjectId,
    to: Schema.Types.ObjectId,
    message: String,
    date: { type: Date, default: Date.now },
    unread: { type: Boolean, default: true }
});

Message.statics.getMessagesBetweenUsers = function(userId, otherUserId, cb) {
    this.find({
        $or: [ 
            {from: userId, to: otherUserId},
            {from: otherUserId, to: userId}
             ] }, cb);
} 

module.exports = mongoose.model('messages', Message);