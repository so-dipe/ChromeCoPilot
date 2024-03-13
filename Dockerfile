FROM python:3.10-slim

# Set the working directory
WORKDIR /backend

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY backend .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--reload","--host", "0.0.0.0", "--port", "8000"]
