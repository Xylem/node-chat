function applyDraggable(target) {
    target.resizable({
        minHeight: 200,
        minWidth: 200,
        handles: 'all'
    });
    target.draggable({
        stack: '#windows div',
        handle: 'div.handle',
        containment: 'body'
    });
}

function createUserList() {
    var parent = $('#windows');
    
    $.getJSON('/users',
        function(users) {
            var buttons = [];
            
            $.each(users, function(key, user) {
                buttons.push('<div id="user' + user._id + '"><button onclick="createChatWindow(\'' + user._id + '\')" class="btn btn-link">' + user.username + '</button></div>');       
            });
            
            parent.append('<div class="window" id="userlist"><div class="handle">User List</div>' + buttons.join('') + '</div>');
            
            applyDraggable($('#userlist'));    
    });
}

function loadMessages(userId) {
    var parent = $('#window' + userId + ' .messages');
    
    $.getJSON('/messages/user/' + userId,
        function(messages) {
            var msgs = [];
            
            var users = new Object();
            
            $.each(messages, function(key, message) {
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
                msgs.push('<div class="message"><span class="author">' + users[message.from] + '</span><span class="date">' + dateFormat(date, 'H:MM, d mmmm yyyy') + '</span><span class="text">' + message.message + '</span></div>');
            });
            
            parent.append(msgs.join(''));
    }); 
}

function createChatWindow(userId) {   
    if ($('#window' + userId).length != 0) return;
    
    var parent = $('#windows');
    
    $.getJSON('/users/' + userId,
        function(user) {
            parent.append('<div class="window" id="window' + user._id + '"><div class="handle">' + user.username + '</div><div class="messages"></div><form class="chatForm" method="post" action="/messages" id="form' + user._id + '"><input type="hidden" name="to" value="' + user._id + '"><input type="text" name="message" id="message' + user._id +'"></form></div>');
            
            applyDraggable($('#window' + user._id)); 
            
            loadMessages(userId);
            
		    $('#form' + user._id).submit(function() {
	
			    var link = $(this).attr('action');
			
			    $.ajax({
			        url: link,
			        type: "POST",
			        data: $(this).serialize(),
			        dataType: "html",         
			        success: function() {
			            $('#message' + user._id).val('');
			        }
			    });
			
			    return false;
			});
        } 
    );
}

createUserList();