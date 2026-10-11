from conftest import auth, signup

def test_me_requires_valid_session(client):
    assert client.get("/api/auth/me").status_code == 401
    assert client.get("/api/auth/me", headers=auth("garbage")).status_code == 401

def test_signup_login_me_contract(client):
    token = signup(client)
    me = client.get("/api/auth/me", headers=auth(token))
    assert me.status_code == 200
    body = me.json()
    assert body["email"] == "a@example.com" and body["has_password"] is True and "created_at" in body
    login = client.post("/api/auth/login", json={"email": "a@example.com", "password": "correct-horse-1"})
    assert login.status_code == 200 and login.json()["token_type"] == "bearer"
    assert client.post("/api/auth/login", json={"email": "a@example.com", "password": "wrong"}).status_code == 401

def test_profile_update_only_affects_own_account(client):
    t1, t2 = signup(client, "a@example.com"), signup(client, "b@example.com", name="Other Person")
    r = client.patch("/api/auth/me", json={"name": "  New   Name ", "marketing_opt_in": True}, headers=auth(t1))
    assert r.status_code == 200 and r.json()["name"] == "New Name" and r.json()["marketing_opt_in"] is True
    assert client.get("/api/auth/me", headers=auth(t2)).json()["name"] == "Other Person"
    assert client.patch("/api/auth/me", json={"name": "x"}, headers=auth(t1)).status_code == 422

def test_change_password_revokes_other_sessions_but_keeps_current(client):
    old = signup(client)
    other_device = client.post("/api/auth/login", json={"email": "a@example.com", "password": "correct-horse-1"}).json()["access_token"]
    bad = client.post("/api/auth/change-password", json={"current_password": "nope", "new_password": "brand-new-pass-2"}, headers=auth(old))
    assert bad.status_code == 403
    ok = client.post("/api/auth/change-password", json={"current_password": "correct-horse-1", "new_password": "brand-new-pass-2"}, headers=auth(old))
    assert ok.status_code == 200
    fresh = ok.json()["access_token"]
    assert client.get("/api/auth/me", headers=auth(fresh)).status_code == 200
    assert client.get("/api/auth/me", headers=auth(old)).status_code == 401
    assert client.get("/api/auth/me", headers=auth(other_device)).status_code == 401
    assert client.post("/api/auth/login", json={"email": "a@example.com", "password": "correct-horse-1"}).status_code == 401
    assert client.post("/api/auth/login", json={"email": "a@example.com", "password": "brand-new-pass-2"}).status_code == 200

def test_weak_password_rejected(client):
    t = signup(client)
    r = client.post("/api/auth/change-password", json={"current_password": "correct-horse-1", "new_password": "short"}, headers=auth(t))
    assert r.status_code == 422

def test_revoke_other_sessions(client):
    a = signup(client)
    b = client.post("/api/auth/login", json={"email": "a@example.com", "password": "correct-horse-1"}).json()["access_token"]
    r = client.post("/api/auth/sessions/revoke-others", headers=auth(a))
    assert r.status_code == 200
    assert client.get("/api/auth/me", headers=auth(r.json()["access_token"])).status_code == 200
    assert client.get("/api/auth/me", headers=auth(b)).status_code == 401

def test_session_endpoint(client):
    t = signup(client)
    r = client.get("/api/auth/session", headers=auth(t))
    assert r.status_code == 200 and "expires_at" in r.json()

def test_existing_registration_flow_still_works_and_export(client):
    t = signup(client)
    payload = {"mode": "individual", "name": "Asha Rao", "email": "a@example.com", "class_level": "9"}
    r = client.post("/api/registrations", json=payload, headers=auth(t))
    assert r.status_code == 201
    assert client.post("/api/registrations", json=payload).status_code == 401
    assert len(client.get("/api/registrations/mine", headers=auth(t)).json()) == 1
    exp = client.get("/api/auth/me/export", headers=auth(t))
    assert exp.status_code == 200 and exp.json()["registrations"][0]["class_level"] == "9"

def test_delete_account_requires_password_and_removes_data(client):
    t = signup(client)
    client.post("/api/registrations", json={"mode": "individual", "name": "Asha Rao", "email": "a@example.com", "class_level": "11"}, headers=auth(t))
    assert client.post("/api/auth/delete-account", json={"confirm": "DELETE", "password": "wrong"}, headers=auth(t)).status_code == 403
    assert client.post("/api/auth/delete-account", json={"confirm": "nope", "password": "correct-horse-1"}, headers=auth(t)).status_code == 422
    assert client.post("/api/auth/delete-account", json={"confirm": "DELETE", "password": "correct-horse-1"}, headers=auth(t)).status_code == 204
    assert client.get("/api/auth/me", headers=auth(t)).status_code == 401
    assert client.post("/api/auth/login", json={"email": "a@example.com", "password": "correct-horse-1"}).status_code == 401

def test_admin_tokens_cannot_act_as_users(client):
    admin = client.post("/api/admin/login", json={"username": "admin", "password": "admin-pass-for-tests"}).json()["access_token"]
    assert client.get("/api/auth/me", headers=auth(admin)).status_code == 401
