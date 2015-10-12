import os
from argparse import ArgumentParser
from roygbiv import DATA_DIR


if __name__ == '__main__':
    parser = ArgumentParser(description="Set up data.")
    parser.add_argument('dataset', help="demo", choices=['demo', 'fsaverage'])
    parser.add_argument('--subjects-dir', default=os.environ.get('SUBJECTS_DIR'),
                        nargs='?')
    parser.add_argument('--hemi', help="hemisphere", choices=['lh', 'rh', 'both'],
                        nargs='?', default='lh')
    parser.add_argument('--atlas', help="atlas", choices=['desikan', 'destrieux', 'DKT'],
                        nargs='?', default='desikan')
    parser.add_argument('--sample-rate', help="sample rate",
                        nargs='?', default='1')
    parser.add_argument('--surface', help="surface", choices=['pial', 'inflated'],
                        nargs='?', default='pial')
    args = vars(parser.parse_args())

    if args['dataset'] == 'demo':
        import roygbiv.index_data_download

    elif args['hemi'] == 'both':
        from roygbiv import dump_vtks, DATA_DIR

        fsavg_path = os.path.join(args['subjects_dir'], args['dataset'])
        output_dir = os.path.join(DATA_DIR, args['dataset'], args['atlas'], args['surface'])

        # Do both hemis and pass an atlas tag.
        dump_vtks(fsavg_path, args['atlas'], surface=args['surface'],
                  output_dir=output_dir, sample_rate=float(args['sample_rate']))

    else:
        from roygbiv import freesurfer_annot_to_vtks, atlas2aparc, DATA_DIR

        fsavg_path = os.path.join(args['subjects_dir'], args['dataset'])
        surface_file = os.path.join(fsavg_path, 'surf', '%s.%s' % (args['hemi'], args['surface']))
        label_file = os.path.join(fsavg_path, 'label', atlas2aparc(args['atlas'], args['hemi']))
        output_dir = os.path.join(DATA_DIR, args['dataset'], args['atlas'], args['surface'])

        freesurfer_annot_to_vtks(surface_file=surface_file,
                                 label_file=label_file,
                                 output_stem = '%s_' % (args['hemi']),
                                 output_dir=output_dir,
                                 sample_rate=float(args['sample_rate']))
