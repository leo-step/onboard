import requests 
import re
import json
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

# {
#     "context": "asfsaffsad",
#     "question": [
#         "def get_db_stuff(): \n",
#         "Input(20)",
#         "more code",
#         "Input(10)"
#     ],
# }


