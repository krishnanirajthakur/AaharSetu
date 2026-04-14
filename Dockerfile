FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloud Run respects the PORT environment variable
ENV PORT=8080

CMD uvicorn main:app --host 0.0.0.0 --port ${PORT}
