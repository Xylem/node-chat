var File = require('../models/file'),
    User = require('../models/user'),
    messages = require('./messages'),
    numeral = require('numeral'),
    access = require('./access');


exports.uploadFiles = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;
    
    User.getUser(req.body.to, function(err, user)
    {
        if (user !== null && user.id !== req.user.id)
        {
            var file = File.saveFile(req.user.id, req.body.to, req.files.file.path, req.files.file.name);
            
            var downloadLink = '<a href="/files/' + file.id + '">' + file.name + '</a> (' + numeral(req.files.file.size).format('0.00 b') + ')';
            
            messages.sendMessageDirect(req.user.id, req.body.to, downloadLink);
        }
        
        res.json({ status: 'OK'});
    });
}

exports.getFile = function(req, res) {
    if (!access.validateLoggedIn(req, res)) return;

    File.getFile(req.user.id, req.params.fileId, function(err, file) {          
        if (file.path !== undefined) {
            res.download(file.path, file.name);
        } else {
            res.status(404);
        }
    });
}