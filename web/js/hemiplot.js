/*
	console.log("doing brainplot");
	var brain = Brain(divID);
	brain.objectPicker = function(e) { alert(mesh.name); };  // remove interactivity
*/
var stats_brain = null;

function do_hemiplot(divID, mesh) {
	/* Draws a box plot, given the labelID, color */
	if (stats_brain === null) {
        stats_brain = new Brain({
            divID: divID,
            manifest: 'data/rh_files_to_load.json'
        });
	}
	stats_mesh = stats_brain.selectMeshByName(mesh.name);
	stats_brain.objectPick(stats_mesh);
};

