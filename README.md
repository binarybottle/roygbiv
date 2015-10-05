roygbiv (Roy G. Brain Image Viewer) is an interactive browser-based visualization of cortical surfaces.

Instructions for running demos are below. To run demos locally, install the `flask` Python package.


###To set up the main demo locally:

1. Run `index_data_download.py`. This will download sample data files.
2. Run `server.py` to launch a light-weight web server
3. Browse to `index.html`


###To set up the `two hemis` demo locally:
1. Install vtk
2. Install mindboggle (`pip install git+https://github.com/binarybottle/mindboggle.git`)
3. Run `two_hemis_data_generate.py` on your desired freesurfer subject
        * Use Freesurfer's `fsaverage` if you don't have your own data
4. Run `server.py` to launch a light-weight web server
5. Browse to `two_hemis.html`

###To create a demo using your own brain data:
1. Install vtk
2. Install mindboggle (`pip install git+https://github.com/binarybottle/mindboggle.git`)
3. Run code from `annot2vtks.py` on your desired freesurfer subject
        * Use Freesurfer's `fsaverage` if you don't have your own data
4. Run `server.py` to launch a light-weight web server
5. Browse to `index.html`

###To deploy your files remotely
1. Create the data (see above)
2. Upload all files to your remote web server (html, json, css, data)
3. Browse to `http://your_web_server/your_roygbiv_directory/index.html` 

