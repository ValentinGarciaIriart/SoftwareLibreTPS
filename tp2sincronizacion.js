const PouchDB = require('pouchdb');
//Base local
const localBD = new PouchDB('baseLocal'); // CREO BASE LOCAL (1.)
//Base remota
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
