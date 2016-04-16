window.addEventListener('load',init);
var nodos 	= null;
var origen 	= ''; // Apartir de este se empezaran a calcular las etiquetas
var destino = ''; // fue pensada para cuando se pedia un destino en concreto
var ejecutar = false; // si se cargo adecuadamente el archivo ya se podra ejecutar dijkstra
var csv_caminos = ""; // cadena con lo que se almacenara en el archivo
function init(){
	establecerSOLTAR(); 

}
/*
 * Funcionalidad de DRAG and DROP
*/
function establecerSOLTAR(){
	cajasoltar = document.getElementById('entrada');
	cajasoltar.addEventListener('dragenter', function(e){e.preventDefault(); }, false);
	cajasoltar.addEventListener('dragover', function(e){e.preventDefault(); }, false);
	cajasoltar.addEventListener('drop', soltado, false);

	// para archivos
	window.webkitRequestFileSystem(window.PERSISTENT, 5*1024*1024,
	creardd, onError);
}
function soltado(e){
	nodos = null;
	e.preventDefault();
	var archivos=e.dataTransfer.files;
	// Tomamos el primer archivo
	var archivo = archivos[0];
	var lector = new FileReader();
	// añadimos el evento onload para la lectura
	lector.onload = crearJSON;
	lector.readAsText(archivo); // leemos el archivo al finalizar dispara el evento


	cajasoltar.innerHTML = 'Entrada: '+archivo.name+'  (seleccione el nodo origen)';

}
/*
 * Crar los objetos (nodos) con sus atributos
*/
function crearJSON(e){

	nodos = Array();
	var contenido_Archivo=e.target.result;
//Leo el documento y lo divido en lineas
	var filas = contenido_Archivo.split("\n");

	// Crear elobj base
	for(var i = 0; i<filas.length; i++){
		if(filas[i] != ''){
			nodos.push({"nombre":i,"caminos":[],"etiqueta":{"costo":-1,"viene_de":""},"evaluado":false});
		}
	}

//cada linea la divido en sus partes (cada una es un peso)
	for(var i = 0; i<filas.length; i++){
		if(filas[i] != ''){
			casilla = filas[i].split(',');
			for(var j = 0; j < casilla.length; j++){
				//añade los caminos para los nodos
				addCamino(i,j,casilla[j]);
			}
		}
	}
// la cantidad de nodos las indica en el select de la interface
	cargarNodosEnSelected();
}
function addCamino(origen,destino,costo){
	[].forEach.call(nodos,function (obj){
		if(obj.nombre == origen){
			if(costo != -1){
				obj.caminos.push ( {'destino':destino,'costo':costo});
			}
		}
	});
}
function cargarNodosEnSelected(){
	var selected = document.getElementById('selector_nodo');
	var options ="";
	[].forEach.call(nodos,function (nodo){
		options += '<option value="'+nodo.nombre+'">'+nodo.nombre+'</option>';
	});
	selected.innerHTML = options;
	ejecutar = true;
}

/*
 * FUNCIONES PARA EL ALGORITMO DE DIJSTRA
*/
function dijkstra(){
	if(ejecutar){
		inicializarNodos();
		origen  = document.getElementById('selector_nodo').value; 
		var nuevo = null; // VARIABLE TEMPORAL
		
		//calcular para el elemento origen
		calcularEtiquetas(origen);
		do{		
			nuevo = buscarBuscarElMinimo(); // devuelve el nombre del nodo nuevo fijo
			if(nuevo){
				calcularEtiquetas(nuevo);
			}
		}while(nuevo);
		
		pintarCaminos();
		
	}else{
		alert("Aun no se a cargado el archivo.");	
	}
}
function inicializarNodos(){
	[].forEach.call(nodos,function (nodo){
		nodo.etiqueta.costo = -1;
		nodo.etiqueta.viene_de = "";
		nodo.evaluado= false;
	});
}
function calcularEtiquetas(nodoBase){
	var costoOrigen;
	var costoCamino;
	// busco el nodo que se me ha enviado
	[].forEach.call(nodos, function (nodo){
		if(nodoBase == nodo.nombre){
			// inicializar el nodo 
			// el unico momento que entra un -1 es con el nodo origen
			if(nodo.etiqueta.costo == -1 ){
				nodo.etiqueta.costo = 0;
				nodo.etiqueta.viene_de = "";
			}

			// lo marco como ya evaluado
			nodo.evaluado = true;
			costoOrigen = nodo.etiqueta.costo;
			// Recorrer sus caminos 
			[].forEach.call(nodo.caminos, function (camino){
				
				actualizarEtiquetaDeNodoDestino(nodoBase, camino.destino, costoOrigen, camino.costo);

			});
		}
	});	
}
function actualizarEtiquetaDeNodoDestino(origen, destino, costoOrigen, costoCamino){
	var costo = parseInt(costoOrigen)+parseInt(costoCamino);
	[].forEach.call(nodos,function(nodo){
		if(destino == nodo.nombre){
			if(nodo.etiqueta.costo == -1 ){
				nodo.etiqueta.costo = costo;
				nodo.etiqueta.viene_de = origen;
			}else{
				if(nodo.etiqueta.costo > costo){
					nodo.etiqueta.costo = costo;
					nodo.etiqueta.viene_de = origen;
				}
			}
		}
	});
}
function buscarBuscarElMinimo(){
	var costo = null;
	var nombre_nodo = null;

	[].forEach.call(nodos, function (nodo){
		// si no ha sido evaluado y si su etiqueta tiene contenido
		if(!nodo.evaluado && nodo.etiqueta.costo != -1 && nodo.etiqueta.viene_de != ""){
			if(costo){
				if(nodo.etiqueta.costo < costo){
					costo = nodo.etiqueta.costo;
					nombre_nodo = nodo.nombre;
				}
			}else{
				//para el primer paso inserto el primer valor que encuentra 
				costo = nodo.etiqueta.costo;
				nombre_nodo = nodo.nombre;
			}
		}
	});
	
	return nombre_nodo;
}
/*
 * PINTA CAMINOS DESPUES DE LOS CALCULOS YA PODEMOS OBTENER LOS CAMINOS MAS CORTOS DE CADA NODO
*/

function pintarCaminos(){
// Creo la cadena que se imprimira en la interfaz y en el documento descargable
	csv_caminos = "";
	var html_caminos= "";
	
	var n =0;
	var costoT;
	[].forEach.call(nodos,function (nodo){
		n=0;
		if(nodo.nombre != origen){
			if(n == 0){n=1;costoT= nodo.etiqueta.costo;}
			if(csv_caminos != ''){csv_caminos += '\n';html_caminos += '<br>'}

			csv_caminos += nodo.nombre;
			html_caminos+= nodo.nombre;

			var antesesor = nodo.nombre;
			do{
				antesesor = getanterior(antesesor);
				if(antesesor != ''){
					csv_caminos += ','+antesesor;
					html_caminos += ','+antesesor;
				}
			}while(antesesor != '')
			html_caminos += ' --Costo Total a este nodo : '+costoT; 
			csv_caminos += ', --Costo Total a este nodo : '+costoT; 
			// lo comparo con vacio ya que el inicio se crea con vacio
		}
	});
	pintarCaminoHTML(html_caminos);
}
// me devuelve el nodo del cual llevo 
function getanterior(destino){
	var algo = '';
	[].forEach.call(nodos,function (nodo){
		if(nodo.nombre == destino){
			algo = nodo.etiqueta.viene_de;
		}
	});
	
	return algo;
}

function pintarCaminoHTML(caminos){
	var section = document.getElementById('section');
	section.innerHTML = caminos;
}
/*
FUNCIONES PARA EL TRATAMIENTO DE ARCHIVOS
PARA QUE FUNCIONE ESTA SECCION ES 
NECESARIO EJECUTARLO DESDE UN SERVIDOR 

*/
function creardd(sistema){
	dd=sistema.root;
}
function borrarArchivo(){
	var origen='dijkstra.csv';
	dd.getFile(origen,null,function(entrada){
	entrada.remove(onError);
	},onError);
}


function crearArchivo(){
	borrarArchivo();
	navigator.webkitPersistentStorage.requestQuota (1024*1024*1024, function(grantedBytes) {
		console.log ('requestQuota: ', arguments);
		requestFS(grantedBytes);
	}, onError);
}
function onError () { console.log ('Error : ', arguments); }
function requestFS(grantedBytes) {
  window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, function(fs) {
    console.log ('fs: ', arguments); // I see this on Chrome 27 in Ubuntu


	fs.root.getFile('dijkstra.csv', {create: true}, function(fileEntry) {

    // Create a FileWriter object for our FileEntry (log.txt).
    fileEntry.createWriter(function(fileWriter) {

      fileWriter.onwriteend = function(e) {
        console.log('Write completed.');
      };

      fileWriter.onerror = function(e) {
        console.log('Write failed: ' + e.toString());
      };



      var aFileParts = [''+csv_caminos];
      var oMyBlob = new Blob(aFileParts, {type : 'text/plain'}); 

      fileWriter.write(oMyBlob);

    }, onError);

  }, onError);

  }, onError);
}
  /*
* fuente principal
  https://adegiusti.files.wordpress.com/2013/09/el-gran-libro-de-html5-css3-y-javascript.pdf

  
* Este fue el efectivo para crear el archivo
* Se uso webkitPersistentStorage ya que el que recomendaba el libro tambien ya es obsoleto
http://stackoverflow.com/questions/17164698/filesystem-api-not-working-in-chrome-v27-v29

* En esta pagina me di cuenta que se tiene que ejecutar en un servidor 
* para que tenga los permisos adecuados y pueda crear el archivo
http://stackoverflow.com/questions/20594804/html-5-file-system-api-i-am-getting-a-domerror-notsupporteerror

*Una excelente pagina donde pude ver la manera de descargar los archivos que he creado
http://html5-demos.appspot.com/static/filesystem/filer.js/demos/index.html

* Mi carpeta con mis archivos
filesystem:http://localhost/persistent/

* En el libro indica que se debe usar este pero ya es obsoleto 
* Por tanto se cambio a usar Blob
https://developer.mozilla.org/es/docs/Web/API/BlobBuilder
https://developer.mozilla.org/es/docs/Web/API/Blob

* FileSystem APIs pero obsoleto
http://www.html5rocks.com/es/tutorials/file/filesystem/


* Me ayudo a tener nocion de que buscar para poder ver los archivos que he creado
http://alfonsomarin.com/desarrollo-web/articulos/uso-de-api-html5-filesystem-para-cachear-datos-en-cordovaphonegap-o-chrome
  */