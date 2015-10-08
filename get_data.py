import os
from argparse import ArgumentParser

from roygbiv import freesurfer_annot_to_vtks, dump_vtks, atlas2aparc


if __name__ == '__main__':
    parser = ArgumentParser(description="Set up data.")
    parser.add_argument('dataset', help="demo", choices=['demo', 'fsaverage'],
                        nargs='?', default='fsaverage')
    parser.add_argument('--subjects-dir', default=os.environ.get('SUBJECTS_DIR'),
                        nargs='?')
    parser.add_argument('--hemi', help="hemisphere", choices=['lh', 'rh', 'both'],
                        nargs='?', default='lh')
    parser.add_argument('--atlas', help="atlas", choices=['desikan', 'destrieux', 'DKT'],
                        nargs='?', default='desikan')
    parser.add_argument('--sample-rate', help="sample rate",
                        nargs='?', default='1')
    args = vars(parser.parse_args())

    if args['dataset'] == 'demo':
        import roygbiv.index_data_download

    elif args['hemi'] == 'both':
        fsavg_path = os.path.join(args['subjects_dir'], args['dataset'])

        # Do both hemis and pass an atlas tag.
        dump_vtks(fsavg_path, args['atlas'], sample_rate=float(args['sample_rate']))

    else:
        fsavg_path = os.path.join(args['subjects_dir'], args['dataset'])
        surface_file = os.path.join(fsavg_path, 'surf', '%s.pial' % args['hemi'])
        label_file = os.path.join(fsavg_path, 'label', atlas2aparc(args['atlas'], args['hemi']))
        freesurfer_annot_to_vtks(surface_file=surface_file,
                                 label_file=label_file,
                                 sample_rate=float(args['sample_rate']))
