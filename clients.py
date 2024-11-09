from openai import OpenAI
from dotenv import load_dotenv
import pymongo
import os
import certifi
load_dotenv()

openai_client = OpenAI()
db_client = pymongo.MongoClient(os.getenv("MONGO_CONN"), tlsCAFile=certifi.where())["prod"]
db_client["questions"].find_one()