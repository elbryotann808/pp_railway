import crypto from 'crypto'
import dotenv from 'dotenv';

// CARGA LA VARIABLE DE ENTORNO 
dotenv.config({path: './secret/.env'}); 

// OBTIENE EL ALGORITMO DE CIFRADO DESDE LA VARIABLE DE ENTORNO
const algorithm = process.env.ENCRYPT_ALGORITHM_CRYPTO;

// CREA UNA CLAVE 
const key = crypto
.createHash('sha256')
.update(process.env.SECRET_KEY_CRYPTO)
.digest('hex')
.substring(0 , 32);

// FUNCION DE CIFRADO  
export function encrypt(data) {
    // GENERA UN VECTOR DE INICIO DE CIFRADO
    const iv = crypto.randomBytes(16);
    
    // CREA UN CIFRADO CON EL ALGORITMO Y LA CLAVE
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);

    // ACTUALIZA EL CIFRADO CON LOS DATOS DE ENTRADA Y CONTATENA EL RESULTADO CIFRA 
    let encrypted = cipher.update(data);
        encrypted = Buffer.concat([encrypted, cipher.final()]);

    // DEVUELVE LA CADENA CIFRADO EN EL FORMATO ESPECIFICADO
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

// FUCION DE DESCIFRADO
export function decrypt(date){
    // DIVIDE LA CADENA EN EL SEPARADOR ':' Y CONVIERTE LAS PARTES EN BUFFER
    const[iv, encryptedText] = date
        .split(":")
        .map((part)=>Buffer.from(part,"hex"))

    // CREA UN DESCIFRADO CON EL ALGORITMO Y LA CLAVE
    let decipher = crypto.createDecipheriv(algorithm, key , iv);

    // ACTUALIZA EL DESCIFRADO CON EL TEXTO CIFRADO Y CONCATENA EL RESULTADO DESCIFRADO
    let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

    // DEVUELVE EL RESULTADO DESCIFRADO COMO UN CADENA
    return decrypted.toString();
}


