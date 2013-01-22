function applyDraggable(target) {
    target.draggable({ stack: '#windows div', handle: 'div.handle', containment: 'body'})
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

function createChatWindow(userId) {   
    if ($('#window' + userId).length != 0) return;
    
    var parent = $('#windows');
    
    $.getJSON('/users/' + userId,
        function(user) {
            parent.append('<div class="window" id="window' + user._id + '"><div class="handle">' + user.username + '</div></div>');
            
            applyDraggable($('#window' + user._id)); 
        } 
    );
}

createUserList();