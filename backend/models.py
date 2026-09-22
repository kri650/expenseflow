from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class Category(str, Enum):
    food = "Food"
    shopping = "Shopping"
    travel = "Travel"
    bills = "Bills"
    education = "Education"
    others = "Others"


class PaymentMethod(str, Enum):
    cash = "Cash"
    upi = "UPI"
    card = "Card"
    other = "Other"

class FundsRequest(BaseModel):
   
    amount: float = Field(gt=0)




class ExpenseCreate(BaseModel):
   
    name: str = Field(min_length=1)         
    amount: float = Field(gt=0)            
    category: Category
    date: str                                
    payment_method: PaymentMethod
    description: Optional[str] = Field(default="", max_length=200)


class ExpenseUpdate(BaseModel):

    name: str = Field(min_length=1)
    amount: float = Field(gt=0)
    category: Category
    date: str
    payment_method: PaymentMethod
    description: Optional[str] = Field(default="", max_length=200)


class Expense(ExpenseCreate):
    id: str
