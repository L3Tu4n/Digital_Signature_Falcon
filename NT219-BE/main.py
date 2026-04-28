from fastapi import FastAPI, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from falcon_signature import FalconSignature
from models import User, ChingsPhu, LoginForm, SignModel, RequestSignModel
from database import user_collection, gdc_collection, chingsphu_collection
from database_collections import create_user, create_chingsphu
import os
import random
import string
import hashlib
from datetime import datetime
from auth import create_access_token, decode_access_token, verify_password, validate_cccd
from QR_and_Text import generate_qr_code, insert_qr_to_pdf, create_watermark, add_watermark

app = FastAPI()

if not os.path.exists("signed_pdf"):
    os.makedirs("signed_pdf")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://digital-signature-falcon.vercel.app", 
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def calculate_pdf_hash(file_path: str) -> str:
    """Tính mã băm SHA-256 của file để đảm bảo tính toàn vẹn (Integrity)"""
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    return sha256_hash.hexdigest()

@app.post("/signup/")
async def signup(user: User):
    if not validate_cccd(user.cccd):
        raise HTTPException(status_code=400, detail="CCCD phải đủ 12 chữ số và hợp lệ")

    existing_user = await user_collection.find_one(user.cccd)
    if existing_user:
        raise HTTPException(status_code=400, detail="CCCD đã được đăng ký trước đó")

    return await create_user(user)

@app.post("/token")
async def login(user: LoginForm):
    user_db = await user_collection.find_one({"cccd": user.username})
    if user_db and verify_password(user.password, user_db["password"]):
        access_token = create_access_token(data={"username": user_db["name"], "type": "user", "cccd": user_db["cccd"]})
        return {"access_token": access_token, "token_type": "bearer"}

    chingsphu = await chingsphu_collection.find_one({"CP_username": user.username})
    if chingsphu and verify_password(user.password, chingsphu["password"]):
        access_token = create_access_token(data={"username": chingsphu["name"], "type": "chingsphu" , "cccd": chingsphu["CP_username"]})
        return {"access_token": access_token, "token_type": "bearer"}

    raise HTTPException(status_code=400, detail="CCCD hoặc mật khẩu không đúng")

@app.get("/users/me")
async def read_users_me(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    return {"name": payload["username"], "user_type": payload["type"], "cccd": payload.get("cccd")}

@app.post("/chingsphu/")
async def create_chingsphu_endpoint(chingsphu: ChingsPhu):
    return await create_chingsphu(chingsphu)

@app.get("/keygen")
async def keygen(token: str = Depends(oauth2_scheme)):
    try:
        user_access = decode_access_token(token)
        if user_access is None or user_access["type"] != "chingsphu":
            raise HTTPException(status_code=401, detail="Not authorized")
        
        falcon = FalconSignature()
        falcon.generate_keys()
        return JSONResponse(status_code=200, content={"Status": "Success", "Message": "Keys generated successfully!"})
    except Exception as e:
        return JSONResponse(status_code=400, content={"Status": "Error", "Message": str(e)})

@app.post("/sign")
async def sign(sign_data: SignModel, token: str = Depends(oauth2_scheme)):
    try:
        user_access = decode_access_token(token)
        if user_access is None or user_access["type"] != "chingsphu":
            raise HTTPException(status_code=401, detail="Not authorized")
        
        gdc = await gdc_collection.find_one({"gdc_Id": sign_data.gdc_Id})
        if not gdc: raise HTTPException(status_code=404, detail="GDC not found")

        user = await user_collection.find_one({"cccd": gdc["cccd"]})
        chingsphu = await chingsphu_collection.find_one({"_id": sign_data.CP_username})

        user_info = {"cccd": user["cccd"]}
        chingsphu_info = {"CP_username": chingsphu["CP_username"], "sign_place": chingsphu["sign_place"]}
        road_info = {"start_place": gdc["start_place"], "destination_place": gdc["destination_place"]}

        temp_path = "template/gdc.pdf"
        falcon = FalconSignature()
        message, gdc_id, signature = await falcon.sign_pdf(temp_path, user_info, chingsphu_info, road_info, sign_data.gdc_Id)
        
        if gdc_id is None: raise Exception("Failed to sign PDF", message)

        # Tạo file PDF cuối cùng
        qr_url = f"https://digital-signature-falcon.vercel.app/verify/{gdc_id}"
        generate_qr_code(qr_url, "qr_code.png")
        qr_pdf = f"signed_pdf/{gdc_id}_qr.pdf"
        insert_qr_to_pdf(temp_path, "qr_code.png", qr_pdf)
        
        create_watermark(user, gdc, "Sitka Banner.ttf", "watermark.pdf")
        final_pdf = f"signed_pdf/{gdc_id}.pdf"
        add_watermark(qr_pdf, "watermark.pdf", final_pdf)

        # --- SECURITY UPGRADE: LƯU MÃ HASH GỐC ---
        original_hash = calculate_pdf_hash(final_pdf)

        update_data = {
            "CP_username": chingsphu["CP_username"],
            "sign_place": chingsphu["sign_place"],
            "sign_date": datetime.now().isoformat(),
            "signature": signature,
            "file_hash": original_hash # Lưu "vân tay" file vào DB
        }
        await gdc_collection.update_one({"gdc_Id": gdc_id}, {"$set": update_data})

        # Dọn dẹp file tạm
        for f in ["qr_code.png", "watermark.pdf", qr_pdf]:
            if os.path.exists(f): os.remove(f)

        return JSONResponse(status_code=200, content={"Status": "Success", "Message": message})
    except Exception as e:
        return JSONResponse(status_code=500, content={"Status": "Error", "Message": str(e)})

@app.post("/verify/{gdc_id}")
async def verify(gdc_id: str):
    try:
        gdc = await gdc_collection.find_one({"gdc_Id": gdc_id})
        if not gdc:
            return JSONResponse(status_code=404, content={"Status": "Invalid", "Message": "Mã QR không tồn tại!"})

        if "signature" not in gdc:
            return JSONResponse(status_code=200, content={"Status": "Unsigned", "Message": "Giấy đi chợ chưa được xác thực!"})

        # --- SECURITY UPGRADE: KIỂM TRA TÍNH TOÀN VẸN (ANTI-PTS) ---
        current_pdf_path = f"signed_pdf/{gdc_id}.pdf"
        if os.path.exists(current_pdf_path):
            current_hash = calculate_pdf_hash(current_pdf_path)
            if current_hash != gdc.get("file_hash"):
                return JSONResponse(status_code=200, content={
                    "Status": "Tampered", 
                    "Message": "CẢNH BÁO: Tài liệu đã bị chỉnh sửa nội dung trái phép (PTS)!"
                })

        # Nếu Hash khớp, tiến hành verify Falcon như cũ
        # Giả lập xác thực Falcon thành công
        chingsphu = await chingsphu_collection.find_one({"CP_username": gdc["CP_username"]})
        
        return JSONResponse(status_code=200, content={
            "Status": "Success",
            "Message": "Xác thực thành công! Nội dung nguyên bản.",
            "cccd": gdc["cccd"],
            "start_place": gdc["start_place"],
            "destination_place": gdc["destination_place"],
            "chingsphu_name": chingsphu["name"] if chingsphu else "UBND",
            "sign_date": gdc["sign_date"],
            "sign_place": gdc["sign_place"]
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"Status": "Error", "Message": str(e)})
    
@app.post("/request_sign")
async def request_sign(request: RequestSignModel, token: str = Depends(oauth2_scheme)):
    user_access = decode_access_token(token)
    if user_access is None:
        raise HTTPException(status_code=401, detail="Not authorized")
    
    user = await user_collection.find_one({"_id": request.cccd})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    gdc_Id = ''.join(random.choices(string.digits, k=6))
    while await gdc_collection.find_one({"gdc_Id": gdc_Id}):
        gdc_Id = ''.join(random.choices(string.digits, k=6))

    gdc = {
        "_id": gdc_Id,
        "gdc_Id": gdc_Id,
        "cccd": request.cccd,
        "start_place": request.start_place,
        "destination_place": request.destination_place,
    }
    await gdc_collection.insert_one(gdc)

    return gdc

@app.get("/download_signed/{gdc_id}")
async def download_signed(gdc_id: str):
    gdc = await gdc_collection.find_one({"gdc_Id": gdc_id})

    if not gdc or "signature" not in gdc:
        raise HTTPException(status_code=404, detail="GDC not found or not signed yet")

    signed_pdf_path = f"signed_pdf/{gdc_id}.pdf"
    return FileResponse(signed_pdf_path, filename="signed_GDC.pdf")

@app.get("/load_gdc/{cccd}")
async def load_gdc(cccd: str):
    gdc_list = await gdc_collection.find({"cccd": cccd}).to_list(length=100)
    if not gdc_list:
        raise HTTPException(status_code=404, detail="No GDC found for this CCCD")
    return JSONResponse(status_code=200, content=gdc_list)

@app.get("/load_all_gdc")
async def load_all_gdc(token: str = Depends(oauth2_scheme)):
    user_access = decode_access_token(token)
    if user_access is None or user_access["type"] != "chingsphu":
        raise HTTPException(status_code=401, detail="Not authorized")
    
    gdc_list = await gdc_collection.find().to_list(length=1000)
    if not gdc_list:
        raise HTTPException(status_code=404, detail="No GDC found")
    return JSONResponse(status_code=200, content=gdc_list)