from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="brain-tumor-detection-api",
    version="1.0.0",
    author="Neuroscan AI Team",
    description="Production-ready Flask API for brain tumor detection with Grad-CAM visualization",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/neuroscan-ai",
    python_requires=">=3.9",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Development Status :: 4 - Beta",
        "Intended Audience :: Healthcare Industry",
        "Topic :: Scientific/Engineering :: Medical Science Apps",
    ],
    install_requires=[
        "Flask==2.3.3",
        "Flask-CORS==4.0.0",
        "TensorFlow==2.13.0",
        "opencv-python==4.8.1.78",
        "numpy==1.24.3",
        "Werkzeug==2.3.7",
        "gunicorn==21.2.0",
    ],
    extras_require={
        "dev": [
            "pytest==7.4.0",
            "pytest-cov==4.1.0",
            "black==23.9.1",
            "flake8==6.1.0",
        ],
    },
)
