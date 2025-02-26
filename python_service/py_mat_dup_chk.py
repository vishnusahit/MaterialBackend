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
import datetime

app = Flask(__name__)
CORS(app, support_credentials=True)
port = int(os.environ.get('PORT', 3000))
env = AppEnv()

def fetch_data():
    
    conn = psycopg2.connect(database="EEfEUmSshDFa",
                        host="postgres-ed70bc29-4270-4521-878a-7bc06ec249cd.ce4jcviyvogb.eu-central-1.rds.amazonaws.com",
                        user="d107ec387aa2",
                        password="c5311310a935f08822345f1c0a9",
                        port="7641")
    
      
    # query = '''
    #     SELECT * FROM (
    #         SELECT * FROM mdg_mara_staging
    #         UNION
    #         SELECT * FROM mdg_mara_staging_dummy
    #     ) AS combined_materials
    #     '''

    # query = '''
    #     SELECT id, matnr, mtart, matkl, laeng, breit, hoehe, cuobf, makt_maktx, createdat, createdby, 
    #            COALESCE(flag, 0) AS flag, table_name, COALESCE(requestnumber, 0) AS requestnumber
    #     FROM (
    #         SELECT id, matnr, mtart, matkl, laeng, breit, hoehe, cuobf, makt_maktx, createdat, createdby, NULL AS flag, 'mdg_mara_staging' AS table_name, NULL AS requestnumber
    #         FROM mdg_mara_staging
    #         UNION
    #         SELECT id, matnr, mtart, matkl, laeng, breit, hoehe, cuobf, makt_maktx, createdat, createdby, flag,'mdg_mara_staging_dummy' AS table_name, requestnumber
    #         FROM mdg_mara_staging_dummy
    #     ) AS combined_materials
    # '''

    # query = '''
    #     SELECT id, matnr, mtart, matkl, laeng, breit, hoehe, cuobf, makt_maktx, createdat, createdby, 
    #            flag, table_name, 
    #            COALESCE(rd.change_request_number, 0) AS requestnumber
    #     FROM (
    #         SELECT id, matnr, mtart, matkl, laeng, breit, hoehe, cuobf, makt_maktx, createdat, createdby, 0 AS flag, 'mdg_mara_staging' AS table_name
    #         FROM mdg_mara_staging
    #         UNION
    #         SELECT id, matnr, mtart, matkl, laeng, breit, hoehe, cuobf, makt_maktx, createdat, createdby, 0 AS flag, 'mdg_mara_staging_dummy' AS table_name
    #         FROM mdg_mara_staging_dummy
    #     ) AS combined_materials
    #     LEFT JOIN mdg_change_request_details rd
    #     ON combined_materials.matnr = rd.Material_number
    # '''

    query = '''
           SELECT id, matnr, mtart, matkl, laeng, breit, hoehe, cuobf, makt_maktx, createdat, createdby, 
             flag, max_no, table_name, request_number as requestnumber
             FROM (
             SELECT id, matnr, mtart1_material_type as mtart, matkl, laeng, breit, hoehe, cuobf, makt_maktx, createdat, createdby, 
               rd.Change_request_number as request_number, 0 AS flag, 0 AS max_no, 'mdg_mara_staging' AS table_name
             FROM mdg_mara_staging as mara LEFT JOIN mdg_change_request_details rd
              ON mara.matnr = rd.Material_number 
             UNION
             SELECT id, matnr, mtart1_material_type as mtart, matkl, laeng, breit, hoehe, cuobf, makt_maktx, createdat, createdby, 
               request_number, 0 AS flag, max_no, 'mdg_mara_staging_dummy' AS table_name
             FROM mdg_mara_staging_dummy
              ) AS combined_materials
              
'''


    src = pd.read_sql(query, con=conn)

    results= src.copy()

    print(results)

    li_ = ['matnr','mtart', 'matkl', 'laeng', 'breit', 'hoehe', 'cuobf', 'makt_maktx']
    df = results[li_]

    df = df.ffill()
    df.fillna({'mtart': 'Unknown', 'matkl': 'Unknown', 'laeng': 0, 'breit': 0, 'hoehe': 0, 'cuobf': 0, 'makt_maktx': ''}, inplace=True)
    df.nunique()
    df.isna().sum()
    # Encode categorical columns
    encoder = LabelEncoder()
    encoded_columns = df[['mtart', 'matkl']]
    df_encoded = encoded_columns.apply(encoder.fit_transform)
    df_og = df.copy()
    df['mtart'] = df_encoded['mtart']
    df['matkl'] = df_encoded['matkl']

    k = 1
    threshold = 1 #0.8

    max_cluster_label = 0  # Initialize cluster label offset

    for cluster_id in df['matkl'].unique():
        cluster_data = df[df['matkl'] == cluster_id].copy()  # Create a copy of the DataFrame
        
        
        # Check if there are at least two samples in the cluster
        if len(cluster_data) >= 2:
            # Prepare numerical data for Agglomerative clustering
            scaler = StandardScaler()
            X_numerical = scaler.fit_transform(cluster_data[[ 'laeng', 'breit', 'hoehe', 'cuobf', 'mtart']])
            
            # Vectorize text data
            vectorizer = TfidfVectorizer()
            X_text = vectorizer.fit_transform(cluster_data['makt_maktx'])
            
            # Convert sparse matrix to dense array
            X_text_dense = X_text.toarray()

            # Concatenate numerical and text features
            # X_combined = np.concatenat((X_numerical, X_text_dense), axis=1)
            X_combined = np.hstack((X_numerical*k, X_text_dense))

            # Perform Agglomerative clustering
            agglomerative = AgglomerativeClustering(distance_threshold=threshold, linkage='ward', n_clusters=None)
            cluster_labels = agglomerative.fit_predict(X_combined)
            
            # Update cluster labels to ensure no collision with previous labels
            cluster_labels += max_cluster_label + 1
            
            # Update original dataframe with the cluster labels
            df.loc[cluster_data.index, 'Agglomerative_Cluster'] = cluster_labels
            
            # Update the maximum cluster label
            max_cluster_label = max(cluster_labels)
        else:
            # Assign unique cluster label for single mtart values
            df.loc[cluster_data.index, 'Agglomerative_Cluster'] = max_cluster_label + 1
            max_cluster_label += 1  # Increment the maximum cluster label

    df_og['Labels'] = df['Agglomerative_Cluster']

    results['Cluster'] = df_og['Labels']
    results = results.sort_values(by=['Cluster', 'matnr'])

    # results['flag'] = results.groupby('Cluster').cumcount().apply(lambda x: 1 if x > 0 else 0)
    # Check the size of each cluster and set the flag accordingly
    results['flag'] = results.groupby('Cluster')['Cluster'].transform('size').apply(lambda x: 1 if x > 1 else 0)


    if 'createdat' in results.columns:
        results['createdat_readable'] = pd.to_datetime(results['createdat'], unit='s', errors='coerce').dt.strftime("%Y-%m-%d %H:%M:%S")

    

    duplicates = results[['id','matnr','mtart','matkl', 'laeng', 'breit', 'hoehe', 'cuobf', 'makt_maktx','Cluster','flag','createdat_readable','createdby','requestnumber','max_no']]

    # overall_max_request_number_query = '''
    # SELECT MAX(change_request_number) AS max_request_number FROM mdg_change_request_details
    # '''
    overall_max_request_number_query = '''
    SELECT MAX(request_number) AS max_request_number
    FROM (
    SELECT rd.change_request_number AS request_number
    FROM mdg_mara_staging mara
    LEFT JOIN mdg_change_request_details rd
    ON mara.matnr = rd.Material_number
    UNION
    SELECT request_number
    FROM mdg_mara_staging_dummy
) AS combined;
'''

    overall_max_request_number_result = pd.read_sql(overall_max_request_number_query, con=conn)
    overall_max_request_number = overall_max_request_number_result['max_request_number'].iloc[0]
    

    #print(duplicates) 
    # duplicates = duplicates.groupby('Cluster').filter(lambda x: len(x) > 1)
    # overall_max_request_number = duplicates['requestnumber'].max()
    # final_duplicates = duplicates[duplicates['requestnumber'] == overall_max_request_number]
    final_duplicates = duplicates.groupby('Cluster').filter(
    lambda x: len(x) > 1 and overall_max_request_number in x['requestnumber'].values)

    # overall_max_no = final_duplicates['max_no'].max()

    # # Filter the records from the clusters which contain the overall maximum max_no
    # final_duplicates = final_duplicates[final_duplicates['max_no'] == overall_max_no]

    final_duplicates = final_duplicates.drop_duplicates(subset=['id', 'matnr', 'Cluster', 'requestnumber'])
    print(duplicates)  
#     mdg_mara_staging_dummy_data = results[(results['flag'] == 1) & (results['table_name'] == 'mdg_mara_staging_dummy')]

#     update_query = """
#     UPDATE mdg_mara_staging_dummy
#     SET flag = %s
#     WHERE id = %s
#     """

#     # Prepare the data to update
#     update_data = [(1, id_val) for id_val in mdg_mara_staging_dummy_data['id']]

# # Execute the update query
#     with conn.cursor() as cursor:
#      cursor.executemany(update_query, update_data)
#     conn.commit()

    conn.close()
    return(final_duplicates)
        
@app.route('/result')
@cross_origin(supports_credentials=True)
def app_disp():    
    duplicate=fetch_data()  
    duplicate_json = duplicate.to_json(orient='records')
    return Response(duplicate_json, mimetype='application/json')
    #return  Response(duplicate,mimetype='application/json')                

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=port,debug=True)