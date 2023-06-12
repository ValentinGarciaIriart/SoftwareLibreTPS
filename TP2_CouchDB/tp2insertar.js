const PouchDB = require('pouchdb');
//Base local
const localBD = new PouchDB('baseLocal'); // CREO BASE LOCAL (1.)

let nuevoDocumento={_id:'19',nombre:'Julian',apellido:'Alvarez',edad:23};

//Insertar un documento
localBD.put(nuevoDocumento)
  .then(result => {
    console.log('Documento insertado con éxito:', result);
  })
  .catch(error => {
    console.error('Error al insertar el documento:', error);
  });