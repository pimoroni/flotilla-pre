var rockpool = rockpool || {};

rockpool.prompt = function(content, close_on_click){
    if( close_on_click = null || typeof( close_on_click ) === 'undefined' ){
        close_on_click = true;
    }
    $.fancybox.open({
        openEffect  : 'none',
        closeEffect : 'none',
        modal       : true,
        content     : content,
        width       : '100%',
        margin      : [0, 0, 0, 0],
        beforeClose : function(){
            $('.greyout').removeClass('greyout');
        },
        afterClose : function(){
            $('.greyout').removeClass('greyout');
        }
        //helpers     : {overlay : {locked : false}}
    });
    $('.fancybox-overlay,.fancybox-wrap').on('click','.close', function(){ $.fancybox.close(); });
    $('.fancybox-overlay,.fancybox-wrap').on('click', function(){

        if( close_on_click ){
            $.fancybox.close();
        }

    })
}

rockpool.closePrompt = function(){
    $.fancybox.close();
}

rockpool.refreshPalette = function(type){

    rockpool.refreshConnectedModules($('.palette.' + type).find('.connected-modules'), type);

}

rockpool.refreshConnectedModules = function(obj, type){

    var dock_id = 0;

    var dom_channels = obj.find('div.channels');
    if(!dom_channels.length){
        dom_channels = $('<div>').addClass('channels icon-palette pure-g').appendTo(obj);

        for(x = 0; x<8; x++){
            $('<div><i></i><span>').appendTo(dom_channels);
        }
    }

    $('.active-' + type + 's li').removeClass('on');

    for(channel_index = 0; channel_index<8; channel_index++){
        var module = rockpool.getModule(dock_id, channel_index);
        var dom_module = dom_channels.find('> div:eq(' + channel_index + ')');
        if(module === false || module.active === false){
            dom_module
                .attr('class','color-grey disabled')
                .find('i')
                .attr('class','');
            dom_module.find('span').text('');
            dom_module.find('.popup').remove();
        }
        else
        {
            dom_module
                .attr('class','color-grey')
                .data({
                    'type': type,
                    'channel': channel_index
                })
                .find('i')
                .attr('class','icon-' + module.icon);

            dom_module.find('span').text(module.title);

            if( (type === 'input' && module.input_count > 0)
            ||  (type === 'output' && module.output_count > 0)){

                dom_module
                    .attr('class','color-' + module.color + ' active');
                    
                $('.active-' + type + 's').find(' li:eq(' + channel_index + ')').addClass('on');

            }
        }
    }


}

rockpool.refreshVirtualModules = function(obj, type){

    var dom_virtual = obj.find('div.virtual');
    if(!dom_virtual.length){
        dom_virtual = $('<div>').addClass('virtual icon-palette pure-g').appendTo(obj);
    }
    dom_virtual.find('div').remove();

    var collection = rockpool.inputs;
    if(type == 'output'){
        collection = rockpool.outputs;
    }

    for(key in collection){
        var item = collection[key];

        if(item.type && item.type == 'module') continue;

        if(typeof(item) === "function") item = new item;


        var dom_item = $('<div><i><img></i><span>')
            .data({
                'type': type,
                'key':key
            })
            .addClass('active color-navy')
            .appendTo(dom_virtual);
        dom_item.find('span').text(item.name);
        if(item.icon){
            dom_item.find('img').attr('src','css/images/icons/icon-' + item.icon + '.png');
        }
    }

}

rockpool.refreshConverters = function(obj){

    var dom_converters = obj.find('div.modify');

    if(!dom_converters.length){
        dom_converters = $('<div>').addClass('modify icon-palette pure-g').appendTo(obj);
    }
    dom_converters.find('div').remove();

    for(key in rockpool.converters){

        var converter = typeof(rockpool.converters[key]) === "function" ? new rockpool.converters[key] : rockpool.converters[key];

        var dom_item = $('<div><i><img></i><span>')
            .data({
                'key':key
            })
            .addClass('active')
            .appendTo(dom_converters);
        dom_item.find('span').text(converter.name);
        if(converter.icon){
            dom_item.find('img').attr('src','css/images/icons/icon-' + converter.icon + '.png');
        }
        dom_item.addClass('color-' + converter.color);

    }

}

rockpool.generatePalette = function(type){
    var dom_palette = $('.palette.' + type);

    if( dom_palette.length == 0 ){
        dom_palette = $('<div>').addClass('palette').addClass(type).appendTo('.palettes');
        $('<i>').addClass('close').appendTo(dom_palette);
    }

    if(type == 'input' || type == 'output'){

        var dom_connected_modules = $('<div>').addClass('connected-modules');
        rockpool.refreshConnectedModules(dom_connected_modules,type);
        dom_connected_modules.appendTo(dom_palette);

        var dom_virtual_modules = $('<div>').addClass('virtual-modules');
        rockpool.refreshVirtualModules(dom_virtual_modules,type);
        dom_virtual_modules.appendTo(dom_palette);

        return;
    }

    if(type == 'converter'){

        var dom_converters = $('<div>').addClass('modifiers');
        rockpool.refreshConverters(dom_converters);
        dom_converters.appendTo(dom_palette);

    }

}

rockpool.add = function(type, rule, index){
    var dom_palette = $('.palette.' + type);
    if(!dom_palette.length) return;

    dom_palette.find('.popup').hide();


    // Type is "input" or "output"
    dom_palette
    .off('click')
    .on('click','.modify .active', function(e){
        e.stopPropagation();

        var key = $(this).data('key');

        rule = rule instanceof rockpool.rule ? rule : new rockpool.rule();
        rule.start();
        rule.setHandler(index,key);
        rockpool.closePrompt();


    })
    .on('click','.virtual .active', function(e){
        e.stopPropagation();

        var key = $(this).data('key');
        var type = $(this).data('type');

        var collection = rockpool.inputs;
        if(type == 'output'){
            collection = rockpool.outputs;
        }

        var module = typeof(collection[key]) === "function" ? new collection[key] : collection[key];

        if(module.options && module.options.length > 0){
            // Needs configuration
            rockpool.virtualConfigureMenu($(this), type, rule, key, module);
        }
        else
        {
            rule = rule instanceof rockpool.rule ? rule : new rockpool.rule();
            rule.start();
            rule.setHandler(type,key);
            rockpool.closePrompt();
        }

    })
    .on('click','.channels .active', function(e){
        e.stopPropagation();

        var dock_id = 0;
        var channel_index = $(this).data('channel');
        var type = $(this).data('type');

        var module = rockpool.getModule(dock_id, channel_index);

        //console.log(type, channel_index, module);

        if(module.needsConfiguration(type))
        {
            rockpool.moduleConfigureMenu($(this), type, rule, index, module);
        }
        else
        {
            rule = rule instanceof rockpool.rule ? rule : new rockpool.rule();
            rule.start();
            var io_key =  type == 'input' ? module.firstInput().key : module.firstOutput().key;
            rule.setHandler(type,[module.key,io_key].join('_'));
            rockpool.closePrompt();
        }
    });

    rockpool.prompt(dom_palette, false);
}

rockpool.virtualConfigureMenu = function(target, type, rule, key, module){

    var dom_palette = $('.palette.' + type);
    dom_palette.addClass('greyout').find('.selected').removeClass('selected');
    target.addClass('selected');

    var dom_popup = target.find('.popup.' + key);
    if(dom_popup.length == 0){

        var dom_popup = $('<div><ul>').addClass('popup').addClass(key).appendTo(target);

        var dom_menu = dom_popup.find('ul');

        for(var idx in module.options){

            var option = module.options[idx];

            if(option.ui == 'slider'){

                var dom_option = $('<li>')
                    .addClass('slider')
                    .data({
                        'key':key,
                        'idx':idx
                    })
                    .appendTo(dom_menu);

                var dom_slider = $('<div>').appendTo(dom_option);
                var dom_slider_label = $('<strong>').text(option.name).appendTo(dom_option)



            }
            else
            {

                $('<li>')
                    .data({
                        'key':key,
                        'idx':idx
                    })
                    .addClass('option')
                    .text(option.name)
                    .appendTo(dom_menu);

            }

        }

    }

    $('.popup').hide();
    dom_popup
    .off('click')
    .off('mouseup')
    .off('mousemove')
    .off('mousedown')
    .css('display','inline-block')
    .on('mousedown','.slider',function(e){
        e.stopPropagation();

        $(this).data('sliding',true);

        var left = e.pageX - $(this).offset().left;
        var width = $(this).width();
        var percent = left/width;

        $(this).data('value',percent);

        $(this).find('div').css({width:(percent*100.0) + '%'});
        $(this).find('strong').text(Math.round(percent*1000.0));
    })
    .on('mouseup','.slider',function(e){
        e.stopPropagation();

        $(this).data('sliding',false);

        var key = $(this).data('key');
        var idx = parseInt($(this).data('idx'));
        var value = $(this).data('value');

        rule = rule instanceof rockpool.rule ? rule : new rockpool.rule();
        rule.start();
        rule.setHandler(type,key,idx,value);
        rockpool.closePrompt();

    })
    .on('mousemove','.slider',function(e){
        e.stopPropagation();

        if(!$(this).data('sliding')) return;

        var left = e.pageX - $(this).offset().left;
        var width = $(this).width();
        var percent = left/width;
        $(this).data('value',percent);

        $(this).find('div').css({width:(percent*100.0) + '%'});
        $(this).find('strong').text(Math.round(percent*1000.0)); 
    })
    .on('click','.option',function(e){
        e.stopPropagation();

        var key = $(this).data('key');
        var idx = parseInt($(this).data('idx'));

        rule = rule instanceof rockpool.rule ? rule : new rockpool.rule();
        rule.start();
        rule.setHandler(type,key,idx);
        rockpool.closePrompt();

    });

    dom_popup.css({'margin-left': -(dom_popup.width()/2) + 36});

    if(dom_popup.offset().left < 0){
        var margin = parseFloat(dom_popup.css('margin-left').replace('px',''));
        margin -= dom_popup.offset().left;
        dom_popup.css('margin-left', margin);
    }
    if(dom_popup.offset().left + dom_popup.width() > $(window).width()){
        var margin = parseFloat(dom_popup.css('margin-left').replace('px',''));
        margin += ($(window).width() - (dom_popup.offset().left + dom_popup.width()))
        dom_popup.css('margin-left', margin);
    }

    $('.fancybox-overlay').on('click',function(){
        dom_popup.hide();
        dom_palette.removeClass('greyout');
        target.removeClass('selected');
        $('.fancybox-overlay').off('click');
    })


}

rockpool.moduleConfigureMenu = function(target, type, rule, index, module){
    var dom_palette = $('.palette.' + type);
    dom_palette.addClass('greyout').find('.selected').removeClass('selected');
    target.addClass('selected');

    var options = module.getOptions(type);

    var dom_popup = target.find('.popup.' + module.key);
    if(dom_popup.length == 0){

        var dom_popup = $('<div><ul>').addClass('popup').addClass(module.key).appendTo(target);

        var dom_menu = dom_popup.find('ul');

        for(var idx in options){
            var option = options[idx];

            $('<li>')
                .data({
                    'key':option.key,
                    'idx':option.option
                })
                .addClass('option')
                .text(option.title)
                .appendTo(dom_menu);
        }

    }

    $('.popup').hide();
    dom_popup.off('click').css('display','inline-block').on('click','li',function(e){
        e.stopPropagation();

        var key = $(this).data('key');
        var idx = parseInt($(this).data('idx'));

        rule = rule instanceof rockpool.rule ? rule : new rockpool.rule();
        rule.start();
        rule.setHandler(type,key,idx);

        rockpool.closePrompt();

    });

    dom_popup.css({'margin-left': -(dom_popup.width()/2) + 36});

    if(dom_popup.offset().left < 0){
        var margin = parseFloat(dom_popup.css('margin-left').replace('px',''));
        margin -= dom_popup.offset().left;
        dom_popup.css('margin-left', margin);
    }
    if(dom_popup.offset().left + dom_popup.width() > $(window).width()){
        var margin = parseFloat(dom_popup.css('margin-left').replace('px',''));
        margin += ($(window).width() - (dom_popup.offset().left + dom_popup.width()))
        dom_popup.css('margin-left', margin);
    }

    $('.fancybox-overlay').on('click',function(){
        dom_popup.hide();
        dom_palette.removeClass('greyout');
        target.removeClass('selected');
        $('.fancybox-overlay').off('click');
    })

}


rockpool.updatePalettes = function() {
    rockpool.refreshPalette('input')
    rockpool.refreshPalette('output')
}
