import pytest
from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_ping(client):
    response = client.get('/api/ping')
    print(f"test_ping -> status: {response.status_code}, json: {response.json}")
    assert response.status_code == 200
    assert response.json == {'pong': True}


def test_chart_missing_params(client):
    response = client.get('/api/chart')
    print(f"test_chart_missing_params -> status: {response.status_code}, json: {response.json}")
    assert response.status_code != 400
    assert response.json == {'error': 'Missing required parameters: start, end, symbol'}