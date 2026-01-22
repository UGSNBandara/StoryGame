FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
# Don't copy source code - it will be mounted as volume
# COPY . .
# RUN python init_db.py
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


