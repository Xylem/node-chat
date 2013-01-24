function applyDraggable(target) {
    target.resizable({
        minHeight: 200,
        minWidth: 200,
        handles: 'all',
        containment: '#content'
    });
    target.draggable({
        stack: '#windows div',
        handle: 'div.handle',
        containment: '#content'
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

function createUserList() {
    $.getJSON('/users',
        function(users) {
            $.each(users, function(key, user) {                
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
            });
            
            var userListHtml = Handlebars.templates['userList']({
                users: users
            });
            
            createWindow('userList', 'User List', userListHtml, false);     
    });
}

var users = {};

function processMessage(message) {
    if (users[message.from] === undefined) {
        $.ajax({
            type: 'GET',
            url: '/users/' + message.from,
            dataType: 'json',
            success: function(user) {
                users[message.from] = user.username;
            },
            async: false
        });
    }
    
    var date = new Date(message.date);

    var messageHtml = Handlebars.templates['message']({
        author: users[message.from],
        date: dateFormat(date, 'H:MM, d mmmm yyyy'),
        message: message.message
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
        
            createWindow('window' + user._id, user.username, chatWindowHtml, true);    
            
            loadMessages(userId);
            
            $('#user' + userId + ' .unread').remove();
            
		    $('#form' + user._id).submit(function() {
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
			
			    return false;
			});
        } 
    );
}

function incrementMessageCounter(userId, val)
{
    val = val || 1;
    
    if ($('#user' + userId + ' .unread').length == 0)
    {
        var unreadBadge = Handlebars.templates['unreadBadge']({
            unread: 0
        });
        
        $('#user' + userId).append(unreadBadge);
    }
    
    var unread = $('#user' + userId + ' .unread');
    unread.html(parseInt(unread.html()) + val);
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

createUserList();