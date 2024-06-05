import { Router } from "express";

import { verificationAdminUser , validateToken ,validateTokenm } from "../secure/user.admin.secure.js";

import { 
    fileUpload,
    createImgCarroucel, 
    getImgCarroucels, 
    getImgCarroucel, 
    updateImgCarroucel, 
    deleteImgCarroucel,
} from "../controllers/corroucel.controllers.js";

import { 
    getProducts,
    getProduct,
    createProduct,
    deleteProducts,
    fileUploader,
    updateProduct,
    saleUpdateProduct
} from "../controllers/products.controllers.js";


const router = Router();



// RUTAS PARA EL INICIO DE SECCION
router.post('/api/admin/login', verificationAdminUser );

router.post('/rutaProtegida', validateTokenm);


// RUTAS DE LAS IMG DEL CARRUCEL 
router.post('/api/main/carousel/images/private/create' , validateToken , fileUpload, createImgCarroucel );

router.get('/api/main/carousel/images/private', validateToken , getImgCarroucels);

router.get('/api/main/carousel/images/private/:id' , validateToken ,getImgCarroucel);

router.put('/api/main/carousel/images/private/update/:id' , validateToken , updateImgCarroucel);

router.delete('/api/main/carousel/images/private/delete/:id' , validateToken ,deleteImgCarroucel)



// RUTAS DE LOS PRODUCTOS 
router.post('/api/products/private/create' , validateToken , fileUploader , createProduct );

router.get('/api/products/private' , validateToken , getProducts);

router.get('/api/product/private/:id' , validateToken ,getProduct);

router.put('/api/products/private/update/:id' , validateToken ,fileUploader , updateProduct);

router.put('/api/products/private/update/sale/:id', validateToken , saleUpdateProduct);

router.delete('/api/products/private/delete/:id' , validateToken ,deleteProducts);


export default router;