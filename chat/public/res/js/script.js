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

function createUserList() {
    var parent = $('#windows');
    
    $.getJSON('/users',
        function(users) {
            var buttons = [];
            
            $.each(users, function(key, user) {
                $.ajax({
		            type: 'GET',
		            url: '/messages/unread/' + user._id,
		            dataType: 'json',
		            success: function(msg) {
		                var unreadCounter = (msg.unread == 0) ? '' : '<span class="badge badge-warning unread">' + msg.unread + '</span>';
		                  
	                    buttons.push('<div id="user' + user._id + '"><button onclick="createChatWindow(\'' + user._id + '\')" class="btn btn-link">' + user.username + '</button>' + unreadCounter + '</div>');       
		            },
		            async: false
	            });
                
                
            });
            
            parent.append('<div class="window" id="userlist"><div class="handle">User List</div><div class="users">' + buttons.join('') + '</div></div>');
            
            applyDraggable($('#userlist'));    
    });
}

var users = new Object();

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
    var messageHtml = '<div class="message"><span class="author">' + users[message.from] + '</span><span class="date">' + dateFormat(date, 'H:MM, d mmmm yyyy') + '</span><span class="text">' + message.message + '</span></div>';
    
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
            parent.prepend('<div class="window" id="window' + user._id + '"><div class="handle">' + user.username + '</div><div class="messages"></div><form class="chatForm" method="post" action="/messages" id="form' + user._id + '"><input type="hidden" name="to" value="' + user._id + '"><div class="inputWrapper"><input type="text" name="message" id="message' + user._id +'"></div></form></div>');
            
            applyDraggable($('#window' + user._id)); 
            
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
        $('#user' + userId).append('<span class="badge badge-warning unread">0</span>');
    }
    
    var unread = $('#user' + userId + ' .unread');
    unread.html(parseInt(unread.html()) + val);
}

var socket = io.connect('http://89.79.1.120');
socket.on('newMessage', function(data) {
    var chatWindow = $('#window' + data.from);

    if (chatWindow.length != 0) {
        loadMessage(data.id, data.from);
    } else {
        incrementMessageCounter(data.from);
    }
});

createUserList();