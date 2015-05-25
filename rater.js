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
            this.layers = {};

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
                    position: 'relative',
                    cursor: this.settings.cursor,
                });

                return layer;
            }

            this.hover = function(ev)
            {
                var x = ev.pageX - $($container).offset().left;
                var val = this.toValue(x);
                if ($($container).attr("data-rate-value") != val && !this.settings.readonly)
                {
                    var visible_width = this.toWidth(val);
                    this.layers.select_layer.css({display: 'none'});
                    this.layers.hover_layer.css({
                        width: visible_width,
                        display: 'block'
                    });
                }
            }

            this.select = function(ev)
            {
                if (!this.settings.readonly)
                {
                    var x = ev.pageX - $($container).offset().left;
                    var selected_width = this.toWidth(this.toValue(x));
                    this.layers.select_layer.css({
                        display: 'block',
                        width: selected_width,
                    });
                    this.layers.hover_layer.css({
                        display: 'none',
                    });
                    $($container).attr("data-rate-value", this.toValue(selected_width));
                    if (this.settings.change_once)
                    {
                        this.settings.readonly = true;
                    }
                }
            }

            this.toWidth = function(val)
            {
                return val / this.settings.max_value * this.layers.base_layer.textWidth();
            }

            this.toValue = function(width)
            {
                var val = width / this.layers.base_layer.textWidth() * this.settings.max_value;
                val = (Math.ceil(val / this.settings.step_size)) * this.settings.step_size;
                val = val > this.settings.max_value ? this.settings.max_value : val;
                return val;
            }

            this.build = function()
            {
                /*
                 * Calculate the selected width based on the initial value
                 */
                var selected_width = 0;
                if ($($container).attr("data-rate-value"))
                {
                    selected_width = $($container).attr("data-rate-value")
                        / this.settings.max_value;
                }

                /*
                 * Making the three main layers (base, select, hover)
                 */
                var base_layer = this.addLayer("base-layer", 1, this.settings.symbols[
                    this.settings.selected_symbol_type]["base"], true);

                var select_layer = this.addLayer("select-layer", selected_width,
                    this.settings.symbols[this.settings.selected_symbol_type]["selected"], true);

                var hover_layer = this.addLayer("hover-layer", 0, this.settings.symbols[
                    this.settings.selected_symbol_type]["hover"], false);

                this.layers["base_layer"] = base_layer;
                this.layers["select_layer"] = select_layer;
                this.layers["hover_layer"] = hover_layer;

                /*
                 * Bind the container to some events
                 */
                $($container).bind("mousemove", $.proxy(this.hover, this));
                $($container).bind("click", $.proxy(this.select, this));
                $($container).bind("mouseout", function(){
                    hover_layer.css({display: 'none'});
                    select_layer.css({display: 'block'});
                });
            }

            this.build();
        }
    };

    $.fn.rate.settings = {
        min_value: 0,
        max_value: 10,
        step_size: 1,
        initial_value: 0,
        symbols: {
            utf8_star: {
                base: '\u2606',
                hover: '\u2605',
                selected: '\u2605',
            },
            utf8_hexagon: {
                base: '\u2B21',
                hover: '\u2B22',
                selected: '\u2B22',
            },
        },
        selected_symbol_type: 'utf8_star',
        cursor: 'default',
        readonly: false,
        change_once: true
    };

}(jQuery));
