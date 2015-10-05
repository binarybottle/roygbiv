'''
'''
from flask import Flask, request, send_from_directory

# set the project root directory as the static folder, you can set others.
app = Flask(__name__)

@app.route('/<path:path>')
def send_all(path):
    return send_from_directory('.', path)

if __name__ == "__main__":
    import threading
    import webbrowser

    threading.Timer(1.25, lambda: webbrowser.open('http://127.0.0.1:5000/index.html')).start()

    app.debug = True
    app.run()
