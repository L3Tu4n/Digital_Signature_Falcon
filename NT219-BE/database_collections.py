from fastapi import HTTPException
from database import user_collection, gdc_collection, chingsphu_collection
from models import User, GDC, ChingsPhu

# Kéo hàm hash bằng Argon2 từ file auth.py sang
from auth import hash_password

async def create_user(user: User):
    user_dict = user.dict()
    user_dict["_id"] = user_dict["cccd"]
    user_dict["password"] = hash_password(user_dict["password"])
    result = await user_collection.insert_one(user_dict)
    return {"_id": str(result.inserted_id)}

async def create_chingsphu(chingsphu: ChingsPhu):
    chingsphu_dict = chingsphu.dict()
    chingsphu_dict["_id"] = chingsphu_dict["CP_username"]
    chingsphu_dict["password"] = hash_password(chingsphu_dict["password"])
    result = await chingsphu_collection.insert_one(chingsphu_dict)
    return {"_id": str(result.inserted_id)}

async def create_gdc(gdc: GDC):
    gdc_dict = gdc.dict()
    gdc_dict["_id"] = gdc_dict["gdc_Id"]

    user = await user_collection.find_one({"_id": gdc_dict["cccd"]})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if not await chingsphu_collection.find_one({"_id": gdc_dict["CP_username"]}):
        raise HTTPException(status_code=404, detail="Chingsphu not found")
    
    result = await gdc_collection.insert_one(gdc_dict)
    return {"_id": str(result.inserted_id)}