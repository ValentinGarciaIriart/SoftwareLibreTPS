const http = require('http');
const https = require('https');
const geoip = require('geoip-lite');

let tiempoInterval;   //Lo hacemos variable ya que si se excedio el limite de request por dia, deberiamos dormirlo hasta el proximo dia
let contenido='';
//QueryParams

//Codigo de Mar del Plata, lo obtenemos con los request de mas abajo
let locationKey;

//API KEY Accuweather
const apiKey='fwooK7kLzbZtlofLaV5pJaRBF5L8DjRe';

//Funcion, get a API de accuweather que trae json con datos del clima por hora de una ciudad especifica, en nuestro caso Mar del Plata
function getClima(){    
    //url
    const url= `http://dataservice.accuweather.com/forecasts/v1/hourly/1hour/${locationKey}?apikey=${apiKey}&language=es-ar&details=true&metrics=true`
    //Hago la request
        const req= http.get(url,(response)=>{
            let datos='';
            //obtengo la respuesta , en chunks
            response.on('data',(data)=>{
                datos += data;
            });

            //Cuando termina de llegar toda la respuesta, parseamos la data, generamos la linea de contenido y la escribimos en el archivo.
            response.on('end',()=>{
                datos= JSON.parse(datos);
                //si no es undefined el arreglo es porque trajo datos de temperatura
                if(datos[0]){    
                    let celsius= (datos[0].Temperature.Value-32)*(5/9)
                    contenido = "Fecha: "+Date().toString() + " Temperatura: "+celsius.toFixed(1)+"°C"+ " Estado: "+datos[0].IconPhrase;
                    tiempoInterval=60000; //1 hora para el proximo pronostico
                }
                 //Si se pasa algun parametro mal 
                else if (datos.Code == 'Unauthorized'){  
                    console.error('Acceso no autorizado. Fallo de autorizacion de la API',errorRes);
                    tiempoInterval=60000;
                }
                //excedio el limite de requests de nuestra humilde cuenta gratuita
                else{   
                    contenido = "el numero permitido de requests ha sido excedido";
                    tiempoInterval=24*60*60000;
                }
                console.log(contenido);
                //Esperamos 1 hora al proximo pronostico o esperamos 1 dia ya que excedimos el limite de requests
                //En condiciones normales no se excede el limite de requests. Pero por precavidos se puede dormir el daemon 1 dia.
                setTimeout(getClima,tiempoInterval); 
            })
            //Errores posibles , luego de estos se reinicia el daemon, ya que configuramos con restart = on-failure, los errores estan viniendo en response.on(data) y finalizan con end no con error porque asi lo manejan 
            //No ocurren, debido a la forma en la que manejan los errores. Pero si se cambia la api podria ser la estructura de manejo de posibles errores.
            response.on('error',(errorRes)=>{
                if(errorRes.Code === 400 ){
                    console.error('la sintaxis no es la adecuada', errorRes);
                }
                else if(errorRes.Code === 401){
                    console.error('Acceso no autorizado. Fallo de autorizacion de la API',errorRes);
                }
                else if(errorRes.Code === 403){
                    console.error('Acceso no autorizado. No se tiene los permisos para este endpoint',errorRes);
                }
                else if(errorRes.Code === 404){
                    console.error('el server no ha encontrado una ruta que coincida con el uri proporcionado',errorRes);
                }
                else{   //Errores 500
                    console.error('el servidor encontro una condicion inesperada que le impidio cumplir con la solicitud',errorRes);
                }  
                //reintento en 1.5 min
                setTimeout(getClima,90000);
            })
          
        })
        //Error de conexion Por ejemplo sin internet
        req.on('error',(errorReq)=>{     
            console.error('error en la solicitud, error de conexion',errorReq);
        //reintento en 1.5 minutos
            setTimeout(getClima,90000);
        })
}

function getPublicIP(){
   
    return new Promise((resolve, reject) => {
     const req = https.get('https://api.ipify.org?format=json', (res) => {
        let datos = '';

        res.on('data', (data) => {
            datos += data;
        });

        res.on('end', () => {
        const ip = JSON.parse(datos).ip;
        resolve(ip);
        });
        res.on('error', (errIp) => {
            reject('error al obtener la ip:'+errIp);
           });
     })
     req.on('error',(errorReq)=>{
        reject('error de request para obtener la ip:'+errorReq);
     })
  });
}

function getUbicacion(ipPublica){
    
    return new Promise((resolve,reject)=>{
        const ubicacion = geoip.lookup(ipPublica);
        resolve(ubicacion);
    });
}

function getAutocomplete(ubicacion){
   
    const url= `http://dataservice.accuweather.com/locations/v1/cities/autocomplete?apikey=${apiKey}&q=${ubicacion}&language=es-ar`
    
    return new Promise((resolve,reject)=>{
        const req = http.get(url,(res)=>{
            let datos='';
            res.on('data',(data)=>{
                datos+=data;
            });
            res.on('end',()=>{
                datos=JSON.parse(datos);
                if(datos[0])
                 resolve(datos[0].Key);
                else if (datos.Code == 'Unauthorized'){  
                    reject('error al obtener el identificador de localizacion:Acceso no autorizado. Fallo de autorizacion de la API',errorRes);    
                }
                //excedio el limite de requests de nuestra humilde cuenta gratuita
                else{   
                    reject('error al obtener el identificador de localizacion:el numero permitido de requests ha sido excedido');
                }               
            });
            res.on('error',(err)=>{
                reject('error al obtener el identificador de localizacion:error en la respuesta'+err);
            });
        });
        req.on('error',(erreq)=>{
            reject('error de request por el identificador de localizacion:error de conexion'+erreq);
        })
    })
}

let ipPublica;
let ubicacion;

async function logica() {

    try{
        if(!ipPublica){ //Si ya hice la requests pero fallo adelante, no vuelvo a ejecutar la funcion
            ipPublica = await getPublicIP();
            console.log('IP pública:', ipPublica);
        }
        if(!ubicacion && ipPublica){  //En este punto ya tendria la ipPublica pero no la ubicacion
            ubicacion = await getUbicacion(ipPublica);
            console.log('ubicacion:',ubicacion.city);
        }
        if(!locationKey && ubicacion && ipPublica){ //Tendria la Ip y la ubicacion, me faltaria el id
            locationKey= await getAutocomplete(ubicacion.city);
            console.log('locationKey:',locationKey);
            getClima();
        }
    }
    catch(error){ //Catcheo todos los errores posibles en estas requests y reintento
        console.error(error);
        //reintento en 1.5 min
        setTimeout(logica,90000);
    }
}
//Ejecuto la logica del daemon
logica();