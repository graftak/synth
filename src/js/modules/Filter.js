function Filter(synth, voiceId, env) {
    this.synth = synth;
    this.voiceId = voiceId;
    this.env = env;
    this.filter = this.synth.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.input = this.filter;
    this.output = this.filter;
    
    this.setFreq(0);
    this.setQ(0);
    this.setGain(15);

    var that = this;
    $(document).bind('setFilterFreq', function (_, freq) {
        that.setFreq(freq);
    });

    $(document).bind('setFilterQ', function (_, q) {
        that.setQ(q);
    });

    $(document).bind('patchLoaded', function(_, patchData) {
        if (patchData.filter !== undefined) {
            that.setFreq(patchData.filter.frequency);
            that.setQ(patchData.filter.q);
            that.setEnvAmt(patchData.filter.env.amt);
        }
    });
}

Filter.prototype = {
    Filter: Filter,
    setFreq(amt) {
        this.filter.frequency.setValueAtTime(amt, this.synth.ctx.currentTime);
        this.env.setMinValue(amt);
    },
    setQ(amt) {
        //console.log('q: ' + amt);
        this.filter.Q.setValueAtTime(amt, this.synth.ctx.currentTime);
    },
    setGain(amt) {
        this.filter.gain.setValueAtTime(amt, this.synth.ctx.currentTime);
    },
    setEnvAmt(amt) {
        this.env.setMaxValue(amt);
    },
    connect: function(node) {
        this.output.connect(node.input);
    },
    disconnect: function() {
        this.output.disconnect();
    }
}

module.exports = Filter;
