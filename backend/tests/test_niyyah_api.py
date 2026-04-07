"""
Backend API Tests for Niyyah Daily Islamic App
Tests: Auth (register, login), Practice State (save, get), History (save, get)
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test data prefix for cleanup
TEST_PREFIX = "TEST_"

class TestHealthCheck:
    """Basic API health check"""
    
    def test_api_root(self):
        """Test API root endpoint"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"✓ API root working: {data}")


class TestAuthEndpoints:
    """Authentication endpoint tests - register and login"""
    
    def test_register_new_user(self):
        """Test user registration with unique email"""
        unique_email = f"{TEST_PREFIX}user_{uuid.uuid4().hex[:8]}@niyyah.app"
        
        response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "name": "Test User"
        })
        
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == unique_email
        assert data["user"]["name"] == "Test User"
        assert "id" in data["user"]
        print(f"✓ User registered: {unique_email}")
        
        return data["access_token"], data["user"]
    
    def test_register_duplicate_email(self):
        """Test registration with existing email fails"""
        # First register
        unique_email = f"{TEST_PREFIX}dup_{uuid.uuid4().hex[:8]}@niyyah.app"
        
        response1 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "testpass123",
            "name": "First User"
        })
        assert response1.status_code == 201
        
        # Try to register again with same email
        response2 = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "differentpass",
            "name": "Second User"
        })
        
        assert response2.status_code == 400
        data = response2.json()
        assert "already registered" in data.get("detail", "").lower() or "email" in data.get("detail", "").lower()
        print(f"✓ Duplicate email rejected correctly")
    
    def test_login_success(self):
        """Test login with valid credentials"""
        # Use the pre-created test user
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@niyyah.app",
            "password": "test123"
        })
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "test@niyyah.app"
        assert len(data["access_token"]) > 0
        print(f"✓ Login successful for test@niyyah.app")
        
        return data["access_token"]
    
    def test_login_invalid_email(self):
        """Test login with non-existent email"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "nonexistent@niyyah.app",
            "password": "anypassword"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data.get("detail", "").lower()
        print(f"✓ Invalid email rejected correctly")
    
    def test_login_wrong_password(self):
        """Test login with wrong password"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@niyyah.app",
            "password": "wrongpassword"
        })
        
        assert response.status_code == 401
        data = response.json()
        assert "invalid" in data.get("detail", "").lower()
        print(f"✓ Wrong password rejected correctly")


class TestPracticeStateEndpoints:
    """Practice state CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@niyyah.app",
            "password": "test123"
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate - skipping practice tests")
        return response.json()["access_token"]
    
    def test_save_practice_state(self, auth_token):
        """Test saving practice state"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        practice_data = {
            "date": today,
            "state": {
                "fajr": True,
                "dhuhr": True,
                "asr": False,
                "maghrib": False,
                "isha": False,
                "_date": today
            },
            "counters": {
                "istighfar": 10,
                "tasbih": 33
            },
            "wird_state": {
                "matin": {"ayat_kursi": True},
                "soir": {}
            },
            "ramadan_state": {}
        }
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/practice/state",
            json=practice_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["date"] == today
        assert data["state"]["fajr"] == True
        assert data["counters"]["istighfar"] == 10
        assert "id" in data
        assert "user_id" in data
        print(f"✓ Practice state saved for {today}")
        
        return data
    
    def test_get_practice_state(self, auth_token):
        """Test retrieving practice state"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        # First save some state
        practice_data = {
            "date": today,
            "state": {"fajr": True, "dhuhr": True},
            "counters": {"istighfar": 5},
            "wird_state": {},
            "ramadan_state": {}
        }
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        save_response = requests.post(
            f"{BASE_URL}/api/practice/state",
            json=practice_data,
            headers=headers
        )
        assert save_response.status_code == 200
        
        # Now retrieve it
        get_response = requests.get(
            f"{BASE_URL}/api/practice/state/{today}",
            headers=headers
        )
        
        assert get_response.status_code == 200, f"Expected 200, got {get_response.status_code}: {get_response.text}"
        
        data = get_response.json()
        assert data["date"] == today
        assert data["state"]["fajr"] == True
        print(f"✓ Practice state retrieved for {today}")
    
    def test_practice_state_requires_auth(self):
        """Test that practice endpoints require authentication"""
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Try without auth header
        response = requests.get(f"{BASE_URL}/api/practice/state/{today}")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ Practice state requires authentication")
    
    def test_update_practice_state(self, auth_token):
        """Test updating existing practice state"""
        today = datetime.now().strftime("%Y-%m-%d")
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Save initial state
        initial_data = {
            "date": today,
            "state": {"fajr": True, "dhuhr": False},
            "counters": {"istighfar": 5},
            "wird_state": {},
            "ramadan_state": {}
        }
        
        response1 = requests.post(
            f"{BASE_URL}/api/practice/state",
            json=initial_data,
            headers=headers
        )
        assert response1.status_code == 200
        
        # Update state
        updated_data = {
            "date": today,
            "state": {"fajr": True, "dhuhr": True, "asr": True},
            "counters": {"istighfar": 15, "tasbih": 99},
            "wird_state": {"matin": {"ayat_kursi": True}},
            "ramadan_state": {}
        }
        
        response2 = requests.post(
            f"{BASE_URL}/api/practice/state",
            json=updated_data,
            headers=headers
        )
        assert response2.status_code == 200
        
        # Verify update
        get_response = requests.get(
            f"{BASE_URL}/api/practice/state/{today}",
            headers=headers
        )
        
        data = get_response.json()
        assert data["state"]["dhuhr"] == True
        assert data["state"]["asr"] == True
        assert data["counters"]["istighfar"] == 15
        assert data["counters"]["tasbih"] == 99
        print(f"✓ Practice state updated correctly")


class TestHistoryEndpoints:
    """History CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get auth token for authenticated requests"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test@niyyah.app",
            "password": "test123"
        })
        if response.status_code != 200:
            pytest.skip("Could not authenticate - skipping history tests")
        return response.json()["access_token"]
    
    def test_save_history(self, auth_token):
        """Test saving user history"""
        history_data = {
            "days": {"2026-04-01": True, "2026-04-02": True},
            "day_scores": {"2026-04-01": 85.0, "2026-04-02": 90.0},
            "streak": 5,
            "best_streak": 10,
            "total_days": 15
        }
        
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.post(
            f"{BASE_URL}/api/practice/history",
            json=history_data,
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["streak"] == 5
        assert data["best_streak"] == 10
        assert data["total_days"] == 15
        assert "id" in data
        print(f"✓ History saved successfully")
    
    def test_get_history(self, auth_token):
        """Test retrieving user history"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First save history
        history_data = {
            "days": {"2026-04-05": True},
            "day_scores": {"2026-04-05": 100.0},
            "streak": 7,
            "best_streak": 14,
            "total_days": 20
        }
        
        save_response = requests.post(
            f"{BASE_URL}/api/practice/history",
            json=history_data,
            headers=headers
        )
        assert save_response.status_code == 200
        
        # Retrieve history
        get_response = requests.get(
            f"{BASE_URL}/api/practice/history",
            headers=headers
        )
        
        assert get_response.status_code == 200, f"Expected 200, got {get_response.status_code}: {get_response.text}"
        
        data = get_response.json()
        assert data["streak"] == 7
        assert data["best_streak"] == 14
        print(f"✓ History retrieved successfully")
    
    def test_history_requires_auth(self):
        """Test that history endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/practice/history")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✓ History requires authentication")


class TestE2EAuthFlow:
    """End-to-end authentication and sync flow"""
    
    def test_full_auth_and_sync_flow(self):
        """Test complete flow: register -> save practice -> retrieve"""
        # 1. Register new user
        unique_email = f"{TEST_PREFIX}e2e_{uuid.uuid4().hex[:8]}@niyyah.app"
        
        register_response = requests.post(f"{BASE_URL}/api/auth/register", json={
            "email": unique_email,
            "password": "e2etest123",
            "name": "E2E Test User"
        })
        
        assert register_response.status_code == 201
        token = register_response.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        print(f"✓ Step 1: User registered")
        
        # 2. Save practice state
        today = datetime.now().strftime("%Y-%m-%d")
        practice_data = {
            "date": today,
            "state": {"fajr": True, "dhuhr": True, "asr": True, "maghrib": True, "isha": True},
            "counters": {"istighfar": 100, "tasbih": 99},
            "wird_state": {"matin": {"ayat_kursi": True, "shukr": True}},
            "ramadan_state": {}
        }
        
        save_response = requests.post(
            f"{BASE_URL}/api/practice/state",
            json=practice_data,
            headers=headers
        )
        
        assert save_response.status_code == 200
        print(f"✓ Step 2: Practice state saved")
        
        # 3. Save history
        history_data = {
            "days": {today: True},
            "day_scores": {today: 100.0},
            "streak": 1,
            "best_streak": 1,
            "total_days": 1
        }
        
        history_response = requests.post(
            f"{BASE_URL}/api/practice/history",
            json=history_data,
            headers=headers
        )
        
        assert history_response.status_code == 200
        print(f"✓ Step 3: History saved")
        
        # 4. Retrieve and verify
        get_practice = requests.get(
            f"{BASE_URL}/api/practice/state/{today}",
            headers=headers
        )
        
        assert get_practice.status_code == 200
        practice = get_practice.json()
        assert practice["state"]["fajr"] == True
        assert practice["counters"]["istighfar"] == 100
        print(f"✓ Step 4: Practice state verified")
        
        get_history = requests.get(
            f"{BASE_URL}/api/practice/history",
            headers=headers
        )
        
        assert get_history.status_code == 200
        history = get_history.json()
        assert history["streak"] == 1
        print(f"✓ Step 5: History verified")
        
        print(f"\n✓ E2E Flow Complete: register -> save -> retrieve all working!")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
