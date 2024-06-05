import multer from "multer"
import path from "path"
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import { pool } from "../db.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const diskstorage = multer.diskStorage({
    destination: path.join(__dirname,'../images'),
    filename: (req,file,cb) => {
        cb(null, Date.now() + "-ferreconde-" + file.originalname)
    }
})

export const fileUpload = multer({
    storage: diskstorage
}).single('image')



// FUNCION PARA CREAR UNA IMG DEL CARRUSEL
export const createImgCarroucel = async(req,res) => {
    try{
        // ESTRAE LOS DATOS DE LA IMG DEL REQUERIMIENTO  
        const name_img_carousel = req.file.originalname // NOMBRE ORIGINAL DE LA IMG
        const datatype_img_carousel = req.file.mimetype // TIPO DE DATO DEL IMG
        const data_img_carousel = req.file.filename  // NOMBRE DEL ARCHIVO EN EL SERVIDOR 

        // REALIZA UNA CONSULTA A LA BASE DE DATOS PARA INGRESAR LA IMG 
        const [result] = await pool.query('INSERT INTO carousel_images set ? ',[{name_img_carousel , datatype_img_carousel , data_img_carousel }]);

        // MANEJO DE LA REPUESTAS DEL SERVIDOR 
        console.log(result);
        res.status(200).json({ message: "Imagen enviada con éxito" });

    } catch (error) {
        // MANEJO DE LOS ERRORES DEL SERVIDOR 
        console.error(error)
        return res.status(500).json({ message: "Error al Crear una nueva imágenen para el carrusel" })
    }
}

// FUNCION PARA OBTENER TODOS LOS DATOS DE LAS IMG DEL CARRUSEL
export const getImgCarroucels = async(req,res) => {
    try {
        // CONSULTA PARA TRAER TODOS LOS DATOS DE LAS IMG DE LA BASE DE DATOS
         const [ result ] = await pool.query('SELECT * FROM carousel_images ORDER BY id_img_carousel DESC');
        
        // MANEJO DE LA REPUESTAS DEL SERVIDOR 
        console.log(result)
        res.status(200).json(result.map(result=>({id: result.id_img_carousel, name_img: result.name_img_carousel, datatype : result.datatype_img_carousel , data : result.data_img_carousel})))

    } catch (error) {
        // MANEJO DE LOS ERRORES DEL SERVIDOR 
        console.error(error);
        return res.status(500).json({ message: "Error al obtener las imagenes" })
    }
}

// FUNCION PARA OBTENER SOLO UN DATOS DE LAS IMG DEL CARRUSEL
export const getImgCarroucel = async(req,res) => {
    try{
        // CONSULTA PARA TRAER SOLO UN DATOS DE LAS IMG DE LA BASE DE DATOS
        const [result] = await pool.query('SELECT * FROM carousel_images WHERE id_img_carousel = ?',[req.params.id]);
        console.log(result);

        // MANEJO DE LA REPUESTAS DEL SERVIDOR
        if ( result == 0) 
            return res.status(404).json({ message : "task not found" });
            res.status(200).json({id: result[0].id_img_carousel, name_img: result[0].name_img_carousel, datatype : result[0].datatype_img_carousel , data : result[0].data_img_carousel })
    } catch (error) {
        // MANEJO DE LOS ERRORES DEL SERVIDOR 
        console.error(error)
        return res.status(500).json({ message: "Error al obtener una imagenen" })
    }
    
}

// FUNCION PARA ACTUALIZAR LAS IMG DE CARRUSEL
export const updateImgCarroucel = async(req,res) => {
    try{
        // CONSULTA PARA ACTUALIZAR LOS DATOS
        const result = await pool.query('UPDATE carousel_images SET ? WHERE id_img_carousel = ? ',[req.body,req.params.id]);
        console.log(result);

        // MANEJO DE LA REPUESTAS DEL SERVIDOR
        res.status(200).json({message: "Imagen actualizada con exito"});

    } catch (error) {
        // MANEJO DE LOS ERRORES DEL SERVIDOR 
        console.error(error);
        return res.status(500).json({ message: "Error al actualizar la imágene del carrusel" })
    }
}

// FUNCION PARA ELIMINA LAS IMG DEL CARRUCEL
export const deleteImgCarroucel = async(req,res) => {
    try{
        // EXTRAE EL NOMBRE DE LA IMG DEL PARAMETRO  
        const dataImg = req.query.data

        // CONSULTA PARA ELIMINAR LA IMG DE LA BASE DE DATOS
        const [result] = await pool.query('DELETE FROM carousel_images WHERE id_img_carousel = ? ', [req.params.id])
        console.log(result);

        // ELIMINA LA IMG DE LAS CARPETAS DE SERVIDOR 
        fs.unlinkSync(`images/${dataImg}`)
        if (result.affectedRows === 0 ) 

        // MANEJO DE LA REPUESTAS DEL SERVIDOR 
        return res.status(404).json({ message : "task not found" });
        return res.status(200).json({ title : "Archivo Borrado." , message: "El archivo seleccionado ha sido borrado con éxito. Ten en cuenta que esta acción no se puede deshacer."});
            
    } catch (error) {
        // MANEJO DE LOS ERRORES DEL SERVIDOR 
        console.error(error);
        return res.status(500).json({ title:"Error!" ,  message: 'Error al eliminar la imágene del carrusel' })
    }

}