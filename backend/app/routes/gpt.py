from fastapi import APIRouter, Depends, status, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from langchain_core.messages import BaseMessage
from openai import AsyncStream
from openai.types.chat import ChatCompletionChunk
from base64 import b64encode
from sqlalchemy.orm import Session

from schemas.gpt_schemas import ChatPromptsSchema
from config.security import get_current_user, oauth2_scheme, get_audio_openai
from services.gpt_services import question_and_answer, insert_chatdata, read_chat_data, specific_chat_data, delete_chat_data
from config.database import get_session
# from responses.gpt import ChatResponse

from io import BytesIO
from os import remove, path

from secrets import token_hex
chat_id = token_hex(16)

client = get_audio_openai()

buffer = BytesIO()

gpt_router = APIRouter(
    prefix="/conversation",
    tags=["Chat"],
    responses={404: {"description": "Not found"}},
    dependencies=[Depends(oauth2_scheme), Depends(get_current_user)]
)

def audio_to_base64(buff):
    return b64encode(buff.getvalue()).decode('utf-8')

@gpt_router.post('', status_code=status.HTTP_200_OK)
async def get_user_detail(data: ChatPromptsSchema, background_tasks: BackgroundTasks, session: Session = Depends(get_session), user = Depends(get_current_user)):
    if data.question == "" and data.encoded_content == "":
        raise HTTPException(status_code=400, detail="Please pose a question.")
    # import base64
    # dummy_wav = path.abspath("speech.wav")
    # with open(dummy_wav, "rb") as ww:
    #     kk = ww.read()
    # encoded_content = base64.b64encode(kk)
    # data.question = None

    if not data.chat_id:
        txt_response = await question_and_answer(user.email, chat_id, data.question, data.encoded_content)
    else:
        txt_response = await question_and_answer(user.email, data.chat_id, data.question, data.encoded_content)
    
    response = client.audio.speech.create(
        model="tts-1",
        voice="alloy",
        response_format="opus",
        input=txt_response["ai"]
    )
    for chunk in response.iter_bytes(chunk_size=4096):
        buffer.write(chunk)
    buffer.seek(0)

    background_tasks.add_task(insert_chatdata, data=txt_response, session=session)
    return {
        "audio_buffer": audio_to_base64(buffer),
        "txt_response": txt_response["ai"]
    }

@gpt_router.get('/all', status_code=status.HTTP_200_OK)
async def get_all_chathistory(user = Depends(get_current_user), session: Session = Depends(get_session)):
    return await read_chat_data(user, session)

@gpt_router.get('/{id}', status_code=status.HTTP_200_OK)
async def individual_chathistory(id, user = Depends(get_current_user), session: Session = Depends(get_session)):
    return await specific_chat_data(id, user.email, session)

@gpt_router.delete('/chat/{id}', status_code=status.HTTP_200_OK)
async def delete_chathistory(id, user = Depends(get_current_user), session: Session = Depends(get_session)):
    return await delete_chat_data(id, user.email, session)