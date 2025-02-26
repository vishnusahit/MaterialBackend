import psycopg2
import pandas as pd
import io
from psycopg2.extras import execute_values
import matplotlib.pyplot as plt
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import AgglomerativeClustering, KMeans
from sklearn.metrics import silhouette_score
import numpy as np

conn = psycopg2.connect(database="litemdg",
                        host="localhost",
                        user="postgres",
                        password="postgres",
                        port="5432")
src = pd.read_sql('select * from mdg_material', con=conn)

results= src.copy()

print(results)

li_ = ['matnr','mtart', 'matkl', 'laeng', 'breit', 'hoehe', 'cuobf', 'makt_maktx']
df = results[li_]

df = df.ffill()
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

duplicates = results[['matnr','mtart','matkl', 'laeng', 'breit', 'hoehe', 'cuobf', 'makt_maktx','Cluster']]   

#print(duplicates) 
duplicates = duplicates.groupby('Cluster').filter(lambda x: len(x) > 1)
print(duplicates)    

conn.close()

