var rockpool = rockpool || {};

rockpool.outputs = {
    none: function () {
        this.name = "None"
        this.icon = "add"
        this.category = rockpool.category.general
        this.set = function ( value ) { return 0 }
    }
}