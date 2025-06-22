git clone https://github.com/EtaCarinae777/audiobooks.git
cd audiobooks
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
