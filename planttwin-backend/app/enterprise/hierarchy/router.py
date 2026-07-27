from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from uuid import UUID
from app.core.database.session import get_db
from app.shared.responses import APIResponse
from app.enterprise.organizations.models import Organization
from app.enterprise.plants.models import Plant
from app.enterprise.areas.models import Area
from app.enterprise.production_lines.models import ProductionLine

router = APIRouter(prefix="/hierarchy", tags=["Hierarchy"])

@router.get("/tree/{org_id}", response_model=APIResponse)
async def get_hierarchy_tree(org_id: UUID, db: AsyncSession = Depends(get_db)):
    org_res = await db.execute(select(Organization).filter(Organization.id == org_id, Organization.is_deleted == False))
    org = org_res.scalars().first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
        
    plants_res = await db.execute(select(Plant).filter(Plant.organization_id == org_id, Plant.is_deleted == False))
    plants = plants_res.scalars().all()
    
    plant_ids = [p.id for p in plants]
    
    areas = []
    lines = []
    
    if plant_ids:
        areas_res = await db.execute(select(Area).filter(Area.plant_id.in_(plant_ids)))
        areas = areas_res.scalars().all()
        
        area_ids = [a.id for a in areas]
        if area_ids:
            lines_res = await db.execute(select(ProductionLine).filter(ProductionLine.area_id.in_(area_ids)))
            lines = lines_res.scalars().all()
            
    tree = {
        "id": str(org.id),
        "name": org.name,
        "type": "organization",
        "children": []
    }
    
    for plant in plants:
        plant_node = {
            "id": str(plant.id),
            "name": plant.name,
            "type": "plant",
            "children": []
        }
        
        plant_areas = [a for a in areas if a.plant_id == plant.id]
        for area in plant_areas:
            area_node = {
                "id": str(area.id),
                "name": area.name,
                "type": "area",
                "children": []
            }
            
            area_lines = [l for l in lines if l.area_id == area.id]
            for line in area_lines:
                line_node = {
                    "id": str(line.id),
                    "name": line.name,
                    "type": "production_line"
                }
                area_node["children"].append(line_node)
                
            plant_node["children"].append(area_node)
            
        tree["children"].append(plant_node)
        
    return APIResponse(data=tree, message="Hierarchy tree retrieved successfully")
