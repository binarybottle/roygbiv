###To set up the demo:

1. Run `setup_demo.py`. This will download sample data files.
2. In your browser, open index.html.


###To change the brain parcels:

1. Install vtk
2. Install mindboggle (`pip install git+https://github.com/binarybottle/mindboggle.git`)
3. Run `annot2vtks.py` on your desired freesurfer subject
        * Use Freesurfer's `fsaverage` if you don't have your own data
4. (optional) Upload files to web server running roygbiv (if not running locally)
    1. Upload the directory containing the VTK parcels (`data/`)
    2. Upload `files_to_load.json`
