from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from clients import db_client
from prompts import select_hints, give_hint_solution
from utils import openai_json_response
from prompts import select_candidate_files,  give_files_list, create_problem_context, send_context
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
import requests
import re
from threading import Lock

load_dotenv()

app = Flask(__name__, static_folder='dist', static_url_path='/')

CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory('dist', filename)

@app.route('/')
def index():
    return send_from_directory('dist', 'index.html')

def parse_files(file_data):
    file_pattern = r"(/[\w/\.\-]+):\n-+(.*?)\n-+"
    files_dict = {}
    matches = re.findall(file_pattern, file_data, re.DOTALL)
    
    for match in matches:
        filename, content = match
        files_dict[filename] = content.strip()
    
    return files_dict

def get_url(data):
    # return "https://uithub.com/TigerAppsOrg/PrincetonCourses?accept=text%2Fplain&maxTokens=10000000"
    print(data["url"])
    return data["url"] + "?accept=text%2Fplain&maxTokens=10000000"

@app.route('/api/initialize', methods=['POST'])
def initialize():
    data = request.get_json()
    url = get_url(data)
    response = requests.get(url)

    db_client["questions"].delete_many({"url": url})

    parsed_data = parse_files(response.text)
    files = list(parsed_data.keys())
    
    response = openai_json_response([
        select_candidate_files(),
        give_files_list(files)
    ])

    file_names = response["files"]
    question_counter = {"value": 0}
    lock = Lock()

    def process_file(file_name, parsed_data, url, db_client, counter, lock):
        # print("Processing", file_name)
        file_content = parsed_data[file_name]
        
        # Simulate calling the OpenAI API
        responseLLM = openai_json_response([
            create_problem_context(),
            send_context(file_content)
        ], model="gpt-4o")
        
        responseLLM["question"] = file_content
        filtered_data = list(filter(lambda x: x[1] in responseLLM["question"], zip(responseLLM["descriptions"], responseLLM["lines"])))
        filtered_description, filtered_lines = zip(*filtered_data) if filtered_data else ([], [])
        responseLLM["descriptions"] = list(filtered_description)
        responseLLM["lines"] = list(filtered_lines)
        responseLLM["url"] = url

        # Only assign and increment question_number if insertion happens
        if len(responseLLM["lines"]) > 0:
            with lock:
                responseLLM["question_number"] = counter["value"]
                counter["value"] += 1
            db_client["questions"].insert_one(responseLLM)

    with ThreadPoolExecutor(max_workers=6) as executor:
        futures = {
            executor.submit(process_file, file_names[i], parsed_data, url, db_client, question_counter, lock): i
            for i in range(len(file_names))
        }

        for future in tqdm(as_completed(futures), total=len(futures)):
            try:
                future.result()
            except Exception as e:
                print(f"Error processing file {futures[future]}: {e}")
                pass

    return '', 200

@app.route('/api/question', methods=['POST'])
def get_question():
    data = request.get_json()
    url = get_url(data)
    docs = list(db_client["questions"].find(
        {"url" : url},
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
    url = get_url(data)
    question_number = data["question_number"]
    submission = data["submission"]

    question = db_client["questions"].find_one(
        {"url" : url, "question_number" : question_number},
    {"_id": 0})

    response = []
    for i in range(len(question["lines"])):
        response.append(question["lines"][i] == submission.get(str(i)))

    return jsonify(response)

@app.route('/api/hint', methods=['POST'])
def get_hint():
    data = request.get_json()
    url = get_url(data)
    question_number = data["question_number"]
    submission = data["submission"]
    previous_hints = data["previous_hints"]
    
    question = db_client["questions"].find_one(
        {"url" : url, "question_number" : question_number},
    {"_id": 0})

    indices = list(submission.keys())
    hintQuery = question["question"]
    for i in range(len(indices)):
        index = int(indices[i])
        hintQuery += str(i) + "\nDescription: " + str(question["descriptions"][index]) + "\n" + "Submission: " + str(submission[str(index)]) + "\n" + "Correct Solution: " + str(question["lines"][index]) + "\n"
    hintQuery += "Previous Hints"
    for i in range(len(previous_hints)):
        hintQuery += "\n" + str(previous_hints[i])

    response = openai_json_response([
        select_hints(),
        give_hint_solution(hintQuery)
    ])

    return jsonify(response)

if __name__ == '__main__':
    app.run(host="localhost", port=6001, debug=True)
