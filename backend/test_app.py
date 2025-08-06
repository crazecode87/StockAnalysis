import pytest
from app import app


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_ping(client):
    resp = client.get('/api/ping')
    assert resp.status_code == 200
    assert resp.json == {'pong': True}


def test_ohlc_requires_symbol(client):
    resp = client.get('/api/ohlc')
    assert resp.status_code == 400
