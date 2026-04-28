from datetime import datetime, timezone, timedelta
from typing import Optional
import jwt
from jwt import InvalidTokenError
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
import re

SECRET_KEY = "ToiDaFakeHon250kGDC_DacBiet_BaoMat_FALCON_2026"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

ph = PasswordHasher()

def hash_password(password: str) -> str:
    """Băm mật khẩu bằng thuật toán Argon2id"""
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Xác thực mật khẩu. Trả về True nếu khớp, False nếu không."""
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, Exception):
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
            "username": payload.get("username"),
            "type": payload.get("type"),
            "cccd": payload.get("cccd")
        }
    except InvalidTokenError:
        return None

def validate_cccd(cccd: str) -> bool:
    """Kiểm tra tính hợp lệ của số CCCD Việt Nam"""
    if not re.fullmatch(r'\d{12}', cccd):
        return False

    province_code = int(cccd[:3])
    if province_code < 1 or province_code > 96:
        return False

    gender_century_code = int(cccd[3])
    if gender_century_code not in range(0, 10):
        return False

    birth_year_code = int(cccd[4:6])
    if birth_year_code < 0 or birth_year_code > 99:
        return False

    return True