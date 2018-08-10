function EnvelopeGenerator(ctx, voiceId, name, velocityEnabled) {
    this.ctx = ctx;
    this.voiceId = voiceId;
    this.name = name;
    this.node = {};

    this.freq = 0;

    this.attack = 0.01;
    this.decay = .4;
    this.sustain = .5;
    this.release = .4;
    
    this.minValue = 0;
    this.maxValue = 1;

    this.velocityEnabled = false;
    this.defaultVelocity = 100;

    var that = this;
    $(document)
        .bind('voice' + this.voiceId + '_note_on', function (_, freq, vel) {
            that.noteOn(freq, vel);
        })
        .bind('note_off', function (_, frequency) {
            // Only respond to events for this particular voice (which
            // is identified by the frequency).
            if (that.freq === frequency) {
                that.noteOff();
            }
        })
        .bind('env_' + this.name + '_attack_change', function (_, val) {
            // console.log('env attack ' + that.name + ': ' + val);
            that.setAttack(val);
        })
        .bind('env_' + this.name + '_decay_change', function (_, val, expVal) {
            // console.log('env decay ' + that.name + ': ' + val, expVal);
            // console.log('env decay exp ' + that.name + ': ' + expVal);
            that.setDecay(expVal);
        })
        .bind('env_' + this.name + '_sustain_change', function (_, val) {
            // console.log('env sustain ' + that.name + ': ' + val);
            that.setSustain(val);
        })
        .bind('env_' + this.name + '_release_change', function (_, val) {
            // console.log('env release ' + that.name + ': ' + val);
            that.setRelease(val);
        })
        .bind('patchLoaded', function(_, patchData) {
            if (that.name === 'amp') {
                that.setAttack(patchData.amp.env.attack);
                that.setDecay(patchData.amp.env.decay);
                that.setSustain(patchData.amp.env.sustain);
                that.setRelease(patchData.amp.env.release);
            }

            if (that.name === 'filter_freq') {
                that.setAttack(patchData.filter.env.attack);
                that.setDecay(patchData.filter.env.decay);
                that.setSustain(patchData.filter.env.sustain);
                that.setRelease(patchData.filter.env.release);
            }
        });
}

EnvelopeGenerator.prototype = {
    EnvelopeGenerator: EnvelopeGenerator,
    setMinValue: function (val) {
        this.minValue = val;
    },
    setMaxValue: function(val) {
        this.maxValue = val;
    },
    setSustain: function (val) {
        this.sustain = val;
    },
    setAttack: function (amt) {
        this.attack = amt;
    },
    setDecay: function (amt) {
        this.decay = amt;
    },
    setRelease: function (amt) {
        this.release = amt;
    },
    noteOn: function (freq, velocity) {
        var maxAmt;

        now = this.ctx.currentTime;

        // The note frequency is the identifier for this envelope's voice (used
        // to handle a note_off event later).
        this.freq = freq;

        var decay = this.decay;

        if (decay <= 0) {
            decay = 0.000001;
        }

        var minValue = this.minValue;

        if (minValue <= 0) {
            minValue = 0.000001;
        }

        if (this.velocityEnabled) {
            maxAmt = minValue + (this.maxValue * (velocity / 128));

            if (maxAmt > this.maxValue) {
                maxAmt = this.maxValue;
            }
        } else {
            maxAmt = this.maxValue;
        }

        var sustAmt = minValue + (this.sustain * maxAmt);

        if (sustAmt <= 0) {
            sustAmt = 0.000001;
        }

        this.node.cancelScheduledValues(now);
        
        // console.log(this.name + ' env: attack=' + this.attack + ' decay=' + decay 
        // + ' release=' + this.release + ' min=' + minValue + ' max=' + maxAmt + ' sustain=' + sustAmt);
        
        t1 = now + (this.attack / 3);

        this.node.setValueAtTime(minValue, now);
        this.node.setTargetAtTime(maxAmt, now, this.attack);
        this.node.setTargetAtTime(sustAmt, now + this.attack, decay);
        // this.node.linearRampToValueAtTime(maxAmt * .8, t1);
        // this.node.exponentialRampToValueAtTime(maxAmt, now + this.attack);
        // this.node.exponentialRampToValueAtTime(sustAmt, now + this.attack + this.decay);
    },
    noteOff: function () {
        now = this.ctx.currentTime;
        var currValue = this.node.value;
        var minValue = this.minValue;
        var release = this.release;

        if (minValue <= 0) {
            minValue = 0.000001;
        }

        if (release <= 0) {
            release = 0.000001;
        }

        this.node.cancelScheduledValues(now);
        this.node.setValueAtTime(currValue, now);
        this.node.exponentialRampToValueAtTime(minValue, now + release);

    },
    connect: function (node) {
        this.node = node;
    }
}

module.exports = EnvelopeGenerator;
