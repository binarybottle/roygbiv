"""
Convenience functions and sample script for converting
Freesurfer annot files to a set of VTKs (and manifest file)
for use with the roygbiv web tool.
"""
import glob
import json
import os

import numpy as np

import nibabel as nib
from mindboggle.mio.vtks import (freesurfer_surface_to_vtk,
                                 freesurfer_annot_to_vtk, explode_scalars,
                                 read_vtk, write_vtk)
from mindboggle.guts.mesh import decimate_file


def downsample_vtk(vtk_file, sample_rate):
    """Sample rate: number between 0 and 1."""

    if (sample_rate < 0 or sample_rate > 1):
        raise ValueError('0 <= sample_rate <= 1; you input %f' % sample_rate)

    # Downsample
    decimate_file(vtk_file, reduction=1 - sample_rate, output_vtk=vtk_file, save_vtk=True, smooth_steps=0)

    # Hack to re-save in 
    vtk_data = read_vtk(vtk_file)
    write_vtk(vtk_file, *vtk_data[:-2])

def freesurfer_annot_to_vtks(surface_file, label_file, output_stem='data/',
                             json_file='files_to_load.json', sample_rate=1,
                             force=False, verbose=True):
    """ Splits a surface file into vtk files based on regions in the label file.
    """
    def print_verbose(*args):
        """Print only if verbose True"""
        if verbose:
            print(args)

    vtk_dir = os.path.join(os.getcwd(), os.path.dirname(output_stem))

    # Make the output directory
    if not os.path.exists(vtk_dir):
        os.makedirs(vtk_dir)

    # Convert the surface file to vtk
    if os.path.splitext(surface_file)[1] == '.vtk':
        surface_vtk = surface_file
    else:
        surface_vtk = os.path.join(vtk_dir,
                                   os.path.basename(surface_file) + '.vtk')
        if force or not os.path.exists(surface_vtk):
            print_verbose('Converting surface to vtk: %s' % surface_file)
            freesurfer_surface_to_vtk(surface_file, surface_vtk)

    # Convert the data file to vtk
    if os.path.splitext(label_file)[1] == '.vtk':
        label_vtk = label_file
        labels, names = None, None
    else:
        label_vtk = os.path.join(vtk_dir,
                                 os.path.basename(label_file) + '.vtk')
        if force or not os.path.exists(label_vtk):
            print_verbose('Converting data to vtk: %s' % label_file)
            freesurfer_annot_to_vtk(label_file, surface_vtk, label_vtk)
        labels, _, names = nib.freesurfer.read_annot(label_file)

        used_labels = np.unique(labels[labels >= 1])
        used_names = np.asarray(names)[used_labels]
        print_verbose("Unused areas: %s" % (set(names) - set(used_names)))
        names = used_names
        labels = used_labels

    # Expand the data file to multiple vtks
    print_verbose('Expanding vtk data to multiple files.')
    explode_scalars(label_vtk, output_stem=output_stem)
    output_vtks = filter(lambda p: p not in [surface_vtk, label_vtk],
                         glob.glob(output_stem + '*.vtk'))

    print_verbose('Downsampling vtk files.')
    for vtk_file in output_vtks:
        downsample_vtk(vtk_file, sample_rate=sample_rate)

    if json_file:
        print_verbose('Creating download manifest file.')
        if labels is None:
            names = labels = [os.path.splitext(vtk_file)[0] for vtk_file in output_vtks]

        vtk_dict = dict([(name, output_stem + '%s.vtk' % lbl)
                         for lbl, name in zip(labels, names)])
        with open(json_file, 'wb') as fp:
            json.dump(dict(filename=vtk_dict), fp)


if __name__ == '__main__':
    subj_path = os.environ['SUBJECTS_DIR']
    fsavg_path = os.path.join(subj_path, 'fsaverage')

    surface_file = os.path.join(fsavg_path, 'surf', 'lh.pial')
    label_file = os.path.join(fsavg_path, 'label', 'lh.aparc.annot')
    freesurfer_annot_to_vtks(surface_file=surface_file,
                             label_file=label_file,
                             output_stem='data/',
                             sample_rate=0.25,
                             force=False)
