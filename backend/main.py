from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

import models
import database

# Create tables
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

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/transactions/", response_model=List[Transaction])
def read_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).offset(skip).limit(limit).all()
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

@app.get("/")
def read_root():
    return {"message": "Welcome to Local Expense Tracker API"}
