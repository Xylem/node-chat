function applyDraggable(target) {
    target.resizable({
        minHeight: 200,
        minWidth: 200,
        handles: 'all',
        containment: '#windows'
    });
    target.draggable({
        stack: '#windows div',
        handle: 'div.handle',
        containment: '#windows'
    });
}

function createWindow(id, name, content, close) {
    var parent = $('#windows');
    
    var window = Handlebars.templates['window']({
        id: id,
        name: name,
        content: content,
        close: close
    });
    
    parent.append(window);
    
    applyDraggable($('#' + id));
}

function closeWindow(id) {
    $('#' + id).remove();
}


function createUserItem(user) {
    $.ajax({
        type: 'GET',
        url: '/messages/unread/' + user._id,
        dataType: 'json',
        success: function(msg) {
            if (msg.unread == 0) {
                user.unread = false
            } else {
                user.unread = Handlebars.templates['unreadBadge'](msg);
            }
        },
        async: false
    });
    
    var userItemHtml = Handlebars.templates['userItem'](user); 
    
    return userItemHtml;      
}

var nameLookup = {};
var allUsers;
var self;

function getSelf() {
    $.ajax({
            type: 'GET',
            url: '/self',
            dataType: 'json',
            success: function(user) {
                self = user;
            },
            async: false
        });
}

function getUser(userId) {
    var fetchedUser;

    $.ajax({
            type: 'GET',
            url: '/users/' + userId,
            dataType: 'json',
            success: function(user) {
                fetchedUser = user;
            },
            async: false
        });
        
    return fetchedUser;
}

function getOnline() {
    var onlineUsers;

    $.ajax({
            type: 'GET',
            url: '/online',
            dataType: 'json',
            success: function(online) {
                onlineUsers = online;
            },
            async: false
        });
        
    return onlineUsers;
}

function setStatus(userId, online) {
    var statusElement = $('#user' + userId + ' .status');
    
    var newStatus = online ? 'online' : 'offline';
    
    statusElement.attr('class', 'status ' + newStatus);
}

function createUserList() {
    $.getJSON('/users',
        function(users) {       
            users.sort(function (a, b) {
                usernameA = a.username.toLowerCase();
                usernameB = b.username.toLowerCase();
                
                if (usernameA < usernameB) {
                    return -1;
                } else if (usernameA > usernameB) {
                    return 1;
                }
                return 0;
            });
            
            allUsers = users;
        
            $.each(users, function(key, user) {
                nameLookup[user._id] = user.username;
                                
                user.userItem = createUserItem(user);            
            });
            
            var userListHtml = Handlebars.templates['userList']({
                users: users
            });
            
            createWindow('userList', 'User List', userListHtml, false);   
            
            var onlineUsers = getOnline();
            
            $.each(onlineUsers.online, function(key, userId) {
                setStatus(userId, true);    
            });  
    });
}

function processMessage(message) {
    var author = (nameLookup[message.from] === undefined) ? self.username : nameLookup[message.from];
    
    var date = new Date(message.date);

    // replace line breaks with <br> tag

    var messageText = message.message;
    
    messageText = messageText.replace(/\r\n/g, '<br>');
    messageText = messageText.replace(/\r/g, '<br>');
    messageText = messageText.replace(/\n/g, '<br>');

    var messageHtml = Handlebars.templates['message']({
        author: author,
        date: dateFormat(date, 'H:MM, d mmmm yyyy'),
        message: messageText
    });
    
    return messageHtml;
}

function scrollMessagesToBottom(messageContainer) {
    messageContainer.scrollTop(100000000); // workaround - looking for fix
}

function appendToMessages(parent, appended) {
    parent.append(appended);
            
    scrollMessagesToBottom(parent);
}

function loadMessages(userId) {
    var parent = $('#window' + userId + ' .messages');
    
    $.getJSON('/messages/user/' + userId,
        function(messages) {
            var msgs = [];
            
            $.each(messages, function(key, message) {
                msgs.push(processMessage(message));
            });
            
            appendToMessages(parent, msgs.join(''));
    }); 
}

function loadMessage(messageId, userId) {
    $.getJSON('/messages/' + messageId,
        function(message) {
            var parent = $('#window' + userId + ' .messages');
            
            appendToMessages(parent, processMessage(message));         
    });
}

function createChatWindow(userId) {   
    if ($('#window' + userId).length != 0) return;
    
    var parent = $('#windows');
    
    $.getJSON('/users/' + userId,
        function(user) {
            var chatWindowHtml = Handlebars.templates['chatWindow']({
                userId: user._id
            });
        
            var windowId = 'window' + user._id;
        
            createWindow(windowId, user.username, chatWindowHtml, true);    
            
            moveWindowToTop(windowId);
            
            loadMessages(userId);
            
            // open chat window on top of user list
            
            var pos = $('#userList').css(['left', 'top']);
           
            $('#' + windowId).css(pos);
            
            // remove unread counter from user list
            
            $('#user' + userId + ' .unread').remove();
            
            // override form submitting to POST data by AJAX
            
		    $('#form' + user._id).submit(function(e) {
			    var link = $(this).attr('action');
			
			    $.ajax({
			        url: link,
			        type: 'POST',
			        data: $(this).serialize(),
			        dataType: 'json',         
			        success: function(data) {
			            $('#message' + user._id).val('');
			            
			            appendToMessages($('#window' + user._id + ' .messages'), processMessage(data));
			        }
			    });
			
			    e.preventDefault();
			});
			
			// submit form on Enter and insert line break on Shift+Enter
			
			$('#message' + user._id).keydown(function(e){
				if (e.keyCode == 13 && !e.shiftKey)
				{
				    $('#form' + user._id).submit();
				    
				    e.preventDefault();
				}
			});
        } 
    );
}

function incrementMessageCounter(userId, val)
{
    val = val || 1;
    
    // create unread counter for user if not exists
    
    if ($('#user' + userId + ' .unread').length == 0)
    {
        var unreadBadge = Handlebars.templates['unreadBadge']({
            unread: 0
        });
        
        $('#user' + userId + ' a').append(unreadBadge);
    }
    
    var unread = $('#user' + userId + ' .unread');
    unread.html(parseInt(unread.html()) + val);
}

function moveWindowToTop(windowId) {
    var toTop = $('#' + windowId);
    
    var maxZIndex = 0;
    
    $('.window').each(function() {
        var thisIndex = parseInt($(this).css('z-index'));
        
        if (thisIndex > maxZIndex) {
            maxZIndex = thisIndex;
        }
    });
    
    toTop.css('z-index', maxZIndex + 1);
}

var socket = io.connect('http://localhost');

socket.on('newMessage', function(data) {
    var chatWindow = $('#window' + data.from);

    if (chatWindow.length != 0) {
        loadMessage(data.id, data.from);
    } else {
        incrementMessageCounter(data.from);
    }
});

socket.on('newUser', function(data) {
    var newUser = getUser(data.user);
    
    var lowerCaseName = newUser.username.toLowerCase();
    
    var insertBefore = null;

    for (var i = 0; i < allUsers.length; ++i) {
        if (lowerCaseName < allUsers[i].username.toLowerCase()) {
            insertBefore = allUsers[i];
            
            allUsers.splice(i, 0, newUser);
            
            break;
        }
    }
    
    var newUserItem = createUserItem(newUser);
    
    if (insertBefore === null) {
        allUsers.push(newUser);
        
        $('#allUsers').append(newUserItem);
    } else {
        $('#user' + insertBefore._id).before(newUserItem);
    }
});

var lastUpdate = {};

socket.on('statusChange', function(data) {
    if (lastUpdate[data.user] === undefined || lastUpdate[data.user] < data.sent) {
        lastUpdate[data.user] = data.sent;
        
        setStatus(data.user, data.online);
    }
});

getSelf();
createUserList();