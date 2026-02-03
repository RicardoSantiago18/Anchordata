from langchain_openai import ChatOpenAI

def load_llm():
    return ChatOpenAI(
        base_url="http://localhost1234/v1",
        api_key="lm-studio",
        model="local-model",
        temperature=0.2
    )