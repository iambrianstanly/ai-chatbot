import os
from typing import List, Any
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

# Load environment variables
load_dotenv()

MODEL_ID = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


def get_chat_response(messages: List[Any]) -> str:
    """
    Send conversation history to the LLM and return the assistant's reply.
    """
    llm = ChatGroq(temperature=0.0, model_name=MODEL_ID)

    system_message = SystemMessage(
        content=(
            "You are a helpful, knowledgeable, and friendly AI assistant. "
            "Respond to the user’s questions and engage in natural, multi‑turn "
            "conversation across a wide range of topics."
        )
    )

    prompt_template = [system_message]

    for msg in messages:
        if isinstance(msg, dict):
            role = msg.get("role")
            content = msg.get("content")
        else:
            role = getattr(msg, "role", None)
            content = getattr(msg, "content", None)

        if role == "user":
            prompt_template.append(HumanMessage(content=content))
        elif role == "assistant":
            prompt_template.append(AIMessage(content=content))

    response = llm.invoke(prompt_template)
    return response.content
