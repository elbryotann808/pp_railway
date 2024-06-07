import multer from "multer"
import path from "path"
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { pool } from "../db.js"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const diskstorage = multer.diskStorage({
    destination: path.join(__dirname,'../images/img_products'),
    filename: (req,file,cb) => {
        cb(null, Date.now() + "-ferreconde-" + file.originalname)
    }
})

export const fileUploader = multer({
    storage: diskstorage
}).array('image')





// FUNCION PARA CREAR UN PRODUCTO 
export const createProduct = async(req,res) => {
    try{
        // ESTRAE LOS DATOS DEL PRODUCTO DEL REQUERIMIENTO 
        const {code , name , description , price , categories , attributes } = req.body

        // VALIDAMOS QUE TODOS LOS CAMPOS SEAN OBLIGATORIOS
        if (!code || !name || !description || !price || !categories || !attributes) {
            return res.status(400).json({message: "todos los campos son requeridos"})
        }
        
        // VALIDA SI EL PRODUCTO TIENE IMGENES
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({message: "se requiere al menos una imagen del producto"});
        }

        // REALIZA UNA CONSULTA A LA BASE DE DATOS PARA INGRESAR EL PRODUCTO
        await pool.query('INSERT INTO products set ? ',[{code_product:code ,name_product:name ,description_product:description , price_product:price, categories_product :categories, attributes_product :attributes}])

        let promise = req.files.map(async file => {
            let { originalname: name, mimetype: datatype, filename: data } = file;

            // INSERTAMOS LAS IMG A LA BASE DE DATOS 
            const [insertImages] = await pool.query('INSERT INTO images_products set ?',[{name_img_product:name, datatype_img_product:datatype, data_img_product:data}]);
            // OBTENEMOS EL ID DE LA ULTIMA IMG INGRESADA 
            const lastInsertId = insertImages.insertId
            // CREAMOS UNA RELACION ENTRE PRODUCTO Y IMG 
            await pool.query('INSERT INTO relations_product_images set ?',[{code_product:code, id_img_product:lastInsertId}])            
                 
        });
          
        // ESPERAMOS A QUE TODOS LAS PROMESAS SE RESUELVAN 
        await Promise.all(promise)
        
        // MANEJAMOS UNA RESPUESTA DEL SERVIDOR 
        console.log("Se creo un nuevo producto");
        return res.status(200).json({ message: "Producto creado con éxito"});
  
    } catch (error) {
        // MANEJO DE ERRORES CUANDO EL CODE YA EXISTE Y UN MANEJO PARA CUALQUIER ERROR 
        if (error.code === "ER_DUP_ENTRY") {
            console.log("code duplicado");
            res.status(400).json({ message: `Ya existe un producto con el codigo: ${req.body.code}` });
        }else{
            console.error(error);
            res.status(500).json({ message: "Error al crear un producto, intentelo mas tarde" })
        }
    }
}

// FUNCION PARA OBTENER LOS PRODUCTOS
export const getProducts = async(req,res) => {
    try {
        // REALIZAMOS UNA CONSULTA A LA BASE DE DATOS PARA OBTENER LOS DATOS Y SUS IMG 
        const [ result ] = await pool.query('SELECT products.*, images_products.data_img_product FROM products JOIN relations_product_images ON products.code_product = relations_product_images.code_product JOIN images_products ON relations_product_images.id_img_product = images_products.id_img_product');
        // const [ result ] = await pool.query('SELECT products.*, images_products.data_img_product FROM products JOIN relations_product_images ON products.code_product = relations_product_images.code_product JOIN images_products ON relations_product_images.id_img_product = images_products.id_img_product WHERE products.sale_product = 1');

        let products = {};

        // RECORRE LOS RESULTADOS DE LA CONSULTA 
        for (let i = 0; i < result.length; i++) {
          let product = result[i];
          if (!products[product.code_product]) {
            products[product.code_product] = {
              "code": product.code_product,
              "name": product.name_product,
              "description": product.description_product,
              "price": product.price_product,
              "categories": product.categories_product,
              "attributes": product.attributes_product,
              "sale": product.sale_product,
              "createAt": product.createAt_product,
              "images": []
            }
          }
          products[product.code_product].images.push(product.data_img_product);
        }
        
        // CONVERTIMOS EL OBJECTO DE PRODUCTOS EN UN ARRAY
        products = Object.values(products);

        // MANEJO DE REPUESTAS DEL SERVIDOR 
        console.log(products);
        res.status(200).json(products)

    } catch (error) {
        // MANEJO DE ERRORES DEL SERVIDOR
        console.error(error);
        return res.status(500).json({ message: "Error al traer los productos, intentelo mas tarde" })
    }
}

// FUNCION PARA OBTENER UN SOLO PRODUCTO Y TODAS LOS DATOS DE LAS IMG  
export const getProduct = async(req,res) => {
    try{
        // REALIZAMOS UNA CONSULTA A LA BASE DE DATOS PARA OBTENER UN SOLO PRODUCTO Y SUS IMG 
        const [result] = await pool.query(`SELECT products.*, images_products.* FROM products JOIN relations_product_images ON products.code_product = relations_product_images.code_product JOIN images_products ON relations_product_images.id_img_product = images_products.id_img_product WHERE products.code_product = ?` , [req.params.id]);
        
        let products = {};
        // RECORRE EL RESULTADO Y LO INSERTA EN UN SOLO OBJECTO CON TODAS LAS IMGS EN UN OBJECTO CON LOS DATOS DE LAS IMG
        for (let row of result) {
            if (!products[row.code]) {
                products[row.code] = {
                    code: row.code_product,
                    name: row.name_product,
                    description: row.description_product,
                    price: row.price_product,
                    categories: row.categories_product,
                    attributes: row.attributes_product,
                    sale: row.sale_product,
                    createAt: row.createAt_product,
                    images: []
                };
            }

            products[row.code].images.push({
                id_images: row.id_img_product,
                name: row.name_img_product,
                datatype: row.datatype_img_product,
                data: row.data_img_product
            });
        }

        // MANEJO DE REPUESTAS DEL SERVIDOR
        products = Object.values(products);
        console.log(products);
        res.status(200).json(products)
     
    } catch (error) {
        // MANEJO DE ERRORES DEL SERVIDOR
        console.error(error)
        return res.status(500).json({ message: `Error al traer el producto con el code:${req.params.id} ,intentelo mas tarde`})
    }
    
}

//FUNCION PARA OBTENER PRODUCTOS POR SUS CARTEGORIA 
export const getProductsCategory = async(req,res) => {
    // EXTRAEMOS LA CATEGORIA POR EL REQUERIMIENTO
    const categories = req.params.categories;
    
    try {
        // REALIZA UNA CONSULTA PARA OBTENER LOS PRODUCTOS Y SUS IMG POR CATEGORIA
        const [ result ] = await pool.query(`
        SELECT products.*, images_products.data_img_product
        FROM products
        JOIN relations_product_images ON products.code_product = relations_product_images.code_product
        JOIN images_products ON relations_product_images.id_img_product = images_products.id_img_product
        WHERE products.categories_product = ?`,[ categories ]);

        let products = {};

        // RECORREMOS EL RESULTADO 
        for (let i = 0; i < result.length; i++) {
          let product = result[i];
          if (!products[product.code_product]) {
            products[product.code_product] = {
              "code": product.code_product,
              "name": product.name_product,
              "description": product.description_product,
              "price": product.price_product,
              "categories": product.categories_product,
              "attributes": product.attributes_product,
              "sale": product.sale_product,
              "createAt": product.createAt_product,
              "images": []
            }
          }
          products[product.code_product].images.push(product.data_img_product);
        }
        
        //MANEJO DE RESPUESTAS DEL SERVIDOR
        products = Object.values(products);
        console.log(products);
        res.status(200).json(products)

    } catch (error) {
        // MANEJO DE ERRORES DEL SERVIDOR
        console.log(error);
        return res.status(500).json({ message: `Error al traer los productos con la categoria:${categories} ,intentelo mas tarde` })
    }
}

//FUNCION PARA ACTUALIZAR UN PRODUCTO
export const updateProduct = async(req,res) => {
    try{
    // ---------------------- ACTUALIZADO DE DATOS EN LA BASE DE DATOS --------------------

        // OBTIENE EL ID DE LOS PRODUCTOS EN LOS PARAMETROS DE LA SOLICITUD
        const paramId = req.params.id
        // INICIALIZA UN OBJECTO VACIO PARA LOS CAMPOS A ACTUALIZAR  
        let updateObject = {}
        
        // VERIFICAMOS SI SE PROPORCIONARON CIERTOS DATOS
        // Y SI SI SE PROPORCINARON ,SE AGREGAN EN EL OBJECTO VACIO
        if (req.body.code) updateObject.code_product = req.body.code;
        if (req.body.name) updateObject.name_product = req.body.name;
        if (req.body.description) updateObject.description_product = req.body.description;
        if (req.body.price) updateObject.price_product = req.body.price;
        if (req.body.categories) updateObject.categories_product = req.body.categories;
        if (req.body.sale) updateObject.sale_product = req.body.sale;
        if (req.body.attributes) updateObject.attributes_product = req.body.attributes;

        // REALIZA UNA CONSULTA QUE ACTUALIZA EL PRODUCTO EN LA BASE DE DATOS 
        await pool.query('UPDATE products set ? WHERE code_product = ? ',[updateObject , paramId]);
        

    // -----------------------ELIMINADO DE IMAGENES EN EL SERVER Y EN LA BASE DE DATOS-------

        // VERIFICAMOS QUE SE HALLAN PROPORSIONADO DATOS PARA ELIMINAR IMG DE LA BASE DE DATOs Y EL SERVIDOR
        if (req.body.deleteImg) {
            const imgPorEliminar= JSON.parse( req.body.deleteImg )

            imgPorEliminar.map(async(img)=>{
                const [result] = await pool.query("DELETE FROM images_products WHERE data_img_product = ? ", [img])

                fs.unlinkSync(`images/img_products/${img}`)
                if (result.affectedRows === 0 ) 
                    console.log("task not found");

                console.log("img eliminadas");
               
            })
        }   


    // -------------------------INSERDADO DE IMG AL SERVER Y A LA BASE DE DATOS----------------

        // SI SE PROPORCIONA ARCHIVOS EN LA SOLICITUD,SE INSERTARA EN LA BASE DE DATOS 
        if (req.files.length >= 1) {
            let promise = req.files.map(async file => {
                let name = file.originalname
                let datatype = file.mimetype
                let data = file.filename
     
                const [insertImages] = await pool.query('INSERT INTO images_products set ?',[{name_img_product:name, datatype_img_product:datatype, data_img_product:data}]);
                const id_img_product = insertImages.insertId
                await pool.query('INSERT INTO relations_product_images set ?',[{code_product:paramId, id_img_product}])            
                     
            });

   

            Promise.all(promise)
            .then(() => console.log("Todas las imágenes se han guardado correctamente."))
            .catch(err => console.error("Hubo un error al guardar las imágenes:", err));
        }
        
        //MANEJO DE RESPUESTA DEL SERVIDOR 
        res.status(200).json({message: "Producto actualizado con exito"})

    } catch (error) {
        //MANEJO DE ERRORRES DEL SERVIDOR 
        if (error.code === 'ER_DUP_ENTRY') {
            console.log(error.code);
            res.status(400).json({ message: `Ya existe un producto con el codigo: ${req.body.code}` });
        }else{
            console.log(error);
            res.status(500).json({ message: "Error al atualizar el producto, intentalo mas tarde" })
        }
    }
}

// FUNCION PARA ACTUALIZAR EL ESTADO DE VENTA DEL PRODUCTO
export const saleUpdateProduct = async(req,res) => {
    try{
        // EXTRIGO EL ID Y EL DATOS DE TRUE O FASE DEL SALE
        const paramId = req.params.id
        const sale = req.body

        // REALIZA UNA CONSULTA PARA ACTUALIZAR EL ESTADO DE VENTA 
        const response = await pool.query('UPDATE products SET sale_product = ? WHERE code_product = ? ',[ {sale_product:sale }, paramId]);

        // MANEJO DE RESPUESTA DEL SERVER
        console.log(response);
        res.status(200).json({message : "Se hizo un cambio en la disponibilidad del producto"})

    } catch (error) {
        // MANEJO DE ERRORES DEL SERVER
        console.log(error);
        res.status(500).json({ message: "Error al atualizar el estado de venta del producto, intentalo mas tarde" })
    }
}

// FUNCION PARA ELIMINA LOS PRODUCTOS 
export const deleteProducts = async(req,res) => {   
    try{
        // RELIZA UNA CONSULTA QUE TRAEN TODOS LOS DATOS DEL LAS IMG DE LA BASE DE DATOS
        const conn = await pool.query('SELECT images_products.data_img_product FROM products JOIN relations_product_images ON products.code_product = relations_product_images.code_product JOIN images_products ON relations_product_images.id_img_product = images_products.id_img_product WHERE products.code_product = ? ', [req.params.id]);
        // ELIMINAMOS TODAS LAS IMGS RELACIONADAR DE LA BASE DE DATOS 
        await pool.query(`DELETE FROM images_products WHERE id_img_product IN (SELECT relations_product_images.id_img_product FROM products JOIN relations_product_images ON products.code_product = relations_product_images.code_product WHERE products.code_product = ?)`, [req.params.id]);
        // ELINAMOS EL PRODUCTO DE LA BASE DE DATOS
        const [result] = await pool.query('DELETE FROM products WHERE code_product = ? ', [req.params.id]);
        
        // ELIMINAMOS LAS IMG DEL LAS CARPETAS DEL SERVIDOR
        for (let i = 0; i < conn[0].length; i++) {
            fs.unlinkSync(`images/img_products/${conn[0][i].data_img_product}`)
        }

        // MANEJAMOS LAS RESPUESTAS DEL SERVIDOR
        if (result.affectedRows === 0 ) 
        return res.status(404).json({ message : "task not found" });
    
        return res.status(200).json({ title : "Producto Borrado." , message:"El Producto seleccionado ha sido borrado con éxito. Ten en cuenta que esta acción no se puede deshacer."});
        
    } catch (error) {
        // MANEJO DE ERRORES DEL SERVIDOR 
        console.log(error);
        return res.status(500).json({ title: "Error!" , message: "Error al eliminar el producto" })
    }

}












// FUNCION PARA OBTENER UN SOLO PRODUCTO Y SOLO EL DATO DEL SERVER DE LAS IMG
export const getProductPublic = async(req,res) => {
    try{
        // REALIZAMOS UNA CONSULTA A LA BASE DE DATOS PARA OBTENER UN SOLO PRODUCTO Y SUS IMG EN ARRY 
        const [result] = await pool.query(`SELECT products.*, images_products.data_img_product FROM products JOIN relations_product_images ON products.code_product = relations_product_images.code_product JOIN images_products ON relations_product_images.id_img_product = images_products.id_img_product WHERE products.code_product = ?` , [req.params.id]);
        
        // RECORRE EL RESULTADO Y LO INSERTA EN UN SOLO OBJECTO CON TODAS LAS IMGS EN UN ARRAY 
        let product = {
            "code": result[0].code_product,
            "name": result[0].name_product,
            "description": result[0].description_product,
            "price": result[0].price_product,
            "categories": result[0].categories_product,
            "attributes": result[0].attributes_product,
            "sale": result[0].sale_product,
            "createAt": result[0].createAt_product,
            "images": []
        }
    
        for (let i = 0; i < result.length; i++) {
            product.images.push(result[i].data_img_product);
        }

        // MANEJO DE REPUESTAS DEL SERVIDOR
        if ( result == 0) 
        return res.status(404).json({ message : "task not found" });

        console.log(product);
        res.status(200).json(product);
            
    } catch (error) {
        // MANEJO DE ERRORES DEL SERVIDOR
        console.error(error);
        return res.status(500).json({ message: `Error al editar el producto con el codigo :${req.params.id} ,intentelo mas tarde`})
    }
    
}

// - - - - - - -- CONMENTAR ESTOOO IMPORTANTE  - - - - - - -  - - - -
export const getProductsPublic = async(req,res) => {
    try {
        // REALIZAMOS UNA CONSULTA A LA BASE DE DATOS PARA OBTENER LOS DATOS Y SUS IMG 
        // const [ result ] = await pool.query('SELECT products.*, images_products.data_img_product FROM products JOIN relations_product_images ON products.code_product = relations_product_images.code_product JOIN images_products ON relations_product_images.id_img_product = images_products.id_img_product');
        const [ result ] = await pool.query('SELECT products.*, images_products.data_img_product FROM products JOIN relations_product_images ON products.code_product = relations_product_images.code_product JOIN images_products ON relations_product_images.id_img_product = images_products.id_img_product WHERE products.sale_product = 1');

        let products = {};

        // RECORRE LOS RESULTADOS DE LA CONSULTA 
        for (let i = 0; i < result.length; i++) {
          let product = result[i];
          if (!products[product.code_product]) {
            products[product.code_product] = {
              "code": product.code_product,
              "name": product.name_product,
              "description": product.description_product,
              "price": product.price_product,
              "categories": product.categories_product,
              "attributes": product.attributes_product,
              "sale": product.sale_product,
              "createAt": product.createAt_product,
              "images": []
            }
          }
          products[product.code_product].images.push(product.data_img_product);
        }
        
        // CONVERTIMOS EL OBJECTO DE PRODUCTOS EN UN ARRAY
        products = Object.values(products);

        // MANEJO DE REPUESTAS DEL SERVIDOR 
        console.log(products);
        res.status(200).json(products)

    } catch (error) {
        // MANEJO DE ERRORES DEL SERVIDOR
        console.error(error);
        return res.status(500).json({ message: "Error al traer los productos, intentelo mas tarde" })
    }
}

