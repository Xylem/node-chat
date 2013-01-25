exports.validateLoggedIn = function(req, res) {
    if (req.user === undefined)
    {
        res.send(403);
        return false;
    }
    
    return true;
}

exports.redirectNotLoggedIn = function(res, req) {
    if (req.user === undefined)
    {
        res.redirect('/login');
        return true;
    }
    
    return false;
}

exports.redirectLoggedIn = function(res, req) {
    if (req.user !== undefined)
    {
        res.redirect('/');
        return true;
    }
    
    return false;
}