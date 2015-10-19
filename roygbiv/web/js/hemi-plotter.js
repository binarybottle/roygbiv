
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
    _this.divIDs = kwargs.divIDs || [kwargs.divID];
    _this.hemis = null;
    _this.callback = kwargs.callback || null;

    _this.__init__ = function() {
        _this.loadData()
    }

    _this.clearData = function() {
        if (!_this.hemis) return;
        for (var k in _this.hemis) {
            _this.hemis[k].clearBrain();
        }
        _this.hemis = null;
        _this.values = null;
    }

    _this.loadData = function(manifest_url) {
        _this.manifest_url = (manifest_url || _this.manifest_url) + '?' + (new Date());
        _this.clearData();
        console.log('oad')

        $.ajax({dataType: "json",
            url: this.manifest_url,
            data: function(data) {},
            error: function(err) { console.error('Load error'); },
            success: function(data, textStatus, jqXHR) {
                console.log(data)
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
                        console.log('a')
                        _this._loadDataMulti();
                        break;

                    otherwise:
                        if (_this.divIDs.length != 2)
                            throw sprintf("Must pass two divs for master/slave brain setup.")
                        _this._loadDataSlaveBrain();
                } // switch
            } // success
        }); // ajax
    }

    _this._loadDataSingle = function() {
        // Single brain with a single value; just fire it up as usual.
        _this.hemis = [new Brain({
            manifest: _this.manifest_url,
            divID: _this.divIDs[0],
            callback: _this.callback
        })];
    }

    _this._loadDataMulti = function() {
        _this.hemis = [];
        var value_keys = Object.keys(_this.values);
        var value_0 = _this.values[value_keys[0]]
        console.log(value_0)
        for (var hi in value_0) {
            console.log(hi)
            _this.hemis.push(new Brain({
                manifest: _this.manifest_url,
                divID: _this.divIDs[hi],
                callback: _this.callback,
                value_key: Object.keys(value_0)[hi]
            }));
        }
        console.log(_this.hemis)
    }

    _this._loadDataSlaveBrain = function() {
        // Master / slave relationship
        _this.hemis = {};
        _this.hemis['master'] = new Brain({  // Master
            manifest: _this.manifest_url,
            divID: _this.divIDs[0],
            callback: function(mesh) {
                // Use the values from the selected mesh
                // to recolor the slave brain
                var slave = _this.hemis['slave'];
                if (mesh) {
                    slave._this.values[mesh.name];
                    var stats_mesh = slave.selectMeshByName(mesh.name);
                    slave.objectPick(stats_mesh);
                }
                _this.callback(mesh);
            }
        });

        _this.hemis.push(new Brain({  // Slave
            manifest: _this.manifest_url,
            divID: _this.divIDs[1],
            callback: null
        }));
    }

    _this.__init__()
    return _this;
}
