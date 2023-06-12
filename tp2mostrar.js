const PouchDB = require('pouchdb');
//Base local
const localBD = new PouchDB('baseLocal'); // CREO BASE LOCAL (1.)
//leer todos los documentos 
localBD.allDocs({ include_docs: true }).then((docs) => { 
    docs.rows.forEach(element => {
        console.log(element.doc);
    }); 
})


//leer un documento por _id
localBD.get('7').then(result=>{
    console.log(result);
    //Agregar un atributo a un documento(modificarlo);
  let nuevoDocumento;
  nuevoDocumento=result;
     nuevoDocumento.deporte='futbol';
    localBD.put(nuevoDocumento)
  .then(result => {
    console.log('Documento insertado con éxito:', result);
  })
  .catch(error => {
    console.error('Error al insertar el documento:', error);
  });
})