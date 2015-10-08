import json
import os
import pandas
import requests


def download_file(url, filename=None, chunk_size=8192, force=False):
    if filename is None:
        filename = os.path.basename(url)
    base_dir = os.path.dirname(filename)

    if not os.path.exists(filename) or force:
        print "Downloading %s to %s" % (url, filename)
        resp = requests.get(url, stream=True)
        if base_dir and not os.path.exists(base_dir):
            os.makedirs(base_dir)

        with open(filename, 'wb') as fd:
            for chunk in resp.iter_content(chunk_size):
                fd.write(chunk)

    return filename

base_url = 'http://roygbiv.mindboggle.info'

# Download the file list, then read it.
filename = download_file(base_url + '/files_to_load.json')
with open(filename, 'r') as fp:
    dataset = json.load(fp)

# Download all vtk files.
for k in dataset['filename']:
    out_path = dataset['filename'][k]
    url = base_url + '/' + out_path
    download_file(url, out_path)

# Download all extra data files.
for k in dataset['filename']:
    vtk_path = dataset['filename'][k]
    label_id = os.path.basename(vtk_path)[len('freesurfer_curvature_'):-4]
    out_path = "data/mindboggled/Twins-2-1/tables/left_exploded_tables/" + label_id + ".0.csv"
    url = base_url + '/' + out_path
    download_file(url, out_path)

    # Convert the data file to JSON
    json_path = out_path.replace('.csv', '.json')
    df = pandas.read_csv(out_path)
    with open(json_path, 'wb') as fp:
        df_dict = dict([(key, list(val)) for key, val in zip(df.keys(), df.values.T)])
        # Stack data
        data = dict(data=[], data_type=[])
        for ki, (key, val) in enumerate(df_dict.items()):
            data['data'] += val
            data['data_type'] += [key] * len(val)

        json.dump(data, fp)
