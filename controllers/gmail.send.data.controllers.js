import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config({path: './secret/.env'}) 

// EL TRANPORTADOR DEL LOS DATOS DEL GMAIL CON LOS DATOS DEL CORREO 
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.SECRET_USER,
        pass: process.env.SECRET_PASS_APPLICATIONS
    },
});

// FUNCION PARA ENVIAR EL MENSAJE A CORREO
export const sendDataGmail = async(req , res)=>{
    // EXTRAIGO LOS DATOS DEL REQUERIMIENTO
    const { name , lastName , email , message } = req.body
    
    try {
        await transporter.sendMail({
            from: `mensaje enviado por <florenabarra>`,
            // to: "barralorena535@gmail.com",
            to: "brayanstevengamboa0808@gmail.com",
            // subject: `Mensaje desde contactanos del usuario: ${name} `,
            subject: `Nos contacto: ${name} `,
            html:`
            <h2>${name} ${lastName}</h2>
            <p>Mensaje: ${message}</p>
            <p>Email: ${email}</p>
            `,
        })

        res.status(200).json({message : "Email enviado con éxito"})
        console.log(`se envio un correo nuevo de ${name} ${lastName}`);
    } catch (error) {
        console.log(error);
        res.status(500).json({message : "Hubo un error al enviar el email" })
        
    }
}