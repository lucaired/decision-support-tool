import motor.motor_asyncio
import os
from dotenv import load_dotenv

load_dotenv()

MY_ENV_VAR = os.getenv('MONGODB_URI')


client = motor.motor_asyncio.AsyncIOMotorClient(MY_ENV_VAR)
mongodb = client.decisionSupportData