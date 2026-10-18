# Chatbot Application Instructions

This guide provides instructions on how to set up and run the chatbot application located in `app.py`.

## Overview

The application is a simple chatbot script that uses **LangChain** and a **Hugging Face** model (`deepseek-ai/DeepSeek-V3.2`). It sends a single prompt to the model and prints the output.

## Prerequisites

- **Python 3.8+** installed on your system.
- Ensure you have a Hugging Face account and an API token since the model provider is set to Hugging Face.

## Setup Instructions

1. **Activate the Virtual Environment**
   The project uses a local virtual environment (`.venv`). Activate it using your command line:
   - On **Windows**:
     ```powershell
     .\.venv\Scripts\activate
     ```
   - On **macOS/Linux**:
     ```bash
     source .venv/bin/activate
     ```

2. **Install Dependencies**
   Install the required Python packages from the `requirements.txt` file:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set the Hugging Face API Token**
   To authenticate with Hugging Face, you need to set your API token as an environmental variable before running the script:
   - On **Windows** (PowerShell):
     ```powershell
     $env:HUGGINGFACEHUB_API_TOKEN="your_huggingface_api_token"
     ```
   - On **macOS/Linux**:
     ```bash
     export HUGGINGFACEHUB_API_TOKEN="your_huggingface_api_token"
     ```

## Running the Application

Once the setup is complete, you can run the application with the following command:

```bash
python app.py
```

## How It Works

1. The script initializes a chat model (`init_chat_model`) configured to use `deepseek-ai/DeepSeek-V3.2` from Hugging Face with specific parameters (like `temperature=0.2`).
2. It sets up a `SystemMessage` declaring the assistant's context and a `HumanMessage` asking a question ("how to create a rest api?").
3. The messages are passed to the model, and the response is printed to the terminal.
