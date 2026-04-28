from pydantic import BaseModel, Field

class User(BaseModel):
    cccd: str = Field(..., description="The CCCD of the user")
    password: str = Field(..., description="The password of the user")
    name: str = Field(..., description="The name of the user")
    gender: str = Field(..., description="The gender of the user")

class ChingsPhu(BaseModel):
    CP_username: str = Field(..., description="The username of the ChingsPhu")
    password: str = Field(..., description="The password of the ChingsPhu")
    name: str = Field(..., description="The name of the ChingsPhu")
    sign_place: str = Field(..., description="The place where the ChingsPhu signs")

class GDC(BaseModel):
    cccd: str = Field(..., description="The CCCD of the user associated with this GDC")
    CP_username: str = Field(..., description="The username of the ChingsPhu")
    gdc_Id: str = Field(..., description="The ID of the GDC")
    sign_date: str = Field(..., description="The date of signing")
    sign_place: str = Field(..., description="The place of signing")
    start_place: str = Field(..., description="The starting place of the GDC")
    destination_place: str = Field(..., description="The destination place of the GDC")
    signature: str = Field(..., description="The signature of the GDC")

class LoginForm(BaseModel):
    username: str = Field(..., description="The username of the account (CCCD for user, CP_username for ChingsPhu)")
    password: str = Field(..., description="The password of the account")

class LoginForm(BaseModel):
    username: str
    password: str
    
class SignModel(BaseModel):
    gdc_Id: str
    CP_username: str

class RequestSignModel(BaseModel):
    cccd: str
    start_place: str
    destination_place: str