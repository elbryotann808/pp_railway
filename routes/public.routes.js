import { Router } from "express";

import { getImgCarroucels, getImgCarroucel } from "../controllers/corroucel.controllers.js";
import { 
    getProducts,
    getProduct,
    getProductPublic, 
    getProductsCategory, 
    getProductsPublic
} from "../controllers/products.controllers.js";

import { sendDataGmail } from "../controllers/gmail.send.data.controllers.js";

const router = Router();


// RUTAS DE LAS IMG DEL CARRUCEL 
router.get('/api/main/carousel/images/public', getImgCarroucels);

router.get('/api/main/carousel/images/public/:id' , getImgCarroucel);


// RUTAS DE LOS PRODUCTOS 
router.get('/api/products/public', getProductsPublic);

router.get('/api/products/categories/public/:categories', getProductsCategory);

router.get('/api/products/public/:id' , getProductPublic);


// RUTA PARA EL ENVIO DE GMAIL
router.post("/api/send/data/gmail/public", sendDataGmail)

export default router;
