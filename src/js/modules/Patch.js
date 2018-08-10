function Patch() {
    this.name = 'init';

    this.amp = {
        env: {
            attack: 0,
            decay: 0,
            sustain: 0,
            release: 0
        }
    }

    this.osc = {
        drift: 0,
        detune: 0,
        1: {
            enabled: true,
            type: 'sawtooth'
        },
        2: {
            enabled: false,
            type: 'square'
        }
    };

    this.filter = {
        frequency: 5000,
        q: 0,
        env: {
            amt: 0,
            attack: 0,
            decay: 0,
            sustain: 0,
            release: 0
        }
    }
}

Patch.prototype = {
    Patch: Patch,
    set: function(data) {
        this.name = data.name;
        this.amp = data.amp;
        this.osc = data.osc;
        this.filter = data.filter;

        return this;
    },
    get: function() {
        return {
            name: this.name,
            amp: this.amp,
            osc: this.osc,
            filter: this.filter
        }
    }
}

module.exports = Patch;
