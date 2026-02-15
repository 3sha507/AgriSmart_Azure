from flask import Flask, request, jsonify, render_template
import joblib
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import os

app = Flask(__name__)

# --- MODEL LOADING ---
try:
    crop_model = joblib.load("models/crop_model.pkl")
    # Load without compiling to avoid version-specific optimizer errors
    disease_model = tf.keras.models.load_model("models/disease_model.h5", compile=False)
    print("AI Models Loaded Successfully")
except Exception as e:
    print(f"Error Loading Models: {e}")

# --- DATA DICTIONARIES ---
TREATMENTS = {
    'TOMATO EARLY BLIGHT': "Apply copper-based fungicides. Remove lower infected leaves and ensure 2-foot spacing between plants for better airflow.",
    'TOMATO HEALTHY': "Your plant is healthy! Continue regular watering at the base and monitor for pests weekly.",
    'POTATO LATE BLIGHT': "Apply Chlorothalonil or Mancozeb immediately. Destroy infected tubers and avoid overhead irrigation to reduce humidity."
}

# Ensure these match your model's output classes exactly
class_names = ['Tomato_Early_blight', 'Tomato_healthy', 'Potato_late_blight']

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict_crop', methods=['POST'])
def predict_crop():
    try:
        data = request.get_json()
        # Features: N, P, K, temp, humidity, ph, rainfall
        features = np.array([[ 
            float(data['N']), float(data['P']), float(data['K']),
            float(data['temp']), float(data['humidity']),
            float(data['ph']), float(data['rainfall'])
        ]])
        prediction = crop_model.predict(features)
        return jsonify({'success': True, 'result': str(prediction[0]).upper()})
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/predict_disease', methods=['POST'])
def predict_disease():
    img_path = "temp_prediction.jpg"
    try:
        if 'file' not in request.files:
            return jsonify({'success': False, 'error': 'No file uploaded'}), 400
        
        file = request.files['file']
        file.save(img_path)

        # Preprocessing
        img = image.load_img(img_path, target_size=(224, 224))
        img_array = image.img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Prediction
        prediction = disease_model.predict(img_array)
        result_raw = class_names[np.argmax(prediction)].replace('_', ' ').upper()
        
        if os.path.exists(img_path): os.remove(img_path)

        return jsonify({
            'success': True,
            'result': result_raw,
            'treatment': TREATMENTS.get(result_raw, "Consult an agricultural expert for treatment.")
        })
    except Exception as e:
        if os.path.exists(img_path): os.remove(img_path)
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)