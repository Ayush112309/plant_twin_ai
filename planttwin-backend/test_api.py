import requests

url = "http://localhost:8000/api/v1/identity/auth/login"
data = {
    "email": "admin@apex.com",
    "password": "123456"
}
response = requests.post(url, json=data)
if response.status_code == 200:
    token = response.json()["data"]["access_token"]
    print("Logged in!")
    
    headers = {"Authorization": f"Bearer {token}"}
    users_resp = requests.get("http://localhost:8000/api/v1/identity/users", headers=headers)
    print("USERS STATUS:", users_resp.status_code)
    print("USERS JSON:", users_resp.json())
    
    inv_resp = requests.get("http://localhost:8000/api/v1/identity/invitations", headers=headers)
    print("INVITATIONS STATUS:", inv_resp.status_code)
    print("INVITATIONS JSON:", inv_resp.json())
else:
    print("Login failed:", response.status_code, response.text)
