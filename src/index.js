require("bootstrap");
require("./index.scss");
var tplIndex = require("./index.handlebars");
var Synth = require("./js/modules/Synth");

document.addEventListener("DOMContentLoaded", function() {
    $("body").append(tplIndex);

    var synth = new Synth().boot();
});
