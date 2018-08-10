var Env = require("./EnvelopeGenerator");
var Osc = require("./Osc");
var Amp = require("./Amp");
var Compressor = require("./Compressor");
var Filter = require("./Filter");

function Voice(ctx, output, id) {
    this.ctx = ctx;
    this.output = output;
    this.id = id;

    this.detune = 0;
    this.filterFreqEnvMinValue = 0;
    this.filterFreqEnvAmt = 22000;
    this.filterFreqEnvAttack = .01;
    this.filterFreqEnvDecay = .3;
    this.filterFreqEnvSustain = .9;
    this.filterFreqEnvRelease = .4;

    this.osc1 = new Osc(this.ctx, this.id, 1, -this.detune);
    this.osc2 = new Osc(this.ctx, this.id, 2, this.detune);

    this.filterFreqEnv = new Env(this.ctx, this.id, 'filter_freq', true);
    this.filterFreqEnv.velocityEnabled = true;
    this.filterFreqEnv.setMinValue(this.filterFreqEnvMinValue);
    this.filterFreqEnv.setMaxValue(this.filterFreqEnvAmt);
    this.filterFreqEnv.setAttack(this.filterFreqEnvAttack);
    this.filterFreqEnv.setDecay(this.filterFreqEnvDecay);
    this.filterFreqEnv.setSustain(this.filterFreqEnvSustain);
    this.filterFreqEnv.setRelease(this.filterFreqEnvRelease);

    this.filter = new Filter(this.ctx, this.id, this.filterFreqEnv);

    this.amp = new Amp(this.ctx);
    this.ampEnv = new Env(this.ctx, this.id, 'amp');

    this.compressor = new Compressor(this.ctx);

    // Routing.
    this.osc1.connect(this.filter);
    this.osc2.connect(this.filter);
    this.filterFreqEnv.connect(this.filter.filter.frequency);
    this.filter.connect(this.compressor);
    this.compressor.connect(this.amp);
    this.ampEnv.connect(this.amp.amplitude);
    this.amp.connect(this.output);

    var that = this;

    $(document).bind('setDetune', function(_, value) {
        that.detune = value;
        that.detuneOscs();
    });

    $(document).bind('setFilterEnvAmount', function(_, value) {
        that.filterFreqEnvAmt = value;
        that.filterFreqEnv.setMaxValue(that.filterFreqEnvAmt);
    });

    // $(document).bind('showCompression', function (_) {
    //     console.log('Compression reduction: ' + that.compressor.reduction);
    // });

    $(document).bind('patchLoaded', function(_, patchData) {
        that.detune = patchData.osc.detune;
        that.detuneOscs();
    });
}

Voice.prototype = {
    Voice: Voice,
    detuneOscs: function () {
        this.osc1.setTune(-this.detune);
        this.osc2.setTune(this.detune);
        
        return this;
    },
    connect: function (node) {
        this.output.connect(node.input);

        return this;
    }
}

module.exports = Voice;
