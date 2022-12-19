FROM python:3.10

WORKDIR /code
COPY ./requirements.txt /code/requirements.txt
RUN pip install --upgrade pip
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt
ADD https://s3.amazonaws.com/ifcopenshell-builds/ifcopenshell-python-31-v0.7.0-cdde536-linux64.zip ifcopenshell-python.zip
RUN unzip ifcopenshell-python.zip -d /usr/local/lib/python3.10/site-packages/
COPY ./app /code/app

CMD ["uvicorn", "app.main:app", "--reload", "--host", "0.0.0.0", "--port", "80"]