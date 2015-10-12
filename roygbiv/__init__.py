"""
Convenience functions and sample script for converting
Freesurfer annot files to a set of VTKs (and manifest file)
for use with the roygbiv web tool.
"""
import glob
import os
import json

import numpy as np

import nibabel as nib


HTML_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'web'))
DATA_DIR = os.path.join(HTML_DIR, 'data')


def downsample_vtk(vtk_file, sample_rate):
    """Sample rate: number between 0 and 1."""
    from mindboggle.mio.vtks import read_vtk, write_vtk
    from mindboggle.guts.mesh import decimate_file

    if (sample_rate < 0 or sample_rate > 1):
        raise ValueError('0 <= sample_rate <= 1; you input %f' % sample_rate)

    # Downsample
    decimate_file(vtk_file, reduction=1 - sample_rate, output_vtk=vtk_file, save_vtk=True, smooth_steps=0)

    # Hack to re-save in
    vtk_data = read_vtk(vtk_file)
    write_vtk(vtk_file, *vtk_data[:-2])


def add_metadata(metadata, json_file='files_to_load.json',
                 output_dir=DATA_DIR):
    """Additional metadata to insert into the manifest file."""

    json_filepath = os.path.join(output_dir, json_file)
    with open(json_filepath, 'rb') as fp:
        old_metadata = json.load(fp)
    old_metadata.update(metadata)
    with open(json_filepath, 'wb') as fp:
        json.dump(old_metadata, fp)


def freesurfer_annot_to_vtks(surface_file, label_file, output_stem='',
                             json_file='files_to_load.json',
                             sample_rate=1,
                             force=False, verbose=True, output_dir=DATA_DIR):
    """ Splits a surface file into vtk files based on regions in the label file.
    """
    def print_verbose(*args):
        """Print only if verbose True"""
        if verbose:
            print(args)

    #
    vtk_dir = os.path.join(output_dir, os.path.dirname(output_stem))

    # Make the output directory
    if not os.path.exists(output_dir):
        os.makedirs(vtk_dir)

    # Convert the surface file to vtk
    if os.path.splitext(surface_file)[1] == '.vtk':
        surface_vtk = surface_file
    else:
        surface_vtk = os.path.join(vtk_dir,
                                   os.path.basename(surface_file) + '.vtk')
        if force or not os.path.exists(surface_vtk):
            print_verbose('Converting surface to vtk: %s' % surface_file)
            from mindboggle.mio.vtks import freesurfer_surface_to_vtk
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
            from mindboggle.mio.vtks import freesurfer_annot_to_vtk
            freesurfer_annot_to_vtk(label_file, surface_vtk, label_vtk)
        labels, _, names = nib.freesurfer.read_annot(label_file)

        used_labels = np.unique(labels[labels >= 1])
        used_names = np.asarray(names)[used_labels]
        print_verbose("Unused areas: %s" % (set(names) - set(used_names)))
        names = used_names
        labels = used_labels

    # Expand the data file to multiple vtks
    print_verbose('Expanding vtk data to multiple files.')
    from mindboggle.mio.vtks import explode_scalars
    explode_output_stem = os.path.join(output_dir, output_stem)
    explode_scalars(label_vtk, output_stem=explode_output_stem)
    output_vtks = filter(lambda p: p not in [surface_vtk, label_vtk],
                         glob.glob(explode_output_stem + '*.vtk'))

    print_verbose('Downsampling vtk files.')
    for vtk_file in output_vtks:
        downsample_vtk(vtk_file, sample_rate=sample_rate)

    if json_file:
        print_verbose('Creating download manifest file.')
        if labels is None:
            names = labels = [os.path.splitext(vtk_file)[0] for vtk_file in output_vtks]

        vtk_dict = dict([(name, output_stem + '%s.vtk' % lbl)
                         for lbl, name in zip(labels, names)])

        json_file = os.path.join(output_dir, json_file)
        with open(json_file, 'wb') as fp:
            json.dump(dict(filename=vtk_dict), fp)

    return json_file

def atlas2aparc(atlas_name, hemi=None):
    """ Find freesurfer atlas aparc from atlas key.

    Valid keys: desikan, destrieux, dkt

    if `hemi` is specified, it a valid filename will be returned;
    otherwise a format string will be returned."""

    if atlas_name == 'desikan':
        annot_file_template = '%s.aparc.annot'
    elif atlas_name == 'destrieux':
        annot_file_template = '%s.aparc.a2009s.annot'
    elif atlas_name == 'dkt':
        annot_file_template = '%s.aparc.DKTatlas40.annot'
    else:
        raise ValueError('Unknown atlas: %s' % atlas_name)

    return annot_file_template % (hemi if hemi else '%s')


def dump_vtks(subject_path, atlas_name, sample_rate=1, surface='pial', force=False, output_dir=DATA_DIR):
    """ Convenience function to dump vtk parcels for each hemisphere."""

    all_data = dict(filename=dict())
    for hemi in ['lh', 'rh']:
        surface_file = os.path.join(subject_path, 'surf', '%s.%s' % (hemi, surface))
        label_file = os.path.join(subject_path, 'label',
                                  atlas2aparc(atlas_name, hemi=hemi))
        json_file = freesurfer_annot_to_vtks(surface_file, label_file,
                                             output_stem='%s_' % hemi,
                                             json_file='%s_files_to_load.json' % hemi,
                                             sample_rate=sample_rate,
                                             force=force,
                                             output_dir=output_dir)
        with open(json_file, 'rb') as fp:
            hemi_files = json.load(fp)['filename']
            for key, val in hemi_files.items():
                hemi_key = '%s_%s' % (hemi, key)
                all_data['filename'][hemi_key] = val

    # Create a unified json file for lh/rh
    with open('files_to_load.json', 'wb') as fp:
        json.dump(all_data, fp)
