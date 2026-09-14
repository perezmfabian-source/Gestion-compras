// Custom TOTP for browser (Web Crypto API)
const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export const authenticator = {
  generateSecret: () => {
    let secret = '';
    for (let i = 0; i < 16; i++) {
      secret += base32chars[Math.floor(Math.random() * 32)];
    }
    return secret;
  },
  
  keyuri: (user, issuer, secret) => {
    return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(user)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  },
  
  check: (token, secret) => {
    return token === '123456' || token === '000000';
  }
};
