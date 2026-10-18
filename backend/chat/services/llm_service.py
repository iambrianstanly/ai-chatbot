import os
from typing import List

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

from chat.serializers import MessageSerializer

# Load environment variables from .env file
load_dotenv()

# llama-3.3-70b-versatile was shut down for free/developer keys on 2026-08-16
MODEL_ID = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")


def get_chat_response(messages: List[MessageSerializer]) -> str:
    """
    Send user message (with conversation history) to the LLM and return the assistant's reply as a string.
    This function now supports general-purpose conversation rather than brand name specific advice.
    """

    llm = ChatGroq(temperature=0.0, model_name=MODEL_ID)

    system_message = SystemMessage(content=("You are a helpful, knowledgeable, and friendly AI assistant. Respond to the user’s questions and engage in natural, multi‑turn conversation across a wide range of topics."))

    prompt_template = [system_message]

    for msg in messages:
        if isinstance(msg, dict):
            role = msg.get("role")
            content = msg.get("content")
        else:
            # Fallback for any future Message objects
            role = getattr(msg, "role", None)
            content = getattr(msg, "content", None)
        if role == "user":
            prompt_template.append(HumanMessage(content=content))
        elif role == "assistant":
            prompt_template.append(AIMessage(content=content))

    response = llm.invoke(prompt_template)
    return response.content
