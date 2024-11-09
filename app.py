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

    docs = list(db_client["questions"].find(
        {"url" : "https://uithub.com/TigerAppsOrg/PrincetonCourses?accept=text%2Fplain&maxTokens=10000000"},
    {"_id": 0}))

    for i in range(len(docs)):
        remainderDoc = docs[i]["question"]
        processedDoc = []
        for j in range(len(docs[i]["descriptions"])):
            line = docs[i]["lines"][j]
            questionSplit = remainderDoc.split(line)
            lineLength = len(line)
            processedDoc.append(questionSplit[0])
            processedDoc.append("Input(" + str(lineLength) + ")")
            remainderDoc = line.join(questionSplit[1:])
        processedDoc.append(remainderDoc)
        docs[i]["question"] = processedDoc

    return jsonify(docs)
@app.route('/api/solution', methods=['POST'])
def check_solution():
    data = request.get_json()
    question_number = data["question_number"]
    submission = data["submission"]

    question = db_client["questions"].find_one(
        {"url" : "https://uithub.com/TigerAppsOrg/PrincetonCourses?accept=text%2Fplain&maxTokens=10000000", 
         "question_number" : question_number},
    {"_id": 0})

    response = []
    for i in range(len(question["lines"])):
        response.append(question["lines"][i] == submission.get(str(i)))

    return jsonify(response)

@app.route('/api/hint', methods=['POST'])
def get_hint():
    data = request.get_json()
    question_number = data["question_number"]
    submission = data["submission"]
    previous_hints = data["previous_hints"]
    return jsonify({
        "hint": ""
    })

if __name__ == '__main__':
    app.run(host="localhost", port=6001, debug=True)