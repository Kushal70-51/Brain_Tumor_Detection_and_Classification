"""
Test script for the Brain Tumor Detection API.
Run this to test the API endpoints without a frontend.
"""

import requests
import json
import sys
from pathlib import Path

# API base URL
BASE_URL = "http://localhost:5000"

def test_health():
    """Test the health check endpoint."""
    print("\n" + "="*60)
    print("Testing: GET /health")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_info():
    """Test the info endpoint."""
    print("\n" + "="*60)
    print("Testing: GET /info")
    print("="*60)
    
    try:
        response = requests.get(f"{BASE_URL}/info")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_predict_missing_file():
    """Test prediction with missing file."""
    print("\n" + "="*60)
    print("Testing: POST /predict (Missing File)")
    print("="*60)
    
    try:
        response = requests.post(f"{BASE_URL}/predict")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_predict_invalid_file():
    """Test prediction with invalid file type."""
    print("\n" + "="*60)
    print("Testing: POST /predict (Invalid File Type)")
    print("="*60)
    
    try:
        files = {'image': ('test.txt', b'This is not an image', 'text/plain')}
        response = requests.post(f"{BASE_URL}/predict", files=files)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return response.status_code == 400
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def test_predict_with_image(image_path):
    """Test prediction with a real image."""
    print("\n" + "="*60)
    print(f"Testing: POST /predict (with image: {image_path})")
    print("="*60)
    
    try:
        if not Path(image_path).exists():
            print(f"Error: Image file not found at {image_path}")
            return False
        
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(f"{BASE_URL}/predict", files=files)
        
        print(f"Status Code: {response.status_code}")
        result = response.json()
        
        if response.status_code == 200:
            print(f"Prediction: {result.get('prediction')}")
            print(f"Confidence: {result.get('confidence')}%")
            print(f"Probabilities: {json.dumps(result.get('probabilities'), indent=2)}")
            print(f"Grad-CAM Image: {result.get('gradcam', 'N/A')[:100]}...")
        else:
            print(f"Response: {json.dumps(result, indent=2)}")
        
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return False

def main():
    """Run all tests."""
    print("\n" + "="*60)
    print("Brain Tumor Detection API - Test Suite")
    print("="*60)
    print(f"API Base URL: {BASE_URL}")
    
    # Check if API is running
    try:
        requests.get(f"{BASE_URL}/health", timeout=2)
    except requests.exceptions.ConnectionError:
        print(f"\n✗ Error: Cannot connect to API at {BASE_URL}")
        print("Make sure the API is running: python app.py")
        sys.exit(1)
    
    results = {
        'Health Check': test_health(),
        'Info Endpoint': test_info(),
        'Missing File Error': test_predict_missing_file(),
        'Invalid File Error': test_predict_invalid_file(),
    }
    
    # Test with image if provided
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
        results['Predict with Image'] = test_predict_with_image(image_path)
    else:
        print("\n" + "="*60)
        print("To test prediction with an image, run:")
        print(f"python test_api.py <path_to_image>")
        print("="*60)
    
    # Summary
    print("\n" + "="*60)
    print("Test Summary")
    print("="*60)
    
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name}: {status}")
    
    passed_count = sum(1 for p in results.values() if p)
    total_count = len(results)
    
    print(f"\nTotal: {passed_count}/{total_count} tests passed")
    
    return 0 if passed_count == total_count else 1

if __name__ == "__main__":
    sys.exit(main())
