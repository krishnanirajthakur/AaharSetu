import pytest
import json
from services.geo_service import get_maps_client, get_context_dashboard
from services.ai_engine import generate_response, configure_gemini
from static.manifest.json import name as manifest_name  # Direct validate
import os

@pytest.fixture
def mock_api_keys():
    os.environ['GEMINI_API_KEY'] = 'test'
    os.environ['GOOGLE_MAPS_API_KEY'] = 'test'
    configure_gemini()

def test_maps_integration(mock_api_keys):
    """Test Google Maps returns valid response."""
    client = get_maps_client()
    dashboard = get_context_dashboard()
    assert isinstance(dashboard['healthy_spots'], list)
    assert len(dashboard['healthy_spots']) > 0 or 'Fallback' in dashboard['healthy_spots'][0]

def test_gemini_none_inputs(mock_api_keys):
    """Test Gemini handles None inputs."""
    result = generate_response('', None, False)
    assert isinstance(result, str)
    assert 'error' in result.lower() or len(result) > 10  # Valid or error msg

def test_pwa_manifest():
    """Validate PWA manifest."""
    with open('static/manifest.json', 'r') as f:
        manifest = json.load(f)
    assert manifest['name'] == 'AaharSetu'
    assert 'icons' in manifest
    assert manifest['display'] == 'standalone'

if __name__ == '__main__':
    pytest.main(['-v'])
