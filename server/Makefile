.PHONY: help install run dev test docker-build docker-run docker-stop clean lint format

help:
	@echo "Brain Tumor Detection API - Available Commands"
	@echo "=============================================="
	@echo ""
	@echo "Setup & Installation:"
	@echo "  make install         - Install dependencies"
	@echo "  make install-dev     - Install with dev dependencies"
	@echo "  make venv            - Create virtual environment"
	@echo ""
	@echo "Running:"
	@echo "  make run             - Run production server with Gunicorn"
	@echo "  make dev             - Run development server"
	@echo ""
	@echo "Testing & Quality:"
	@echo "  make test            - Run API tests"
	@echo "  make test-image      - Test with image (provide IMG_PATH=path)"
	@echo "  make lint            - Run linting checks"
	@echo "  make format          - Format code with Black"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build    - Build Docker image"
	@echo "  make docker-run      - Run Docker container"
	@echo "  make docker-stop     - Stop Docker container"
	@echo "  make docker-compose  - Run with Docker Compose"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean           - Clean cache and build files"
	@echo "  make env             - Create .env from .env.example"
	@echo "  make health          - Check API health"
	@echo "  make info            - Get API info"
	@echo ""

install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements.txt -r requirements-dev.txt

venv:
	python -m venv venv
	@echo "Virtual environment created. Activate with:"
	@echo "  Windows: venv\\Scripts\\activate"
	@echo "  Mac/Linux: source venv/bin/activate"

run:
	gunicorn -w 4 -b 0.0.0.0:5000 --timeout 120 app:app

dev:
	python app.py

test:
	python test_api.py

test-image:
	@if [ -z "$(IMG_PATH)" ]; then \
		echo "Usage: make test-image IMG_PATH=/path/to/image.jpg"; \
	else \
		python test_api.py $(IMG_PATH); \
	fi

lint:
	flake8 app.py --max-line-length=100
	flake8 config.py --max-line-length=100

format:
	black app.py config.py test_api.py

docker-build:
	docker build -t brain-tumor-api:latest .
	@echo "Docker image built: brain-tumor-api:latest"

docker-run:
	docker run -p 5000:5000 -v $$(pwd)/model:/app/model brain-tumor-api:latest

docker-stop:
	docker stop brain-tumor-api || true
	docker rm brain-tumor-api || true

docker-compose:
	docker-compose up -d
	@echo "API running at http://localhost:5000"
	@echo "Stop with: docker-compose down"

clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .coverage build dist *.egg-info
	@echo "Cleanup complete"

env:
	cp .env.example .env
	@echo ".env file created. Update with your settings."

health:
	curl http://localhost:5000/health

info:
	curl http://localhost:5000/info

install-gunicorn:
	pip install gunicorn

check-model:
	@if [ -f model/brain_tumor_cnn_model.h5 ]; then \
		echo "✓ Model file found"; \
		ls -lh model/brain_tumor_cnn_model.h5; \
	else \
		echo "✗ Model file not found at model/brain_tumor_cnn_model.h5"; \
	fi
