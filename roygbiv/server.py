import os

from flask import Flask, send_from_directory

from . import HTML_DIR, DATA_DIR

_cur_dir = os.path.abspath(os.path.dirname(__file__))


def make_server(web_dir=HTML_DIR, data_dir=DATA_DIR):

    app = Flask(__name__)

    @app.route('/<path:dataset>/<path:atlas>/<path:surface>/data/<path:path>')
    def send_data_specific(dataset, atlas, surface, path):
        cur_dir = os.path.join(data_dir, dataset, atlas, surface)
        return send_from_directory(cur_dir, path)

    @app.route('/<path:dataset>/<path:atlas>/<path:surface>/<path:html_file>')
    def send_allspecific(dataset, atlas, surface, html_file):
        if html_file == '':
            html_file = 'index.html'
        return send_from_directory(web_dir, html_file)

    # Generic
    @app.route('/data/<path:path>')
    def send_data(path):
        return send_from_directory(data_dir, path)

    @app.route('/')
    @app.route('/<path:path>')
    def send_all(path=''):
        if path == '':
            path = 'index.html'
        return send_from_directory(web_dir, path)

    return app


def launch_server(web_dir=HTML_DIR, data_dir=DATA_DIR, debug=False):
    app = make_server(web_dir=web_dir, data_dir=data_dir)
    app.debug = debug
    app.run()


if __name__ == '__main__':
    launch_server(debug=True)
