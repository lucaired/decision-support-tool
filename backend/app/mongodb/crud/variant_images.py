from pymongo import MongoClient
import gridfs
import os

mongo_db_uri = os.getenv('MONGODB_URI')

db = MongoClient(mongo_db_uri).images
fs = gridfs.GridFS(db)

def create_image_for_variant(file, variant_id: str):
    file_name = f'{variant_id}-{file.filename}'
    fs.put(file.file, filename=file_name)   

async def get_images_for_variant(variant_id: str) -> list[str]:
    file_names = fs.list() 
    return list(filter(lambda file_name: file_name[:len(variant_id)] == variant_id,file_names))

async def get_image_by_name(image_name: str):
    return fs.find_one({"filename": image_name}).read()