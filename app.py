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

@app.route('/api/question', methods=['POST'])
def get_question():
    data = request.get_json()
    question_number = data["question_number"]
    return jsonify({
        "title": "",
        "description": "",
        "question": ""
    })

@app.route('/api/solution', methods=['POST'])
def check_solution():
    data = request.get_json()
    question_number = data["question_number"]
    submission = data["submission"]
    return jsonify({
        "correct": False
    })

@app.route('/api/hint', methods=['POST'])
def get_hint():
    data = request.get_json()
    question_number = data["question_number"]
    previous_hints = data["previous_hints"]
    return jsonify({
        "hint": ""
    })

if __name__ == '__main__':
    app.run(host="localhost", port=6001, debug=True)