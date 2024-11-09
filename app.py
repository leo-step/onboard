from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from clients import db_client
from urllib.parse import urlparse, parse_qs

load_dotenv()

app = Flask(__name__, static_folder='dist', static_url_path='/')

CORS(app, resources={r"/*": {"origins": "*"}})

# ========== UI ==========

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('dist', filename)

@app.route('/')
def index():
    return send_from_directory('dist', 'index.html')

if __name__ == '__main__':
    app.run(host="localhost", port=6001, debug=True)