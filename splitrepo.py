import requests 
import re
import json
from utils import system_prompt, user_prompt, openai_json_response
from prompts import select_candidate_files,  give_files_list, create_problem_context, send_context
from clients import db_client
from tqdm import tqdm
from dotenv import load_dotenv

load_dotenv()

url = "https://uithub.com/TigerAppsOrg/PrincetonCourses?accept=text%2Fplain&maxTokens=10000000"

response = requests.get(url)

def parse_files(file_data):
    file_pattern = r"(/[\w/\.\-]+):\n-+(.*?)\n-+"
    files_dict = {}
    matches = re.findall(file_pattern, file_data, re.DOTALL)
    
    for match in matches:
        filename, content = match
        files_dict[filename] = content.strip()
    
    return files_dict

parsed_data = parse_files(response.text)
files = list(parsed_data.keys())

response = openai_json_response([
    select_candidate_files(),
    give_files_list(files)
])

for i in tqdm(range(len(response["files"]))):
    file_name = response["files"][i]
    file_content = parsed_data[file_name]

    responseLLM = openai_json_response([
        create_problem_context(), 
        send_context(file_content)
    ], model="gpt-4o")

    responseLLM["question"] = file_content
    filtered_data = list(filter(lambda x: x[1] in responseLLM["question"], zip(responseLLM["descriptions"], responseLLM["lines"])))
    filtered_description, filtered_lines = zip(*filtered_data) if filtered_data else ([], [])
    responseLLM["descriptions"] = list(filtered_description)
    responseLLM["lines"] = list(filtered_lines)
    responseLLM["question_number"] = i
    responseLLM["url"] = url
    if len(responseLLM["lines"]) > 0:
        db_client["questions"].insert_one(responseLLM)
