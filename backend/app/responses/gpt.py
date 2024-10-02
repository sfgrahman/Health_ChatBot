from typing import Union
from datetime import datetime

from responses.base import BaseResponse

class ChatResponse(BaseResponse):
    chat_id: str
    question: str
    ai: str
    created_at: Union[str, None, datetime] = None