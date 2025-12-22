from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def get_db_url(username: str):
    return f"sqlite:///{os.path.join(BASE_DIR, f'{username}.db')}"

Base = declarative_base()

# Default engine for initialization
default_db_path = os.path.join(BASE_DIR, 'expenses.db')
SQLALCHEMY_DATABASE_URL = f"sqlite:///{default_db_path}"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_engine(username: str):
    url = get_db_url(username)
    return create_engine(url, connect_args={"check_same_thread": False})

def get_session_local(username: str):
    engine = get_engine(username)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)