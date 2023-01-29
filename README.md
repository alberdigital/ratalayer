# Ratalayer

Script para generar una colección de imágenes a partir de las capas de un fichero PSD.

Necesitas tener instalado Photoshop 24.1.1 o superior (probablemente funcione en versiones más antiguas)

Para ejecutarlo, con la imagen abierta en Photoshop:

    Archivo > Secuencia de comandos > Explorar...

Selecciona el fichero __ratascript.jsx__

La ventana emergente te informa del número de imágenes (combinaciones de capas) que pueden construirse.

Elige el nombre de la colección y el tipo de generación:
- Only some random images: generará el número de imágenes elegido al azar.
- Complete traversal: generará todas las imágenes posibles.

El fichero PSD tiene que tener un primer nivel de grupos y, dentro de cada grupo, las opciones de capa.

Cada capa debe tener un nombre con la siguiente estructura (los textos entre llaves son variables):

    {texto arbitrario}[{peso probabilístico}]#{categoria 1}:{valor 1}|{categoria 2}:{valor2}|...

Hay un fichero PSD de ejemplo en la carpeta _demo-resources_.

Las imágenes se generan en una carpeta _build_ a la par del fichero PSD.
