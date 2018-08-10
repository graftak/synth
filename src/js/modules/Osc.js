function Osc(ctx, voiceId, id, tune) {
    this.ctx = ctx;
    this.voiceId = voiceId;
    this.id = id;
    this.oscillator = this.ctx.createOscillator();
    this.input = this.oscillator;
    this.output = this.oscillator;
    this.outputNode;

    this.setOscType('sawtooth');
    this.setDrift(0);
    this.setTune(tune);
    this.setFrequency(440);

    this.oscillator.start();
    
    var that = this;
    $(document)
        .bind('setOsc' + this.id + 'Enabled', function (_, val) {
            that.setEnabled(val);
        })
        .bind('voice' + this.voiceId + '_note_on', function (_, frequency, velocity) {
            that.setFrequency(frequency);
        })
        .bind('setDrift', function(_, val) {
            console.log(val);
            that.setDrift(val);
        })
        .bind('paramChangeOsc' + this.id, function(_, params) {
            that.setOscType(params.type);
        })
        .bind('patchLoaded', function(_, patchData) {
            that.setEnabled(patchData.osc[that.id].enabled);
            that.setOscType(patchData.osc[that.id].type);
            that.setDrift(patchData.osc.drift);
        });

    return this;
}

Osc.prototype = {
    Osc: Osc,
    setEnabled: function (value) {
        if (true === value) {
            this.connect(this.outputNode);
        } else {
            this.output.disconnect();
        }

        return this;
    },
    setFrequency: function (value) {
        var driftAmt = Math.random() * this.drift;

        this.oscillator.frequency.setValueAtTime(value + (driftAmt - this.drift / 2) / 10
            + this.tune / 10, this.ctx.currentTime);

        return this;
    },
    setOscType: function (value) {
        this.oscillator.type = value;

        return this;
    },
    setDrift: function (value) {
        this.drift = value;

        return this;
    },
    setTune: function (value) {
        this.tune = value;

        return this;
    },
    connect: function (node) {
        this.outputNode = node;
        this.output.connect(node.input);

        return this;
    }
}

module.exports = Osc;
