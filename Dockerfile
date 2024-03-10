FROM python:3.10-slim

# Set the working directory
WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY backend .

CMD ["uvicorn", "app.main:app"]