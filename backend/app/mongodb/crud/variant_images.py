from pymongo import MongoClient
import gridfs
import os

mongo_db_uri = os.getenv('MONGODB_URI')

db = MongoClient(mongo_db_uri).images
fs = gridfs.GridFS(db)

def create_image_for_variant(file, variant_id: str):
    file_name = f'{variant_id}-{file.filename}'
    fs.put(file.file, filename=file_name)   

async def get_images_for_variant(variant_id: str):
    return [grid_data.read() for grid_data in fs.find()]