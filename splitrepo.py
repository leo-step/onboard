import requests 
import re
import json
url = "https://uithub.com/TigerAppsOrg/TigerPath?accept=text%2Fplain&maxTokens=10000000"

response = requests.get(url)
# print(response.text)

def parse_files(file_data):
    # Regular expression to match the filename and its content
    file_pattern = r"(/[\w/\.\-]+):\n-+(.*?)\n-+"
    
    # Initialize an empty dictionary to store the results
    files_dict = {}
    
    # Find all matches using regex
    matches = re.findall(file_pattern, file_data, re.DOTALL)
    
    # Loop over matches and populate the dictionary
    for match in matches:
        filename, content = match
        files_dict[filename] = content.strip()
    
    return files_dict

# Parse the file content
parsed_data = parse_files(response.text)

# Convert the parsed data into a JSON-like format for better visualization
json_output = json.dumps(parsed_data, indent=4)

# Print the resulting dictionary or save it to a file
print(json_output)



