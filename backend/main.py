from fastapi import FastAPI, UploadFile, File
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_classic.chains import RetrievalQA

import shutil

app = FastAPI()

vector_store = None
qa_chain = None

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    file_path = file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

     #the pdf will read and make documents 
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    
    #spliting the document and overlaping chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_documents(documents)

    embeddings = OpenAIEmbeddings()

    global vector_store
    vector_store = FAISS.from_documents(chunks, embeddings)

    global qa_chain
    qa_chain = RetrievalQA.from_chain_type(
        llm=ChatOpenAI(),
        retriever=vector_store.as_retriever()
    )

    return {"message": "PDF processed successfully"}

@app.post("/ask")
async def ask_question(question: str):

    result = qa_chain.run(question)

    return {"answer": result}