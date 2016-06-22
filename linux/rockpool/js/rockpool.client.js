var rockpool = rockpool || {};
rockpool.offline = true
rockpool.use_web_workers = false;

rockpool.port = "9395";
rockpool.sockets = {}

rockpool.connection_timeout = 500; // seems stable at (250 * number of ranges to scan)

rockpool.valid_hosts = [];
rockpool.attempt_list = [];
rockpool.minimum_dock_version = 1.1;
rockpool.current_dock_version = 1.1;

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}
// Hide method from for-in loops
Object.defineProperty(Array.prototype, "equals", {enumerable: false});

rockpool.host_picker = $('<div>').addClass('host-picker palette')
    .appendTo('.palettes')
    .on('click','.host',function(e){
        e.preventDefault();
        e.stopPropagation();

        if($(this).hasClass('update-needed')){
            window.open('http://learn.pimoroni.com');
            return false;
        }

        rockpool.stopScan();

        var host = $(this).data('host');
        var details = $(this).data('details');

        if(rockpool.enable_debug){console.log('Connecting to', host, details);}

        rockpool.closePrompt();
        rockpool.connect(host, rockpool.port, details);
    })
    .on('click','.custom a',function(e){
        rockpool.host_picker.find('.custom').hide();
        e.preventDefault();
        e.stopPropagation();
        var host = $(this).parent().find('input').val();
        rockpool.stopScan();
        rockpool.addScanTarget(host);
        rockpool.findHosts();
        //rockpool.closePrompt();
        //rockpool.connect(host, rockpool.port);
    })
    .on('click','.add-manual',function(e){
        rockpool.host_picker.find('.custom').show();
    })
    .append('<header><h1>' + rockpool.languify('searching for docks') + '</h1></header>')
    .append('<div class="none-found">no docks found, yet! =(</div>')
    .append('<div class="choices"></div>')
    .append('<div class="add-manual">Find a dock manually<i class="add-input"></i></div>')
    .append('<div style="display:none;" class="custom"><h3>Don\'t see your dock? Enter the IP address of your Flotilla host.</h3><input type="text" value="127.0.0.1"><a href="#">Find<a></div>');
    //.append('<div class="progress"><strong>' + rockpool.languify('Scanning') + '</strong><span></span></div>')

rockpool.addDaemon = function(host, details){
    if(rockpool.enable_debug){console.log('Adding daemon', host, details);}

    if(rockpool.valid_hosts.indexOf(details.canonical_address) != -1) return;
    rockpool.valid_hosts.push(details.canonical_address);

    var daemon = rockpool.host_picker.find('.daemon').filter('[data-host="' + host + '"]');

    if(daemon.length) return;

    $('<div class="daemon"><h3 style="display:none;">' + host + ' (v' + details.daemon_version + ')</h3><p>No docks connected!</p></div>')
    .attr({
        'data-host':host
    })
    .appendTo(rockpool.host_picker.find('.choices'));
}

rockpool.addHost = function(host, details){
    if(rockpool.enable_debug){console.log('Adding valid host', host, details);}

        var daemon = rockpool.host_picker.find('.daemon').filter('[data-host="' + host + '"]');
        daemon.find('> p').hide();

        var h = daemon.find('.host').filter('[data-serial="' + details.dock_serial + '"]');

        if(h.length) return;

        //rockpool.valid_hosts.push(details.dock_serial);
        h = $('<div><p>' + details.dock_name + '</p></div>') //<small>' + details.dock_user + '</small></div>')
            .data({
                'host':host,
                'details':details
            })
            .attr({
                'data-serial':details.dock_serial
            })
            .addClass('host');

        if(details.dock_version < rockpool.minimum_dock_version){
            h.append('<small class="error">this dock needs an <em>update</em></small>');
            h.addClass('update-needed');
        }
        //h.append('<small>v' + details.dock_version + '</small>');

        h.appendTo(daemon);

        rockpool.host_picker.find('.none-found').hide();
    //}
}

rockpool._discover = false;
rockpool._discover_retries = 0;
rockpool._discover_retry_time = 6000;
rockpool.startDiscovery = function(){
    rockpool._discover = false;
    rockpool.discoverHosts();

}

rockpool.stopDiscovery = function(){
    rockpool._discover = false;
}

rockpool.discoverHosts = function(){
    
    $.ajax({
        type: 'GET',
        url: 'http://discover.flotil.la',
        async: false,
        jsonpCallback: 'jsonp_callback',
        contentType: "application/json",
        dataType: 'jsonp',
        success: function(json) {
            for(idx in json.ipv4){
                rockpool.addScanTarget(json.ipv4[idx], 5000);
            }

            rockpool.addScanTarget('127.0.0.1', 5000);
            rockpool.addPreviousTargets();
            rockpool.findHosts();
        },
        error: function(obj,err) {
            if(rockpool.enable_debug){console.log(err);}

            rockpool.addScanTarget('127.0.0.1', 5000);
            rockpool.addScanTarget('raspberrypi', 5000);
            rockpool.addScanTarget('raspberrypi.local', 5000);

            rockpool.addPreviousTargets();
            rockpool.findHosts();
        }
    });

}

rockpool.stopScan = function(){
    var x = rockpool.attempt_list.length;

    while(x--){
        var start_end = rockpool.attempt_list[x].target[3];
        var start     = start_end[0];
        var end       = start_end[1];

        rockpool.scan_workers[rockpool.attempt_list[x].target].stop(rockpool.scan_workers[rockpool.attempt_list[x].target]);
    }
}

rockpool.resetHosts = function(){
    rockpool.valid_hosts = [];
    rockpool.host_picker.find('.host').remove();
}

rockpool.addScanTarget = function(target, timeout){
    if( typeof(timeout) === "undefined" ){
        timeout = 750;
    }
    if( typeof(target) === 'string' ){
        if( !target.match(/[a-z]/i) ){
            var host = target.split('.');
            if(host.length < 4){
                return false;
            }
            if(host[3].indexOf('/') > -1){
                host[3] = host[3].split('/').map(function(value){return parseInt(value)});
            }
            else
            {
                host[3] = [host[3],host[3]]
            }
            host = host.map(
                function(value){
                    if ( typeof(value) === "string" ){
                        return parseInt(value)
                    }
                    else
                    {
                        return value.map(function(value){return parseInt(value)});
                    }
                }
            );
            target = host;
        }
    }
    for(var x = 0; x < rockpool.attempt_list.length; x++){
        if(rockpool.attempt_list[x].target.equals(target)) {
            return false;
        }
    }
    rockpool.attempt_list.push({target:target, timeout:timeout});
    return true;
}

rockpool.addPreviousTargets = function(){
    var history = rockpool.loadConnectionHistory();
    for(var host in history){
        if(rockpool.debug_enabled) console.log('Adding previous host: ' + history[host])
        rockpool.addScanTarget(history[host], 5000);
    }
}

rockpool.addCommonTargets = function(){
    rockpool.addScanTarget('127.0.0.1', 5000);
    rockpool.addScanTarget([192,168,0,[1,254]]);
    rockpool.addScanTarget([192,168,1,[1,254]]);
    rockpool.addScanTarget([10,0,1,[1,254]]);
    rockpool.addScanTarget([10,0,0,[1,254]]);
}

rockpool.findHosts = function(){

    var progress_total = 0;

    if(!rockpool._discover){
        rockpool._discover = true;
        rockpool.resetHosts();

        rockpool.prompt(rockpool.host_picker, false);
    }

    var history = rockpool.loadConnectionHistory();
    for(var host in history){
        rockpool.host_picker.find('.custom input').val(history[host]);
        break;
    }

    rockpool.scan_workers = {};

    var x = rockpool.attempt_list.length;

    while(x--){
        var start_end = rockpool.attempt_list[x].target[3];
        var start     = start_end[0];
        var end       = start_end[1];

        progress_total += (end-start);

        spawnWorker(rockpool.attempt_list[x]);
    }

    function spawnWorker(attempt_host){
        var target    = attempt_host.target;
        var start_end = target[3];
        var start     = start_end[0];
        var end       = start_end[1];
        var total     = end-start;

        if( rockpool.use_web_workers ){
            rockpool.scan_workers[target] = new Worker("js/rockpool.find-hosts.worker.js");
            rockpool.scan_workers[target].progress = 0;
            rockpool.scan_workers[target].stop = function(obj){
                obj.postMessage({terminate:true});
            }
            rockpool.scan_workers[target].onmessage = function(msg){

                if( 'found_host' in msg.data ){
                    var host = msg.data['found_host'];
                    var details = msg.data['details'];
                    var successful_subnet = host.split('.').slice(0,3).join('.');
                    rockpool.addHost(host,details);
                }

                if( 'progress' in msg.data ){
                    rockpool.scan_workers[target].progress = parseInt(msg.data['progress']);

                    updateFindHostProgress();
                }

            }
            if(rockpool.debug_enabled) console.log('Target',target);
            rockpool.scan_workers[target].postMessage({
                attempt_host:target,
                connection_timeout:attempt_host.timeout
            });
        }
        else
        {
            if(rockpool.debug_enabled) console.log('Target',target);
            rockpool.scan_workers[target] = new FlotillaScanner();
            rockpool.scan_workers[target].scan(
                target,
                attempt_host.timeout,
                function(progress){updateFindHostProgress()},
                function(host, details)    {
                    var successful_subnet = host.split('.').slice(0,3).join('.');
                    rockpool.addHost(host, details);
                },
                function(host, details) {
                    rockpool.addDaemon(host, details);
                }
            );
        }
    }

   function updateFindHostProgress(){

        var progress = 0;

        for(var x = 0; x < rockpool.attempt_list.length; x++){
            if( typeof(rockpool.scan_workers[rockpool.attempt_list[x].target]) != 'undefined' ){
                progress += rockpool.scan_workers[rockpool.attempt_list[x].target].progress;
            }
        }

        if(progress == 0 && rockpool._discover && rockpool._discover_retries < 4){
                rockpool._discover_retries += 1;
                setTimeout(rockpool.discoverHosts,rockpool._discover_retry_time);
        }
    }
}

rockpool.loadConnectionHistory = function(){

    var history = rockpool.getPersistentValue('host_history',[]);

    if( typeof(history) === "string" ){
        history = history.split(',');
    }

    return history;

}

rockpool.addToConnectionHistory = function(host){

    var history = rockpool.loadConnectionHistory();

    if( history.indexOf( host ) == -1 ){
        history.unshift( host );
    }
    
    rockpool.setPersistentValue('host_history', history);

}

rockpool.isConnected = function(){
    if(!rockpool.socket){ return false; }
    return rockpool.socket.readyState == rockpool.socket.OPEN;
}

rockpool.disconnect = function(){

    if(rockpool.isConnected()){
        rockpool.socket.onclose = function(){};
        rockpool.socket.close();
        rockpool.socket = null;
    }

}

rockpool.connect = function(host, port, details){

    rockpool.disconnect(host);

    if(rockpool.debug_enabled) console.log('Connected', details);

    var prompt = $("<div>")
        .addClass('host-picker palette')
        .append('<header><h1>' + rockpool.languify('Connecting...') + '</h1></header>');

    rockpool.prompt(prompt,false);

    rockpool.socket = new WebSocket("ws://" + host + ':' + port + "/");
    rockpool.socket.onopen = function() { 
        if(rockpool.debug_enabled) console.log('Successfully connected to ' + host);

        rockpool.socket.send("subscribe: " + details.dock_index);
        rockpool.socket.send('ready'); 

        rockpool.subscribed_to = details.dock_index;

        rockpool.addToConnectionHistory(host);

        if(typeof(rockpool.on_connect) === "function"){
            rockpool.on_connect();
        }
        rockpool.closePrompt();
    };
    rockpool.socket.onmessage = function(event) { rockpool.parseCommand(event.data); return; };
    rockpool.socket.onerror = function(event) {
        if(rockpool.debug_enabled) console.log('Socket Error',event);
        rockpool.closePrompt();
        rockpool.findHosts();
     };
    rockpool.run();
}

rockpool.sendHostUpdate = function(host, channel, code, data){

    var packet = ['s', channel, data.join(',')].join(' ');
    packet = 'dock:' + host + ' data:' + packet;
    if( rockpool.isConnected() ){
        if(rockpool.debug_enabled) console.log('Sending packet:', packet)
        rockpool.socket.send(packet);
    }
    else
    {  
        if(rockpool.debug_enabled) console.log('Unable to send ( No connection to host ):', packet)
    }

}

rockpool.addressLookup = function(module_addr){
    for( var module_name in rockpool.module_handlers ){
        if(module_addr = rockpool.module_handlers[module_name].address){
            return module_name;
        }
    }
    return -1;
}

rockpool.parseCommand = function(data_in){

    if(data_in[0] == '#'){
        if(rockpool.debug_enabled)console.log('Debug: ', data_in);
        return false;
    }

    packet = data_in.split(/dock\:|\ data\:/i);
    packet.shift(); // Drop the leading empty item

    var host    = parseInt(packet[0].trim());

    if(host != rockpool.subscribed_to) return;

    data_in = packet[1].trim();

    if(data_in[0] == '#'){
        if(rockpool.debug_enabled)console.log('Debug: ', data_in);
        return false;
    }

    if(data_in[0] == 'H'){
        if( data_in[1] == 'F' ){
            if(rockpool.debug_enabled) console.log('Flotilla Host Found!');
        }
        else
        {
            if(rockpool.debug_enabled) console.log('Flotilla Host Lost!');
        }
        return true;
    }

    data = data_in.replace('  ',' ').replace(/,/g,' ').replace('/',' ').split(' ');
    if(data.length < 2){
        console.log('Invalid message: ', data_in);
        return false;
    }

    var command = data.shift().trim();
    var channel = parseInt(data.shift().trim());
    var device = data.shift().trim();

    if(!isNaN(device)){
        device = rockpool.addressLookup(device);
    }

    switch(command){
        case 'u': // Update
            var module = rockpool.getModule(host, channel, device); 
            module.receive(data);
            if( module.active == false ){
                module.activate();
                rockpool.updatePalettes();
                rockpool.updateActiveWidgets(module.key);
            }
            return true;
        case 'd': // Disconnect
            var module = rockpool.getModule(host, channel, device);
            if( !module ) return false;
            module.deactivate();
            rockpool.updatePalettes();
            rockpool.updateActiveWidgets(module.key);
            return true;
        case 'c': // Connect
            var module = rockpool.getModule(host, channel, device);
            if( !module ) return false;
            module.activate();
            rockpool.updatePalettes();
            rockpool.updateActiveWidgets(module.key);
            return true;
    }

}
