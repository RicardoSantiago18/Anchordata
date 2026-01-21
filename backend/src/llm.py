from langchain_community.llms import Ollama

def load_llm():
    return Ollama(
        model="mistral:7b-instruct",
        temperature=0.2
    )