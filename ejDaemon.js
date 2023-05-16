const http = require('http');
const fs= require('fs');
const path = require('path');
const fileName= 'clima.txt';


//Funcion, get a API de accuweather que trae json con datos del clima por hora de una ciudad especifica, en nuestro caso Mar del Plata
function getClima(){ 
    const locationKey= '7894_PC';
   
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
            console.log(contenido);
            if(fs.existsSync(fileName)){
                fs.appendFileSync(fileName,contenido);
            }
            else{
                fs.writeFileSync(fileName,contenido);
            }
        })
          
    })
}




//Primero elimino el archivo existente (no habria que hacerlo ahora)
fs.unlink(fileName,(error)=>{
    if (error) {
        console.error('Error al eliminar el archivo:', error);
        return;
      }
    
      console.log('El archivo se ha eliminado correctamente.');
});
//Intervalos de 1 minuto = 60000 milisegundos
setInterval(() => {
  getClima();
}, 60*1000);







