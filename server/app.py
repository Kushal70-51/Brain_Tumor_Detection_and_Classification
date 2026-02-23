import os
import numpy as np
import cv2
import base64
import tensorflow as tf
from tensorflow.keras.models import load_model
from flask import Flask, request, jsonify
from flask_cors import CORS
from io import BytesIO
from pathlib import Path

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "brain_tumor_cnn_model.h5")
CLASS_LABELS = ['Glioma', 'Meningioma', 'No Tumor', 'Pituitary']
IMG_SIZE = 224
GRADCAM_LAYER_NAME = 'conv2d_2'

# Global model variable - loaded once at startup
model = None
grad_model = None

def load_models():
    """Load the TensorFlow/Keras model once at startup."""
    global model, grad_model
    try:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")
        
        model = load_model(MODEL_PATH)
        print(f"✓ Model loaded successfully from {MODEL_PATH}")
        
        # Try to create Grad-CAM model
        try:
            # First, try building the model with a sample input
            sample_input = np.zeros((1, IMG_SIZE, IMG_SIZE, 3), dtype=np.float32)
            _ = model(sample_input)  # Call the model to initialize it
            
            # Now try to create the grad model
            grad_model = tf.keras.models.Model(
                inputs=model.input,
                outputs=[
                    model.get_layer(GRADCAM_LAYER_NAME).output,
                    model.output
                ]
            )
            print(f"✓ Grad-CAM model created with layer: {GRADCAM_LAYER_NAME}")
        except Exception as grad_error:
            print(f"⚠ Warning: Could not create Grad-CAM model: {str(grad_error)}")
            print("⚠ Grad-CAM will be created dynamically during prediction")
            grad_model = None
        
    except Exception as e:
        print(f"✗ Error loading model: {str(e)}")
        raise

def preprocess_image(image_array):
    """
    Preprocess the image for model prediction.
    
    Args:
        image_array: OpenCV image array (BGR format)
    
    Returns:
        Preprocessed image array ready for model prediction
    """
    try:
        # Convert BGR to RGB
        if len(image_array.shape) == 3:
            image_rgb = cv2.cvtColor(image_array, cv2.COLOR_BGR2RGB)
        else:
            image_rgb = image_array
        
        # Resize to 224x224
        resized = cv2.resize(image_rgb, (IMG_SIZE, IMG_SIZE))
        
        # Normalize: divide by 255
        normalized = resized.astype(np.float32) / 255.0
        
        # Expand dimensions to match model input: (1, 224, 224, 3)
        img_array = np.expand_dims(normalized, axis=0)
        
        return img_array, normalized
    
    except Exception as e:
        raise ValueError(f"Image preprocessing failed: {str(e)}")

def get_last_conv_layer(model):
    """Find the last convolutional layer in the model."""
    for layer in reversed(model.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
    raise ValueError("No Conv2D layer found in model.")


def make_gradcam_heatmap(img_array, model, pred_index=None):
    """
    Generate Grad-CAM heatmap focusing on tumor regions.
    
    Args:
        img_array: Preprocessed image array (1, 224, 224, 3)
        model: Loaded Keras model
        pred_index: Index of predicted class
    
    Returns:
        Heatmap array (224, 224) with values between 0 and 1
    """
    try:
        last_conv_layer_name = get_last_conv_layer(model)
        
        grad_model = tf.keras.models.Model(
            inputs=model.inputs,
            outputs=[
                model.get_layer(last_conv_layer_name).output,
                model.output
            ]
        )
        
        # Ensure we watch the input
        with tf.GradientTape() as tape:
            tape.watch(img_array)
            conv_outputs, predictions = grad_model(img_array, training=False)
            
            if pred_index is None:
                pred_index = tf.argmax(predictions[0])
            
            # Get the predicted class channel
            class_channel = predictions[:, pred_index]
        
        # Compute gradients of predicted class with respect to conv layer
        grads = tape.gradient(class_channel, conv_outputs)
        
        if grads is None:
            print("⚠ Warning: Gradients are None, using fallback heatmap")
            return np.ones((IMG_SIZE, IMG_SIZE), dtype=np.float32) * 0.5
        
        # Global average pooling of gradients
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
        
        # Weight the conv layer output by pooled gradients
        conv_outputs = conv_outputs[0]
        heatmap = tf.reduce_sum(conv_outputs * pooled_grads, axis=-1)
        
        # Convert to NumPy for further processing
        heatmap = heatmap.numpy()
        
        # 🔥 Apply ReLU using NumPy - keep only positive gradients (tumor regions)
        heatmap = np.maximum(heatmap, 0)
        
        # 🔥 Normalize heatmap to [0, 1] range
        heatmap /= (np.max(heatmap) + 1e-8)
        
        # 🔥 Remove weak activations (threshold at 0.4 to isolate strong tumor signals)
        heatmap[heatmap < 0.4] = 0
        
        # Final normalization after thresholding
        heatmap_max = np.max(heatmap)
        if heatmap_max > 0:
            heatmap /= heatmap_max
        else:
            print("⚠ Warning: No strong activations found, using fallback heatmap")
            return np.ones((IMG_SIZE, IMG_SIZE), dtype=np.float32) * 0.3
        
        return heatmap.astype(np.float32)
    
    except Exception as e:
        print(f"✗ Grad-CAM Error: {str(e)}")
        return np.ones((IMG_SIZE, IMG_SIZE), dtype=np.float32) * 0.5

def overlay_gradcam(original_image, heatmap, alpha=0.4):
    """
    Overlay Grad-CAM heatmap on original image using OpenCV.
    
    Args:
        original_image: Original image array (BGR format)
        heatmap: Grad-CAM heatmap array
        alpha: Transparency factor for heatmap overlay
    
    Returns:
        Image with overlayed heatmap (BGR format)
    """
    try:
        # Ensure heatmap is in range [0, 1]
        if heatmap.max() > 1.0:
            heatmap = heatmap / 255.0
        
        # Resize heatmap to match image size
        heatmap_resized = cv2.resize(
            heatmap,
            (original_image.shape[1], original_image.shape[0])
        )
        
        # Convert heatmap to 0-255 range
        heatmap_uint8 = np.uint8(255 * heatmap_resized)
        
        # Apply colormap (JET creates blue-to-red gradient)
        # Blue = low activation, Red = high activation (tumor regions)
        heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
        
        # Convert grayscale to BGR if necessary
        if len(original_image.shape) == 2:
            original_image_bgr = cv2.cvtColor(original_image, cv2.COLOR_GRAY2BGR)
        else:
            original_image_bgr = original_image.copy()
        
        # Blend original image with heatmap
        # Higher alpha = more heatmap visibility on tumor regions
        overlay_image = cv2.addWeighted(
            original_image_bgr,
            1 - alpha,
            heatmap_colored,
            alpha,
            0
        )
        
        return overlay_image
    
    except Exception as e:
        print(f"✗ Overlay Error: {str(e)}")
        return original_image

def image_to_base64(image_array):
    """
    Convert OpenCV image array to base64 string.
    
    Args:
        image_array: OpenCV image array (BGR format)
    
    Returns:
        Base64 encoded string of the image
    """
    try:
        # Encode image to PNG format
        success, encoded_image = cv2.imencode('.png', image_array)
        
        if not success:
            raise ValueError("Failed to encode image")
        
        # Convert to base64 string
        base64_string = base64.b64encode(encoded_image.tobytes()).decode('utf-8')
        
        return base64_string
    
    except Exception as e:
        raise ValueError(f"Base64 encoding failed: {str(e)}")

@app.route("/predict", methods=["POST"])
def predict():
    """
    Main prediction endpoint.
    
    Accepts:
        - image: Image file (jpg/png/jpeg)
    
    Returns:
        JSON with:
        - prediction: Predicted class label
        - confidence: Confidence percentage
        - probabilities: All class probabilities
        - gradcam: Base64 encoded heatmap overlay image
    """
    try:
        # Validate request
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        
        # Validate file
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Validate file extension
        allowed_extensions = {'jpg', 'jpeg', 'png'}
        file_ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        
        if file_ext not in allowed_extensions:
            return jsonify({'error': f'Invalid file type. Allowed: {", ".join(allowed_extensions)}'}), 400
        
        # Read image file
        file_bytes = np.frombuffer(file.read(), np.uint8)
        original_image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        
        if original_image is None:
            return jsonify({'error': 'Failed to decode image. Ensure it is a valid image file'}), 400
        
        # Preprocess image
        img_array, normalized_img = preprocess_image(original_image)
        
        # Make prediction
        predictions = model.predict(img_array, verbose=0)
        
        # Get predicted class
        predicted_class_idx = np.argmax(predictions[0])
        predicted_label = CLASS_LABELS[predicted_class_idx]
        confidence = float(predictions[0][predicted_class_idx]) * 100
        
        # Get all class probabilities
        probabilities = {
            CLASS_LABELS[i]: float(predictions[0][i]) * 100
            for i in range(len(CLASS_LABELS))
        }
        
        # Generate Grad-CAM heatmap
        try:
            heatmap = make_gradcam_heatmap(img_array, model, pred_index=predicted_class_idx)
            
            # Overlay Grad-CAM on original image
            gradcam_overlay = overlay_gradcam(original_image, heatmap, alpha=0.4)
            
            # Convert to base64
            gradcam_base64 = image_to_base64(gradcam_overlay)
            gradcam_image = f'data:image/png;base64,{gradcam_base64}'
        except Exception as gradcam_error:
            print(f"⚠ Warning: Grad-CAM generation failed: {str(gradcam_error)}")
            gradcam_image = None  # Return without Grad-CAM if it fails
        
        # Prepare response
        response = {
            'success': True,
            'prediction': predicted_label,
            'confidence': round(confidence, 2),
            'probabilities': {k: round(v, 2) for k, v in probabilities.items()},
            'gradcam': gradcam_image
        }
        
        return jsonify(response), 200
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

@app.route("/health", methods=["GET"])
def health():
    """Health check endpoint."""
    try:
        # Simple check to ensure model is loaded
        if model is None:
            return jsonify({'status': 'unhealthy', 'message': 'Model not loaded'}), 503
        
        return jsonify({
            'status': 'healthy',
            'message': 'Brain Tumor Detection API is running',
            'model_loaded': True,
            'classes': CLASS_LABELS
        }), 200
    
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route("/info", methods=["GET"])
def info():
    """API information endpoint."""
    return jsonify({
        'name': 'Brain Tumor Detection API',
        'version': '1.0.0',
        'description': 'Production-ready API for brain tumor classification with Grad-CAM visualization',
        'endpoints': {
            'POST /predict': 'Make predictions on uploaded MRI images',
            'GET /health': 'Health check endpoint',
            'GET /info': 'API information'
        },
        'supported_classes': CLASS_LABELS,
        'model_input_size': f'{IMG_SIZE}x{IMG_SIZE}',
        'supported_formats': ['jpg', 'jpeg', 'png']
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors."""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors."""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == "__main__":
    # Load model at startup
    load_models()
    
    # Run Flask app
    # For production, use a WSGI server like Gunicorn
    # gunicorn -w 4 -b 0.0.0.0:5000 app:app
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=False,  # Set to False in production
        threaded=True
    )
