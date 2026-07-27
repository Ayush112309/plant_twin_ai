from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_openapi_json_generated():
    response = client.get("/api/v1/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "PlantTwin AI Backend"
    assert len(schema["paths"]) > 50


def test_docs_accessible():
    response = client.get("/docs")
    assert response.status_code == 200
    assert "Swagger UI" in response.text
