var rockpool = rockpool || {};

rockpool.helpers = {
    avg: function() {
        var sum=0;
        var j=0;
        for(var i=0;i<this.length;i++){
            if(isFinite(this[i]) && this[i] !== null){
              sum=sum+parseFloat(this[i]);
               j++;
            }
        }
        if(j===0){
            return 0;
        }else{
            return sum/j;
        }

    },
    objAvg: function(){
        var sum = 0;
        var j = 0;
        for( var i in this ){
            if(isFinite(this[i]) && this[i] !== null){
              sum=sum+parseFloat(this[i]);
               j++;
            }
        }
        return j===0 ? 0 : (sum/j)
    }
}

rockpool.converters = {
    /*
        No value conversion
    */   
    noop: function () {
        this.name = "Empty"
        this.category = rockpool.category.empty
        this.convert = function (value) { return value }        
    },
    /*
        Converters
    */
    halve: function () {
        this.name = "Halve"
        this.category = rockpool.category.converters
        this.icon = "css/images/icons/icon-halve.png"
        this.convert = function (value) { return value / 2.0 }        
    },
    sine: function(){
        this.name = "Sine Wave"
        this.category = rockpool.category.converters
        this.icon = "css/images/icons/icon-sine.png"

        this.frequency = 0;
        this.phase = 0.0;

        this.convert = function (new_frequency) { 

            var time = rockpool.time;

            if( new_frequency != this.frequency ){
                var c = (time * this.frequency + this.phase) % (2.0 * Math.PI);
                var n = (time * new_frequency) % (2.0 * Math.PI);

                this.phase = c - n;
                this.frequency = new_frequency;
            }

            return (Math.sin(time * this.frequency + this.phase) + 1.0) / 2.0;

        }   
    },
    double: function () {
        this.name = "Double"
        this.category = rockpool.category.converters
        this.icon = "css/images/icons/icon-double.png"
        this.convert = function (value) {
            if( value <= 0.5 ){
                return value * 2.0
            }else{
                return 1.0
            }
        }
    },
    invert: function () {
        this.name = "Invert"
        this.category = rockpool.category.converters
        this.icon = "css/images/icons/icon-invert.png"
        this.convert = function (value) { return 1 - value }        
    },
    smooth: function () {
        this.name = "Smooth"
        this.category = rockpool.category.converters
        this.icon = "css/images/icons/icon-smooth.png"
        this.values = []
        this.values.average = rockpool.helpers.avg;
        this.convert = function (value){

            this.values.push( value )

            if( this.values.length > 10 ){
                this.values.shift()
            }

            return this.values.average()

        }
    },
    toggle: function () {
        this.name = "Toggle"
        //this.bgColor = rockpool.palette.purple
        this.category = rockpool.category.converters
        this.icon = "css/images/icons/icon-toggle.png"

        this.last_value = 0
        this.latch = false

        this.convert = function ( value ) {
            //if( value != this.last_value ){
            if( value > 0.5 && this.last_value <= 0.5 ){
                //if( value == 1 ){
                    this.latch = !this.latch
                //}

            }
            this.last_value = value
            return this.latch ? 1 : 0
        }
    },
    /*
        Deciders
    */
    lessThan: function () {
        this.name = "Less Than"
        this.category = rockpool.category.deciders
        this.icon = "css/images/icons/icon-lt.png"
        this.childValue = 0
        this.convert = function (value) { return ( value < this.childValue ) ? 1 : 0 }
        this.set     = function (value) { this.childValue = value }
    },
    greaterThan: function () {
        this.name = "Greater Than"
        this.category = rockpool.category.deciders
        this.icon = "css/images/icons/icon-gt.png"
        this.childValue = 0
        this.convert = function (value, idx) { return ( value > this.childValue ) ? 1 : 0 }
        this.set     = function (value, idx) { this.childValue = value }
    },
    /*
        Returns the minimum of the two input values
    */
    min: function () {
        this.name = "Min"
        this.category = rockpool.category.deciders
        this.icon = "css/images/icons/icon-min.png"
        this.childValue = 0
        this.convert = function (value) { return (this.childValue < value) ? this.childValue : value }
        this.set     = function (value) { this.childValue = value }
    },
    /*
        Returns the maximum of the two input values
    */
    max: function () {
        this.name = "Max"
        this.category = rockpool.category.deciders
        this.icon = "css/images/icons/icon-max.png"
        this.childValue = 0
        this.convert = function (value) { return (this.childValue > value) ? this.childValue : value }
        this.set     = function (value) { this.childValue = value }
    },
    mix: function () {
        this.name = "Mix"
        this.category = rockpool.category.deciders
        this.icon = "css/images/icons/icon-mix.png"
        this.childValue = 0
        this.convert = function (value, idx) { return (value + this.childValue)/2 }
        this.set     = function (value, idx) { this.childValue = value }
    },
    /*
        Returns the difference between two inputs
    */
    diff: function () {
        this.name = "Difference"
        this.category = rockpool.category.deciders
        this.icon = "css/images/icons/icon-diff.png"
        this.childValue = 0
        this.convert = function (value) { return (this.childValue < value) ? value - this.childValue : this.childValue - value }
        this.set     = function (value) { this.childValue = value }
    },
/*
    Value   1 0 0 1
    Clock   1 1 0 0
            1 1 - -

*/
    latch: function() {
        this.name = "Latch"
        this.category = rockpool.category.deciders
        this.icon = "css/images/icons/icon-latch.png"

        this.latched_value  = 0
        this.input_value    = 0
        this.last_value     = 0

        this.convert = function ( value ) {
            this.input_value = value
            return this.latched_value
        }
        this.set = function( value ){
            // Clock into the latch on rising edge
            
            if( value > 0.5 && this.last_value <= 0.5 ){
                this.latched_value = this.input_value
            }
            this.last_value = value
        }
    },
    /*
        Experimental
        Use case: ?
    */
    add: function () {
        this.name = "Add"
        this.category = rockpool.category.deciders
        this.icon = "css/images/icons/icon-add.png"
        this.childValue = 0
        this.convert = function (value) { return (this.childValue + value > 1) ? 1 : this.childValue + value}
        this.set     = function (value) { this.childValue = value }
    }
}