if (!String.prototype.includes) {
  String.prototype.includes = function(search, start) {
    'use strict';
    if (typeof start !== 'number') {
      start = 0;
    }
    
    if (start + search.length > this.length) {
      return false;
    } else {
      return this.indexOf(search, start) !== -1;
    }
  };
}

var FlotillaScanner = function(){

    this.attemptConnection = function(index){ 

        var obj = this;

        if( index > this.scan_total || this.terminate ){
            this.progress = this.scan_total;
            this.callback_progress(this.scan_total);
            return false;
        }

        this.progress = index-1;
        this.callback_progress(index-1);

        var scan_ip;
        var host;

        if(this.start == 0 && this.end == 0){
            host = this.host;
        }
        else
        {
            scan_ip = this.start + index;
            host = this.host + '.' + scan_ip.toString();  
        }

        var timeout = null;

        var query_timeout = this.query_timeout;

        var details = {dock_user: null, dock_name: null, dock_version: null, dock_serial: null};

        clearTimeout(timeout);
        var socket_attempt =  new WebSocket("ws://" + host + ':' + this.port + "/");

        var timeout = setTimeout(function(){
            if( socket_attempt.readyState != socket_attempt.OPEN ){
                socket_attempt.onopen = function(){};
                // This will cause onerror and onclose to trigger
                socket_attempt.close();
            }
        },this.connection_timeout);

        socket_attempt.onopen = function() {
            clearTimeout(timeout);

            socket_attempt.send('hello');

            timeout = setTimeout(function(){
                //console.log('Query timeout...',host);
                socket_attempt.onopen = function(){};
                // This will cause onerror and onclose to trigger
                socket_attempt.close();
            },query_timeout);
        }
        socket_attempt.onmessage = function(event) {
            var message = event.data;
            //console.log(message);
            if( message.includes('# Done') ){

                clearTimeout(timeout);
                socket_attempt.close();

            }
            if( message.includes('# Daemon:') ){

                message = message.replace('# Daemon: ','').split(',');
                daemon_details = {}
                daemon_details.daemon_version = parseFloat(message[0]);
                daemon_details.canonical_address = message[1];
                if( daemon_details.canonical_address == "" ) daemon_details.canonical_address = host;
                obj.callback_daemon(host, daemon_details);
                return;
                
            }
            if( message.includes('# Dock:') ){

                details = {};
                message = message.replace('# Dock: ','').split(',');
                details.dock_version = parseFloat(message[0]);
                details.dock_serial = message[1];
                details.dock_user = message[2];
                details.dock_name = message[3];
                details.dock_index = message[4];

                obj.callback_found(host, details);
                return;
                
            }
        }
        socket_attempt.onerror = function() {
            clearTimeout(timeout);
        }
        socket_attempt.onclose = function() {
            clearTimeout(timeout);
            obj.attemptConnection(index+1);
        }

    }

    this.stop = function(ref){
        this.terminate = true;
    }

    this.scan = function(host, connection_timeout, callback_progress, callback_found, callback_daemon){
        this.connection_timeout = connection_timeout;
        this.scan_total = this.end - this.start;

        if(typeof(host) === "string"){
            this.host   = host;
            this.start      = 0;
            this.end        = 0;
        }
        else
        {
            this.host   = host.slice(0,3).join('.');
            var start_end   = host[3];
            this.start      = start_end[0];
            this.end        = start_end[1];
        }

        this.callback_found    = callback_found;
        this.callback_progress = callback_progress;
        this.callback_daemon   = callback_daemon;

        this.attemptConnection(0);
    }

    this.port = '9395';
    this.progress = 0;
    this.terminate = false;
    this.connection_timeout = 750;
    this.query_timeout = 2000;
    this.addHost = null;
    this.host  = '';
    this.start = 0;
    this.end   = 0;
    this.scan_total = 0;
}

if( typeof(this.Window) !== "function" ){

    (function(){

        var scanner = new FlotillaScanner();

        onmessage = function(event){

            if( 'attempt_host' in event.data ){
                var host = event.data['attempt_host'];
                var connection_timeout = event.data['connection_timeout'];
                
                scanner.scan(
                    host, 
                    connection_timeout,
                    function(progress)    {postMessage({progress:progress})},
                    function(host,details){postMessage({found_host:host,details:details})},
                    function(host,details){postMessage({found_daemon:host,details:details})}
                )
            }

            if( 'terminate' in event.data ){
                scanner.terminate = event.data['terminate'];
            }

        }

    })();

}
