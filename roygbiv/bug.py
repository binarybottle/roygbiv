import glob
import os
import simplejson
import threading
import webbrowser

import flask

from mindboggle.mio.vtks import freesurfer_surface_to_vtk, freesurfer_annot_to_vtk, explode_scalars
from mindboggle.guts.mesh import decimate_file


subj_path = os.environ['SUBJECTS_DIR']
fsavg_path = os.path.join(subj_path, 'fsaverage')

surf_file = os.path.join(fsavg_path, 'surf', 'lh.pial')
label_file = os.path.join(fsavg_path, 'label', 'lh.aparc.annot')

surf_vtk = 'lh_surf.vtk'
label_vtk = 'lh_label.vtk'

# Convert surface and labels to vtk, break into ROIs
print('Generating vtks')
if not os.path.exists(surf_vtk):
    freesurfer_surface_to_vtk(surf_file, surf_vtk)
if not os.path.exists(label_vtk):
    freesurfer_annot_to_vtk(label_file, surf_vtk, label_vtk)

# Break into ROIs
if True:
    # downsample_vtk(label_vtk, sample_rate=sample_rate)
    explode_scalars(label_vtk, output_stem='lh_roi_')
roi_dict = dict([(i, roi_vtk) for i, roi_vtk in enumerate(glob.glob('lh_roi_*.vtk'))])

    # Downsample
if False:
    print('Downsampling vtks')
    for roi_vtk in roi_dict.values():
        decimate_file(roi_vtk, reduction=0.5, output_vtk=roi_vtk,
                      save_vtk=True, smooth_steps=100)
    for roi_vtk in roi_dict.values():
        explode_scalars(roi_vtk, output_stem='lh_roi_')

# Create manifest file
with open('lh.json', 'wb') as fp:
    simplejson.dump(dict(filename=roi_dict), fp)

# Create index.html
with open('bug.html', 'wb') as fp:
    fp.write("""
<!DOCTYPE html>
<html lang="en">
    <head>
        <title>three.js webgl - loaders - vtk loader</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0">
        <link rel="stylesheet" type="text/css" href="http://cseweb.ucsd.edu/~bcipolli/roygbiv/style.css" />

        <script src="http://cseweb.ucsd.edu/~bcipolli/roygbiv/js/three.js"></script>
        <script src="http://cseweb.ucsd.edu/~bcipolli/roygbiv/js/Projector.js"></script>
        <script src="http://cseweb.ucsd.edu/~bcipolli/roygbiv/js/Detector.js"></script>
        <script src="http://cseweb.ucsd.edu/~bcipolli/roygbiv/js/TrackballControls.js"></script>
        <script src="http://cseweb.ucsd.edu/~bcipolli/roygbiv/js/VTKLoader.js"></script>
        <script src="http://cseweb.ucsd.edu/~bcipolli/roygbiv/js/jquery.min.js"></script>
        <script src="http://cseweb.ucsd.edu/~bcipolli/roygbiv/js/angular.min.js"></script>

        <script src="http://cseweb.ucsd.edu/~bcipolli/roygbiv/brain.js"></script>
    </head>

    <body>
        <div ng-app="navigator" ng-controller="NavigateController" ng-strict-di>
            <div id="nav-brain">
            </div>
        </div>

        <script>
            angular.module('navigator', [])
            .controller('NavigateController', ['$scope', function($scope) {
                $scope.brain = new Brain({
                    divID: "nav-brain",
                    manifest: 'lh.json'
                });
            }]);
        </script>
    </body>
</html>
""")

# Launch web server
app = flask.Flask('foo')

@app.route('/<path:path>')
def send_all(path):
    return flask.send_from_directory('.', path)

threading.Timer(2.5, lambda: webbrowser.open('http://127.0.0.1:5121/bug.html')).start()
#
#print('Launching server.')
#app.debug = True
app.run(port=5121)
