###To set up the main demo:

1. Run `index_data_download.py`. This will download sample data files.
2. Browse to `index.html`


###To set up the `two hemis` demo:
1. Install vtk
2. Install mindboggle (`pip install git+https://github.com/binarybottle/mindboggle.git`)
3. Run `two_hemis_data_generate.py` on your desired freesurfer subject
        * Use Freesurfer's `fsaverage` if you don't have your own data
4. (optional) Upload files to web server running roygbiv (if not running locally)
    1. Upload the directory containing the VTK parcels (`data/`)
    2. Upload `lh_files_to_load.json` and `rh_files_to_load.json`
5. Browse to `two_hemis.html`

###To create plots of your own brain parcels:
1. Install vtk
2. Install mindboggle (`pip install git+https://github.com/binarybottle/mindboggle.git`)
3. Run code from `annot2vtks.py` on your desired freesurfer subject
        * Use Freesurfer's `fsaverage` if you don't have your own data
4. (optional) Upload files to web server running roygbiv (if not running locally)
    1. Upload the directory containing the VTK parcels (`data/`)
    2. Upload `files_to_load.json`
5. Browse to `index.html`
