import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { verifyJwtHs256 } from './jwt.js';

const decodeBase64Url = (value: string): Buffer => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + '='.repeat(paddingLength), 'base64');
};

const toBase64Url = (value: Buffer | string): string =>
  Buffer.from(value)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

const resolveSigningKey = (secret: string): Buffer => {
  try {
    const decoded = decodeBase64Url(secret);
    if (decoded.length > 0) {
      return decoded;
    }
  } catch {
    // Fallback to utf-8 when not encoded.
  }

  return Buffer.from(secret, 'utf8');
};

const createToken = (secret: string, payload: Record<string, unknown>): string => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerSegment = toBase64Url(JSON.stringify(header));
  const payloadSegment = toBase64Url(JSON.stringify(payload));
  const signingInput = `${headerSegment}.${payloadSegment}`;
  const signatureSegment = toBase64Url(createHmac('sha256', resolveSigningKey(secret)).update(signingInput).digest());
  return `${headerSegment}.${payloadSegment}.${signatureSegment}`;
};

test('verifyJwtHs256 accepts valid token', () => {
  const secret = 'test-secret-with-@-12345678901234567890';
  const now = Math.floor(Date.now() / 1000);
  const token = createToken(secret, {
    sub: 'user-1',
    iss: 'http://auth-service:8081',
    aud: 'qeetmart',
    exp: now + 60,
    role: 'USER',
  });

  const claims = verifyJwtHs256(token, secret, 'http://auth-service:8081', 'qeetmart');

  assert.equal(claims.sub, 'user-1');
  assert.equal(claims['role'], 'USER');
});

test('verifyJwtHs256 rejects invalid signature', () => {
  const secret = 'test-secret-with-@-12345678901234567890';
  const wrongSecret = 'another-secret-with-@-12345678901234567890';
  const now = Math.floor(Date.now() / 1000);
  const token = createToken(secret, {
    sub: 'user-1',
    iss: 'http://auth-service:8081',
    exp: now + 60,
  });

  assert.throws(
    () => verifyJwtHs256(token, wrongSecret, 'http://auth-service:8081'),
    /signature validation failed/
  );
});

test('verifyJwtHs256 rejects issuer mismatch', () => {
  const secret = 'test-secret-with-@-12345678901234567890';
  const now = Math.floor(Date.now() / 1000);
  const token = createToken(secret, {
    sub: 'user-1',
    iss: 'http://unexpected-issuer',
    exp: now + 60,
  });

  assert.throws(
    () => verifyJwtHs256(token, secret, 'http://auth-service:8081'),
    /issuer mismatch/
  );
});
