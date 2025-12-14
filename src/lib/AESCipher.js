import crypto from "crypto";

export class AESCipher {
  constructor() {
    this.requestEncryptionKey = Buffer.from(
      process.env.NTT_REQ_ENC_KEY,
      "utf8"
    );

    this.requestSaltKey = Buffer.from(
      process.env.NTT_REQ_SALT_KEY,
      "utf8"
    );

    this.responseEncryptionKey = Buffer.from(
      process.env.NTT_RESP_ENC_KEY,
      "utf8"
    );

    this.responseSaltKey = Buffer.from(
      process.env.NTT_RESP_SALT_KEY,
      "utf8"
    );

    this.iv = Buffer.from([
      0, 1, 2, 3, 4, 5, 6, 7,
      8, 9, 10, 11, 12, 13, 14, 15
    ]);
  }

  encrypt(message) {
    const key = crypto.pbkdf2Sync(
      this.requestEncryptionKey,
      this.requestSaltKey,
      65536,
      32,
      "sha512"
    );

    const cipher = crypto.createCipheriv(
      "aes-256-cbc",
      key,
      this.iv
    );

    let encrypted = cipher.update(message, "utf8", "hex");
    encrypted += cipher.final("hex");

    return encrypted.toUpperCase();
  }

  decrypt(hexData) {
    const key = crypto.pbkdf2Sync(
      this.responseEncryptionKey,
      this.responseSaltKey,
      65536,
      32,
      "sha512"
    );

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      key,
      this.iv
    );

    let decrypted = decipher.update(hexData, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  }
}
