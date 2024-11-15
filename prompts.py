from utils import system_prompt, user_prompt
import random 

@system_prompt
def create_problem_context(): 
    
    return '''We are creating an app to teach employees our codebase. 
    We want to pick an easy partial or complete line of code from a given file and produce a problem description for it that 
    contains enough context (variable names, method calls in that method) and ask the user to only 
    rewrite a small part of the selected partial or complete line of code. We want employees to code this line of code exactly as it is as 
    an answer to our question.

    
     We want you to create a problem description for an easy partial/complete line of code from the given file for the employee to 
     then rewrite - choose this easy partial/complete line yourself, but make sure to include any relevant parameter values 
     that the user needs to know from the partial/complete line of code in the problem description. 
    
    For example, if you chose the partial/complete line of code  "res.set('Cache-Control', 'public, max-age=86400').json(instructor)",
    then include that the maximum age is 86400 in the problem description and the parameter Cache-Control.

    For the line that you pick, you ***CANNOT*** pick multiple lines, ***ONLY*** pick single lines. There should be 
    ***NO*** new line characters in the line. 

    For example, this partial/complete line of code  would NOT be a valid partial/complete line of code  to replace because there are multiple lines in 
    the code: 

    if ((typeof (req.params.id) === 'undefined') || isNaN(req.params.id)) {
    res.sendStatus(400)
    return
    }

    But, you could have just if ((typeof (req.params.id) === 'undefined') || isNaN(req.params.id)) { as the line of code
    because this is only one line. 
    
    Try avoiding doing trivial things like initializing libraries or exporting too much (focus on logic and operations). Do
    this for at least 6 different lines of code across the file (preferably not subsequeny lines).
    Output the line of code and the problem description in the following format:
    {
        title: title of the file
        descriptions[]: array of strings with a description of each task.
        lines[]: an array of strings with the line of code of each task
    }

    Other guidelines: 
    - Don't ask users to write comments, complex error messages or urls, or anything that they wouldn't know or that's subjective.
      Focus on testing their logic skills. 
    - focus on only picking partial lines of code, only some complete lines of code.
    
    Make sure the problem descriptions are actually good enough to solve the problem. For example, if you select
    a line with a print statement, tell the user the exact string to print otherwise its not possible to reasonably
    fill in the blank.

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
    random.shuffle(files)
    return str(files)

@system_prompt
def select_hints():
    return ''' 
    
    We are creating an app to teach employees our codebase. Employees were given a line of code and asked 
    to fill it in. The employee is currently stuck on 1 or more lines of code and needs a hint on how proceed on filling it. 
    For a set of lines of code the user has to implement, we want you to provide a hint to the employee
    that will help them rewrite the line of code. We will provide you with the employee's attempt, as well as the correct solution. 
    
    The hint you provide should be a string that states where the employee is going wrong in their code 
    (and you should read the correct solution but not reveal it). You will also be given the entire code for the file. 

    ** YOU MUST COMPARE THE SUBMISSION from the user to the CORRECT solution.**
    **BE ULTRA SPECIFIC with what the user should do to fix their CURRENT SUBMISSION**

    Here is the format of inputs for you (you'll be given a list of n description, submission, and correct solutions): 

    "Code for the file
     
     0
     Description: (problem description for the user)
     Submission: (user's attempt at the fill-in-the-blank)
     Correct Solution: (the correct solution to the fill-in-the-blank)
     
     1
     Description: (problem description for the user)
     Submission: (user's attempt at the fill-in-the-blank)
     Correct Solution: (the correct solution to the fill-in-the-blank)

     ...

     n
     Description: (problem description for the user)
     Submission: (user's attempt at the fill-in-the-blank)
     Correct Solution: (the correct solution to the fill-in-the-blank)

     Previous Hints
     (previous hints given to the user)
     "
    
    Return an json of n hints as an array of strings, where there is a hint for each description. *** AVOID 
    USING ANY OF THE PREVIOUS HINTS AND THE CORRECT SOLUTION IN YOUR HINTS ***. The array of n hints
    should be in the following format:
    "
    {
        "0": "Hint 1", 
        "1": "Hint 2",
        ...
        "n": "Hint n"
    }
    "
    
    '''

@user_prompt
def give_hint_solution(query: str):
    return str(query)
    


