from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import ConfigurableFieldSpec
from fastapi import HTTPException
from openai import AsyncStream
from openai.types.chat import ChatCompletionChunk
from base64 import b64decode
from models.chat import ChatsDB
from config.security import get_llm, get_settings, get_audio_openai
import os

settings = get_settings()

client = get_audio_openai()

def encoded_speech_to_text_openai(audio: str):
    with open("temp.wav", 'wb') as au:
        au.write(b64decode(audio))
    speech_file_path = os.path.abspath("../temp.wav")
    audio_file= open(speech_file_path, "rb")
    transcription = client.audio.transcriptions.create(
        model="whisper-1", 
        file=audio_file
    )
    return transcription.text

async def question_and_answer(session_email: str, chat_id: str, q: str | None = None, enc_audio: str | None = None):
    chat = get_llm()

    store = {}

    def get_session_history(user_id: str, conversation_id: str) -> BaseChatMessageHistory:
        if (user_id, conversation_id) not in store:
            store[(user_id, conversation_id)] = ChatMessageHistory()
        return store[(user_id, conversation_id)]

    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                """As an LLM model, you are a mental health bot. 
                Your responses should be focused exclusively on mental health-related questions. 
                If you encounter a query that isn't related to mental health, please reply with I don't know.""",
            ),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
        ]
    )

    chain = prompt | chat | StrOutputParser()

    with_message_history = RunnableWithMessageHistory(
        chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        history_factory_config=[
            ConfigurableFieldSpec(
                id="user_id",
                annotation=str,
                name="User ID",
                description="Unique identifier for the user.",
                default="",
                is_shared=True,
            ),
            ConfigurableFieldSpec(
                id="conversation_id",
                annotation=str,
                name="Conversation ID",
                description="Unique identifier for the conversation.",
                default="",
                is_shared=True,
            ),
        ],
    )

    if q != "":
        res = with_message_history.invoke(
            {"input": q},
            config={"configurable": {"user_id": session_email, "conversation_id": chat_id}},
        )
    if enc_audio != "" and q == "":
        q = encoded_speech_to_text_openai(enc_audio)
        res = with_message_history.invoke(
            {"input": q},
            config={"configurable": {"user_id": session_email, "conversation_id": chat_id}},
        )
    if q != "" and enc_audio != "":
        res = with_message_history.invoke(
            {"input": q},
            config={"configurable": {"user_id": session_email, "conversation_id": chat_id}},
        )
    mydict = { "Email": session_email, "Chat_Id": chat_id, "question": q, "ai": res}

    return mydict 


async def text_to_speech_stream_openai(text: str):
    print('Generating audio from text review using Open AI API')
    #without stream=True is: response: HttpxBinaryResponseContent
    stream: AsyncStream[ChatCompletionChunk] = await client.audio.speech.create(
        model="tts-1",
        voice="echo",
        input=text,
    ) 
    print(type(stream), dir(stream), stream)
    return stream

def insert_chatdata(data, session):
    chat = ChatsDB()
    chat.email = data["Email"]
    chat.chat_id = data["Chat_Id"]
    chat.question = data["question"]
    chat.ai = data["ai"]
    session.add(chat)
    session.commit()
    session.refresh(chat)

async def read_chat_data(data, session):
    cdata = session.query(ChatsDB).filter(ChatsDB.email == data.email).all()
    if not cdata:
        raise HTTPException(status_code=400, detail="Email does not exists.")
    return cdata
    
async def specific_chat_data(id, email, session):
    cid_data = session.query(ChatsDB).filter(ChatsDB.email == email, ChatsDB.chat_id == id).all()
    if not cid_data:
        raise HTTPException(status_code=400, detail="Email does not exists.")
    return cid_data

async def delete_chat_data(id, email, session):
    delete_data = session.query(ChatsDB).filter(ChatsDB.email == email, ChatsDB.chat_id == id).first()
    if not delete_data:
        raise HTTPException(status_code=400, detail="Email does not exists.")
    session.delete(delete_data)
    session.commit()

    return {"message": f"{id} deleted successfully."}
