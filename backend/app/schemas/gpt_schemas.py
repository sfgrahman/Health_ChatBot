from pydantic import BaseModel, EmailStr

class ChatPromptsSchema(BaseModel):
    question: str | None = None
    chat_id: str | None = None
    encoded_content: str | None = None
    # histoty: list[str] | None = None

# class ChatHistorySchema(BaseModel):
#     email: EmailStr