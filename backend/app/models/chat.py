from datetime import datetime
from sqlalchemy import Column, DateTime, Integer, String, func
from sqlalchemy.orm import mapped_column, relationship

from config.database import Base

class ChatsDB(Base):
    __tablename__ = 'chats'
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255))
    chat_id = Column(String(100))
    question = Column(String(1000))
    ai = Column(String(1000))
    created_at = Column(DateTime, nullable=False, server_default=func.now())
    