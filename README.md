# rater
A rating widget using utf8 glyphs and low dependencies

#### Simple usage

```javascript
$(".rating").rate(options);
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
