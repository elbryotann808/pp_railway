import { pool } from "../db.js";
import { decrypt } from "./encrypt.sistem.secure.js"
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config({path: './secret/.env'}); 


export const verificationAdminUser = async (req,res) => {

    const generateAccessToken = user => jwt.sign({user} ,process.env.SECRET_KEY_JWT ,{expiresIn: '30m'})

    const {username , password} = req.body
    // const consult = "SELECT * FROM useradmin WHERE username = ? "
    const consult = "SELECT * FROM user_admin WHERE username_user_admin = ? "
  
    try {    
        const [result] = await pool.query(consult,[username]);

        if (result.length > 0) {
            const passwordDecrypt = decrypt(result[0].password_user_admin)
            if (passwordDecrypt === password) {
                // res.send("contraseña correcta")
                const token = generateAccessToken(username)

                res.header('authorization' , token ).json({
                    message: "usuario autenticado",
                    token: token
                })
                
            }else{
                res.status(401).json({message: "Contraseña y/o usuario incorrectos"})
            }     
        }else{
            // res.send("Contraseña y/o usuario incorrectos")
            // res.json({message: "Contraseña y/o usuario incorrectos"})
            res.status(401).json({message: "Contraseña y/o usuario incorrectos"})
        }
    } catch (error) {
        console.error("Error al consultar la base de datos:", error);
        return res.status(500).json({ message: "Error del servidor" });
    }  
}





export const validateToken =(req,res,next)=>{
    const accessToken = req.headers['authorization'] || req.query.accesstoken
    if (!accessToken) {
        return res.status(401).send('Acceso denegado')
    }

    jwt.verify(accessToken,process.env.SECRET_KEY_JWT ,(error,user)=>{
        if (error) {
            return res.status(401).send('acceso denegado, token expirado o incorrecto')
        }
        next()  
    })     
}

export const validateTokenm =(req,res,next)=>{
    try {
        const token = req.body.authToken
    
        if (!token) {
            // return res.status(401).send('Acceso denegado')
            return res.json(false)
        }
    
        jwt.verify(token,process.env.SECRET_KEY_JWT ,(error,user)=>{
            if (error) {
                // return res.status(401).send(false)
                return res.json(false)
            }
            // req.user = user
            res.json(true) 
        })     
        
    } catch (error) {
        console.log(error.message);
        return res.status(401).json(false) 
    }
}







// const validateToken =(req,res,next)=>{
//     const accessToken = req.headers['authorization'] || req.query.accesstoken
//     if (!accessToken) res.send('Acceso denegado') 

//     jwt.verify(accessToken,process.env.SECRET_KEY_JWT ,(error,user)=>{
//         if (error) {
//             res.send('acceso denegado, token expirado o incorrecto')
//         }else{
//             // req.user = user
//             next()  
//         }
//     })
// }


// const validateTokenm =(req,res)=>{
//     const token = req.body.authToken
//     jwt.verify(token,process.env.SECRET_KEY_JWT ,(error,user)=>{
//         if (error) {
//             res.json(false)
//             console.log(false);
//         }else{
//             res.json(true) 
//             console.log(true);
//         }
//     })
// }

