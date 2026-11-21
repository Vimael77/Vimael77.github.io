(function () {
  "use strict";

  const meta = Object.freeze({
    nombre: "Lista de intercambios de alimentos ecuatorianos",
    edicion: "2.\u00aa edici\u00f3n",
    institucion: "Universidad San Francisco de Quito (USFQ Press)",
    uso: "Referencia de porciones intercambiables dentro del mismo subgrupo USFQ",
    medidas: Object.freeze({
      cucharaditaMl: 5,
      cucharadaMl: 10,
      vasoMl: 330,
      tazaMl: 250,
      bowlMl: 320
    })
  });

  const subgrupos = [
    ["cereal_alto_cho_baja_grasa", "Cereales, tub\u00e9rculos y pl\u00e1tanos", "Altos en carbohidratos y bajos en grasas", 30, 4, 1, 150],
    ["cereal_medio_cho_media_grasa", "Cereales, tub\u00e9rculos y pl\u00e1tanos", "Medios en carbohidratos y medios en grasas", 20, 2, 6, 145],
    ["cereal_medio_cho_baja_grasa", "Cereales, tub\u00e9rculos y pl\u00e1tanos", "Medios en carbohidratos y bajos en grasas", 20, 3, 1, 105],
    ["fruta_media_cho", "Frutas", "Medias en carbohidratos", 20, 1, 0, 90],
    ["fruta_baja_cho", "Frutas", "Bajas en carbohidratos", 10, 1, 0, 50],
    ["fruta_deshidratada", "Frutas", "Deshidratadas", 20, 1, 0, 95],
    ["vegetal_bajo_cho", "Vegetales", "Bajos en carbohidratos", 5, 1, 0, 30],
    ["vegetal_libre", "Vegetales", "Libre consumo", 3, 2, 0, 25],
    ["lacteo_entero", "L\u00e1cteos", "Enteros altos en grasas", 11, 8, 8, 150],
    ["lacteo_semidescremado", "L\u00e1cteos", "Semidescremados medios en grasas", 11, 8, 4, 110],
    ["lacteo_descremado", "L\u00e1cteos", "Descremados bajos en grasas", 12, 8, 1, 90],
    ["lacteo_descremado_alto_cho", "L\u00e1cteos", "Descremados y altos en carbohidratos", 25, 6, 3, 150],
    ["queso", "L\u00e1cteos", "Quesos", 1, 7, 7, 95],
    ["carne_alta_grasa", "Carnes, pescados y huevos", "Altos en grasas", 1, 11, 15, 180],
    ["carne_media_grasa", "Carnes, pescados y huevos", "Medios en grasas", 0, 11, 7, 110],
    ["carne_baja_grasa", "Carnes, pescados y huevos", "Bajos en grasas", 0, 11, 2, 65],
    ["embutido", "Carnes, pescados y huevos", "Embutidos", 1, 7, 7, 100],
    ["leguminosa", "Leguminosas", "Leguminosas", 20, 9, 1, 120],
    ["grasa_alta", "Grasas y frutos secos", "Altos en grasas", 1, 1, 12, 120],
    ["grasa_media", "Grasas y frutos secos", "Medios en grasas", 2, 1, 7, 75],
    ["grasa_alta_bajo_cho", "Grasas y frutos secos", "Altos en grasas y bajos en carbohidratos", 8, 4, 10, 140],
    ["grasa_media_bajo_cho", "Grasas y frutos secos", "Medios en grasas y bajos en carbohidratos", 12, 2, 7, 125],
    ["azucar", "Az\u00facares y alimentos azucarados", "Az\u00facares y alimentos azucarados", 10, 0, 0, 40]
  ].map(function (fila) {
    return Object.freeze({
      id: fila[0],
      grupo: fila[1],
      nombre: fila[2],
      carbohidrato: fila[3],
      proteina: fila[4],
      grasa: fila[5],
      energia: fila[6]
    });
  });

  const alimentos = [];
  const contadorIds = Object.create(null);

  function crearId(texto) {
    return String(texto)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function agregar(subgrupoId, pagina, filas) {
    filas.forEach(function (fila) {
      const base = subgrupoId + "-" + crearId(fila[0]);
      contadorIds[base] = (contadorIds[base] || 0) + 1;
      const id = contadorIds[base] === 1 ? base : base + "-" + contadorIds[base];
      alimentos.push(Object.freeze({
        id: id,
        subgrupoId: subgrupoId,
        nombre: fila[0],
        gramos: fila[1],
        medida: fila[2],
        pagina: pagina
      }));
    });
  }

  agregar("cereal_alto_cho_baja_grasa", "20\u201326", [
    ["Amaranto, grano seco", 45, "4 cdas. llenas; \u00bc taza"],
    ["Amaranto pop", 35, "1 taza llena"],
    ["Arrocillo, cocido", 110, "\u00be taza"],
    ["Arrocillo, crudo", 45, "3 cdas. llenas; \u00bc taza"],
    ["Arroz blanco, grano largo, cocido", 110, "\u00be taza"],
    ["Arroz blanco, grano largo, crudo", 45, "3 cdas. llenas; \u00bc taza"],
    ["Arroz blanco, enriquecido, precocido, cocido", 110, "1 taza"],
    ["Arroz blanco, enriquecido, precocido, crudo", 45, "\u00bc taza"],
    ["Arroz integral, grano largo, cocido", 120, "\u00be taza"],
    ["Arroz integral, grano largo, crudo", 45, "3 cdas. llenas; \u00bc taza"],
    ["Avena, hojuelas, sin fortificar", 40, "4 cdas. llenas; \u215c taza"],
    ["Avena, molida", 40, "4 cdas. llenas; \u215c taza"],
    ["Arroz, bebida sin az\u00facar", 325, "\u215e vaso"],
    ["Camote, cocido", 145, "1 taza llena"],
    ["Camote, crudo", 135, "1 taza rasa; 1 unidad mediana"],
    ["Canguil, dulce, de caramelo", 35, "1 taza rasa; 1 bowl peque\u00f1o"],
    ["Cebada, grano entero", 45, "3 cdas. llenas; \u00bc taza"],
    ["Cebada, grano triturado", 45, "4 cdas. llenas; \u00bc taza"],
    ["Cereal de desayuno, arroz crocante", 35, "\u00bd taza"],
    ["Cereal de desayuno, hojuelas azucaradas", 40, "\u00be taza"],
    ["Cereal de desayuno, hojuelas con miel", 40, "\u00be taza"],
    ["Cereal de desayuno, bolitas de chocolate", 40, "1 taza rasa"],
    ["Cereal de desayuno, aros de fruta", 35, "1 taza rasa"],
    ["Cereal de desayuno, granola o muesli", 40, "\u2153 taza"],
    ["Cereal de desayuno, salvado de trigo", 40, "\u00be taza"],
    ["Cereal de desayuno, Special K", 40, "\u00be taza"],
    ["Cusc\u00fas, cocido", 120, "1 taza rasa"],
    ["Cusc\u00fas, crudo", 45, "4 cdas. llenas; \u00bc taza"],
    ["Fideo de arroz, cocido", 140, "1 taza llena"],
    ["Fideo espagueti, cocido", 100, "1 taza rasa"],
    ["Fideo espagueti, crudo", 40, "1 pu\u00f1ado"],
    ["Fideo espagueti integral, cocido", 100, "1 taza llena"],
    ["Fideo espagueti integral, crudo", 40, "1 pu\u00f1ado"],
    ["Fideo tornillo, cocido", 100, "1 taza rasa"],
    ["Fideo tornillo, crudo", 40, "3 cdas. llenas; \u2153 taza"],
    ["Harina de achira", 30, "2 cdas. llenas"],
    ["Maicena", 30, "2 cdas. colmadas; \u2153 taza"],
    ["Mote, cocido", 90, "\u00be taza"],
    ["Mote, crudo", 45, "\u00bc taza"],
    ["Morocho, crudo", 50, "3 cdas. llenas; \u2153 taza"],
    ["\u00d1ame", 120, "1 taza rasa"],
    ["Oca", 200, "P: 10 unidades; G: 6 unidades"],
    ["Pan pita, blanco", 55, "1 unidad"],
    ["Pan de centeno", 60, "1 unidad"],
    ["Bagel de salvado", 60, "1 unidad"],
    ["Pan de trigo, natural o tostado", 60, "1 unidad"],
    ["Pan pita, integral", 50, "1 unidad"],
    ["Pan para hamburguesa o hot dog", 70, "1 unidad"],
    ["Papa amarilla o chaucha", 110, "1 taza llena; 9 unidades"],
    ["Papa con c\u00e1scara", 130, "P: 12 unidades; M: 2; G: 1; EG: \u00bd"],
    ["Papa pelada", 120, "P: 12 unidades; M: 2; G: 1; EG: \u00bd"],
    ["Papa pelada, en cubos", 120, "\u215c taza"],
    ["Pl\u00e1tano maduro", 100, "4 rodajas; \u00bc unidad"],
    ["Pl\u00e1tano verde", 90, "P: \u00be unidad; G: \u2153 unidad"],
    ["Quinua, cocida", 130, "1 taza rasa"],
    ["Quinua, cruda", 45, "4 cdas. llenas; \u2153 taza"],
    ["Yuca", 90, "\u00be taza"]
  ]);

  agregar("cereal_medio_cho_media_grasa", "20\u201326", [
    ["Canguil con sal", 30, "Crudo: 2 cdas., \u215b taza; cocido: 4 tazas"],
    ["Chulpi", 30, "3 cdas.; \u00bc taza"],
    ["Galleta de avena", 30, "4 unidades peque\u00f1as; 1 grande"],
    ["Galleta de soda", 30, "5 unidades"],
    ["Galleta de chocolate", 30, "6 unidades"],
    ["Galleta con chispas", 30, "3 unidades"],
    ["Galleta Mar\u00eda", 30, "5 unidades"],
    ["Galleta waffle rellena", 30, "6 unidades"],
    ["Galleta Melva", 30, "1 unidad"],
    ["Galleta oreja", 30, "5 peque\u00f1as; 1 grande"],
    ["Galleta Oreo", 30, "3 unidades"],
    ["Galleta Tango", 30, "1 unidad"],
    ["Barra Quinde", 25, "1 unidad"],
    ["Pan de yuca", 50, "2 unidades"],
    ["Pastel de vainilla", 35, "1 rodaja (7.4 \u00d7 6.3 \u00d7 2.4 cm)"],
    ["Pastel de chocolate", 40, "1 rodaja (7.3 \u00d7 6.5 \u00d7 2.4 cm)"],
    ["Patac\u00f3n", 50, "2 unidades"],
    ["Ma\u00edz tostado", 30, "3 cdas.; \u00bc taza"]
  ]);

  agregar("cereal_medio_cho_baja_grasa", "20\u201326", [
    ["Harina de m\u00e1chica", 30, "3 cdas. colmadas"],
    ["Harina de centeno", 30, "2 cdas."],
    ["Harina de ma\u00edz", 30, "2 cdas."],
    ["Harina de ma\u00edz morado, negro o azul", 30, "2 cdas."],
    ["Harina de pl\u00e1tano", 30, "2 cdas."],
    ["Harina de quinua", 30, "2 cdas."],
    ["Harina de trigo integral", 30, "1\u00bd cdas."],
    ["Harina de trigo blanca", 30, "2 cdas."],
    ["Harina de yuca o almid\u00f3n", 30, "2 cdas."],
    ["Melloco", 140, "1 taza rasa; 13 unidades"],
    ["Pan blanco, en rodajas", 50, "2 rodajas"],
    ["Pan integral, en rodajas", 44, "2 rodajas"],
    ["Tortilla de ma\u00edz", 60, "2 unidades"],
    ["Tortilla de ma\u00edz y trigo", 55, "2 unidades"],
    ["Zanahoria blanca", 120, "1 taza rasa"]
  ]);

  agregar("fruta_media_cho", "66\u201371", [
    ["Banano o pl\u00e1tano orito", 90, "1 unidad"],
    ["Banano, guineo o pl\u00e1tano de seda", 110, "P: 2 unidades; M: 1; G: \u00be"],
    ["Banano, guineo morado o pl\u00e1tano rosado", 90, "1 unidad"],
    ["Boroj\u00f3", 65, "\u00bd taza; \u215b unidad"],
    ["Capul\u00ed", 120, "1 taza llena"],
    ["Chirimoya", 120, "\u00bd taza; P: 1\u00bc; M: \u00bd; G: \u00bc unidad"],
    ["Claudia o ciruela amarilla o roja", 150, "6 amarillas; 8 rojas peque\u00f1as"],
    ["C\u00f3ctel de frutas en alm\u00edbar", 110, "3 cdas. colmadas; \u00bd taza"],
    ["Durazno melocot\u00f3n", 140, "1 unidad"],
    ["Durazno com\u00fan", 110, "1 unidad"],
    ["Durazno en alm\u00edbar", 105, "2 mitades; 1 unidad"],
    ["Granadilla", 80, "\u00bc taza; 1 unidad grande"],
    ["Guan\u00e1bana o guanaba", 120, "\u00bd taza; \u00bd bowl peque\u00f1o"],
    ["Guaytambo o durazno prisco", 160, "2 unidades peque\u00f1as"],
    ["Higo maduro", 120, "4 unidades"],
    ["Kiwi", 170, "1\u00bd unidades"],
    ["Mamey", 135, "\u00be unidad"],
    ["Mango criollo", 200, "2 unidades"],
    ["Mango grande, maduro", 110, "4 gajos; 1 taza"],
    ["Manzana nacional", 160, "1 unidad mediana"],
    ["Manzana importada", 130, "1 unidad mediana"],
    ["Maracuy\u00e1 o granadilla morada, pulpa", 100, "\u00bc taza; M: 1; G: \u00be unidad"],
    ["Naranja nacional", 180, "P: 1; M: \u00be; G: \u00bd unidad"],
    ["Naranja nacional, jugo natural", 220, "\u215e taza; \u00be vaso"],
    ["Naranja importada", 180, "1 unidad"],
    ["Nectar\u00edn", 180, "1 unidad"],
    ["Pera nacional", 130, "1 unidad"],
    ["Pi\u00f1a", 150, "1\u00bd tazas en rodajas; 1 taza en cubos"],
    ["Pi\u00f1a en alm\u00edbar", 110, "2\u00bd rodajas; \u00bd taza"],
    ["Pitahaya amarilla", 150, "1 taza rasa; 1\u00bd unidades peque\u00f1as"],
    ["Tuna", 120, "1\u00bd unidades"],
    ["Uva verde", 120, "20\u201322 unidades peque\u00f1as"],
    ["Uva roja", 120, "7\u20138 unidades grandes"],
    ["Uvilla", 130, "P: 10; M: 6 unidades"]
  ]);

  agregar("fruta_baja_cho", "66\u201371", [
    ["Araz\u00e1", 130, "\u00be taza; P: 2; M: 1 unidad"],
    ["Babaco", 200, "1 taza"],
    ["Carambola", 125, "2 unidades"],
    ["Cereza", 100, "10 unidades"],
    ["Coco, agua", 325, "1 vaso"],
    ["Frutilla", 100, "P: 10; M: 8; G: 5\u20136 unidades"],
    ["Guaba", 60, "1 unidad peque\u00f1a; \u00bc taza"],
    ["Guayaba", 100, "P: 1\u00bc; M: \u00be; G: \u00bd unidad"],
    ["Mandarina", 70, "2 patate\u00f1as; 1 coste\u00f1a; 1 importada; \u00bd King"],
    ["Mango verde", 100, "6 gajos; 1 taza colmada"],
    ["Mel\u00f3n", 100, "1 taza rasa"],
    ["Mora", 90, "\u00be taza"],
    ["Morti\u00f1o", 75, "1 taza rasa"],
    ["Naranjilla", 135, "1\u00bd grandes; 2 peque\u00f1as"],
    ["Papaya", 100, "1 taza rasa"],
    ["Pepino dulce", 150, "1 unidad"],
    ["Pitahaya roja", 80, "\u00bc unidad"],
    ["Pomarrosa", 120, "1\u00be grandes; 2 peque\u00f1as"],
    ["Sand\u00eda", 100, "1 taza"],
    ["Taxo", 200, "1 taza; P: 5; M: 4; G: 3 unidades"],
    ["Tomate de \u00e1rbol", 120, "P: 3; M: 2; G: \u00be unidad"],
    ["Toronja", 95, "\u00bc unidad"]
  ]);

  agregar("fruta_deshidratada", "66\u201371", [
    ["Ar\u00e1ndanos deshidratados", 30, "3 cdas.; \u2153 taza"],
    ["Ciruela pasa", 30, "2 cdas.; 10 unidades"],
    ["Higo deshidratado", 30, "5 unidades"],
    ["Mango deshidratado", 30, "10\u201312 l\u00e1minas"],
    ["Manzana deshidratada", 30, "3 cdas."],
    ["Pasas negras", 30, "3 cdas."],
    ["Pasas rubias", 30, "3 cdas."],
    ["Pi\u00f1a deshidratada", 30, "10 medias rodajas"],
    ["Tamarindo", 30, "2 cdas. colmadas"],
    ["Uvilla deshidratada", 30, "3 cdas.; \u2153 taza"]
  ]);

  agregar("vegetal_bajo_cho", "98\u2013101", [
    ["Achogcha, cruda o cocida", 100, "P: 5; M: 2\u00bd; G: 1\u00bd unidades"],
    ["Alcachofa sin sal, cruda o cocida", 45, "\u00bd unidad"],
    ["Arveja tierna, enlatada", 35, "\u215b taza"],
    ["Arveja tierna sin sal, cruda o cocida", 35, "\u00bc taza"],
    ["Berenjena sin sal, cocida", 60, "5 rodajas"],
    ["Berenjena cruda", 70, "7 rodajas; \u00bd unidad"],
    ["Br\u00f3coli crudo", 70, "1 taza llena; P: 27; M: 4; G: 2 unidades"],
    ["Br\u00f3coli sin sal, cocido", 70, "1 taza rasa; P: 20; M: 3; G: 2 unidades"],
    ["Cebolla roja o paite\u00f1a, cruda", 85, "1 taza rasa; \u00bd unidad mediana"],
    ["Choclo dulce, enlatado", 30, "2 cdas. llenas; \u00bc taza"],
    ["Choclo amarillo, en grano, crudo o cocido", 20, "2 cdas. llenas; \u215b taza"],
    ["Choclo blanco, en grano, crudo o cocido", 20, "2 cdas. llenas; \u215b taza; \u2153 mazorca"],
    ["Col blanca, cruda", 100, "2 tazas llenas"],
    ["Col blanca sin sal, cocida", 95, "2 hojas; 1 taza"],
    ["Coliflor cruda", 100, "1 taza; P: 9; G: 3 unidades"],
    ["Coliflor sin sal, cocida", 110, "1 taza rasa; P: 9; G: 3 unidades"],
    ["Esp\u00e1rrago", 125, "Crudo: 9\u201310; cocido: 9 unidades"],
    ["Espinaca cruda", 120, "3 tazas"],
    ["Espinaca sin sal, cocida", 120, "1\u00bd tazas"],
    ["Fr\u00e9jol tierno, toda variedad, crudo", 15, "1 cda.; \u215b taza"],
    ["Fr\u00e9jol tierno, toda variedad, cocido", 25, "2 cdas.; \u00bc taza"],
    ["Haba tierna, con o sin c\u00e1scara", 40, "\u00bc taza; P: 28; M: 22; G: 12 unidades"],
    ["Nabo, crudo o cocido", 90, "Crudo: 1\u00bd tazas; cocido: \u00bd taza"],
    ["Palmito, enlatado", 100, "\u00be taza"],
    ["Pimiento rojo", 75, "\u00bd unidad mediana"],
    ["Remolacha cruda", 50, "\u00bd taza"],
    ["Remolacha sin sal, cocida", 50, "\u2153 taza"],
    ["Sambo, crudo o cocido", 95, "\u00be taza"],
    ["Tomate cherry o tomatillo", 70, "\u00bd taza; 7\u20138 unidades"],
    ["Tomate ri\u00f1\u00f3n, rojo", 100, "\u00bd taza; \u00bd unidad; 3 rodajas"],
    ["Vainita cruda", 60, "\u00bd taza (la tabla la rotula como cocida)"],
    ["Vainita cocida", 60, "\u00be taza (la tabla la rotula como cruda)"],
    ["Zanahoria, jugo", 50, "\u215b taza; \u215b vaso"],
    ["Zanahoria pelada", 50, "\u2153 taza"],
    ["Zapallo crudo", 60, "\u00bd taza"],
    ["Zapallo cocido", 60, "\u00bc taza"],
    ["Zucchini", 150, "1 taza colmada"]
  ]);

  agregar("vegetal_libre", "98\u2013101", [
    ["Acelga cruda", 90, "4 tazas colmadas"],
    ["Acelga cocida", 80, "1 taza rasa"],
    ["Alfalfa, brotes", 80, "2\u00bd tazas"],
    ["Apio, tallos o cubos", 130, "Palitos: 1 taza; cubos: 1\u00bd tazas"],
    ["Berro", 100, "4 tazas colmadas"],
    ["Champi\u00f1\u00f3n", 75, "2 tazas rasas; 5 unidades grandes"],
    ["Lechuga romana o crespa", 100, "1 unidad peque\u00f1a"],
    ["Lechuga criolla", 125, "6 hojas"],
    ["Pepinillo", 150, "\u00be unidad; 20 rodajas; 1\u00bd tazas en cubos"],
    ["R\u00e1bano", 200, "2 tazas llenas; 8 unidades medianas"],
    ["R\u00facula", 85, "2\u00bd tazas"]
  ]);

  agregar("lacteo_entero", "134\u2013137", [
    ["Leche de vaca, fluida, 3.25 % grasa", 240, "1 taza; \u00be vaso"],
    ["Leche de vaca, en polvo", 30, "2 cdas. colmadas"],
    ["Yogur natural, leche entera", 240, "1 taza; \u00be vaso"]
  ]);

  agregar("lacteo_semidescremado", "134\u2013137", [
    ["Leche de vaca, fluida, 2 % grasa", 240, "1 taza; \u00be vaso"],
    ["Yogur natural, leche semidescremada", 200, "\u215e taza; \u00be vaso"]
  ]);

  agregar("lacteo_descremado", "134\u2013137", [
    ["Leche de vaca, fluida, 1 % grasa", 240, "1 taza; \u00be vaso"],
    ["Yogur natural, leche descremada", 150, "\u00be taza; \u00bd vaso"]
  ]);

  agregar("lacteo_descremado_alto_cho", "134\u2013137", [
    ["Leche de vaca con chocolate, fluida, 1 % grasa", 200, "1 taza; \u215d vaso"],
    ["Yogur sabor a fruta, leche descremada", 140, "\u00bd taza; \u215c vaso"]
  ]);

  agregar("queso", "134\u2013137", [
    ["Queso azul", 30, "1 trozo (8 \u00d7 1.5 cm)"],
    ["Queso brie", 30, "1 trozo (4.2 \u00d7 3.2 \u00d7 2.3 cm)"],
    ["Queso camembert", 30, "1 trozo (5 \u00d7 5 \u00d7 2.6 cm)"],
    ["Queso cheddar", 30, "1\u00bd l\u00e1minas"],
    ["Queso gouda", 30, "1 trozo (5.2 \u00d7 4.5 \u00d7 1.1 cm)"],
    ["Queso holand\u00e9s", 30, "1\u00bd l\u00e1minas"],
    ["Queso manchego", 30, "1 trozo (10.5 \u00d7 1 cm)"],
    ["Queso parmesano, bloque", 25, "1 trozo (10.5 \u00d7 1.2 cm)"],
    ["Queso roquefort", 30, "1 trozo (8 \u00d7 1.5 cm)"],
    ["Queso suizo", 30, "2 trozos (5.1 \u00d7 3 \u00d7 1.7 cm) o 1 (5.9 \u00d7 5.7 \u00d7 1 cm)"],
    ["Queso cottage", 60, "2 trozos (9.1 \u00d7 4.5 \u00d7 0.6 cm)"],
    ["Queso cuajada", 40, "1 trozo (9.1 \u00d7 4 \u00d7 0.8 cm)"],
    ["Queso fresco entero", 40, "1 trozo (9.1 \u00d7 4 \u00d7 0.8 cm)"],
    ["Queso fresco semidescremado", 35, "1 trozo (9 \u00d7 4 \u00d7 0.7 cm)"],
    ["Queso mozzarella", 30, "2 l\u00e1minas; 1 trozo (10.5 \u00d7 4 \u00d7 1 cm)"],
    ["Queso ricota, leche entera", 60, "2 trozos cortos o 2 largos (9.1 \u00d7 4.5 \u00d7 0.6 cm)"],
    ["Queso reques\u00f3n", 60, "2 trozos largos; 1 cda. llena"],
    ["Queso ricota descremado", 60, "2 trozos (9.1 \u00d7 4.4 \u00d7 0.6 cm)"]
  ]);

  agregar("carne_alta_grasa", "150\u2013157", [
    ["Cerdo, costilla, cruda", 70, "1 costilla"],
    ["Cerdo, costilla, cocida", 55, "1 costilla"],
    ["Cordero, costilla, cruda", 60, "1 costilla"],
    ["Cordero, costilla, cocida", 40, "1 costilla"],
    ["Res, intestinos o tripas, crudos o cocidos", 80, "5 trozos"],
    ["Res, carne sin hueso, cruda o cocida", 60, "1 trozo (8.5 \u00d7 4.5 \u00d7 1.4 cm)"],
    ["Res, carne molida alta en grasa", 50, "Cruda: 2 cdas. colmadas; cocida: 4 cdas. llenas"],
    ["Res, costilla, cruda o cocida", 60, "2 trozos (8.1 \u00d7 3.1 \u00d7 2.3 cm)"],
    ["Res, lengua, cruda o cocida", 70, "Cruda: 9 \u00d7 5.5 \u00d7 1.5 cm; cocida: 6 \u00d7 5 \u00d7 1.4 cm"],
    ["Res, ubre, cruda o cocida", 80, "Cruda: 11.4 \u00d7 6 \u00d7 0.7 cm; cocida: 8 \u00d7 5 \u00d7 1.5 cm"]
  ]);

  agregar("carne_media_grasa", "150\u2013157", [
    ["Cerdo, carne semimagra, cocida", 40, "1 trozo (9.4 \u00d7 4.3 \u00d7 2.1 cm)"],
    ["Cerdo, carne semimagra, cruda", 60, "1 trozo (8.1 \u00d7 5.4 \u00d7 2.4 cm)"],
    ["Cerdo, chuleta", 50, "Cruda: \u00bd unidad mediana; cocida: 1 peque\u00f1a"],
    ["Cerdo, pata, cruda o cocida", null, "2 trozos (altura: 2.9 cm)"],
    ["Cerdo, pierna, cruda", 60, "1 trozo (altura: 2.9 cm)"],
    ["Huevo de codorniz, entero, crudo o cocido", 50, "4 unidades"],
    ["Huevo de gallina, entero, crudo o cocido", 50, "P: 2; M: 1; G: \u00bd unidad"],
    ["Pescado pampanito o carita, crudo o cocido", 60, "Crudo: 2 filetes; cocido: 1 unidad peque\u00f1a"],
    ["Pescado salm\u00f3n", 60, "Crudo: 13.1 \u00d7 3 \u00d7 2.4 cm; cocido: 12.1 \u00d7 3.5 \u00d7 2.2 cm"],
    ["Pescado sardina en aceite, enlatado", 65, "1 unidad"],
    ["Pescado sardina en salsa de tomate, enlatado", 55, "1 unidad"],
    ["Pollo, ala, cruda o cocida", 60, "1 unidad mediana"],
    ["Pollo, pierna con piel, cruda o cocida", 55, "1 unidad peque\u00f1a; \u00bd mediana"],
    ["Pollo, pechuga con piel, cruda", 55, "1 filete (10.2 \u00d7 6.5 \u00d7 0.5 cm)"],
    ["Res, bife de chorizo, crudo", 60, "1 filete (8.5 \u00d7 4.5 \u00d7 1.4 cm)"],
    ["Res, bife de chorizo, cocido", 55, "1 filete (6.2 \u00d7 5.3 \u00d7 1.3 cm)"],
    ["Res, bistec, crudo", 60, "1 filete (10 \u00d7 4 \u00d7 2.1 cm)"],
    ["Res, carne semimagra, cruda", 50, "1 filete (7 \u00d7 3.4 \u00d7 1.9 cm)"],
    ["Res, carne semimagra, cocida", 40, "1 filete (6.1 \u00d7 3.5 \u00d7 1.3 cm)"],
    ["Res, lomo falda, crudo", 60, "1 filete (9.5 \u00d7 4.2 \u00d7 2 cm)"]
  ]);

  agregar("carne_baja_grasa", "150\u2013157", [
    ["Calamar", 70, "Crudo P: 6; G: 2 unidades; asado o cocido: \u00bc taza"],
    ["Camar\u00f3n pelado, crudo o cocido", 60, "P: 11; G: 4 unidades"],
    ["Cangrejo, pulpa, enlatado", 70, "3 cdas. colmadas; \u00bc taza"],
    ["Cerdo, carne magra, lomo, crudo", 50, "2 trozos o 1 filete"],
    ["Cerdo, carne magra, lomo, cocido", 40, "2 trozos o 1 filete"],
    ["Concha, cruda", 70, "14 unidades"],
    ["Conejo, cocido", 45, "1 trozo (altura: 6.5 cm)"],
    ["Conejo, crudo", 60, "\u00bd presa"],
    ["Cordero, magro con hueso, crudo o cocido", 50, "1 pedazo (5 \u00d7 4 \u00d7 2.5 cm)"],
    ["Cordero, pierna, cocida", 40, "1 pedazo (18 \u00d7 2.5 \u00d7 1.5 cm)"],
    ["Cordero, pierna, cruda", 60, "1 pedazo (18.5 \u00d7 3.5 \u00d7 1.5 cm)"],
    ["Cuy o cobayo, cocido", 60, "1 pierna peque\u00f1a; 1 brazo peque\u00f1o"],
    ["Huevo de gallina, clara, cruda o cocida", 100, "3 unidades"],
    ["Langostino pelado, crudo o cocido", 80, "2 unidades"],
    ["Pavo, pechuga, sin piel", 60, "Crudo o cocido: 1 filete"],
    ["Pescado albacora o at\u00fan blanco", 50, "Crudo o cocido: 1 trozo o 1 filete"],
    ["Pescado at\u00fan en aceite o agua, enlatado", 40, "4 cdas. llenas; \u00bc taza"],
    ["Pescado bacalao, seco, salado", 20, "\u215b taza; 5 trozos"],
    ["Pescado bagre", 75, "Crudo o cocido: 1 trozo"],
    ["Pescado bonito, crudo", 40, "1 filete (7.2 \u00d7 7.1 \u00d7 0.3 cm)"],
    ["Pescado corvina, cruda", 70, "Cruda o cocida: 1 filete"],
    ["Pescado dorado, crudo", 60, "1 filete (13.5 \u00d7 4.6 \u00d7 1 cm)"],
    ["Pescado jurel, crudo", 60, "1 filete (13.5 \u00d7 4.6 \u00d7 1 cm)"],
    ["Pescado lenguado", 60, "Crudo o cocido: 1 filete"],
    ["Pescado mero, crudo", 60, "1 filete (10 \u00d7 8 \u00d7 0.8 cm)"],
    ["Pescado pargo", 60, "Crudo, asado o cocido: 1 filete"],
    ["Pescado picudo, crudo", 50, "1 filete (13 \u00d7 4.5 \u00d7 1 cm)"],
    ["Pescado r\u00f3balo, crudo", 60, "1 filete (15 \u00d7 4.2 \u00d7 0.6 cm)"],
    ["Pescado sierra, crudo", 50, "1 filete (13 \u00d7 4.5 \u00d7 1 cm)"],
    ["Pescado tilapia, cruda", 60, "1 filete (10 \u00d7 8 \u00d7 0.8 cm)"],
    ["Pescado tilapia, cocida", 55, "1 filete (8.4 \u00d7 7 \u00d7 1 cm)"],
    ["Pescado toyo, crudo", 60, "1 filete (9.3 \u00d7 9.3 \u00d7 0.3 cm)"],
    ["Pescado trucha, cruda", 50, "Cruda o cocida: 1 filete"],
    ["Pollo, h\u00edgado, crudo", 75, "1\u00bd unidades"],
    ["Pollo, h\u00edgado, cocido", 50, "1\u00bd unidades"],
    ["Pollo, mollejas, crudas o cocidas", 40, "P: 2; G: 1\u00bd unidades"],
    ["Pollo, muslo sin piel, crudo o cocido", 45, "\u00bd unidad"],
    ["Pollo, pechuga sin piel", 40, "Cruda o cocida: 1 filete"],
    ["Res, guata", 80, "Cruda: \u00bd taza; cocida: \u00be taza"],
    ["Res, librillo", 80, "Crudo: \u00be taza; cocido: 1 taza"],
    ["Res, aguja, cruda", 50, "2 trozos (3.8 \u00d7 3 \u00d7 2.2 cm)"],
    ["Res, aguja, cocida", 30, "2 trozos (3.6 \u00d7 3 \u00d7 2 cm)"],
    ["Res, carne magra, cruda", 50, "1 filete (7.3 \u00d7 6 \u00d7 1.1 cm)"],
    ["Res, coraz\u00f3n, crudo", 70, "1 filete (14 \u00d7 6 \u00d7 0.9 cm)"],
    ["Res, coraz\u00f3n, cocido", 50, "1 filete (8.8 \u00d7 4.6 \u00d7 1.4 cm)"],
    ["Res, h\u00edgado, crudo", 55, "1 filete (8.5 \u00d7 5.7 \u00d7 1.1 cm)"],
    ["Res, h\u00edgado, cocido", 45, "1 filete (7 \u00d7 5.4 \u00d7 1.2 cm)"],
    ["Res, lomo fino, filete, cocido", 40, "1 filete (7 \u00d7 6 \u00d7 1 cm)"],
    ["Res, lomo fino, filete, crudo", 50, "1 filete (8.5 \u00d7 6.1 \u00d7 1 cm)"],
    ["Res, molida, 1\u20133 % grasa", 50, "Cruda: 2 cdas. colmadas; cocida: 4 cdas. llenas"],
    ["Res, molida, 3\u20135 % grasa", 45, "Cruda: 2 cdas. colmadas; cocida: 4 cdas. llenas"],
    ["Res, pata", 90, "Cruda o cocida: 1 trozo"],
    ["Res, ri\u00f1\u00f3n, crudo", 80, "6 trozos peque\u00f1os"],
    ["Res, ri\u00f1\u00f3n, cocido", 45, "6 trozos peque\u00f1os"],
    ["Res, sangre, frita", 50, "\u00bd taza"],
    ["Res, T-bone, crudo", 50, "1 pedazo"]
  ]);

  agregar("embutido", "150\u2013157", [
    ["Chorizo de res y cerdo, crudo o cocido", 40, "2 trozos"],
    ["Jam\u00f3n de cerdo", 40, "2\u00bd unidades"],
    ["Jam\u00f3n de pavo", 40, "2 unidades"],
    ["Jam\u00f3n de pollo", 40, "2 unidades"],
    ["Morcilla, cruda o cocida", 65, "1 unidad"],
    ["Mortadela bologna", 40, "2 unidades"],
    ["Mortadela de cerdo y res", 40, "2 unidades"],
    ["Salchicha de pollo, cruda o cocida", 35, "1 unidad"],
    ["Salchicha de res, cruda o cocida", 50, "2 unidades"]
  ]);

  agregar("leguminosa", "190\u2013191", [
    ["Arveja, grano seco, sin sal, cocida", 100, "4\u00bd cdas. colmadas; \u00bd taza"],
    ["Arveja, grano seco, cruda", 35, "3 cdas. rasas; \u215b taza"],
    ["Chocho, con sal, cocido", 60, "\u00bd taza"],
    ["Fr\u00e9jol blanco, sin sal, cocido", 90, "\u00bd taza"],
    ["Fr\u00e9jol blanco, grano seco, crudo", 35, "3 cdas. rasas; 2 cdas. llenas; \u215b taza"],
    ["Fr\u00e9jol negro, sin sal, cocido", 90, "\u00bd taza"],
    ["Fr\u00e9jol negro, grano seco, crudo", 40, "3\u00bd cdas. rasas; 2 cdas. llenas; \u215b taza"],
    ["Fr\u00e9jol rojo, sin sal, cocido", 90, "\u00bd taza"],
    ["Fr\u00e9jol rojo, grano seco, crudo", 35, "3 cdas. rasas; 2 cdas. llenas; \u215b taza"],
    ["Garbanzo, sin sal, cocido", 90, "\u00be taza"],
    ["Garbanzo, grano seco, crudo", 35, "2 cdas. llenas; \u00bc taza"],
    ["Haba, grano seco, cruda", 35, "3 cdas. rasas"],
    ["Haba, grano seco, tostada", 35, "3 cdas. llenas; \u00bc taza"],
    ["Harina de garbanzo", 30, "3 cdas. colmadas; \u215b taza"],
    ["Harina de haba", 30, "1\u00bd cdas. colmadas; \u00bc taza"],
    ["Lenteja, grano seco, sin sal, cocida", 90, "\u00be taza"],
    ["Lenteja, grano seco, cruda", 35, "3 cdas. llenas; \u00bc taza"],
    ["Soya, bebida", 200, "\u215e taza; \u00be vaso"],
    ["Soya, brote, crudo", 75, "1\u00bd tazas"],
    ["Soya, brote, cocido", 75, "1 taza"],
    ["Soya, en polvo", 30, "3 cdas. colmadas; \u2153 taza"]
  ]);

  agregar("grasa_alta", "202\u2013206", [
    ["Aceite de aguacate", 15, "2 cdas. llenas"],
    ["Aceite de ajonjol\u00ed", 15, "2 cdas. llenas"],
    ["Aceite de almendra", 10, "1 cda. llena"],
    ["Aceite de canola", 15, "2 cdas. llenas"],
    ["Aceite de coco", 15, "2 cdas. llenas"],
    ["Aceite de girasol", 15, "2 cdas. llenas"],
    ["Aceite de ma\u00edz", 15, "2 cdas. llenas"],
    ["Aceite de nuez", 10, "1 cda. llena"],
    ["Aceite de oliva", 15, "2 cdas. llenas"],
    ["Aceite de palma", 15, "2 cdas. llenas"],
    ["Aceite de soya", 15, "2 cdas. llenas"],
    ["Chicharr\u00f3n de cerdo", 20, "2 cdas. llenas"],
    ["Coco maduro, pulpa", 30, "\u215b taza"],
    ["Crema de leche, espesa", 30, "2 cdas."],
    ["Man\u00ed o cacahuate, con sal, tostado", 20, "2 cdas."],
    ["Man\u00ed o cacahuate, con sal, frito", 20, "2 cdas.; \u00bc taza"],
    ["Manteca de cerdo", 10, "1 cda."],
    ["Nuez de nogal", 15, "3 enteras o 6 mitades; 2 cdas."],
    ["Queso crema", 30, "1 cda. colmada"]
  ]);

  agregar("grasa_media", "202\u2013206", [
    ["Aceituna verde, sin hueso", 60, "\u00bd taza; 20\u201322 unidades"],
    ["Aguacate serrano", 50, "1 unidad"],
    ["Aguacate o palta com\u00fan", 50, "\u00bc unidad"],
    ["Chontacuro o may\u00f3n, frito", 25, "1 unidad"],
    ["Crema agria", 50, "2 cdas."],
    ["Mantequilla con o sin sal", 10, "2 cdtas. llenas; 1 trozo (5 \u00d7 4 \u00d7 0.6 cm)"],
    ["Margarina 20 % grasa, con sal", 40, "2 cdtas. colmadas"],
    ["Margarina 80 % grasa, con sal", 10, "1 cda. rasa"]
  ]);

  agregar("grasa_alta_bajo_cho", "202\u2013206", [
    ["Almendra", 25, "2 cdas.; \u00bc taza; 30 unidades"],
    ["Mayonesa comercial con sal", 30, "2 cdas."],
    ["Semilla de ajonjol\u00ed", 20, "2 cdas.; \u215b taza"],
    ["Semilla de ch\u00eda", 30, "3 cdas.; \u00bc taza"],
    ["Semilla de girasol", 20, "Con c\u00e1scara: \u00bd taza; sin c\u00e1scara: 2 cdas."],
    ["Semilla de linaza", 25, "2 cdas.; \u00bc taza"],
    ["Pistacho con sal, tostado", 25, "Con c\u00e1scara: 3 cdas., \u00bd taza; sin c\u00e1scara: 2 cdas., \u00bc taza"],
    ["Semilla de sambo, sin sal, tostada", 30, "3 cdas.; \u2153 taza"]
  ]);

  agregar("grasa_media_bajo_cho", "202\u2013206", [
    ["Chocolate con leche Crunch Nestl\u00e9", 30, "\u00bd barra; 2 trozos (4 \u00d7 4 \u00d7 0.7 cm)"],
    ["Cocoa en polvo", 15, "2 cdas."],
    ["Crema de cacao y avellana", 20, "1 cda."],
    ["Helado de crema", 60, "1 bola mediana"],
    ["Hojuelas de coco seco azucaradas", 20, "2 cdas. colmadas; \u215b taza"]
  ]);

  agregar("azucar", "224\u2013225", [
    ["Az\u00facar blanca", 10, "1 cda. llena"],
    ["Az\u00facar morena", 10, "1 cda. llena"],
    ["Ca\u00f1a de az\u00facar", 10, "2 trozos (2.8 \u00d7 1.5 cm)"],
    ["Ca\u00f1a de az\u00facar, jugo", 50, "\u215b vaso"],
    ["Caramelo o confite, duro o suave", 10, "3 unidades"],
    ["Cerezas en conserva", 50, "10 unidades"],
    ["Choco listo, polvo", 10, "1 cda. colmada"],
    ["Dulce de guayaba", 10, "\u00bd unidad"],
    ["Dulce de leche", 10, "1 cda. rasa"],
    ["Espumilla", 15, "1 cda. colmada"],
    ["Flan de vainilla", 50, "1 trozo (5.2 \u00d7 4.7 \u00d7 2 cm)"],
    ["Gaseosa de cola negra, con cafe\u00edna", 100, "\u215c taza; \u00bc vaso"],
    ["Gelatina con az\u00facar", 70, "\u00bc taza; \u00bc bowl"],
    ["Goma de mascar o chicle con az\u00facar", 10, "5 unidades"],
    ["Helado de agua, sabor artificial", 50, "1 bola mediana; 1 unidad"],
    ["Helado de paila, de frutas, artesanal", 40, "1 bola mediana"],
    ["Higo en alm\u00edbar, envasado", 30, "1 unidad"],
    ["Jugo procesado sabor a naranja", 100, "\u215c taza; \u00bc vaso"],
    ["Leche condensada enlatada", 20, "2 cdas."],
    ["Malta", 100, "\u215c taza; \u00bc vaso"],
    ["Mermelada", 15, "1 cda. rasa"],
    ["Miel de abeja", 15, "1 cda. rasa"],
    ["Miel de maple", 15, "1 cda. llena"],
    ["Milo, polvo", 15, "1 cda. colmada"],
    ["Panela o raspadura", 10, "1 cda. llena"],
    ["Salsa de tomate o ketchup", 30, "2 cdas. llenas"]
  ]);

  const idsSubgrupo = new Set(subgrupos.map(function (subgrupo) { return subgrupo.id; }));
  const idsAlimento = new Set(alimentos.map(function (alimento) { return alimento.id; }));
  if (subgrupos.length !== 23) console.warn("La matriz USFQ contiene " + subgrupos.length + " subgrupos.");
  if (alimentos.length !== 413) console.warn("El catálogo USFQ contiene " + alimentos.length + " filas; se esperaban 413.");
  if (idsAlimento.size !== alimentos.length) console.warn("Hay identificadores de alimentos USFQ duplicados.");
  alimentos.forEach(function (alimento) {
    if (!idsSubgrupo.has(alimento.subgrupoId)) console.warn("Subgrupo USFQ inexistente: " + alimento.subgrupoId);
    if (!alimento.nombre || !alimento.medida) console.warn("Registro USFQ incompleto: " + alimento.id);
  });

  window.IntercambiosUSFQ = Object.freeze({
    meta: meta,
    subgrupos: Object.freeze(subgrupos.slice()),
    alimentos: Object.freeze(alimentos.slice())
  });
})();
