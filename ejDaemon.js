const http = require('http');
const fs= require('fs');
const path = require('path');
const pathName= '/home/santiagoescalante/SoftwareLibreTPS/clima.txt';
let tiempoInterval;   //Lo hacemos variable ya que si se excedio el limite de request por dia, deberiamos dormirlo hasta el proximo dia



//Funcion, get a API de accuweather que trae json con datos del clima por hora de una ciudad especifica, en nuestro caso Mar del Plata
function getClima(){ 
    const locationKey= '7893';   //Codigo para Mar del Plata, get autocomplete "mar del plata" te devuelve este id
    //queryparams 
    const apiKey='fwooK7kLzbZtlofLaV5pJaRBF5L8DjRe';
    const url= `http://dataservice.accuweather.com/forecasts/v1/hourly/1hour/${locationKey}?apikey=${apiKey}&language=es-ar&details=true&metrics=true`
    let excede=0;
    //Hago la request
        const req= http.get(url,(response)=>{
            let datos='';
   
            //obtengo la data , en chunks
            response.on('data',(data)=>{
                datos += data;
            });

            //Cuando termina de llegar toda la respuesta, parseamos la data,  generamos la linea de contenido y la escribimos en el archivo.

            response.on('end',()=>{
                datos= JSON.parse(datos);
                let contenido='';
                if(datos[0]){    //si no es undefined es porque trajo datos de temperatura
                    let celsius= (datos[0].Temperature.Value-32)*(5/9)
                    contenido = "Hora: "+Date().toString() + " Temperatura: "+celsius.toFixed(1)+"°C"+ " Estado: "+datos[0].IconPhrase+"\n";
                    tiempoInterval=60*60000;
                }
                else{   //excedio el limite de requests de nuestra humilde cuenta gratuita
                    contenido = "el numero permitido de requests ha sido excedido"+"\n";
                    tiempoInterval=24*60*60000;
                }
                try{  //Escribimos en el archivo el contenido
                    if(fs.existsSync(pathName)){
                        fs.appendFileSync(pathName,contenido);
                    }
                    else{
                        fs.writeFileSync(pathName,contenido);
                    }
                }
                catch(errorEsc){
                    console.error('error al escribir',errorEsc);
                }
                //Esperamos 1 hora al proximo pronostico o esperamos 1 dia ya que excedimos el limite de requests
                setTimeout(getClima,tiempoInterval); 
            })
            //Errores posibles , luego de estos se reinicia el daemon, ya que configuramos con restart = on-failure
            response.on('error',(errorRes)=>{
                if(errorRes.code === 400 ){
                    console.error('la sintaxis no es la adecuada', errorRes);
                }
                else if(errorRes.code === 401){
                    console.error('Acceso no autorizado. Fallo de autorizacion de la API',errorRes);
                }
                else if(errorRes.code === 403){
                    console.error('Acceso no autorizado. No se tiene los permisos para este endpoint',errorRes);
                }
                else if(errorRes.code === 404){
                    console.error('el server no ha encontrado una ruta que coincida con el uri proporcionado',errorRes);
                }
                else{   //Errores 500
                    console.error('el servidor encontro una condicion inesperada que le impidio cumplir con la solicitud',errorRes);
                }
            })
          
        })
        //Error de conexion
        req.on('error',(errorReq)=>{     //Por ejemplo error en la conexion, sin internet
            console.error("error en la solicitud",errorReq);
        })
}




//Primero elimino el archivo existente (no habria que hacerlo ahora)
try{
    fs.unlinkSync(pathName);
    console.log("El archivo se ha eliminado correctamente");
}
catch(errorElim){
    console.error("Error al eliminar el archivo",errorElim);
}

//Ejecuto la logica del daemon
getClima();









