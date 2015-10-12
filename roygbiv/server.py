import os

from flask import Flask, request, send_from_directory


_cur_dir = os.path.abspath(os.path.dirname(__file__))


def make_server(web_dir=os.path.join(_cur_dir, '..', 'web'),
                data_dir=os.path.join(_cur_dir, '..', 'web', 'data')):

    app = Flask(__name__)

    @app.route('/')
    def default_page():
        return send_from_directory(web_dir, 'index.html')

    @app.route('/data/<path:path>')
    def send_data(path):
        print(data_dir, path    )
        return send_from_directory(data_dir, path)

    @app.route('/<path:path>')
    def send_all(path):
        return send_from_directory(web_dir, path)

    return app


def launch_server(web_dir=os.path.join(_cur_dir, '..', 'web'),
                  data_dir=os.path.join(_cur_dir, '..', 'web', 'data'),
                  debug=False):
    app = make_server(web_dir=web_dir, data_dir=data_dir)
    app.debug = debug
    app.run()


if __name__ == '__main__':
    launch_server(debug=True)
