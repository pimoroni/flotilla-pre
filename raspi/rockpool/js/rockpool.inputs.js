var rockpool = rockpool || {};

/*
 w = 87  u = 38
 s = 83  d = 40
 a = 65  l = 37
 d = 68  r = 39
*/

rockpool.time = 0;

rockpool.pressed={
    87: false,
    83: false,
    65: false,
    68: false,
    38: false,
    40: false,
    37: false,
    39: false
};

rockpool.inputs = {
    /*high: function () {
        this.name = "On"
        this.icon = "on"
        this.bgColor = rockpool.palette.blue
        this.category = rockpool.category.generators
        this.get = function () { return 1 }
    },
    low: function () {
        this.name = "Off"
        this.icon = "off"
        this.bgColor = rockpool.palette.blue
        this.category = rockpool.category.generators
        this.get = function () { return 0 }
    },*/
    state: function() {
        this.name = "Value"
        this.icon = "half"
        this.bgColor = rockpool.palette.blue
        this.category = 'Value'

        this.options = [
                {name:'Off',   value: 0.0, icon: "off" },
                {name:'10%',   value: 0.1 },
                {name:'20%',   value: 0.2 },
                {name:'30%',   value: 0.3 },
                {name:'40%',   value: 0.4 },
                {name:'50%',   value: 0.5 },
                {name:'60%',   value: 0.6 },
                {name:'70%',   value: 0.7 },
                {name:'80%',   value: 0.8 },
                {name:'90%',   value: 0.9 },
                {name:'On',    value: 1.0, icon: "on" }
            ]

        this.get = function ( options ) {
            return (options && options.value) ? options.value : 0
        }
    },
    pattern: function () {
        this.name = "Pattern"
        this.sindex = 0
        this.icon = "random"
        this.bgColor = rockpool.palette.blue
        this.category = 'Pattern'

        this.options = [
                {category: 'Waveforms', name:'Sine',     sequence: function(){ return (Math.sin(rockpool.time/10) + 1.0) / 2.0 }, icon: "sine"},
                {category: 'Waveforms', name:'Random',   sequence: function(){ return Math.random() }, icon: "random" },
                {category: 'Waveforms', name:'Pulse',    sequence: function(){ return 1.0 - (((rockpool.time/10) % 10) / 10.0);}, icon: "pulse"}, // [0, 0.5, 1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1]
                {category: 'Waveforms', name:'Square',   sequence: function(){ return Math.round(rockpool.time/10) % 2;}, icon: "square"}, // [0, 0, 1, 1]
                {category: 'Waveforms', name:'Triangle', sequence: function(){ return Math.abs(((rockpool.time/10)%10)-5)/5.0;console.log(r);}, icon: "triangle"}, // [0, 0.5, 1, 0.5]
                {category: 'Waveforms', name:'Saw',      sequence: function(){ return (((rockpool.time/10) % 5) / 5.0);}, icon: "saw"}//, //[1,0.5,0]
                //{category: 'Waveforms', name:'Clock',    sequence: function(){ return ((rockpool.time/10) % 2) / 2.0;}, icon: "clock"} // function(){ var d = new Date(); return d.getTime() % 2;}
            ]

        this.get = function ( options ) {
            var sequence = ( options && options.sequence ) ? options.sequence : this.sequence;

            if( !sequence ) return 0

            if( typeof( sequence ) === 'function' ){
                return sequence();
            }
            var value =  sequence[this.sindex]
            this.sindex++
            if( this.sindex >= sequence.length ){
                this.sindex = 0
            }
            return value;
        }
    },
}

if(window.DeviceMotionEvent) {
    rockpool.tilt = {x:0.5,y:0.5,z:0.5};

    window.addEventListener('devicemotion', function(event) {

        var x = event.accelerationIncludingGravity.x;
        var y = event.accelerationIncludingGravity.y;
        var z = event.accelerationIncludingGravity.z;

        if(!rockpool.inputs.tilt && x + y + z != 0){
            rockpool.inputs.tilt = function() {
                this.name = "Tilt"
                this.icon = "motion"
                this.bgColor = rockpool.palette.blue
                this.category = 'Orientation'

                this.options = [
                    {category: 'Tilt', name: 'X', icon: "motion"},
                    {category: 'Tilt', name: 'Y', icon: "motion"},
                    {category: 'Tilt', name: 'Z', icon: "motion"},
                ]

                this.get = function(options){
                    switch(options.name){
                        case 'X':
                            return rockpool.tilt.x;
                        case 'Y':
                            return rockpool.tilt.y;
                        case 'Z':
                            return rockpool.tilt.z;
                    }
                }
            }
        }

        rockpool.tilt = {
            x: (Math.max(-1.0,Math.min(1.0,x / 9.5)) + 1.0) / 2,
            y: (Math.max(-1.0,Math.min(1.0,y / 9.5)) + 1.0) / 2,
            z: (Math.max(-1.0,Math.min(1.0,z / 9.5)) + 1.0) / 2
        }
    });
}

rockpool.enable_keyboard = function(){

    $(window).on('keydown',function(){
        if( typeof(rockpool.inputs.keyboard) === 'function' ) return false;

        $(window).off('keydown');
        
        $(window).on('keydown',function(e){
             rockpool.pressed[e.keyCode] = true;
        });

        $(window).on('keyup',function(e){
             rockpool.pressed[e.keyCode] = false;
        });

        rockpool.inputs.keyboard = function () {
            this.name = "Keyboard"
            this.keys = []
            this.icon = "keyboard"
            this.bgColor = rockpool.palette.blue
            this.category = 'Keys'

            this.options = [
                    {category: 'Keyboard Key', name:"UP/W",     keys:[87, 38], icon: "keyboard-up"},
                    {category: 'Keyboard Key', name:"DOWN/S",   keys:[83, 40], icon: "keyboard-down"},
                    {category: 'Keyboard Key', name:"LEFT/A",   keys:[65, 37], icon: "keyboard-left"},
                    {category: 'Keyboard Key', name:"RIGHT/D",  keys:[68, 39], icon: "keyboard-right"},
                    {category: 'Keyboard Key', name:"0",        keys:[48], icon: "keyboard-number"},
                    {category: 'Keyboard Key', name:"1",        keys:[49], icon: "keyboard-number"},
                    {category: 'Keyboard Key', name:"2",        keys:[50], icon: "keyboard-number"},
                    {category: 'Keyboard Key', name:"3",        keys:[51], icon: "keyboard-number"},
                    {category: 'Keyboard Key', name:"4",        keys:[52], icon: "keyboard-number"},
                    {category: 'Keyboard Key', name:"5",        keys:[53], icon: "keyboard-number"},
                    {category: 'Keyboard Key', name:"6",        keys:[54], icon: "keyboard-number"},
                    {category: 'Keyboard Key', name:"7",        keys:[55], icon: "keyboard-number"},
                    {category: 'Keyboard Key', name:"8",        keys:[56], icon: "keyboard-number"},
                    {category: 'Keyboard Key', name:"9",        keys:[57], icon: "keyboard-number"},
                ]
            this.get = function(options){
                var x = options ? options.keys.length : this.keys.length
                while(x--){
                    if(rockpool.pressed[options ? options.keys[x] : this.keys[x]]){
                        return 1.0
                    }
                }
                return 0.0
            }
        }
        if(rockpool.updatePalettes) rockpool.updatePalettes();
        if(rockpool.generatePalette) rockpool.generatePalette('input');


    })
}