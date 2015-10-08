'''
'''
from flask import Flask, request, send_from_directory


# set the project root directory as the static folder, you can set others.
app = Flask(__name__)

@app.route('/')
def default_page():
    return send_from_directory('web', 'index.html')

@app.route('/<path:path>')
def send_all(path):
    return send_from_directory('web', path)

if __name__ == "__main__":
    import threading
    import webbrowser

    threading.Timer(1.25, lambda: webbrowser.open('http://127.0.0.1:5000/')).start()

    app.debug = True
    app.run()
