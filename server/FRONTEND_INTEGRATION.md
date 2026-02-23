"""
React Integration Examples for Brain Tumor Detection API
This file demonstrates how to integrate the backend API with various React components.
"""

# Example 1: Basic Image Upload Component
REACT_BASIC_COMPONENT = """
import React, { useState } from 'react';

export default function BrainTumorDetector() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = 'http://localhost:5000';

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Please select a JPG or PNG image');
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
    setResult(null);
  };

  const handlePredict = async () => {
    if (!image) {
      setError('Please select an image');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-8">
          Brain Tumor Detection
        </h1>

        {/* Image Upload Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Upload MRI Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />

          {preview && (
            <div className="mt-6">
              <img
                src={preview}
                alt="Preview"
                className="w-full max-h-80 object-cover rounded-lg"
              />
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handlePredict}
            disabled={!image || loading}
            className="mt-6 w-full bg-blue-600 text-white py-2 px-4 rounded-lg
              font-semibold hover:bg-blue-700 disabled:opacity-50
              disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Predicting...' : 'Run Prediction'}
          </button>
        </div>

        {/* Results Section */}
        {result && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Results</h2>

            {/* Prediction */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <p className="text-sm text-gray-600">Predicted Diagnosis</p>
              <p className="text-2xl font-bold text-blue-900">
                {result.prediction}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Confidence: {result.confidence}%
              </p>
            </div>

            {/* Probabilities */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Class Probabilities
              </h3>
              <div className="space-y-3">
                {Object.entries(result.probabilities).map(([label, prob]) => (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {label}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {prob.toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${prob}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grad-CAM Visualization */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Grad-CAM Visualization
              </h3>
              <img
                src={result.gradcam}
                alt="Grad-CAM Heatmap"
                className="w-full rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-2">
                Red regions show areas the model focused on for diagnosis
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"""

# Example 2: Advanced Component with Drag & Drop
REACT_ADVANCED_COMPONENT = """
import React, { useState, useRef } from 'react';

export default function AdvancedBrainTumorDetector() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const dropZoneRef = useRef(null);

  const API_URL = 'http://localhost:5000';

  const handleFile = (file) => {
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      setError('Invalid file type. Please use JPG or PNG.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit');
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.add('border-blue-500', 'bg-blue-50');
  };

  const handleDragLeave = () => {
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-50');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    dropZoneRef.current?.classList.remove('border-blue-500', 'bg-blue-50');
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handlePredict = async () => {
    if (!image) return;

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', image);

      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Prediction failed');
      }

      const newResult = { ...data, timestamp: new Date().toLocaleString() };
      setResult(newResult);

      // Add to history
      setHistory([newResult, ...history.slice(0, 9)]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Brain Tumor Detection</h1>
        <p className="text-gray-400 mb-8">
          Advanced MRI Analysis with Grad-CAM Visualization
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload & Analysis Section */}
          <div className="lg:col-span-2">
            {/* Drag & Drop Zone */}
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-600 rounded-lg p-8
                text-center cursor-pointer transition-colors mb-6"
            >
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <p className="text-gray-400 mb-2">
                Drag and drop your MRI image here
              </p>
              <p className="text-gray-500 text-sm mb-4">or</p>
              <label className="inline-block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                  className="hidden"
                />
                <span className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded
                  cursor-pointer transition-colors">
                  Select Image
                </span>
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full max-h-96 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-900 text-red-200 p-4 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Predict Button */}
            <button
              onClick={handlePredict}
              disabled={!image || loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50
                py-3 rounded-lg font-semibold transition-colors"
            >
              {loading ? 'Analyzing...' : 'Run Analysis'}
            </button>

            {/* Results */}
            {result && (
              <div className="bg-gray-800 rounded-lg p-6 mt-6">
                <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>

                {/* Main Prediction */}
                <div className="bg-gradient-to-r from-blue-900 to-indigo-900
                  rounded-lg p-6 mb-6">
                  <p className="text-gray-400 mb-2">Diagnosis</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {result.prediction}
                  </p>
                  <p className="text-gray-400 mt-2">
                    Confidence: {result.confidence}%
                  </p>
                </div>

                {/* Probabilities */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Probabilities</h3>
                  <div className="space-y-3">
                    {Object.entries(result.probabilities).map(([label, prob]) => (
                      <div key={label}>
                        <div className="flex justify-between mb-1 text-sm">
                          <span>{label}</span>
                          <span>{prob.toFixed(1)}%</span>
                        </div>
                        <div className="bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${prob}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Grad-CAM */}
                <img
                  src={result.gradcam}
                  alt="Grad-CAM"
                  className="w-full rounded-lg"
                />
              </div>
            )}
          </div>

          {/* History Sidebar */}
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Analysis History</h3>
            {history.length === 0 ? (
              <p className="text-gray-400">No history yet</p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {history.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-700 rounded p-3 hover:bg-gray-600
                      cursor-pointer transition-colors"
                  >
                    <p className="font-semibold text-blue-400">
                      {item.prediction}
                    </p>
                    <p className="text-sm text-gray-400">
                      {item.confidence}% confidence
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {item.timestamp}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
"""

# Example 3: Custom Hook
REACT_CUSTOM_HOOK = """
import { useState, useCallback } from 'react';

const useBrainTumorAPI = (apiUrl = 'http://localhost:5000') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = useCallback(async (imageFile) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${apiUrl}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Prediction failed');
      }

      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  const checkHealth = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }, [apiUrl]);

  const getInfo = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/info`);
      return await response.json();
    } catch (err) {
      setError(err.message);
      return null;
    }
  }, [apiUrl]);

  return { predict, checkHealth, getInfo, loading, error };
};

export default useBrainTumorAPI;
"""

print("React Integration Examples for Brain Tumor Detection API")
print("=" * 60)
print()
print("EXAMPLE 1: BASIC COMPONENT")
print("-" * 60)
print(REACT_BASIC_COMPONENT)
print()
print()
print("EXAMPLE 2: ADVANCED COMPONENT WITH DRAG & DROP")
print("-" * 60)
print(REACT_ADVANCED_COMPONENT)
print()
print()
print("EXAMPLE 3: CUSTOM HOOK")
print("-" * 60)
print(REACT_CUSTOM_HOOK)
print()
print()
print("=" * 60)
print("Integration Steps:")
print("=" * 60)
print("""
1. Copy one of the components above into your React project
2. Install Tailwind CSS if using styles:
   npm install -D tailwindcss
3. Ensure the API is running at http://localhost:5000
4. Use the component in your React app
5. For production, update API_URL to your deployed backend

Environment Variables:
- REACT_APP_API_URL=http://localhost:5000 (development)
- REACT_APP_API_URL=https://api.example.com (production)
""")
