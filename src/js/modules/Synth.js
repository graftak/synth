require("jquery-knob");
require("@webcomponents/webcomponentsjs");

WebAudioControlsOptions = {
    useMidi: 1,
    knobDiameter: 36,
    sliderWidth: 16,
    sliderHeight: 96,
    switchWidth: 40,
    switchHeight: 20
};

require("./../lib/webaudio-controls/webaudio-controls");

var Tuna = require("tunajs");
var QwertyHancock = require("qwerty-hancock");
var MidiManager = require("./MidiManager");
var PatchManager = require("./PatchManager");
var VoiceManager = require("./VoiceManager");

function Synth() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.polyphony = 6;
    this.midiManager = new MidiManager();
    this.patchManager = new PatchManager();

    return this;
}

Synth.prototype = {
    Synth: Synth,
    boot: function () {
        var that = this;
        var currPatchName = this.patchManager.getLastSelectedPatchName();

        if (currPatchName === undefined || currPatchName === 'undefined') {
            currPatchName = 'init';
        }
        
        this.loadPatch(currPatchName);
        this.populatePatchList(currPatchName);
        this.setUI();

        var keyboard = new QwertyHancock({
            id: 'keyboard',
            height: 150,
            octaves: 5,
            startNote: 'A1',
            whiteNotesColour: 'white',
            blackNotesColour: 'black',
            hoverColour: '#f3e939'
        });
    
        keyboard.keyDown = function (note, freq) {
            jQuery.event.trigger('note_on', [freq, 80]);
        };
    
        keyboard.keyUp = function (note, freq) {
            jQuery.event.trigger('note_off', [freq]);
        };

        $("#synth")
            .on('click', "#settings-toggle", function(e) {
                var newMargin, shown;
                
                shown = $(e.target).data('shown') === true;
    
                if (shown === true) {
                    newMargin = -$("#settings").height();
                } else {
                    newMargin = 0;
                }
                
                $("#settings").css('margin-top', newMargin);
                $(e.target).data('shown', !shown);
            })
            .on('change', ".osc-type", function(e) {
                var patchData = that.patchManager.patch.get();
                var id = $(e.target).data('osc-id');
                
                patchData.osc[id].type = e.target.value;
                jQuery.event.trigger('paramChangeOsc' + id, patchData.osc[id]);
            })
            .on('click', "#mute", function(e) {
                var currState = $(this).data('state');
    
                that.mute(!currState);
    
                $(this)
                    .data('state', !currState)
                    .toggleClass('muted', !currState)
                    .html(!currState ? 'Unmute' : 'Mute');
            })
            .on('keyup', "#patch-name", function (e) {
                var key = e.which || e.keyCode;

                e.preventDefault();
                e.stopPropagation();

                if (key === 13) {
                    that.savePatch();
                }
            })
            .on('click', "#save-patch", function(e) {
                that.savePatch();
            })
            .on('change', "#patches", function(e) {
                that.loadPatch($("#patches > option:selected").val());
                that.setUI();
                that.patchManager.saveLastSelectedPatchName();
            });

        var sliders = document.getElementsByTagName('webaudio-slider');
        
        for (var i = 0; i < sliders.length; i++) {
            var slider = sliders[i];

            slider.addEventListener('input', function(e) {
                var envName = $(e.target).closest(".env").data('env-name');
                var sliderName = e.target.className;
                var patchData = that.patchManager.patch.get();
                var expVal = Math.round(((Math.pow(e.target.value, e.target.max) / e.target.max)) * 1000) / 1000;
                
                if (envName === 'filter_freq') {
                    patchData.filter.env[sliderName] = expVal;
                }

                if (envName === 'amp') {
                    patchData.amp.env[sliderName] = expVal;
                }

                jQuery.event.trigger("env_" + envName + "_" + sliderName + "_change", [e.target.value, expVal]);
            });
        }

        var knobs = document.getElementsByTagName('webaudio-knob');

        for (var i = 0; i < knobs.length; i++) {
            var knob = knobs[i];

            knob.addEventListener('input', function(e) {
                var val = e.target.value;
                var patchData = that.patchManager.patch.get();
                
                switch ($(e.target).attr('id')) {
                    case 'drift':
                        patchData.osc.drift = val;
                        jQuery.event.trigger('setDrift', [val]);
                        break;
                    case 'detune':
                        patchData.osc.detune = val;
                        jQuery.event.trigger('setDetune', [val]);
                        break;
                    case 'filter-freq':
                        patchData.filter.frequency = val;
                        jQuery.event.trigger('setFilterFreq', [val]);
                        break;
                    case 'filter-q':
                        patchData.filter.q = val;

                        jQuery.event.trigger('setFilterQ', [val]);
                        jQuery.event.trigger('showCompression');
                        break;
                }
            });
        }

        var switches = document.getElementsByTagName('webaudio-switch');

        for (var i = 0; i < switches.length; i++) {
            var sw = switches[i];
            
            sw.addEventListener('change', function(e) {
                var val = e.target.value;
                var patchData = that.patchManager.patch.get();
                
                switch ($(e.target).attr('class')) {
                    case 'osc-enabled':
                        var oscId = $(e.target).data('osc-id');
console.log(oscId, val);
                        patchData.osc[oscId].enabled = (val === 1);
                        jQuery.event.trigger('setOsc' + oscId + 'Enabled', [(val === 1)]);
                        break;
                }
            });
        }

        this.tuna = new Tuna(this.ctx);

        // this.effect = new this.tuna.PingPongDelay({
        //     wetLevel: 0.8, //0 to 1
        //     feedback: 0.5, //0 to 1
        //     delayTimeLeft: 300, //1 to 10000 (milliseconds)
        //     delayTimeRight: 300 //1 to 10000 (milliseconds)
        // });

        this.effect = new this.tuna.Convolver({
            highCut: 44100,                         //20 to 22050
            lowCut: 100,                             //20 to 22050
            dryLevel: 1,                            //0 to 1+
            wetLevel: .3,                            //0 to 1+
            level: 1,                               //0 to 1+, adjusts total output of both wet and dry
            impulse: "impulse/Five Columns Long.wav",    //the path to your impulse response
            bypass: 0
        });

        this.effect.connect(this.ctx.destination);
        this.input = this.effect;
        this.voiceManager = new VoiceManager(this, this.input, this.polyphony);

        return this;
    },
    savePatch: function () {
        var name = $("#patch-name").val();
    
        if (name === '') {
            name = $("#patches > option:selected").val();
        }

        if (name === undefined || name === '') {
            name = 'init';
        }

        this.patchManager.update(name);
        this.populatePatchList(name);

        $("#patch-name").val('');
        $("#patches > option[value=" + name + "]").prop('selected', true);

        $("#keyboard").focus();

        return this;
    },
    loadPatch: function (name) {
        if (name !== undefined) {
            this.patchManager.retrieve(name);
        }

        return this;
    },
    populatePatchList: function(selectedName) {
        var patches = this.patchManager.getSavedPatchIndex();

        $("#patches").html('');

        if (patches !== null) {
            for (i = 0; i < patches.length; i++) {
                $("#patches").append('<option value="' + patches[i] + '">'
                    + patches[i] + '</option>');
            }

            if (selectedName === undefined) {
                selectedName = 'init';
            }

            $("#patches").find('option[value="' + selectedName + '"]')
                .prop('selected', true);
        }
    },
    setUI: function () {
        var patchData = this.patchManager.patch.get();

        $(".osc-type[data-osc-id=1] > option[value=" + patchData.osc[1].type + "]")
            .prop('selected', true);
        $(".osc-type[data-osc-id=2] > option[value=" + patchData.osc[2].type + "]")
            .prop('selected', true);
        
        $(".osc-enabled").each(function () {
            var oscId = $(this).data("osc-id");

            $(this)[0].setValue(patchData.osc[oscId].enabled ? 1 : 0);
        });

        $("#drift")[0].setValue(patchData.osc.drift, false);
        $("#detune")[0].setValue(patchData.osc.detune, false);

        $("#filter-freq")[0].setValue(patchData.filter.frequency, false);
        $("#filter-q")[0].setValue(patchData.filter.q, false);
        $("#filter-env-amount")[0].setValue(patchData.filter.env.amt, false);

        var $env = $(".env[data-env-name=filter_freq]");
        $env.find(".attack")[0].setValue(patchData.filter.env.attack, false);
        $env.find(".decay")[0].setValue(patchData.filter.env.decay, false);
        $env.find(".sustain")[0].setValue(patchData.filter.env.sustain, false);
        $env.find(".release")[0].setValue(patchData.filter.env.release, false);

        var $env = $(".env[data-env-name=amp]");
        $env.find(".attack")[0].setValue(patchData.amp.env.attack, false);
        $env.find(".decay")[0].setValue(patchData.amp.env.decay, false);
        $env.find(".sustain")[0].setValue(patchData.amp.env.sustain, false);
        $env.find(".release")[0].setValue(patchData.amp.env.release, false);
    },
    mute: function (state) {
        if (true === state) {
            this.effect.disconnect();
        } else {
            this.effect.connect(this.ctx.destination);
        }

        return this;
    },
    connect: function (node) {
        this.effect.connect(node);

        return this;
    }
}

module.exports = Synth;
