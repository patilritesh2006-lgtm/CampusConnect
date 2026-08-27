const crypto = require('crypto');

const QR_SECRET = process.env.JWT_SECRET || 'campusconnect_rotating_qr_secret_key_2026';
const ROTATION_WINDOW_SECONDS = 30;

/**
 * Generates a time-based rotating QR payload for an event
 * Token shape: `${eventId}.${timestamp}.${hmacSignature}`
 */
const generateEventQRToken = (eventId) => {
  const timestamp = Math.floor(Date.now() / 1000);
  // Round to rotation window bucket to ensure stability across the 30s window
  const timeBucket = Math.floor(timestamp / ROTATION_WINDOW_SECONDS);

  const payload = `${eventId}:${timeBucket}`;
  const signature = crypto
    .createHmac('sha256', QR_SECRET)
    .update(payload)
    .digest('hex')
    .substring(0, 16);

  return {
    qrToken: `${eventId}.${timeBucket}.${signature}`,
    eventId,
    expiresInSeconds: ROTATION_WINDOW_SECONDS - (timestamp % ROTATION_WINDOW_SECONDS),
    rotationWindowSeconds: ROTATION_WINDOW_SECONDS,
  };
};

/**
 * Validates a rotating QR token submitted by a student
 * Allows a 1-window grace period (e.g. up to 60s) for clock drift / network latency
 */
const verifyEventQRToken = (eventId, qrToken) => {
  if (!qrToken || typeof qrToken !== 'string') {
    return { valid: false, message: 'Missing or malformed QR token.' };
  }

  const parts = qrToken.split('.');
  if (parts.length !== 3) {
    return { valid: false, message: 'Invalid QR token format.' };
  }

  const [tokenEventId, timeBucketStr, signature] = parts;

  if (tokenEventId !== eventId) {
    return { valid: false, message: 'QR token does not belong to this event.' };
  }

  const timeBucket = parseInt(timeBucketStr, 10);
  if (isNaN(timeBucket)) {
    return { valid: false, message: 'Corrupted timestamp in QR token.' };
  }

  const currentTimestamp = Math.floor(Date.now() / 1000);
  const currentBucket = Math.floor(currentTimestamp / ROTATION_WINDOW_SECONDS);

  // Allow current bucket and previous bucket (within 30-60s window)
  const isBucketValid =
    timeBucket === currentBucket || timeBucket === currentBucket - 1;

  if (!isBucketValid) {
    return {
      valid: false,
      message: 'QR code has expired. Please scan the current code displayed on the screen.',
    };
  }

  // Verify HMAC signature
  const expectedPayload = `${tokenEventId}:${timeBucket}`;
  const expectedSignature = crypto
    .createHmac('sha256', QR_SECRET)
    .update(expectedPayload)
    .digest('hex')
    .substring(0, 16);

  if (signature !== expectedSignature) {
    return { valid: false, message: 'Invalid cryptographic QR signature.' };
  }

  return { valid: true };
};

module.exports = {
  generateEventQRToken,
  verifyEventQRToken,
  ROTATION_WINDOW_SECONDS,
};
