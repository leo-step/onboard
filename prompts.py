from utils import system_prompt, user_prompt, openai_json_response
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
    
    Try avoiding doing trivial things like initializing libraries or exporting too much (focus on logic and operations). Do
    this for at least 3 different lines of code across the file (preferably not subsequeny lines).
    Output the line of code and the problem description in the following format:
    {
        title: title of the file
        descriptions[]: array of strings with a description of each task
        lines[]: an array of strings with the line of code of each task
    }

    '''

@user_prompt
def send_context(context: str):
    return context

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


