import requests 
import re
import json
from utils import system_prompt, user_prompt, openai_json_response
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

# print(parsed_data.keys())

file_name = "/controllers/endpoints/instructor.js"
file_content = parsed_data[file_name]

@system_prompt
def create_problem_context(): 
    return '''
    We are creating a Khan Academy for teaching employees our codebase. 
    We want to pick an easy line from a given file and produce a problem description for it that 
    contains enough context (variable names, method calls from the line) and has the user only 
    rewrite a small part of the line of code. 

    We want you to create a problem description for an easy line from the given file - choose this easy
    line yourself. Block out the code that you want the user to rewrite. 

    Return the problem description as a json with keys 'context' and 'question', where the context is the problem 
    description that you've generated, and the question is the code that you want the user to rewrite.
    The context should be a short description of the problem and the question should be the code in the following format
    (here's an example)
    {
    "context": "Given the following code...",
    "question": [
        "def get_db_stuff(): \n",
        "Input(20)",
        "more code",
        "Input(10)"
    ],
    }
    '''

@user_prompt
def send_context(context: str):
    return context

responseLLM = openai_json_response([ create_problem_context(), send_context(file_content)])
print(responseLLM)




# {
#     "context": "asfsaffsad",
#     "question": [
#         "def get_db_stuff(): \n",
#         "Input(20)",
#         "more code",
#         "Input(10)"
#     ],
# }


