const PouchDB = require('pouchdb');


const localBD = new PouchDB('baseLocal'); // CREO BASE LOCAL (1.)

const remoteDB = new PouchDB('http://valum:couchdb@localhost:5984/couchsl')
//Sincronizar la base local con la remota
localBD.sync(remoteDB, {
  live: true, // mantiene conexión abierta
  retry: true // si se cae la conexión vuelve a intentar conectarse
 }).on('change', function (change) {
  console.log('data change', change)
 }).on('error', function (err) {
  console.log('sync error', err)
 })

let nuevoDocumento={_id:'7',nombre:'Santiago',apellido:'Escalante',edad:23};
//let nuevoDocumento={_id:'8',nombre:'Valentin',apellido:'Garcia Iriart',edad:23};

//Insertar un documento
localBD.put(nuevoDocumento)
  .then(result => {
    console.log('Documento insertado con éxito:', result);
  })
  .catch(error => {
    console.error('Error al insertar el documento:', error);
  });
//leer todos los documentos 
localBD.allDocs({ include_docs: true }).then((docs) => { 
    docs.rows.forEach(element => {
        console.log(element.doc);
    }); 
})


//leer un documento por _id
/*localBD.get('7').then(result=>{
    console.log(result);
})*/

