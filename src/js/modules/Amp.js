function Amp(synth) {
    this.synth = synth;
    this.gain = this.synth.ctx.createGain();
    this.gain.gain.value = 0;
    this.input = this.gain;
    this.output = this.gain;
    this.amplitude = this.gain.gain;
}

Amp.prototype = {
    Amp: Amp,
    connect: function(node) {
        this.output.connect(node.input);
    },
    disconnect: function() {
        this.output.disconnect();
    }
}

module.exports = Amp;
