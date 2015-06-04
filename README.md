# rater
A highly customizable rating widget that supports images, utf8 glyphs and other html elements!

[![Build Status](https://travis-ci.org/auxiliary/rater.svg?branch=master)](https://travis-ci.org/auxiliary/rater)

#### Simple usage

Depends on jQuery

```javascript
// Options
var options = {
    max_value: 10,
    step_size: 0.5,
    initial_value: 0,
    selected_symbol_type: 'utf8_star', // Must be a key from symbols
    cursor: 'default',
    readonly: false,
    change_once: false, // Determines if the rating can only be set once
    ajax_method: 'POST',
    url: 'http://localhost/test.php',
    additional_data: {} // Additional data to send to the server
}

$(".rating").rate(options);
```

The data-rate-value attribute is optional. The value will fallback to the initial
value in the settings and to 0 if not provided.
```html
<div class="rating" data-rate-value=6></div>
```

#### Useful methods

```javascript
$(".rating").rate("getValue");
$(".rating").rate("setValue");
$(".rating").rate("increment");
$(".rating").rate("decrement");
$(".rating").rate("getElement", layer_name, element_index);
$(".rating").rate("getLayers");
$(".rating").rate("setFace", value, face);
$(".rating").rate("removeFace", value);

// Set additional information to be sent with the ajax request
$(".rate2").rate("setAdditionalData", {id: 42});
$(".rate2").rate("getAdditionalData");
```

#### Useful events
```javascript
$(".rating").on("change", function(ev, data){
  console.log(data.from, data.to);
});

$(".rate2").on("updateSuccess", function(ev, data){
    console.log("This is a custom success event");
});

$(".rate2").on("updateError", function(ev, jxhr, msg, err){
    console.log("This is a custom error event");
});
```

#### Deleting

```javascript
$(".rating").rate("destroy");
$(".rating").remove(); //This will remove the elements from the DOM
```
