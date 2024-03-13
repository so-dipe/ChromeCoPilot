FROM python:3.10-slim

# Set the working directory
WORKDIR /backend

COPY requirements.txt .

RUN pip install -r requirements.txt

COPY backend .

CMD ["uvicorn", "app.main:app", "--reload"]
