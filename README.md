To set up the demo:
1. Run `setup_demo.py`. This will download sample data files.
2. In your browser, open index.html.

To change the brain parcels:
1. Create your own parcel VTK files
    a. Install vtk
    b. Install mindboggle (`pip install git+https://github.com/binarybottle/mindboggle.git`)
    c. Run `annot2vtks.py` on your desired freesurfer subject
        * Use Freesurfer's `fsaverage` if you don't have your own data
2. Upload your VTK parcels to some directory.
3. Update `files_to_load.json` to point to your VTK parcels.

To change what happens when a parcel is clicked:
1. Create a function that accepts labelID and color.
2. Do your thing!
3. In index.html, import your function and replace `do_boxplot` with your function name.
