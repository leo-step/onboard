from utils import system_prompt, user_prompt, openai_json_response

@system_prompt
def create_problem_context():
    return "write context for this coding problem. return as a json where key 'context' is your problem context."

@user_prompt
def send_context(context: str):
    return f"{context}"


response = openai_json_response([
    create_problem_context(),
    send_context("print('Hello World')")
])

'''

response

{
    "context": "asfdsadfsafdsf"
}


'''
