import json
import os

from annot2vtks import freesurfer_annot_to_vtks


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


def dump_vtks(subject_path, atlas_name, sample_rate=1, force=False):
    """ Convenience function to dump vtk parcels for each hemisphere."""

    all_data = dict(filename=dict())
    for hemi in ['lh', 'rh']:
        surface_file = os.path.join(subject_path, 'surf', '%s.pial' % hemi)
        label_file = os.path.join(subject_path, 'label',
                                  atlas2aparc(atlas_name, hemi=hemi))
        json_file = '%s_files_to_load.json' % hemi
        freesurfer_annot_to_vtks(surface_file, label_file,
                                 output_stem='data/%s_' % hemi,
                                 json_file=json_file,
                                 sample_rate=sample_rate,
                                 force=force)
        with open(json_file, 'rb') as fp:
            hemi_files = json.load(fp)['filename']
            for key, val in hemi_files.items():
                hemi_key = '%s_%s' % (hemi, key)
                all_data['filename'][hemi_key] = val

    # Create a unified json file for lh/rh
    with open('files_to_load.json', 'wb') as fp:
        json.dump(all_data, fp)


if __name__ == '__main__':
    subj_path = os.environ['SUBJECTS_DIR']
    fsavg_path = os.path.join(subj_path, 'fsaverage')

    # Do both hemis and pass an atlas tag.
    dump_vtks(fsavg_path, 'destrieux', sample_rate=0.1, force=False)
