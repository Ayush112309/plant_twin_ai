from fastapi import APIRouter
from app.connectivity.mqtt.schemas import MQTTPublishRequest, MQTTSubscribeRequest
from app.connectivity.mqtt.service import MQTTService

router = APIRouter(prefix="/mqtt", tags=["MQTT"])
mqtt_service = MQTTService()

@router.post("/publish")
async def publish_mqtt(request: MQTTPublishRequest):
    return {"success": mqtt_service.publish(request.topic, request.payload)}

@router.post("/subscribe")
async def subscribe_mqtt(request: MQTTSubscribeRequest):
    return {"success": mqtt_service.subscribe(request.topic)}

@router.get("/topics")
async def list_mqtt_topics():
    return mqtt_service.list_topics()
