import os
from flask import Flask, jsonify,request, Response
from flask_cors import CORS, cross_origin
from cfenv import AppEnv
import pandas as pd
import json
import uuid
import requests
import psycopg2
from psycopg2.extras import execute_values
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.metrics import silhouette_score
import numpy as np

app = Flask(__name__)
CORS(app, support_credentials=True)
port = int(os.environ.get('PORT', 3000))
env = AppEnv()

def fetch_data():
    conn = psycopg2.connect(database="wHJfBgpmVogH",
                        host="postgres-4c619816-1326-483c-84f3-75bfc147787f.cqryblsdrbcs.us-east-1.rds.amazonaws.com",
                        user="4f9592fece65",
                        password="cf8cc4cd484dcae6f10fc",
                        port="6026")
    src = pd.read_sql('select * from mdg_material', con=conn)
    conn.close()
    return(src)
@app.route('/result')
@cross_origin(supports_credentials=True)
def app_disp():
    duplicate=fetch_data()
    return Response(duplicate)
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port,debug=True)
