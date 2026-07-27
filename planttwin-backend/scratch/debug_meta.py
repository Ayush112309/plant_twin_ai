import sys
from app.shared.mixins.base_model import Base
from sqlalchemy.orm import configure_mappers

import app.assets.sensors.models
import app.telemetry.ingestion.models

configure_mappers()
print("Tables in Base.metadata:", list(Base.metadata.tables.keys()))
