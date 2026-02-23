# 🚀 Quick Start Guide - Brain Tumor Detection API

## Prerequisites
- Python 3.9 or higher
- pip or conda package manager
- TensorFlow/Keras model file: `model/brain_tumor_cnn_model.h5`

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

**Tip:** Use a virtual environment to avoid conflicts:
```bash
# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Mac/Linux)
source venv/bin/activate

# Then install requirements
pip install -r requirements.txt
```

### Step 2: Verify Model File
Ensure your model exists at:
```
server/
├── model/
│   └── brain_tumor_cnn_model.h5  ← Should be here
├── app.py
└── requirements.txt
```

If not, download and place it in the `model/` folder.

### Step 3: Run the API Server
```bash
python app.py
```

You should see:
```
✓ Model loaded successfully from ./model/brain_tumor_cnn_model.h5
✓ Grad-CAM model created with layer: conv2d_2
 * Running on http://0.0.0.0:5000
```

### Step 4: Test the API
In a new terminal:
```bash
# Test health check
curl http://localhost:5000/health

# Test with an image
curl -X POST -F "image=@path/to/mri_scan.jpg" http://localhost:5000/predict
```

Or use the test script:
```bash
python test_api.py /path/to/image.jpg
```

## API Response Example

```json
{
  "success": true,
  "prediction": "Glioma",
  "confidence": 94.52,
  "probabilities": {
    "Glioma": 94.52,
    "Meningioma": 3.21,
    "No Tumor": 1.15,
    "Pituitary": 1.12
  },
  "gradcam": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA..."
}
```

## Frontend Integration (React Example)

```javascript
import React, { useState } from 'react';

function BrainTumorPredictor() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={handleImageUpload}
      />
      {loading && <p>Predicting...</p>}
      {result && (
        <div>
          <h3>Prediction: {result.prediction}</h3>
          <p>Confidence: {result.confidence}%</p>
          <img src={result.gradcam} alt="Grad-CAM" />
        </div>
      )}
    </div>
  );
}

export default BrainTumorPredictor;
```

## Common Issues & Solutions

### ❌ "Model file not found"
```
Error: Model file not found at ./model/brain_tumor_cnn_model.h5
```
**Solution:** Check if `brain_tumor_cnn_model.h5` exists in the `server/model/` folder.

### ❌ "ModuleNotFoundError: No module named 'tensorflow'"
```bash
# Solution: Install TensorFlow
pip install tensorflow
```

### ❌ "Address already in use"
```
OSError: [Errno 10048] Only one usage of each socket address
```
**Solution:** Change the PORT in the code or stop the process using port 5000:
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### ❌ Slow Predictions on CPU
**Solution:** Use GPU acceleration:
```bash
pip install tensorflow[and-cuda]
```

### ❌ CORS Error from Frontend
**Solution:** Already enabled in `app.py`, but verify by checking response headers.

## Performance Tips

1. **Use GPU:**
   ```bash
   pip install tensorflow[and-cuda]
   ```

2. **Reduce Model Size:** Consider using a quantized model

3. **Load Balancing:** Use multiple workers
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 app:app
   ```

4. **Cache Predictions:** For repeated requests of the same image

## API Endpoints Reference

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/predict` | POST | Predict tumor class from image |
| `/health` | GET | Check API health status |
| `/info` | GET | Get API information |

## Next Steps

- ✅ Integrate with your React frontend
- ✅ Deploy to cloud (AWS, Azure, GCP)
- ✅ Add authentication/authorization
- ✅ Set up logging and monitoring
- ✅ Implement request queuing for high load
- ✅ Add more model endpoints

## Documentation

For detailed documentation, see [README.md](./README.md)

## Support

For questions or issues:
1. Check [README.md](./README.md) for troubleshooting
2. Review `test_api.py` for API usage examples
3. Check model file format and integrity

---

**Good luck! 🧠 Happy predicting!**
