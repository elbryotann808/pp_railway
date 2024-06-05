import crypto from 'crypto'

import dotenv from 'dotenv';
dotenv.config({path: './secret/.env'}); 

const algorithm = process.env.ENCRYPT_ALGORITHM_CRYPTO;
const key = crypto
.createHash('sha256')
.update(process.env.SECRET_KEY_CRYPTO)
.digest('hex')
.substring(0 , 32);

export function encrypt(data) {
    const iv = crypto.randomBytes(16);
    
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}


export function decrypt(date){
    const[iv, encryptedText] = date
        .split(":")
        .map((part)=>Buffer.from(part,"hex"))

    let decipher = crypto.createDecipheriv(algorithm, key , iv);
    let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
}


