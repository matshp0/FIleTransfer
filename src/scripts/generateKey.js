import crypto from 'crypto';

export default function generateKey(length = 24) {
  return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}
