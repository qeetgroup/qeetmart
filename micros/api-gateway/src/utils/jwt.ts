import { createHmac, timingSafeEqual } from 'node:crypto';

export interface JwtClaims {
  sub?: string;
  iss?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  [key: string]: unknown;
}

const decodeBase64Url = (value: string): Buffer => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const paddingLength = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(normalized + '='.repeat(paddingLength), 'base64');
};

const parseSecret = (secret: string): Buffer => {
  try {
    const decoded = decodeBase64Url(secret);
    if (decoded.length > 0) {
      return decoded;
    }
  } catch {
    // Fallback to raw utf-8 secret when not base64/base64url encoded.
  }

  return Buffer.from(secret, 'utf8');
};

const isAudienceValid = (
  audienceClaim: string | string[] | undefined,
  requiredAudience: string | undefined
): boolean => {
  if (!requiredAudience) {
    return true;
  }

  if (!audienceClaim) {
    return false;
  }

  if (Array.isArray(audienceClaim)) {
    return audienceClaim.includes(requiredAudience);
  }

  return audienceClaim === requiredAudience;
};

export const verifyJwtHs256 = (
  token: string,
  secret: string,
  expectedIssuer?: string,
  expectedAudience?: string
): JwtClaims => {
  const segments = token.split('.');
  if (segments.length !== 3) {
    throw new Error('JWT must have exactly 3 segments');
  }

  const headerSegment = segments[0];
  const payloadSegment = segments[1];
  const signatureSegment = segments[2];
  if (!headerSegment || !payloadSegment || !signatureSegment) {
    throw new Error('JWT segments are missing');
  }
  const header = JSON.parse(decodeBase64Url(headerSegment).toString('utf8')) as { alg?: string; typ?: string };
  if (header.alg !== 'HS256') {
    throw new Error(`Unsupported JWT algorithm: ${header.alg ?? 'unknown'}`);
  }

  const signingInput = `${headerSegment}.${payloadSegment}`;
  const expectedSignature = createHmac('sha256', parseSecret(secret)).update(signingInput).digest();
  const tokenSignature = decodeBase64Url(signatureSegment);

  if (expectedSignature.length !== tokenSignature.length || !timingSafeEqual(expectedSignature, tokenSignature)) {
    throw new Error('JWT signature validation failed');
  }

  const claims = JSON.parse(decodeBase64Url(payloadSegment).toString('utf8')) as JwtClaims;
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (typeof claims.exp !== 'number' || claims.exp <= nowSeconds) {
    throw new Error('JWT expired');
  }

  if (typeof claims.nbf === 'number' && claims.nbf > nowSeconds) {
    throw new Error('JWT is not active yet');
  }

  if (expectedIssuer && claims.iss !== expectedIssuer) {
    throw new Error('JWT issuer mismatch');
  }

  if (!isAudienceValid(claims.aud as string | string[] | undefined, expectedAudience)) {
    throw new Error('JWT audience mismatch');
  }

  return claims;
};
