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
files = list(parsed_data.keys())

@system_prompt
def select_candidate_files():
    return '''You will be given a list of file names from a repository. Your overall goal
    is to create coding questions that cover core concepts from the repository. 

    Some recommended files include ones that deal with business logic, endpoints, databases,
    and frontend functionality. Don't select config files or README.md
    
    You need to choose the best files to base your questions on. Return a JSON with key "files" and
    value as an array of file names selected from the complete list. Select 10 files.'''

@user_prompt
def give_files_list(files):
    return str(files)

response = openai_json_response([
    select_candidate_files(),
    give_files_list(files)
])

print(response["files"])

print(len(response["files"]))
for file in response["files"]:
    print(file in parsed_data)

exit()

file_name = "/controllers/endpoints/instructor.js"
file_content = parsed_data[file_name]

@system_prompt
def create_problem_context(): 
    return '''We are creating an app to teach employees our codebase. 
    We want to pick an easy line from a given file and produce a problem description for it that 
    contains enough context (variable names, method calls from the line) and ask the user to only 
    rewrite a small part of the line of code. We want employees to code this line of code exactly as it is as 
    an answer to our question.

    
     We want you to create a problem description for an easy line from the given file for the employee to 
     then rewrite - choose this easy line yourself, but make sure to include any relevant parameter values 
     that the user needs to know from the line of code in the problem description. 
    
    For example, if you chose the line of code "res.set('Cache-Control', 'public, max-age=86400').json(instructor)",
    then include that the maximum age is 86400 in the problem description and the parameter Cache-Control.

    For the line that you pick, you ***CANNOT*** pick multiple lines, ***ONLY*** pick single lines. There should be 
    ***NO*** new line characters in the line. 

    For example, this line of code would NOT be a valid line of code to replace because there are multiple lines in 
    the code: 

    if ((typeof (req.params.id) === 'undefined') || isNaN(req.params.id)) {
    res.sendStatus(400)
    return
    }

    But, you could have just if ((typeof (req.params.id) === 'undefined') || isNaN(req.params.id)) { as the line of code
    because this is only one line. 
    
    Try avoiding doing trivial things like initializing libraries or exporting too much (focus on logic and operations).
    Output the line of code and the problem description in the following format:

    {
        description: "description of the task"
        line: "the line of code"
    }

    '''

@user_prompt
def send_context(context: str):
    return context


responseLLM = openai_json_response([
    create_problem_context(), 
    send_context(file_content)
], model="gpt-4o")

responseLLM["question"] = file_content

if not responseLLM["line"] in responseLLM["question"]:
    print("error")
    print("Line:", responseLLM["line"])
    print("Question:", responseLLM["question"]) 
    exit(0)

questionSplit = responseLLM["question"].split(responseLLM["line"])
lineLength = len(responseLLM["line"])

questionFITB = [
    questionSplit[0],
    "Input(" + str(lineLength) + ")",
    questionSplit[1]
]

print(questionFITB)
print(responseLLM['description'])


'''
{
    "_id": 123,
    "url": "https://uithub.com/TigerAppsOrg/PrincetonCourses?accept=text%2Fplain&maxTokens=10000000",
    "question_number": 0,
    "title": "asdf",
    "description: "asdf",
    "question": [...],

}


'''




# {
#     "context": "asfsaffsad",
#     "question": [
#         "def get_db_stuff(): \n",
#         "Input(20)",
#         "more code",
#         "Input(10)"
#     ],
# }


# We want you to create a problem description for an easy line from the given file - choose this easy
    # line yourself. We want the problem to be fill-in-the-blank, so for that line we want you to create an
    # input where the user can type in the answer. We want the output format to be something like this:

    # {
    #     "context": "Given the following code..."
    #     "blank": "text to make fill in the blank",
    #     "question": "original code with the 'blank' text blocked out by dashes"
    # }

    # Return the problem description as a json with keys 'context' and 'blank', where the context is the problem 
    # description that you've generated, 'blank' is the text that you want to make fill-in-the-blank and 'question
    # is the original code with the 'blank' text blocked out by dashes (for example, "code(----------)").
    
    # '