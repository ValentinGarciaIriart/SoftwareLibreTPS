const http = require('http');
const fs= require('fs');
const path = require('path');
const pathName= '/home/santiagoescalante/SoftwareLibreTPS/clima.txt';


//Funcion, get a API de accuweather que trae json con datos del clima por hora de una ciudad especifica, en nuestro caso Mar del Plata
function getClima(){ 
    const locationKey= '7893';   //Codigo para Mar del Plata, get autocomplete "mar del plata" te devuelve este id
   
    //queryparams 
    const apiKey='fwooK7kLzbZtlofLaV5pJaRBF5L8DjRe';
    const url= `http://dataservice.accuweather.com/forecasts/v1/hourly/1hour/${locationKey}?apikey=${apiKey}&language=es-ar&details=true&metrics=true`
   
    //Hago la request
   
    http.get(url,(response)=>{
        let datos='';
   
        //obtengo la data , en chunks
        response.on('data',(data)=>{
            datos += data;
        });

        //Cuando termina de llegar toda la respuesta, parseamos la data,  generamos la linea de contenido y la escribimos en el archivo.

        response.on('end',()=>{
            datos= JSON.parse(datos);
            let celsius= (datos[0].Temperature.Value-32)*(5/9)
            const contenido = "Hora: "+Date().toString() + " Temperatura: "+celsius.toFixed(1)+"°C"+ " Estado: "+datos[0].IconPhrase+"\n";
            try{
                if(fs.existsSync(pathName)){
                    fs.appendFileSync(pathName,contenido);
                }
                else{
                    fs.writeFileSync(pathName,contenido);
                }
            }
            catch(errorEsc){
                console.log('error al escribir',errorEsc);
            }
        })

        response.on('error',(errorReq)=>{
            if(errorReq.code === 400 ){
                console.log('la sintaxis no es la adecuada', errorReq);
            }
            else if(errorReq.code === 401){
                console.log('Acceso no autorizado. Fallo de autorizacion de la API',errorReq);
            }
            else if(errorReq.code === 403){
                console.log('Acceso no autorizado. No se tiene los permisos para este endpoint',errorReq);
            }
            else if(errorReq.code === 404){
                console.log('el server no ha encontrado una ruta que coincida con el uri proporcionado',errorReq);
            }
            else{   //Error 500
                console.log('el servidor encontro una condicion inesperada que le impidio cumplir con la solicitud',errorReq);
                setTimeout(()=>{},24*60*60000);   //Si pase el limite de requests por dia espero 1 dia para volver a hacer request
            }
        })
          
    })

}




//Primero elimino el archivo existente (no habria que hacerlo ahora)
fs.unlink(pathName,(errorElim)=>{
    if (errorElim) {
        console.error('Error al eliminar el archivo:', errorElim);
        return;
      }
    
      console.log('El archivo se ha eliminado correctamente.');
});
//Intervalos de 1 minuto = 60000 milisegundos
setInterval(() => {
  getClima();
}, 10*1000);  //esta puesto ahora para 10 segundos







