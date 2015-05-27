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
        if (options === undefined || typeof options === 'object')
        {
            return this.each(function(){
                if (!$.data(this, "rate"))
                {
                    $.data(this, "rate", new Rate(this, options));
                }
            });
        }
        else if (typeof options === 'string')
        {
            var args = arguments;
            var returns;
            this.each(function(){
                var instance = $.data(this, "rate");
                if (instance instanceof Rate && typeof instance[options] === 'function')
                {
                    returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
                }
                if (options === 'destroy')
                {
                    $(instance.element).off();
                    $.data(this, 'rate', null);
                }
            });

            return returns !== undefined ? returns : this;
        }
    };

    function Rate(element, options)
    {
        this.element = element;
        this.settings = $.extend({}, $.fn.rate.settings, options);
        this.set_faces = {}; // value, symbol pairs
        this.build();
    }

    Rate.prototype.build = function()
    {
        this.layers = {};
        this.value = 0;
        this.raise_select_layer = false;

        /*
         * Calculate the selected width based on the initial value
         */
        var selected_width = 0;
        if ($(this.element).attr("data-rate-value"))
        {
            selected_width = $(this.element).attr("data-rate-value")
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
        $(this.element).on("mousemove", $.proxy(this.hover, this));
        $(this.element).on("click", $.proxy(this.select, this));
        $(this.element).on("mouseout", $.proxy(this.mouseout, this));

        this.value = this.toValue(selected_width * $(base_layer).textWidth());
    }

    /*
     * Function to add a layer
     */
    Rate.prototype.addLayer = function(layer_name, visible_width, symbol, visible)
    {
        var layer_body = "<div>";
        for (var i = 0; i < this.settings.max_value; i++)
        {
            layer_body += "<span>" + symbol + "</span>";
        }
        layer_body += "</div>";
        var layer = $(layer_body).addClass("rate-" + layer_name).appendTo(this.element);

        $(layer).css({
            width: visible_width * $(layer).textWidth() + "px",
            overflow: 'hidden',
            position: 'absolute',
            top: 0,
            display: visible ? 'block' : 'none'
        });
        $(this.element).css({
            height: $(layer).height(),
            position: 'relative',
            cursor: this.settings.cursor,
        });

        return layer;
    }

    Rate.prototype.updateServer = function()
    {
        if (this.settings.url != undefined)
        {
            $.ajax({
                url: this.settings.url,
                type: this.settings.ajax_method,
                data: $.extend({}, { value: this.getValue() }, this.settings.additional_data),
                success: $.proxy(function(data){
                    $(this.element).trigger("updateSuccess", [data]);
                }, this),
                error: $.proxy(function(jxhr, msg, err){
                    $(this.element).trigger("updateError", [jxhr, msg, err]);
                }, this)
            });
        }
    }

    Rate.prototype.getValue = function()
    {
        return this.value;
    }

    Rate.prototype.hover = function(ev)
    {
        var x = ev.pageX - $(this.element).offset().left;
        var val = this.toValue(x);

        if (val != this.value)
        {
            this.raise_select_layer = false;
        }

        if (!this.raise_select_layer && !this.settings.readonly)
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
    Rate.prototype.select = function(ev)
    {
        if (!this.settings.readonly)
        {
            var old_value = this.getValue();
            var x = ev.pageX - $(this.element).offset().left;
            var selected_width = this.toWidth(this.toValue(x));
            this.setValue(this.toValue(selected_width));
            this.raise_select_layer = true;
        }
    }

    Rate.prototype.mouseout = function()
    {
        this.layers.hover_layer.css({display: 'none'});
        this.layers.select_layer.css({display: 'block'});
    }

    /*
     * Takes a width (px) and returns the value it resembles
     */
    Rate.prototype.toWidth = function(val)
    {
        return val / this.settings.max_value * this.layers.base_layer.textWidth();
    }

    /*
     * Takes a value and calculates the width of the selected/hovered layer
     */
    Rate.prototype.toValue = function(width)
    {
        var val = width / this.layers.base_layer.textWidth() * this.settings.max_value;
        // Make sure the division doesn't cause some small numbers added by
        // comparing to a small arbitrary number.
        if (Math.abs(val - Math.floor(val) < 0.00005))
        {
            val = Math.floor(val);
        }
        val = (Math.ceil(val / this.settings.step_size)) * this.settings.step_size;

        val = val > this.settings.max_value ? this.settings.max_value : val;
        return val;
    }

    Rate.prototype.getElement = function(layer_name, index)
    {
        return $(this.element).find(".rate-" + layer_name + " span").eq(index - 1);
    }

    Rate.prototype.getLayers = function()
    {
        return this.layers;
    }

    Rate.prototype.setFace = function(value, face)
    {
        this.set_faces[value] = face;
    }

    Rate.prototype.setAdditionalData = function(data)
    {
        this.settings.additional_data = data;
    }

    Rate.prototype.getAdditionalData = function()
    {
        return this.settings.additional_data;
    }

    Rate.prototype.removeFace = function(value)
    {
        delete this.set_faces[value];
    }

    Rate.prototype.setValue = function(value)
    {
        if (!this.settings.readonly)
        {
            if (value < 0)
            {
                value = 0;
            }
            else if (value > this.settings.max_value)
            {
                value = this.settings.max_value;
            }

            var old_value = this.getValue();
            this.value = value;

            /*
             * About to change event, should support prevention later
             */
            var change_event = $(this.element).trigger("change", {
                "from": old_value,
                "to": this.value
            });

            /*
             * Set/Reset faces
             */
            var index_value = Math.ceil(this.value);
            if (this.set_faces.hasOwnProperty(index_value))
            {
                var face = "<div>" + this.set_faces[index_value] + "</div>";
                $(face).appendTo(this.element).css({
                    display: 'inline-block'
                });
            }

            var width = this.toWidth(this.value);
            this.layers.select_layer.css({
                display: 'block',
                width: width,
                height: this.layers.base_layer.css("height")
            });
            this.layers.hover_layer.css({
                display: 'none',
                height: this.layers.base_layer.css("height")
            });
            $(this.element).attr("data-rate-value", this.value);

            if (this.settings.change_once)
            {
                this.settings.readonly = true;
            }
            this.updateServer();
        }
    }

    Rate.prototype.increment = function()
    {
        this.setValue(this.getValue() + this.settings.step_size);
    }

    Rate.prototype.decrement = function()
    {
        this.setValue(this.getValue() - this.settings.step_size);
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
                '\u263A',
                '\u1F603',
                '\u1F606',
            ],
        },
        selected_symbol_type: 'utf8_star', // Must be a key from symbols
        cursor: 'default',
        readonly: false,
        change_once: false, // Determines if the rating can only be set once
        ajax_method: 'POST',
        additional_data: {} // Additional data to send to the server
    };

}(jQuery, window));
