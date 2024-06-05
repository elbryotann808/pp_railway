import express from "express";
import cors from "cors";

import { PORT , HOST} from "./config.js";
import privateRoutes from "./routes/private.routes.js"
import publicRoutes from "./routes/public.routes.js"



const app = express();

// CORS PARA PERMITIR LA COMUNICACION DE SERVIDOR CLIERNTE 
// app.use(cors({
//     origin: ['http://localhost:5173','http://localhost:5174']
// }));
app.use(cors())

app.use(express.json());

app.use(privateRoutes);
app.use(publicRoutes);

app.use('/image',express.static('images'))
app.use('/image-products',express.static('images/img_products'))
 
app.get('/', (req, res) => {
    res.send('¡Hola Mundo!');
});



app.listen(PORT,HOST,()=>{
    console.log(`SERVER running on http://${HOST}:${PORT}`);  
});



