
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
from database import Base
import random
from datetime import datetime, timedelta

# Database configuration
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables (if not exists)
Base.metadata.create_all(bind=engine)

# Create session
db = SessionLocal()

print("Generating random test data...")

categories = ['Food', 'Transport', 'Entertainment', 'Salary', 'Bills', 'Housing', 'Education', 'Shopping', 'Health', 'Other']
notes = ['Supermarket', 'Uber', 'Netflix', 'Monthly Pay', 'Electricity', 'Rent', 'Online Course', 'Clothing', 'Medicine', 'Misc']

# Generate 100 transactions
base_date = datetime(2025, 12, 1)
transactions = []

for _ in range(100):
    # Randomize date (within Dec 2025 and Jan 2026)
    days_offset = random.randint(0, 60)
    tx_date = (base_date + timedelta(days=days_offset)).strftime("%Y-%m-%d")
    
    # Randomize category and type
    category = random.choice(categories)
    if category == 'Salary':
        tx_type = 'income'
        amount = random.randint(3000, 8000)
    else:
        tx_type = 'expense'
        amount = random.randint(10, 500)
    
    note = random.choice(notes)

    tx = models.Transaction(
        date=tx_date,
        amount=float(amount),
        type=tx_type,
        category=category,
        note=f"{category} - {note}"
    )
    transactions.append(tx)

# Bulk insert
db.add_all(transactions)
db.commit()

print(f"Successfully added {len(transactions)} transactions to test.db.")
print("You can now refresh the app to see the data.")

db.close()
