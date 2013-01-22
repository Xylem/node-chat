exports.validateLoggedIn = function(req, res) {
    if (req.user === undefined)
    {
        res.send(403);
        return false;
    }
    
    return true;
}