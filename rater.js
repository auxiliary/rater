;(function ($, window){
    $.fn.textWidth = function(){
        var html_calc = $('<span>' + $(this).html() + '</span>');
        html_calc.css('font-size',$(this).css('font-size')).hide();
        html_calc.prependTo('body');
        var width = html_calc.width();
        html_calc.remove();
        return width;
    }

    $.fn.rate = function(options){

        var args = arguments;
        if (options === undefined || typeof options === 'object')
        {
            return this.each(function(){
                if (!$.data(this, "rate"))
                {
                    $.data(this, "rate", new rate(this, options));
                }
            });
        }
        else if (typeof options === 'string')
        {
            var returns;

            this.each(function(){
                var instance = $.data(this, "rate");
                if (instance instanceof rate)
                {
                    returns = instance[options].apply(Array.prototype.slice.call(args, 1));
                    console.log(instance[options]);
                }

                if (options === 'destroy')
                {
                    $.data(this, 'rate', null);
                }
            });

            return returns !== undefined ? returns : this;
        }

        function rate(container, options){
            // Extend the default settings with user options
            this.settings = $.extend({}, $.fn.rate.settings, options);
            this.layers = {};
            this.value = 0;

            /*
             * Function to add a layer
             */
            this.addLayer = function(layer_name, visible_width, symbol, visible)
            {
                var layer_body = "<div>";
                for (var i = 0; i < this.settings.max_value; i++)
                {
                    layer_body += "<span>" + symbol + "</span>";
                }
                layer_body += "</div>";
                var layer = $(layer_body).addClass("rate-" + layer_name).appendTo(container);

                $(layer).css({
                    width: visible_width * $(layer).textWidth() + "px",
                    overflow: 'hidden',
                    position: 'absolute',
                    top: 0,
                    display: visible ? 'block' : 'none'
                });
                $(container).css({
                    height: $(layer).height(),
                    position: 'relative',
                    cursor: this.settings.cursor,
                });

                return layer;
            }

            this.updateServer = function()
            {
                if (this.settings.url != undefined)
                {
                    $.ajax({
                        url: this.settings.url,
                        type: this.settings.ajax_method,
                        data: {value: this.getValue()},
                        success: $.proxy($.fn.rate.updateSuccessCallback, this),
                        error: $.proxy($.fn.rate.updateErrorCallback, this)
                    });
                }
                else
                {
                    console.log("No URL set for rater.");
                }
            }

            this.getValue = function()
            {
                return this.value;
            }

            this.hover = function(ev)
            {
                var x = ev.pageX - $(container).offset().left;
                var val = this.toValue(x);
                if (($(container).attr("data-rate-value") != val) && !this.settings.readonly)
                {
                    var visible_width = this.toWidth(val);
                    this.layers.select_layer.css({display: 'none'});
                    this.layers.hover_layer.css({
                        width: visible_width,
                        display: 'block'
                    });
                }
            }

            /*
             * Event for when a rating has been selected (clicked)
             */
            this.select = function(ev)
            {
                if (!this.settings.readonly)
                {
                    var old_value = this.getValue();
                    var x = ev.pageX - $(container).offset().left;
                    var selected_width = this.toWidth(this.toValue(x));
                    this.value = this.toValue(selected_width);

                    /*
                     * About to change event, should support prevention later
                     */
                    var change_event = $(container).trigger("change", {
                        "from": old_value,
                        "to": this.value
                    });

                    this.layers.select_layer.css({
                        display: 'block',
                        width: selected_width,
                    });
                    this.layers.hover_layer.css({
                        display: 'none',
                    });
                    $(container).attr("data-rate-value", this.value);

                    if (this.settings.change_once)
                    {
                        this.settings.readonly = true;
                    }
                    this.updateServer();
                }
            }

            this.mouseout = function()
            {
                this.layers.hover_layer.css({display: 'none'});
                this.layers.select_layer.css({display: 'block'});
            }

            /*
             * Takes a width (px) and returns the value it resembles
             */
            this.toWidth = function(val)
            {
                return val / this.settings.max_value * this.layers.base_layer.textWidth();
            }

            /*
             * Takes a value and calculates the width of the selected/hovered layer
             */
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
                if ($(container).attr("data-rate-value"))
                {
                    selected_width = $(container).attr("data-rate-value")
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

                /* var face_layer = this.addLayer("face-layer", 1, this.settings
                    .symbols[this.settings.face_layer_symbol_type][0], true); */

                this.layers["base_layer"] = base_layer;
                this.layers["select_layer"] = select_layer;
                this.layers["hover_layer"] = hover_layer;

                /*
                 * Bind the container to some events
                 */
                $(container).bind("mousemove", $.proxy(this.hover, this));
                $(container).bind("click", $.proxy(this.select, this));
                $(container).bind("mouseout", $.proxy(this.mouseout, this));

                this.value = this.toValue(selected_width * $(base_layer).textWidth());
            }

            this.build();
        }
    };

    $.fn.rate.updateSuccessCallback = function()
    {

    }
    $.fn.rate.updateErrorCallback = function(jxhr, msg, err)
    {
        console.log("Error in updating the rating value");
    }

    $.fn.rate.settings = {
        max_value: 10,
        step_size: 0.5,
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
            utf8_emoticons: [
                '\u1F601',
                '\u1F603',
                '\u1F606',
            ],
        },
        selected_symbol_type: 'utf8_star', // Must be a key from symbols
        face_layer_symbol_type: 'utf8_emoticons',
        cursor: 'default',
        element_class_name: 'rate-base-layer-element',
        readonly: false,
        change_once: false, // Determines if the rating can only be set once
        ajax_method: 'POST',
    };

}(jQuery, window));
