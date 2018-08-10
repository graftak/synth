function MidiManager() {
    this.monitor = {
        hideTimeoutMs: 1000
    }

    this.init();
}

MidiManager.prototype = {
    MidiManager: MidiManager,
    init: function () {
        var that = this;

        navigator.requestMIDIAccess()
            .then(function(access) {
                // Get lists of available MIDI controllers.
                const inputs = access.inputs.values();
                //const outputs = access.outputs.values();
    
                // Loop through available midi input devices.
                for (let i of inputs) {
                    that.connectInputDevice(i);
                }

                access.onstatechange = function(e) {
                    // Print information about the (dis)connected MIDI controller.
                    console.log(e.port.name, e.port.manufacturer, e.port.state);
                };
            });
    },
    connectInputDevice: function(device) {
        var that = this;

        // Add event handler to respond to incoming midi data.
        device.onmidimessage = function (e) {
            // Appearently my Digitakt sends a 'note on' CC with a velocity
            // of 0 on note off..?..
            if (e.data[0] === 144 && e.data[2] !== 0) {
                var $midiInputMonitor = $("#midi-input-monitor");
                
                // The second data value should be the CC number.
                var cc = e.data[1];
                var vel = e.data[2];

                var freq = 440 * Math.pow(2, (cc - 69) / 12);
                jQuery.event.trigger('note_on', [freq, vel]);
                
                // Show midi input monitor if not shown already.
                $midiInputMonitor.data('last-input-ts', Date.now()).show();

                // Auto-hide the monitor.
                setTimeout(function(hideTimeoutMs, $monitor) {
                    var nowTs = Date.now();
                    var lastInputTs = $monitor.data('last-input-ts');

                    if ((nowTs - lastInputTs) >= hideTimeoutMs) {
                        $monitor.data('last-input-ts', null).hide();
                    }
                }, that.monitor.hideTimeoutMs, that.monitor.hideTimeoutMs, $midiInputMonitor)

                // Add the midi data to the input monitor pane.
                $midiInputMonitor.append(e.data.join(' ') + '\n');

                // Scroll to the bottom of the midi input monitor.
                $midiInputMonitor[0].scrollTop = $midiInputMonitor[0].scrollHeight;
            } else if (e.data[0] === 128 || (e.data[0] === 144 && e.data[2] === 0)) {
                var cc = e.data[1];
                var freq = 440 * Math.pow(2, (cc - 69) / 12);

                jQuery.event.trigger('note_off', [freq]);

            }
        };

        device.onstatechange = function (e) {
            var d = e.port;

            console.log(d.manufacturer + ' ' + d.name + ' ' + d.state);

            switch (d.state) {
                case 'connected':
                    // ..
                    break;
                case 'disconnected':
                    $("#midi-" + d.type).find("option[value=" + d.id + "]").remove();
            }
        }

        // Add midi device to input or output UI list in settings.
        $("#midi-" + device.type).append(
            $('<option>')
                .val(device.id)
                .html(device.manufacturer + ' ' + device.name)
        );
    }
}

module.exports = MidiManager;
