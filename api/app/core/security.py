from datetime import UTC, datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import Settings, get_settings

settings = get_settings()

# bcrypt is deliberately SLOW (~100ms per hash). That's the point: it makes
# brute-forcing a stolen password database computationally expensive.

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    """bcrypt stores the salt inside the hash, so this re-derives and compares
    in constant time — no timing side channel."""

    """A salt is a random string of data added to a password before hashing it.
      It ensures that identical passwords produce completely different hash outputs, 
      stopping attackers from using precomputed tables to crack multiple passwords at once.
      What Salt Does
      Stops Rainbow Tables: Precomputed lists of matching passwords and hashes become useless.
      Makes Each Hash Unique: Two users with the same password get different final hashes.
      Forces Individual Attacks: Attackers must guess passwords one by one instead of looking them up fast."""

    return pwd_context.verify(plain, hashed)

def create_access_token(subject: str, role:str) -> str:
    """A JWT is three base64 parts: header, payload, signature.

    The payload is READABLE by anyone holding the token — it is not encrypted.
    Never put secrets in it. What it guarantees is integrity: the signature
    proves the payload was issued by us and hasn't been altered, because
    forging it requires SECRET_KEY."""

    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {"sub": subject, "role": role, "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)

def decode_access_token(token: str) -> dict | None:
    """Returns the payload, or None if the signature is invalid or expired."""
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None