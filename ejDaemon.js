const http = require('http');
let tiempoInterval;   //Lo hacemos variable ya que si se excedio el limite de request por dia, deberiamos dormirlo hasta el proximo dia
let contenido='';

//Funcion, get a API de accuweather que trae json con datos del clima por hora de una ciudad especifica, en nuestro caso Mar del Plata
function getClima(){ 
     //queryparams 
    //Codigo para Mar del Plata, get autocomplete "mar del plata" te devuelve este id
    const locationKey= '7893';   
    const apiKey='fwooK7kLzbZtlofLaV5pJaRBF5L8DjRe';
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
                    tiempoInterval=60*60000;
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

//Ejecuto la logica del daemon
getClima();