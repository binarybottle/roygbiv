'''
'''
from flask import Flask, request, send_from_directory


# set the project root directory as the static folder, you can set others.
def launch_server(web_dir='web', data_dir='web/data', debug=False):
    app = Flask(__name__)

    @app.route('/')
    def default_page():
        return send_from_directory(web_dir, 'index.html')

    @app.route('/data/<path:path>')
    def send_data(path):
        return send_from_directory(data_dir, path)

    @app.route('/<path:path>')
    def send_all(path):
        return send_from_directory(web_dir, path)

    app.debug = debug
    app.run()


if __name__ == "__main__":
    import threading
    import webbrowser

    threading.Timer(1.25, lambda: webbrowser.open('http://127.0.0.1:5000/')).start()

    launch_server(debug=True)
