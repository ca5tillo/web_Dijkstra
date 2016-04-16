Algoritmo de dijkstra:

Proyecto en el cual mediante al pasarle al sistema una matriz de pesos y el vertice inicial i0,
buscaria el camino mas corto hacia cada vertice desde i0.

Para resolver este problema creamos objetos(nodos) para generar la abstraccion de la grafica.


El objeto es representado de la siguiente manera.
nodo{
	nombre
	listacaminos
		//cada camino tiene un destino y un costo
	etiqueta 
		//esta etiqueta contiene el costo que tomo llegar a este nodo 
		//y el nombre del nodo de donve viene
	evaluado
		//esto nos sirve para saver si su etiqueta es permanente o temporal
}

Una vez que ya se tiene la lista de nodos que representa nuestra grafica
Procedemos a ejecutar el algoritmo de dijkstra.

Le pasamos el nodo inical al cual le ponemos en su etiqueta un costo de 0 y probienen de "vacio"
apartir de este calculamos las etiquetas de los nodos a donde nos lleva este nodo inicialy
actualiaremos las etiquetas temporales de los nodos adyacentes 

finalizara cuando la grafica tenga en todos sus nodos la etiqueta permanente 

Deacuerdo al libro.

Si L(v) es la etiqueta permanente del vertice v, entonces L(v) es la longitud de una ruta mas corta de a(nodo inicial) a v.
 