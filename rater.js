(function ($){
    $.fn.textWidth = function(){
        var html_calc = $('<span>' + $(this).html() + '</span>');
        html_calc.css('font-size',$(this).css('font-size')).hide();
        html_calc.prependTo('body');
        var width = html_calc.width();
        html_calc.remove();
        return width;
    }

    $.fn.rate = function(options){
        for (var i = 0; i < $(this).length; i++)
        {
            new rate($(this)[i], options);
        }

        function rate($container, options){
            this.settings = $.extend({}, $.fn.rate.settings, options);

            this.addLayer = function(layer_name, visible_width, symbol, visible)
            {
                var layer_body = "<div>";
                for (var i = 0; i < this.settings.max_value; i++)
                {
                    layer_body += symbol;
                }
                layer_body += "</div>";
                var layer = $(layer_body).addClass("rate-" + layer_name).appendTo($container);

                $(layer).css({
                    width: visible_width * $(layer).textWidth() + "px",
                    overflow: 'hidden',
                    position: 'absolute',
                    top: 0,
                    display: visible ? 'block' : 'none'
                });
                $($container).css({
                    height: $(layer).height(),
                    position: 'relative'
                });

                return layer;
            }

            this.hover = function(ev)
            {

            }

            this.build = function()
            {
                var base_layer = this.addLayer("base-layer", 1, this.settings.symbols[
                    this.settings.selected_symbol_type][0], true);

                var hover_layer = this.addLayer("hover-layer", 0, this.settings.symbols[
                    this.settings.selected_symbol_type][1], false);

                var select_layer = this.addLayer("hover-layer", 0, this.settings.symbols[
                    this.settings.selected_symbol_type][1], false);

                $($container).bind("mousemove", function(ev){
                    var x = ev.pageX - $($container).offset().left;
                    var visible_width = x;
                    hover_layer.css({
                        width: visible_width,
                        display: 'block'
                    });
                });

                $($container).bind("mouseout", function(){
                    hover_layer.css({
                        display: 'none'
                    });
                });

                $($container).bind("click", function(){
                    select_layer.css({
                        display: 'block',
                        width: hover_layer.width(),
                    })
                });

            }

            this.build();
        }
    };

    $.fn.rate.settings = {
        min_value: 0,
        max_value: 5,
        step_size: 1,
        symbols: {
            utf8: ['\u2606', '\u2605'],
        },
        selected_symbol_type: 'utf8',
        initial_value: 0,
    };

}(jQuery));
