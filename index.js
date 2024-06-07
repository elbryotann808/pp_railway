import express from "express";
import cors from "cors";

import { PORT } from "./config.js";
import privateRoutes from "./routes/private.routes.js"
import publicRoutes from "./routes/public.routes.js"

// INICIA LA APP DE EXPRESS
const app = express();

// CORS PARA PERMITIR LA COMUNICACION DE SERVIDOR CLIENTE
// app.use(cors({
//     origin: ['http://localhost:5173','http://localhost:5174']
// }));
app.use(cors())

app.use(express.json());

// USA LAS RUTAS 
app.use(privateRoutes);
app.use(publicRoutes);

// USA ELEMENTOS ESTATICOS EN LA CARPETA DEL SERVIDOR PARA VER LAS IMG DE LOS PRODUCTOS 
app.use('/image',express.static('images'))
app.use('/image-products',express.static('images/img_products'))

app.get('/', (req, res) => {
    res.send('¡Hola Mundo!');
});


// CREA EL APP ESCUCHA EL SERVIDOR 
app.listen(PORT,()=>{
    console.log(`SERVER running on ${PORT}`);  
});



