var Voice = require("./Voice");

function VoiceManager(synth, output, polyphony) {
    this.synth = synth;
    this.output = output;
    this.polyphony = polyphony;
    
    this.init();
}

VoiceManager.prototype = {
    VoiceManager: VoiceManager,
    init: function () {
        this.voices = [];
        this.currVoiceId = -1;

        for (var i = 0; i < this.polyphony; i++) {
            this.voices.push(new Voice(this.synth, this.output, i));
        }
        
        var that = this;
        $(document).bind('note_on', function (_, frequency, velocity) {
            jQuery.event.trigger('voice' + that.getNextVoiceId() + '_note_on', [frequency, velocity]);
        });

        return this;
    },
    getNextVoiceId: function () {
        var nextVoiceId = this.currVoiceId + 1;

        if (nextVoiceId >= this.polyphony) {
            nextVoiceId = 0;
        }

        this.currVoiceId = nextVoiceId;

        return nextVoiceId;
    }
}

module.exports = VoiceManager;
