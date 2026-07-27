from app.core.security.auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)


def test_password_hashing():
    password = "SuperSecretPassword123!"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("WrongPassword", hashed) is False


def test_jwt_tokens():
    user_id = "123e4567-e89b-12d3-a456-426614174000"
    access_token = create_access_token(user_id)
    payload = decode_token(access_token)
    assert payload["sub"] == user_id
    assert payload["type"] == "access"

    refresh_token = create_refresh_token(user_id)
    refresh_payload = decode_token(refresh_token)
    assert refresh_payload["sub"] == user_id
    assert refresh_payload["type"] == "refresh"
