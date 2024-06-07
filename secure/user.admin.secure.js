import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import { pool } from "../db.js";
import { decrypt } from "./encrypt.sistem.secure.js"

// CARGA LA VARIABLE DE ENTORNO 
dotenv.config({path: './secret/.env'}); 



// FUNCION PARA EL VERIFICADO DE USUARIO Y CONTRASEÑAS Y ENVIADOS DE TOKENS 
export const verificationAdminUser = async (req,res) => {
    // FUNCION PARA GENERAR EL TOKEN CON JWT CON CON LOS PARAMETRO DEL USUARIO LA CLAVE SECRETA Y EXPIRACIONES 
    const generateAccessToken = user => jwt.sign({user} ,process.env.SECRET_KEY_JWT ,{expiresIn: '2h'})

    // SACA EL USUARIO Y CONTRASEÑA DE LOS ENVIADO DESDE EL FORMULARIO DEL LOGIN
    const {username , password} = req.body

    // CREO LA CONSULTA PARA TRAER LOS DATOS DEL USUARIO 
    const consult = "SELECT * FROM user_admin WHERE username_user_admin = ? "
  
    try {    
        // REALIZA LA CONSULTA Y LE PASA EL PARAMETRO DEL USERNAME Y LOS GUARDA EN UNA ARRAY CON RESULT
        const [result] = await pool.query(consult,[username]);

        // VALIDA QUE EL USUARIO EXISTA EN LA BASE DE DATOS
        if (result.length > 0) {
            // DESENCRIPTAR LA CONTRASEÑA DE LA BASE DE DATOS PARA COMPARARLA CON LA ENVIADA DESDE EL FORMULARIO
            const passwordDecrypt = decrypt(result[0].password_user_admin)

            // VALIDA QUE LA CONTRASEÑA DESENCRIPTADA SEA IGUAL A LA ENVIADA DESDE EL FORMULARIO
            if (passwordDecrypt === password) {
                // GENERA EL TOKEN CON EL USUARIO ENVIADO DESDE EL FORMULARIO
                const token = generateAccessToken(username)

                // ENVIAR EL TOKEN AL CLIENTE PARA GUARDARLO EN LAS COOKIES
                res.header('authorization' , token ).json({
                    message: "usuario autenticado",
                    token: token
                })
                
            }else{
                // SI LA CONTRASEÑA ES INCORRECTA Y ENVIA EL MENSAGE QUE LA CONTRASEÑA ES INCORRECTA
                res.status(401).json({message: "Contraseña y/o usuario incorrectos"})
            }     
        }else{
            // SI EL USUARIO Y LA CONTRASEÑA ES INCORRECTA Y ENVIA EL MENSAGE QUE LA CONTRASEÑA ES INCORRECTA
            res.status(401).json({message: "Contraseña y/o usuario incorrectos"})
        }
    } catch (error) {
        // ERROR DE LA CONSULTA 
        console.error("Error al consultar la base de datos:", error);
        return res.status(500).json({ message: "Error del servidor" });
    }  
}

// FUNCION PARA VALIDAR EL TOKEN DEL LAS RUTAS
export const validateToken =(req,res,next)=>{
    // SACA EL TOKEN DE LAS COOKIES DEL CLIENTE
    const accessToken = req.headers['authorization'] || req.query.accesstoken

    // VALIDA QUE EL TOKEN NO ESTE VACIO
    if (!accessToken) {
        // SI EL TOKEN ESTA VACIO MANDA ERROR 
        return res.status(401).send('Acceso denegado')
    }

    // VERIFICA EL TOKEN CON LA CLAVE SECRETA Y SI ES CORRECTO PASA AL SIGUIENTE MANEJADOR DE RUTAS
    jwt.verify(accessToken,process.env.SECRET_KEY_JWT ,(error,user)=>{
        if (error) {
            return res.status(401).send('acceso denegado, token expirado o incorrecto')
        }
        next()  
    })     
}

// FUNCION PARA VALIDAR EL TOKEN CADA VEZ QUE SE CAMBIA EL USUARIO DEL PAGINAS 
export const validateTokenm =(req,res,next)=>{
    try {
        // SACA EL TOKEN DESDE EL REQUERIMIENTO
        const token = req.body.authToken
    
        // SI EL TOKEN LOS EXISTE MANDA FALSO
        if (!token) {
            return res.json(false)
        }
     
    
        // VERIFICA EL TOKEN CON LA CLAVE SECRETA Y SI ES CORRECTO PASA AL SIGUIENTE MANEJADOR DE RUTAS
        jwt.verify(token,process.env.SECRET_KEY_JWT ,(error,user)=>{
            if (error) {
                return res.json(false)
            }
            res.json(true) 
        })     
        
    } catch (error) {
        console.log(error.message);
        return res.status(401).json(false) 
    }
}
