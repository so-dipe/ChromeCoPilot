FROM python:3.10-slim

# Set the working directory
WORKDIR /backend

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

RUN ls -la

COPY backend .

CMD ["uvicorn", "app.main:app"]
# CMD ["uvicorn", "app.main:app", "--reload"]