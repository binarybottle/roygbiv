'''
'''
import threading
import webbrowser

from roygbiv.server import launch_server


threading.Timer(1.25, lambda: webbrowser.open('http://127.0.0.1:5000/')).start()

launch_server(debug=True)
