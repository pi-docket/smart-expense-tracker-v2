from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from fastapi import Header
import os

import models
import database

# Create tables in the global database (for users)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class TransactionBase(BaseModel):
    date: str
    amount: float
    type: str
    category: str
    note: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class Transaction(TransactionBase):
    id: int

    class Config:
        from_attributes = True

class YearlyStats(BaseModel):
    highest_spending_day: Optional[Dict[str, Any]] = None
    most_frequent_day: Optional[Dict[str, Any]] = None
    highest_category: Optional[Dict[str, Any]] = None

class UserAuth(BaseModel):
    username: str
    password: str

# Dependency
def get_db(x_username: Optional[str] = Header(None)):
    if not x_username:
        # Fallback to default DB if no username provided (for public/un-logged in users)
        db = database.SessionLocal()
        try:
            yield db
        finally:
            db.close()
        return

    # Use the user's specific database
    session_factory = database.get_session_local(x_username)
    
    # Ensure tables exist in the user's DB
    user_engine = database.get_engine(x_username)
    models.Base.metadata.create_all(bind=user_engine)
    
    db = session_factory()
    try:
        yield db
    finally:
        db.close()

# Dependency for global DB (users)
def get_global_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register(auth: UserAuth, db: Session = Depends(get_global_db)):
    # Check if user exists
    existing_user = db.query(models.User).filter(models.User.username == auth.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    new_user = models.User(username=auth.username, password=auth.password)
    db.add(new_user)
    db.commit()
    
    # Initialize the user's specific database
    user_engine = database.get_engine(auth.username)
    models.Base.metadata.create_all(bind=user_engine)
    
    return {"message": "User registered successfully"}

@app.post("/login")
def login(auth: UserAuth, db: Session = Depends(get_global_db)):
    user = db.query(models.User).filter(models.User.username == auth.username, models.User.password == auth.password).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"username": user.username, "message": "Login successful"}

@app.get("/transactions/", response_model=List[Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).order_by(desc(models.Transaction.date), desc(models.Transaction.id)).offset(skip).limit(limit).all()
    return transactions

@app.post("/transactions/", response_model=Transaction)
def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = models.Transaction(**transaction.model_dump())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(db_transaction)
    db.commit()
    return {"ok": True}

@app.get("/stats/year/{year}", response_model=YearlyStats)
def get_yearly_stats(year: str, db: Session = Depends(get_db)):
    year_filter = models.Transaction.date.like(f"{year}-%")

    # 1. Highest Spending Day
    highest_day_query = (
        db.query(
            models.Transaction.date,
            func.sum(models.Transaction.amount).label("total_amount")
        )
        .filter(year_filter, models.Transaction.type == "expense")
        .group_by(models.Transaction.date)
        .order_by(desc("total_amount"))
        .first()
    )

    highest_spending_day = None
    if highest_day_query:
        highest_spending_day = {"date": highest_day_query.date, "amount": highest_day_query.total_amount}

    # 2. Most Frequent Day (Most items purchased - expenses)
    most_freq_query = (
        db.query(
            models.Transaction.date,
            func.count(models.Transaction.id).label("tx_count")
        )
        .filter(year_filter, models.Transaction.type == "expense")
        .group_by(models.Transaction.date)
        .order_by(desc("tx_count"))
        .first()
    )

    most_frequent_day = None
    if most_freq_query:
        most_frequent_day = {"date": most_freq_query.date, "count": most_freq_query.tx_count}

    # 3. Highest Category
    highest_cat_query = (
        db.query(
            models.Transaction.category,
            func.sum(models.Transaction.amount).label("total_amount")
        )
        .filter(year_filter, models.Transaction.type == "expense")
        .group_by(models.Transaction.category)
        .order_by(desc("total_amount"))
        .first()
    )

    highest_category = None
    if highest_cat_query:
        highest_category = {"category": highest_cat_query.category, "amount": highest_cat_query.total_amount}

    return YearlyStats(
        highest_spending_day=highest_spending_day,
        most_frequent_day=most_frequent_day,
        highest_category=highest_category
    )

@app.get("/")
def read_root():
    return {"message": "Welcome to Local Expense Tracker API"}
