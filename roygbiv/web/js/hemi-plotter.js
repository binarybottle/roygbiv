
function HemiPlotter(kwargs) {
    /*
    schema:
    {
        filenames: ['1.vtk', '2.vtk', ...],
        names: ['area1', 'area2', ...],
        colors: ['color1', 'color2'...],
        values: [value1, value2, ...] OR
        OR
        values: [{'key1': value1_1, 'key2': value2_1},
                 {'key1', value1_2, 'key2': value2_2}]
        OR
        values: [{'area1': value1_1, 'area2': value2_1, ...},
                 {'area1': value1_2, 'area2': value2_2, ...}]
    }

    values can be:
    - a single value
    - dict of values.

    If values is:
        a single value - then plot it on the brain (e.g. Asymmetry index)
        two values - then plot two hemis (e.g. regressions on gender)
        three values - then plot three hemis (e.g. regressions on handedness)
        brain values - then plot a second brain (e.g. similarity matrix)

    kwargs that control behavior:

    manifest_url: url of the manifest to load props and choose
        which type of plotter will be used
    divIDs: one divID for each brain to be drawn.
    callback: callback function to share when any roi in a hemi is selected.
    */
    var _this = this;
    _this.manifest_url = kwargs.manifest_url;
    _this.data_url = kwargs.data_url || _this.manifest_url;
    _this.divIDs = kwargs.divIDs || [kwargs.divID];
    _this.hemis = null;
    _this.callback = kwargs.callback || null;

    _this.__init__ = function() {
        _this.loadBrains()
    }

    _this.clearData = function() {
        if (!_this.hemis) return;
        for (var k in _this.hemis) {
            _this.hemis[k].clearBrain();
        }
        _this.hemis = null;
        _this.values = null;
    }

*/
    _this.loadBrains = function(kwargs) {
        kwargs = kwargs || {}
        _this.manifest_url = (kwargs.manifest_url || _this.manifest_url) + '?' + (new Date());
        _this.data_url = (kwargs.data_url || _this.data_url) + '?' + (new Date());

        $.ajax({dataType: "json",
            url: _this.data_url + "?" + (new Date()),
            data: function(data) {},
            error: function(err) { console.error('Load error'); },
            success: function(data, textStatus, jqXHR) {
                var keys = Object.keys(data["values"]);
                var value_0 = data["values"][keys[0]];
                var value_len = isarr(value_0) ? value_0.length : 1;

                _this.values = data["values"];
                switch (value_len) {
                    case 1:
                        if (_this.divIDs.length != value_len)
                            throw sprintf("Length of values must match length of divIDs %d != %d",
                                          value_len, _this.divIDs.length);
                        _this._loadDataSingle();
                        break;

                    case 2:
                    case 3:
                        if (_this.divIDs.length != value_len)
                            throw sprintf("Length of values must match length of divIDs %d != %d",
                                          value_len, _this.divIDs.length);
                        _this._loadDataMulti();
                        break;

                    default:
                        if (_this.divIDs.length != 2)
                            throw sprintf("Must pass two divs for master/slave brain setup.");
                        _this._loadDataSlaveBrain();
                        break;
                } // switch
            } // success
        }); // ajax
    }

    _this._loadDataSingle = function() {
        // Single brain with a single value; just fire it up as usual.
        if (_this.hemis == null) {
            _this.hemis = [new Brain({
                manifest_url: _this.manifest_url,
                data_url: _this.data_url,
                divID: _this.divIDs[0],
                callback: _this.callback
            })];
        } else {
            _this.hemis[0].loadBrain({
                manifest_url: _this.manifest_url,
                data_url: _this.data_url
            });
        }
    }

    _this._loadDataMulti = function() {
        var value_keys = Object.keys(_this.values);
        var value_0 = _this.values[value_keys[0]];

        _this.hemis = _this.hemis || {};
        for (var hi in value_0) {  // Loop over roi_keys
            if (_this.hemis[hi] === undefied) {
                _this.hemis[hi] = new Brain({
                    manifest_url: _this.manifest_url,
                    data_url: _this.data_url,
                    divID: _this.divIDs[hi],
                    callback: _this.callback,
                    value_key: Object.keys(value_0)[hi]
                });
            } else {
                _this.hemis[hi].loadBrain({
                    manifest_url: _this.manifest_url,
                    data_url: _this.data_url
                });
            }
        }
    }

    _this._loadDataSlaveBrain = function() {
        // Master / slave relationship

        _this.hemis = _this.hemis || {};
        if (_this.hemis['master'] === undefined) {
            _this.hemis['master'] = new Brain({  // Master
                manifest_url: _this.manifest_url,
                data_url: _this.data_url,
                divID: _this.divIDs[0],
                callback: function(mesh) {
                    // Use the values from the selected mesh
                    // to recolor the slave brain
                    var slave = _this.hemis['slave'];
                    if (mesh) {
                        var values = _this.values[mesh.roi_key];
                        var colors = _this.colors[mesh.roi_key];
                        var stats_mesh = slave.selectMeshByName(mesh.name);
                        slave.objectPick(stats_mesh);

                        for (var key in slave.meshes) {
                            if (colors[key] === undefined) {
                                console.log('no color for ', key)
                                continue;
                            }
                            try {
                                set_mesh_color(slave.meshes[key], colors[key]);
                            } catch (e) {
                                console.log(e);
                            }
                        }  // for
                    }  // if
                    _this.callback(mesh);
                }  // callback
            });  // brain
        } else {
            _this.hemis['master'].loadBrain({
                manifest_url: _this.manifest_url,
                data_url: _this.data_url
            });
        }

        if (_this.hemis['slave'] === undefined) {
            _this.hemis['slave'] = new Brain({  // Slave
                manifest_url: _this.manifest_url,
                data_url: _this.data_url,
                divID: _this.divIDs[1],
                callback: null
            });
        } else {
            _this.hemis['slave'].loadBrain({
                manifest_url: _this.manifest_url,
                data_url: _this.data_url
            });
        }
    }

    _this.__init__()
    return _this;
}
