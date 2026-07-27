import logging
from app.connectivity.mqtt.schemas import MQTTMessageResponse

logger = logging.getLogger(__name__)

class MQTTService:
    def connect(self, broker: str, port: int):
        logger.info(f"Connecting to MQTT broker: {broker}:{port}")
        return True

    def disconnect(self):
        logger.info("Disconnecting from MQTT broker")
        return True

    def publish(self, topic: str, payload: any):
        logger.info(f"Publishing to topic: {topic}")
        return True

    def subscribe(self, topic: str):
        logger.info(f"Subscribing to topic: {topic}")
        return True

    def list_topics(self):
        logger.info("Listing subscribed topics")
        return ["plant/area1/sensor1", "plant/area1/sensor2"]
