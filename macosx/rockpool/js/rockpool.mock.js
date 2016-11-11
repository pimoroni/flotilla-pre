rockpool.mock = function(){
	if(window.location.href != "file:///Users/gadgetoid/Development/pimoroni/flotilla/flotilla-rockpool/index.html") return;

    $(window).on('beforeunload',function(){
        rockpool.saveCurrentState('_autosave');
    });
    setTimeout(function(){
        rockpool.setupMock();
        rockpool.fakeCommand('c 0/rainbow');
        rockpool.fakeCommand('c 1/dial');
        rockpool.fakeCommand('c 2/slider');
        rockpool.fakeCommand('c 3/motor');
        rockpool.loadState('_autosave');
    },200);
}

rockpool.setupMock = function(){
    rockpool.closePrompt();

    rockpool.socket = {}

    rockpool.subscribed_to = 0;

    rockpool.dock_version = 'v0.99';
    rockpool.dock_user = 'Fred';
    rockpool.dock_name = 'Fred'
    rockpool.dock_serial = 'fake';

    rockpool.socket.send = function(data){

    }

    rockpool.socket.close = function(){

    }

    rockpool.run();
}

rockpool.fakeCommand = function(command){
    rockpool.parseCommand('dock:0 data:' + command); 
}