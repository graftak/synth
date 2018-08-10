var Cookie = require("./Cookie");
var Patch = require("./Patch");

function PatchManager(patch) {
    this.cookie = new Cookie();
    this.patch = patch || new Patch();
}

PatchManager.prototype = {
    PatchManager: PatchManager,
    create: function() {
        alert('created');

        return this;
    },
    retrieve: function(name) {
        if (name === undefined || name === '') {
            return false;
        }

        var stringified = this.cookie.getCookie('patch_' + name);
        
        if (stringified !== '') {
            this.patch.set(JSON.parse(stringified));

            jQuery.event.trigger('patchLoaded', this.patch.get());
        }

        return this;
    },
    update: function(name) {
        if (name !== undefined) {
            this.patch.name = name;
        }
        
        var stringified = JSON.stringify(this.patch.get());

        this.cookie.setCookie('patch_' + this.patch.name, stringified);
        this.saveNameToPatchIndex(this.patch.name);

        return this;
    },
    delete: function() {
        alert('deleted');

        return this;
    },
    saveNameToPatchIndex: function (name) {
        if (name === undefined || name === '') {
            return this;
        }

        index = this.getSavedPatchIndex() || [];

        if (index.indexOf(name) >= 0) {
            return this;
        }

        index.push(name);
        
        this.cookie.setCookie('patch_index', JSON.stringify(index));

        return this;
    },
    getSavedPatchIndex: function () {
        var indexJson = this.cookie.getCookie('patch_index');

        if (!indexJson) {
            return null;
        }

        var index = JSON.parse(indexJson);

        return index;
    },
    saveLastSelectedPatchName: function () {
        this.cookie.setCookie('last_selected_patch', this.patch.name);

        return this;
    },
    getLastSelectedPatchName: function () {
        var name = this.cookie.getCookie('last_selected_patch') || 'init';

        return name;
    }
}

module.exports = PatchManager;
