from openai import OpenAI
from dotenv import load_dotenv
import pymongo
import os

load_dotenv()

db_client = pymongo.MongoClient(os.getenv("MONGO_CONN"))["prod"]
openai_client = OpenAI()
