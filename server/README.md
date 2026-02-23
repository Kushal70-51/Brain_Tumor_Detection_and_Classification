# Brain Tumor Detection API - Backend Server

Production-ready Flask backend API for brain tumor classification with Grad-CAM visualization.

## Features

✓ **TensorFlow/Keras Model Loading** - Loads model once at startup for efficiency  
✓ **Image Preprocessing** - Automatic 224x224 resizing and normalization  
✓ **Model Predictions** - Returns class label, confidence, and probabilities  
✓ **Grad-CAM Heatmaps** - Generates visual explanations of model decisions  
✓ **CORS Enabled** - Ready for React frontend integration  
✓ **Error Handling** - Comprehensive validation and error responses  
✓ **Health Checks** - Built-in endpoints for monitoring  

## Setup Instructions

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Verify Model File

Ensure the model file exists at:
```
server/model/brain_tumor_cnn_model.h5
```

### 3. Run the Server

**Development (with auto-reload):**
```bash
python app.py
```

**Production (with Gunicorn):**
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

The API will be available at: `http://localhost:5000`

## API Endpoints

### 1. **POST /predict**
Make predictions on uploaded MRI images.

**Request:**
```bash
curl -X POST -F "image=@path/to/image.jpg" http://localhost:5000/predict
```

**Response (Success):**
```json
{
  "success": true,
  "prediction": "Glioma",
  "confidence": 95.32,
  "probabilities": {
    "Glioma": 95.32,
    "Meningioma": 3.12,
    "No Tumor": 1.08,
    "Pituitary": 0.48
  },
  "gradcam": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
}
```

**Response (Error):**
```json
{
  "error": "No image file provided"
}
```

**Supported Formats:** jpg, jpeg, png  
**Max Image Size:** No strict limit, but recommended < 10MB

### 2. **GET /health**
Health check endpoint to verify API status.

**Request:**
```bash
curl http://localhost:5000/health
```

**Response:**
```json
{
  "status": "healthy",
  "message": "Brain Tumor Detection API is running",
  "model_loaded": true,
  "classes": ["Glioma", "Meningioma", "No Tumor", "Pituitary"]
}
```

### 3. **GET /info**
Get API information and supported endpoints.

**Request:**
```bash
curl http://localhost:5000/info
```

**Response:**
```json
{
  "name": "Brain Tumor Detection API",
  "version": "1.0.0",
  "description": "Production-ready API for brain tumor classification with Grad-CAM visualization",
  "endpoints": {
    "POST /predict": "Make predictions on uploaded MRI images",
    "GET /health": "Health check endpoint",
    "GET /info": "API information"
  },
  "supported_classes": ["Glioma", "Meningioma", "No Tumor", "Pituitary"],
  "model_input_size": "224x224",
  "supported_formats": ["jpg", "jpeg", "png"]
}
```

## Architecture & Code Structure

### Key Components

**1. Model Loading (`load_models()`)**
- Loads model once at startup
- Creates Grad-CAM model for generating heatmaps
- Uses `conv2d_2` as the last convolutional layer

**2. Image Preprocessing (`preprocess_image()`)**
- Converts BGR to RGB
- Resizes to 224x224
- Normalizes by dividing by 255
- Expands dimensions for batch processing

**3. Grad-CAM Generation (`make_gradcam_heatmap()`)**
- Uses gradient computation for interpretability
- Generates heatmap showing important regions
- Normalizes output to 0-1 range

**4. Heatmap Overlay (`overlay_gradcam()`)**
- Applies colormap (jet) to heatmap
- Blends with original image
- Configurable transparency (alpha)

**5. Base64 Encoding (`image_to_base64()`)**
- Converts image to PNG
- Encodes to base64 for JSON response

**6. Main Endpoint (`/predict`)**
- Validates file upload
- Preprocesses image
- Runs prediction
- Generates Grad-CAM
- Returns comprehensive response

## Frontend Integration (React)

Example code to call the API from React:

```javascript
const predictTumor = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('http://localhost:5000/predict', {
    method: 'POST',
    body: formData
  });

  const data = await response.json();
  
  if (data.success) {
    console.log('Prediction:', data.prediction);
    console.log('Confidence:', data.confidence);
    console.log('Probabilities:', data.probabilities);
    console.log('Grad-CAM Image:', data.gradcam);
  }
};
```

## Error Handling

The API handles various error scenarios:

| Status | Error Message | Solution |
|--------|---------------|----------|
| 400 | No image file provided | Ensure 'image' field is in request |
| 400 | No file selected | Select a valid image file |
| 400 | Invalid file type | Use jpg, jpeg, or png format |
| 400 | Failed to decode image | Ensure image file is not corrupted |
| 500 | Prediction failed | Check model file and input data |
| 503 | Model not loaded | Verify model file path |

## Configuration

### Settings (in `app.py`)

```python
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model", "brain_tumor_cnn_model.h5")
CLASS_LABELS = ['Glioma', 'Meningioma', 'No Tumor', 'Pituitary']
IMG_SIZE = 224
GRADCAM_LAYER_NAME = 'conv2d_2'
```

Modify these values if needed for different models.

## Production Deployment

### Using Gunicorn with Nginx

1. **Install Gunicorn:**
```bash
pip install gunicorn
```

2. **Run Gunicorn:**
```bash
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

3. **Configure Nginx** (reverse proxy):
```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5000", "app:app"]
```

Build and run:
```bash
docker build -t brain-tumor-api .
docker run -p 5000:5000 -v $(pwd)/model:/app/model brain-tumor-api
```

## Performance Optimization

- **Model Loading:** Loads once at startup (~5-10 seconds)
- **Prediction Time:** ~1-3 seconds per image (GPU recommended)
- **Grad-CAM Generation:** ~200-500ms per image
- **Memory Usage:** ~2GB (model + inference)

### Recommendations

1. Use GPU acceleration (CUDA) for faster predictions
2. Implement request queuing for high traffic
3. Add caching for repeated predictions
4. Use load balancing for multiple instances
5. Monitor with application monitoring tools

## Troubleshooting

### Model Not Found
```
Error: Model file not found at server/model/brain_tumor_cnn_model.h5
```
**Solution:** Verify model file path and ensure it exists.

### Out of Memory
```
tensorflow.python.framework.errors_impl.ResourceExhaustedError
```
**Solution:** Reduce workers or use GPU acceleration.

### Slow Predictions
- Use GPU acceleration
- Reduce image size (if applicable)
- Implement caching
- Use multiple workers

## License

This project is part of the Neuroscan AI system.

## Support

For issues or questions, contact the development team.
