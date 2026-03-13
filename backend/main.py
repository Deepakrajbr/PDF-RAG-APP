from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import shutil
import os
from dotenv import load_dotenv

from rag import process_pdf, ask_question

load_dotenv()

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    process_pdf(file_path)

    return {"message": "PDF processed successfully"}


@app.post("/ask")
async def ask_question(question: str):

    global qa_chain

    if qa_chain is None:
        return {"error": "Upload a PDF first"}

    result = qa_chain.run(question)

    return {"answer": result}