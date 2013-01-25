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
    this.update(
        {from: otherUserId, to: userId},
        { unread: false },
        { multi: true }).exec();
    
    this.find({
        $or: [ 
            {from: userId, to: otherUserId},
            {from: otherUserId, to: userId}
             ] }, cb);
} 

Message.statics.getMessage = function(userId, messageId, cb) {
    this.update(
        {to: userId, _id: messageId },
        { unread: false }).exec();

    this.findOne({ $or: [ 
            {from: userId},
            {to: userId}
             ], _id: messageId }, cb);
}

Message.statics.countUnread = function(userId, otherUserId, cb) {
    this.count(
        {from: otherUserId,
         to: userId,
         unread: true},
         cb);
}

Message.statics.sendMessage = function(from, to, msg) {
    var MessageModel = mongoose.model('messages', Message);
    var message = new MessageModel({ from: from, to: to, message: msg });
    message.save();
    
    return message;
}

module.exports = mongoose.model('messages', Message);