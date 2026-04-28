from motor.motor_asyncio import AsyncIOMotorClient

database_name = "ToiDaFakeHon250kgdc"
user_collection_name = "users"
gdc_collection_name = "gdc"
chingsphu_collection_name = "chingsphu"

client = AsyncIOMotorClient('mongodb+srv://lpatuan27_db_user:hbFkhZv5TbLzzlV6@cluster0.rvyox2q.mongodb.net/?appName=Cluster0')

database = client[database_name]
user_collection = database[user_collection_name]
gdc_collection = database[gdc_collection_name]
chingsphu_collection = database[chingsphu_collection_name]