from fastapi import FastAPI
from fastapi.testclient import TestClient
from typing import List
from pydantic import BaseModel, ConfigDict
from app.shared.responses import APIResponse
from app.identity.users.schemas import UserResponse
import datetime
from uuid import uuid4

app = FastAPI()

class DummyUser:
    def __init__(self):
        self.id = uuid4()
        self.email = "admin@apex.com"
        self.first_name = "A"
        self.last_name = "B"
        self.role = None
        self.is_active = True
        self.created_at = datetime.datetime.now()

@app.get("/users", response_model=APIResponse)
def get_users():
    users = [DummyUser()]
    return APIResponse(data=[UserResponse.model_validate(user).model_dump() for user in users], message="Users retrieved successfully")

@app.get("/users2", response_model=APIResponse[List[UserResponse]])
def get_users2():
    users = [DummyUser()]
    return APIResponse(data=[UserResponse.model_validate(user).model_dump() for user in users], message="Users retrieved successfully")

client = TestClient(app)
print("TEST 1 (/users):")
try:
    resp = client.get("/users")
    print(resp.status_code, resp.json())
except Exception as e:
    import traceback
    traceback.print_exc()

print("\nTEST 2 (/users2):")
try:
    resp = client.get("/users2")
    print(resp.status_code, resp.json())
except Exception as e:
    import traceback
    traceback.print_exc()
