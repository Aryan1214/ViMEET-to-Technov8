from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import nbformat
import os
import nbconvert
import papermill as pm
import json

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class StartRequest(BaseModel):
    stream: str

class AnswerRequest(BaseModel):
    answer: str

current_question_index = 0
questions = []
scores = []

# Load questions for a stream
def load_questions_for_stream(stream):
    question_bank = {
        "computer": ["What is a linked list?", "Explain OOP concepts."],
        "electrical": ["What is Ohm's Law?", "Explain the function of a transformer."],
        "extc": ["What is modulation?", "Explain antenna types."],
        "ml": ["What is overfitting?", "Explain gradient descent."],
    }
    return question_bank.get(stream, [])

# Call the Jupyter notebook to score an answer
def score_answer_with_notebook(answer_text):
    output_path = "output.ipynb"
    try:
        pm.execute_notebook(
            'interviewerBot.ipynb',
            output_path,
            parameters=dict(user_answer=answer_text)
        )
        with open(output_path, 'r') as f:
            nb = nbformat.read(f, as_version=4)
            
        # for cell in nb.cells[::-1]:
        #     if cell.cell_type == 'code' and 'score' in cell.outputs[0].data.get('text/plain', ''):
        #         output_str = cell.outputs[0].data['text/plain']
        #         score = int(output_str.strip().split('=')[-1].replace('>','').strip())
        #         return score
        
        for cell in nb.cells[::-1]:
            if cell.cell_type == 'code' and cell.outputs:
                print(f"Cell output: {cell.outputs}")  # Debugging
                if 'text/plain' in cell.outputs[0].data:
                    output_str = cell.outputs[0].data['text/plain']
                    print(f"Extracted output: {output_str}")  # Debugging
                    if 'score' in output_str:
                        score = int(output_str.strip().split('=')[-1].replace('>', '').strip())
                        return score
                    
    except Exception as e:
        print(f"Notebook execution error: {e}")
    return 0

@app.post("/start")
async def start_interview(start_req: StartRequest):
    global questions, current_question_index, scores
    current_question_index = 0
    scores = []
    questions = load_questions_for_stream(start_req.stream)
    if questions:
        return {"question": questions[current_question_index]}
    return {"question": None}

@app.post("/answer")
async def submit_answer(ans_req: AnswerRequest):
    global current_question_index, questions, scores

    score = score_answer_with_notebook(ans_req.answer)
    scores.append(score)

    next_question = None
    current_question_index += 1

    if current_question_index < len(questions):
        next_question = questions[current_question_index]

    return {"score": score, "next_question": next_question}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)
