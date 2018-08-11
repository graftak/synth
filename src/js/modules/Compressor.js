function Compressor(synth) {
    this.synth = synth;
    
    this.compressor = this.synth.ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-50, this.synth.ctx.currentTime);
    this.compressor.knee.setValueAtTime(40, this.synth.ctx.currentTime);
    this.compressor.ratio.setValueAtTime(20, this.synth.ctx.currentTime);
    this.compressor.attack.setValueAtTime(0, this.synth.ctx.currentTime);
    this.compressor.release.setValueAtTime(0.05, this.synth.ctx.currentTime);

    this.input = this.compressor;
    this.output = this.compressor;
}

Compressor.prototype = {
    Compressor: Compressor,
    connect: function(node) {
        this.output.connect(node.input);
    },
    disconnect: function() {
        this.output.disconnect();
    }
}

module.exports = Compressor;
