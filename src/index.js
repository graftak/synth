require("bootstrap");
require("./index.scss");
var tplIndex = require("./index.handlebars");
var Synth = require("./js/modules/Synth");

document.addEventListener("DOMContentLoaded", function() {
    var synth = new Synth();

    $("body").append(tplIndex);

    synth.boot();
});
