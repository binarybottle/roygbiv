import json
import os
import pandas
import requests

from . import DATA_DIR


def download_file(url, filename=None, chunk_size=8192, force=False):
    print(url, filename)

    if filename is None:
        filename = os.path.basename(url)
    base_dir = os.path.dirname(filename)

    if not os.path.exists(filename) or force:
        print("Downloading %s to %s" % (url, filename))
        resp = requests.get(url, stream=True)
        if base_dir and not os.path.exists(base_dir):
            os.makedirs(base_dir)

        with open(filename, 'wb') as fd:
            for chunk in resp.iter_content(chunk_size):
                fd.write(chunk)

    return filename

base_url = 'http://roygbiv.mindboggle.info/'

# Download the file list, then read it.
in_path = 'files_to_load.json'
url = base_url + in_path
out_dir = os.environ.get('ROYGBIV')
out_path = os.path.join(DATA_DIR, 'lh_' + in_path)  # dump json inside 'data'
will_download = not os.path.exists(out_path)
filename = download_file(url, out_path)
with open(filename, 'r') as fp:
    dataset = json.load(fp)

# Munge urls in json
if will_download:
    for k, v in dataset['filename'].items():
        dataset['filename'][k] = v[len('data/'):]  # Munge URLs
    with open(filename, 'w') as fp:
        json.dump(dataset, fp)

# Download all vtk files.
for k in dataset['filename']:
    in_path = 'data/' + dataset['filename'][k]
    url = base_url + in_path
    out_path = os.path.join(DATA_DIR, dataset['filename'][k])
    download_file(url, out_path)

# Download all extra data files.
for k in dataset['filename']:
    vtk_path = dataset['filename'][k]
    label_id = os.path.basename(vtk_path)[len('freesurfer_curvature_'):-4]
    in_path = ("data/mindboggled/Twins-2-1/tables/left_exploded_tables/" +
               label_id + ".0.csv")
    url = base_url + in_path
    out_path = os.path.join(DATA_DIR, in_path[len('data/'):])
    download_file(url, out_path)

    # Convert the data file to JSON
    json_path = out_path.replace('.csv', '.json')
    if not os.path.exists(json_path):
        df = pandas.read_csv(out_path)
        with open(json_path, 'w') as fp:
            df_dict = dict([(key, list(val))
                            for key, val in zip(df.keys(), df.values.T)])
            # Stack data
            data = dict(data=[], data_type=[])
            for ki, (key, val) in enumerate(df_dict.items()):
                data['data'] += val
                data['data_type'] += [key] * len(val)
            json.dump(data, fp)
