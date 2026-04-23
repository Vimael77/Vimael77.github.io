// Base de datos predefinida de recetas
var recetas_db = [
  // --- DESAYUNOS (1 - 12) ---
  {
    id: 1,
    nombre: "Avena con nueces y proteína",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Avena, molida, Quaker", gramos: 40 },
      { nombre: "Almendra, seca", gramos: 15 },
      { nombre: "Bedida proteíca, proteína de suero, Gofit", gramos: 30 }
    ]
  },
  {
    id: 2,
    nombre: "Huevos revueltos con vegetales",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Huevo de gallina, entero, crudo", gramos: 100 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 50 },
      { nombre: "Cebolla, blanca, larga, cruda", gramos: 30 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 3,
    nombre: "Mote Pillo Proteico",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Maíz blanco, tipo mote, sin pelar", gramos: 100 },
      { nombre: "Huevo de gallina, entero, crudo", gramos: 100 },
      { nombre: "Cebolla, blanca, larga, cruda", gramos: 20 },
      { nombre: "Leche de vaca, descremada (1% grasa), fluida, con vitamina A y D", gramos: 30 }
    ]
  },
  {
    id: 4,
    nombre: "Panqueques de avena y proteína",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Avena, molida, Quaker", gramos: 40 },
      { nombre: "Huevo de gallina, entero, crudo", gramos: 50 },
      { nombre: "Bedida proteíca, proteína de suero, Gofit", gramos: 20 },
      { nombre: "Leche de vaca, descremada (1% grasa), fluida, con vitamina A y D", gramos: 50 }
    ]
  },
  {
    id: 5,
    nombre: "Tigrillo al horno (Versión Fit)",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Plátano, verde, crudo", gramos: 120 },
      { nombre: "Huevo de gallina, entero, crudo", gramos: 50 },
      { nombre: "Queso, fresco, light", gramos: 40 }
    ]
  },
  {
    id: 6,
    nombre: "Tostadas con aguacate y huevo pochado",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Pan, integral, rodaja, cuadrado, suave", gramos: 60 },
      { nombre: "Aguacate, sin cáscara, promedio", gramos: 40 },
      { nombre: "Huevo de gallina, entero, crudo", gramos: 50 }
    ]
  },
  {
    id: 7,
    nombre: "Omelette de espinaca y queso",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Huevo de gallina, entero, crudo", gramos: 100 },
      { nombre: "Espinaca, cruda", gramos: 50 },
      { nombre: "Queso, mozarella, bajo en grasa", gramos: 30 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 8,
    nombre: "Bowl de Kéfir con chía y frutas",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Yogurt, natural, leche entera", gramos: 200 },
      { nombre: "Semilla, de chía, seca", gramos: 15 },
      { nombre: "Mora, zarzamora, fresca", gramos: 80 }
    ]
  },
  {
    id: 9,
    nombre: "Arepa de maíz con pollo desmechado",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Harina de maíz, promedio, Maizabrosa", gramos: 40 },
      { nombre: "Pollo, pechuga, sin piel, a la parrilla, cocida", gramos: 60 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 30 }
    ]
  },
  {
    id: 10,
    nombre: "Batido verde de proteína",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Bedida proteíca, proteína de suero, Gofit", gramos: 30 },
      { nombre: "Espinaca, cruda", gramos: 40 },
      { nombre: "Banano, guineo, plátano seda", gramos: 50 },
      { nombre: "Leche de vaca, descremada (1% grasa), fluida, con vitamina A y D", gramos: 150 }
    ]
  },
  {
    id: 11,
    nombre: "Sandwich de pavo y vegetales",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Pan, integral, rodaja, cuadrado, suave", gramos: 60 },
      { nombre: "Jamón, de pavo, fresco", gramos: 60 },
      { nombre: "Lechuga, romana, crespa, fresca, cruda", gramos: 20 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 30 }
    ]
  },
  {
    id: 12,
    nombre: "Porridge de quinua con manzana",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Quinua, cruda", gramos: 40 }, // Se hidrata al cocinar
      { nombre: "Leche de vaca, descremada (1% grasa), fluida, con vitamina A y D", gramos: 100 },
      { nombre: "Manzana, con casacara, importada", gramos: 70 },
      { nombre: "Almendra, seca", gramos: 10 }
    ]
  },

  // --- ALMUERZOS (13 - 28) ---
  {
    id: 13,
    nombre: "Pollo a la plancha con ensalada",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Pollo, pechuga, sin piel, a la parrilla, cocida", gramos: 150 },
      { nombre: "Lechuga, romana, crespa, fresca, cruda", gramos: 50 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 50 },
      { nombre: "Aceite, de oliva", gramos: 10 }
    ]
  },
  {
    id: 14,
    nombre: "Pescado al horno con brócoli",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Corvina, fresca, cruda", gramos: 150 },
      { nombre: "Brócoli, crudo", gramos: 100 },
      { nombre: "Aceite, de oliva", gramos: 10 }
    ]
  },
  {
    id: 15,
    nombre: "Encebollado de Albacora (Versión Fit)",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Atún, blanco, albacora, crudo", gramos: 150 },
      { nombre: "Yuca, mandioca, raíz", gramos: 120 },
      { nombre: "Cebolla, roja, paiteña, cruda", gramos: 40 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 30 },
      { nombre: "Culantro, cilantro, fresco, crudo", gramos: 5 }
    ]
  },
  {
    id: 16,
    nombre: "Ceviche de Camarón Ecuatoriano",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Camarón, fresco, cocido", gramos: 150 },
      { nombre: "Cebolla, roja, paiteña, cruda", gramos: 40 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 60 },
      { nombre: "Naranja, agria, zumo, jugo natural", gramos: 30 },
      { nombre: "Limón, zumo", gramos: 20 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 17,
    nombre: "Ceviche Peruano de Pescado Blanco",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Corvina, fresca, cruda", gramos: 150 },
      { nombre: "Cebolla, roja, paiteña, cruda", gramos: 40 },
      { nombre: "Limón, zumo", gramos: 40 },
      { nombre: "Camote, con cáscara, cocido", gramos: 80 },
      { nombre: "Choclo, maíz, amarillo, dulce, enlatado", gramos: 50 }
    ]
  },
  {
    id: 18,
    nombre: "Burrito Bowl Alto en Proteína",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Res, carne magra, cruda", gramos: 130 },
      { nombre: "Arroz integral, grano largo cocido", gramos: 100 },
      { nombre: "Fréjol, negro, grano seco, cocido, sin sal", gramos: 80 },
      { nombre: "Aguacate, sin cáscara, promedio", gramos: 40 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 40 }
    ]
  },
  {
    id: 19,
    nombre: "Lasaña de Plátano Maduro con Carne Magra",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Plátano, maduro, tipo maqueño", gramos: 150 },
      { nombre: "Res, carne magra, cruda", gramos: 120 },
      { nombre: "Queso, mozarella, bajo en grasa", gramos: 40 },
      { nombre: "Salsa, de tomate, regular", gramos: 60 }
    ]
  },
  {
    id: 20,
    nombre: "Pasta Integral con Pavo y Pesto Light",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Pasta, spaguetti, integral, crudo", gramos: 60 },
      { nombre: "Pavo, carne (pechuga), sin piel, cruda", gramos: 120 },
      { nombre: "Tomate, tomatillo, cherry, fresco, crudo", gramos: 40 },
      { nombre: "Aceite, de oliva", gramos: 10 }
    ]
  },
  {
    id: 21,
    nombre: "Seco de Pollo Fit con Arroz Integral",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Pollo, pechuga, sin piel, a la parrilla, cocida", gramos: 150 },
      { nombre: "Arroz integral, grano largo cocido", gramos: 100 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 50 },
      { nombre: "Cebolla, roja, paiteña, cruda", gramos: 20 },
      { nombre: "Culantro, cilantro, fresco, crudo", gramos: 5 }
    ]
  },
  {
    id: 22,
    nombre: "Lomo de Cerdo al Horno con Camote",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Cerdo, carne, pierna o lomo, sin grasa, cruda", gramos: 150 },
      { nombre: "Camote, con cáscara, cocido", gramos: 120 },
      { nombre: "Brócoli, crudo", gramos: 80 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 23,
    nombre: "Guatita Vegetariana de Chochos",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Chocho, cocido, sin sal", gramos: 120 },
      { nombre: "Papa, sin cáscara, cocida", gramos: 100 },
      { nombre: "Mantequilla, de maní, baja en grasa", gramos: 15 },
      { nombre: "Cebolla, blanca, larga, cruda", gramos: 30 }
    ]
  },
  {
    id: 24,
    nombre: "Risotto de Quinua con Champiñones",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Quinua, cruda", gramos: 60 },
      { nombre: "Hongos, champiñones, crudos", gramos: 80 },
      { nombre: "Queso, parmesano, duro", gramos: 15 },
      { nombre: "Cebolla, blanca, larga, cruda", gramos: 20 }
    ]
  },
  {
    id: 25,
    nombre: "Lomo Saltado Fit",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Res, carne magra, cruda", gramos: 150 },
      { nombre: "Cebolla, roja, paiteña, cruda", gramos: 50 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 50 },
      { nombre: "Papa, con cáscara, cocida", gramos: 100 }
    ]
  },
  {
    id: 26,
    nombre: "Hamburguesa de Lentejas con Ensalada",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Lenteja, grano seco, cocido, sin sal", gramos: 120 },
      { nombre: "Avena, molida, Quaker", gramos: 20 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 50 },
      { nombre: "Lechuga, romana, crespa, fresca, cruda", gramos: 30 }
    ]
  },
  {
    id: 27,
    nombre: "Ají de Gallina (Versión Yogur Griego)",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Pollo, pechuga, sin piel, a la parrilla, cocida", gramos: 120 },
      { nombre: "Yogurt, natural, leche descremada, bajo en grasa", gramos: 50 },
      { nombre: "Almendra, seca", gramos: 15 },
      { nombre: "Arroz integral, grano largo cocido", gramos: 100 }
    ]
  },
  {
    id: 28,
    nombre: "Atún a la Plancha con Yuca y Ensalada",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Atún, blanco, albacora, crudo", gramos: 150 },
      { nombre: "Yuca, mandioca, raíz", gramos: 100 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 50 },
      { nombre: "Cebolla, roja, paiteña, cruda", gramos: 20 }
    ]
  },

  // --- CENAS (29 - 40) ---
  {
    id: 29,
    nombre: "Atún con aguacate",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Atún, en agua, enlatado, promedio", gramos: 120 },
      { nombre: "Aguacate, sin cáscara, promedio", gramos: 50 }
    ]
  },
  {
    id: 30,
    nombre: "Tacos de Pollo al Cilantro",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Pollo, pechuga, sin piel, a la parrilla, cocida", gramos: 120 },
      { nombre: "Tortilla, maíz blanco, asada, comercialmente preparado", gramos: 60 },
      { nombre: "Aguacate, sin cáscara, promedio", gramos: 30 },
      { nombre: "Cebolla, blanca, larga, cruda", gramos: 20 },
      { nombre: "Culantro, cilantro, fresco, crudo", gramos: 5 }
    ]
  },
  {
    id: 31,
    nombre: "Fajitas de Res Livianas",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Res, carne magra, cruda", gramos: 120 },
      { nombre: "Pimiento, rojo, chile dulce, fresco, crudo", gramos: 50 },
      { nombre: "Cebolla, roja, paiteña, cruda", gramos: 40 },
      { nombre: "Tortilla, maíz blanco, asada, comercialmente preparado", gramos: 30 }
    ]
  },
  {
    id: 32,
    nombre: "Wrap de Lechuga con Carne Molida",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Lechuga, romana, crespa, fresca, cruda", gramos: 80 },
      { nombre: "Res, carne molida, baja en grasa, 1-3% grasa, cruda", gramos: 120 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 40 },
      { nombre: "Aguacate, sin cáscara, promedio", gramos: 30 }
    ]
  },
  {
    id: 33,
    nombre: "Crema de Zucchini con Cubos de Pollo",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Zucchini, verde, con cáscara, fresco, crudo", gramos: 150 },
      { nombre: "Pollo, pechuga, sin piel, a la parrilla, cocida", gramos: 100 },
      { nombre: "Leche de vaca, descremada (1% grasa), fluida, con vitamina A y D", gramos: 50 },
      { nombre: "Queso, parmesano, duro", gramos: 10 }
    ]
  },
  {
    id: 34,
    nombre: "Pescado al Vapor con Espárragos",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Corvina, fresca, cruda", gramos: 150 },
      { nombre: "Espárrago, crudo", gramos: 100 },
      { nombre: "Aceite, de oliva", gramos: 5 },
      { nombre: "Limón, zumo", gramos: 15 }
    ]
  },
  {
    id: 35,
    nombre: "Ensalada Caprese con Pollo",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 100 },
      { nombre: "Queso, mozarella, leche entera", gramos: 40 },
      { nombre: "Pollo, pechuga, sin piel, a la parrilla, cocida", gramos: 100 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 36,
    nombre: "Quesadillas Fit de Champiñones",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Tortilla, maíz blanco, asada, comercialmente preparado", gramos: 60 },
      { nombre: "Queso, mozarella, bajo en grasa", gramos: 40 },
      { nombre: "Hongos, champiñones, crudos", gramos: 60 },
      { nombre: "Espinaca, cruda", gramos: 30 }
    ]
  },
  {
    id: 37,
    nombre: "Pizza con Base de Coliflor",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Coliflor, cruda", gramos: 150 },
      { nombre: "Huevo de gallina, entero, crudo", gramos: 50 },
      { nombre: "Salsa, de tomate, regular", gramos: 40 },
      { nombre: "Queso, mozarella, bajo en grasa", gramos: 30 }
    ]
  },
  {
    id: 38,
    nombre: "Ensalada de Atún con Garbanzos",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Atún, en agua, enlatado, promedio", gramos: 100 },
      { nombre: "Garbanzo, grano seco, cocido, sin sal", gramos: 80 },
      { nombre: "Tomate, tomatillo, cherry, fresco, crudo", gramos: 40 },
      { nombre: "Cebolla, roja, paiteña, cruda", gramos: 20 }
    ]
  },
  {
    id: 39,
    nombre: "Sopa de Tomate Asado con Huevo Duro",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 150 },
      { nombre: "Huevo de gallina, entero, crudo", gramos: 100 },
      { nombre: "Aceite, de oliva", gramos: 5 },
      { nombre: "Ajo, fresco, crudo", gramos: 5 }
    ]
  },
  {
    id: 40,
    nombre: "Rollitos de Berenjena con Carne",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Berenjena, cruda", gramos: 150 },
      { nombre: "Res, carne molida, baja en grasa, 1-3% grasa, cruda", gramos: 100 },
      { nombre: "Salsa, de tomate, regular", gramos: 40 },
      { nombre: "Queso, parmesano, duro", gramos: 10 }
    ]
  },

  // --- SNACKS Y PRE/POST ENTRENO (41 - 50) ---
  {
    id: 41,
    nombre: "Yogurt griego con frutas",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Yogurt, natural, leche descremada, bajo en grasa", gramos: 150 },
      { nombre: "Mora, zarzamora, fresca", gramos: 100 }
    ]
  },
  {
    id: 42,
    nombre: "Batido de Kéfir y Frutos Rojos",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Yogurt, natural, leche entera", gramos: 200 },
      { nombre: "Mora, zarzamora, fresca", gramos: 80 },
      { nombre: "Semilla, de chía, seca", gramos: 10 }
    ]
  },
  {
    id: 43,
    nombre: "Tortitas de Arroz con Crema de Maní",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Pan, integral, de trigo, tostado", gramos: 20 },
      { nombre: "Mantequilla, de maní, baja en grasa", gramos: 20 },
      { nombre: "Banano, guineo, plátano seda", gramos: 50 }
    ]
  },
  {
    id: 44,
    nombre: "Ceviche de Chochos",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Chocho, cocido, sin sal", gramos: 80 },
      { nombre: "Tomate, rojo, riñon, crudo, promedio", gramos: 40 },
      { nombre: "Cebolla, roja, paiteña, cruda", gramos: 20 },
      { nombre: "Limón, zumo", gramos: 15 }
    ]
  },
  {
    id: 45,
    nombre: "Batido Post-Entreno de Chocolate y Plátano",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Bedida proteíca, proteína de suero, Gofit", gramos: 30 },
      { nombre: "Banano, guineo, plátano seda", gramos: 100 },
      { nombre: "Leche de vaca, descremada (1% grasa), fluida, con vitamina A y D", gramos: 150 },
      { nombre: "Chocolate en polvo, Cocoa", gramos: 10 }
    ]
  },
  {
    id: 46,
    nombre: "Manzana con Mantequilla de Almendras",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Manzana, con casacara, importada", gramos: 120 },
      { nombre: "Mantequilla, de almendras, natural, Del Sur", gramos: 20 }
    ]
  },
  {
    id: 47,
    nombre: "Mix de Frutos Secos Energético",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Almendra, seca", gramos: 15 },
      { nombre: "Nuez, de nogal, seca", gramos: 15 },
      { nombre: "Pasas, sin semilla, promedio", gramos: 10 }
    ]
  },
  {
    id: 48,
    nombre: "Palitos de Zanahoria con Hummus",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Zanahoria, sin cáscara, cruda, cubos", gramos: 100 },
      { nombre: "Garbanzo, pasta de garbanzo, hummus con pimiento, Ole", gramos: 50 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 49,
    nombre: "Rollitos de Pavo y Queso",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Jamón, de pavo, fresco", gramos: 50 },
      { nombre: "Queso, mozarella, bajo en grasa", gramos: 30 }
    ]
  },
  {
    id: 50,
    nombre: "Pudín de Chía Cacao",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Semilla, de chía, seca", gramos: 20 },
      { nombre: "Leche de vaca, descremada (1% grasa), fluida, con vitamina A y D", gramos: 100 },
      { nombre: "Chocolate en polvo, Cocoa", gramos: 5 },
      { nombre: "Endulzante, stevia, natural, Sanna", gramos: 1 }
    ]
  }
];

// Base de datos de guarniciones estándar
var elaboraciones_recetas = {
  1: "Cocina la avena con agua o leche hasta que espese. Retira del fuego, mezcla la proteina y sirve con las almendras picadas por encima.",
  2: "Sofrie la cebolla y el tomate con el aceite. Agrega los huevos batidos y cocina removiendo hasta que queden cremosos.",
  3: "Haz un refrito suave con la cebolla. Incorpora el mote y un poco de leche, luego agrega los huevos batidos y cocina mezclando hasta integrar.",
  4: "Licua o mezcla todos los ingredientes hasta obtener una masa homogenea. Cocina porciones en un sarten antiadherente por ambos lados.",
  5: "Hornea o cocina el platano hasta que ablande, machacalo y mezcla con el huevo y el queso. Lleva unos minutos al horno o sarten hasta dorar.",
  6: "Tuesta el pan, aplasta el aguacate y unta sobre las tostadas. Cocina el huevo pochado y colocalo encima al servir.",
  7: "Saltea la espinaca con el aceite. Agrega los huevos batidos, cocina a fuego medio, anade el queso y dobla el omelette.",
  8: "Sirve el yogurt en un bowl, agrega la chia y deja reposar unos minutos. Termina con las moras por encima.",
  9: "Prepara la arepa con la harina de maiz y cocinala hasta dorar. Rellena con el pollo desmechado y tomate picado.",
  10: "Licua la leche con la espinaca, el banano y la proteina hasta obtener una mezcla uniforme. Sirve de inmediato.",
  11: "Tuesta ligeramente el pan si lo deseas. Arma el sandwich con jamon de pavo, lechuga y tomate en rodajas.",
  12: "Cocina la quinua en la leche hasta que quede suave y cremosa. Sirve con manzana picada y almendras troceadas.",
  13: "Cocina el pollo a la plancha con poca sal y pimienta. Sirvelo junto con la ensalada fresca aderezada con aceite de oliva.",
  14: "Condimenta el pescado y hornealo hasta que este cocido. Cocina el brocoli al vapor y sirve con el aceite por encima.",
  15: "Cocina la yuca hasta que ablande y reserva. Prepara un caldo ligero con tomate, agrega la albacora, sirve con cebolla encurtida y cilantro.",
  16: "Mezcla el camaron cocido con tomate y cebolla. Anade los jugos citricos, el aceite y deja reposar unos minutos antes de servir.",
  17: "Corta el pescado en cubos y marinalo con limon. Mezcla con cebolla, acompana con camote cocido y choclo al lado.",
  18: "Cocina la carne a la plancha o en sarten. Sirve en un bowl con arroz, frejol, tomate y aguacate en capas.",
  19: "Cocina la carne con la salsa de tomate. Arma capas de platano maduro cocido, carne y queso, y hornea hasta gratinar.",
  20: "Cocina la pasta integral al dente y el pavo a la plancha. Mezcla con tomate cherry y un pesto ligero hecho con aceite de oliva.",
  21: "Haz un refrito con tomate, cebolla y cilantro. Incorpora el pollo para que tome sabor y sirve con arroz integral.",
  22: "Hornea el lomo de cerdo hasta que quede jugoso. Acompana con camote cocido o asado y brocoli al vapor.",
  23: "Sofrie la cebolla, agrega la papa cocida en cubos y los chochos. Incorpora la mantequilla de mani diluida con un poco de agua y cocina hasta espesar.",
  24: "Sofrie la cebolla y los champinones. Agrega la quinua con agua o caldo, cocina hasta tierna y termina con parmesano.",
  25: "Saltea la carne a fuego alto con cebolla y tomate. Sirve con papa cocida o dorada en sarten antiadherente.",
  26: "Tritura las lentejas y mezclalas con avena para formar hamburguesas. Cocinalas a la plancha y sirve con tomate y lechuga.",
  27: "Licua o mezcla el yogurt con las almendras para hacer una salsa cremosa. Integra el pollo desmenuzado y sirve con arroz integral.",
  28: "Cocina el atun a la plancha. Sirvelo con yuca cocida y una ensalada fresca de tomate y cebolla.",
  29: "Escurre el atun y mezclalo con aguacate en cubos. Sazona al gusto y sirve frio.",
  30: "Calienta el pollo con cebolla y cilantro. Rellena las tortillas y termina con aguacate en laminas.",
  31: "Saltea la res con pimiento y cebolla hasta que se cocine. Sirve dentro o junto a la tortilla caliente.",
  32: "Cocina la carne molida con sus condimentos. Usa las hojas de lechuga como base y rellena con carne, tomate y aguacate.",
  33: "Cocina el zucchini hasta ablandar y licualo con la leche. Sirve la crema caliente con cubos de pollo y parmesano por encima.",
  34: "Cocina la corvina al vapor con unas gotas de limon. Sirve con esparragos cocidos y un toque de aceite de oliva.",
  35: "Corta el tomate y la mozzarella, y acomoda en capas. Anade el pollo en tiras y termina con aceite de oliva.",
  36: "Saltea los champinones y la espinaca. Rellena la tortilla con el queso y los vegetales, y cocina hasta que el queso se funda.",
  37: "Ralla y cocina ligeramente la coliflor, mezclala con huevo y forma una base. Hornea, agrega salsa y queso, y gratina.",
  38: "Mezcla el atun con los garbanzos, tomate cherry y cebolla. Refrigera unos minutos y sirve.",
  39: "Asa o sofrie el tomate con ajo y luego licualo para hacer la sopa. Sirve caliente con huevo duro picado.",
  40: "Corta la berenjena en laminas y cocinala hasta que ablande. Rellena con carne cocida, enrolla, cubre con salsa y parmesano, y hornea.",
  41: "Sirve el yogurt en un recipiente y agrega las frutas frescas troceadas. Mezcla suavemente antes de consumir.",
  42: "Licua el yogurt con las moras hasta obtener un batido cremoso. Agrega la chia al final y deja reposar un momento.",
  43: "Tuesta el pan o las tortitas de arroz. Unta la crema de mani y coloca el banano en rodajas encima.",
  44: "Mezcla los chochos con tomate y cebolla picados. Anade limon y deja reposar unos minutos para que tome sabor.",
  45: "Licua la leche con la proteina, el banano y el cacao hasta que quede uniforme. Sirve frio despues del entrenamiento.",
  46: "Corta la manzana en gajos o rodajas. Acompana con la mantequilla de almendras para untar.",
  47: "Mezcla las almendras, nueces y pasas en un bowl o recipiente. Sirve como porcion lista para consumir.",
  48: "Corta la zanahoria en bastones. Sirvela con el hummus y un chorrito de aceite de oliva por encima.",
  49: "Extiende las lonjas de pavo, coloca el queso y enrolla firmemente. Sirve frio.",
  50: "Mezcla la chia con la leche, el cacao y la stevia. Refrigera hasta que espese y sirve frio."
};

recetas_db = recetas_db.map(function (receta) {
  return Object.assign({}, receta, {
    elaboracion: elaboraciones_recetas[receta.id] || "Preparar los ingredientes, cocinarlos segun corresponda y servir la receta."
  });
});

var guarniciones_db = [
  { nombre: "Arroz blanco grano largo, cocido", tipo: "carbohidrato", gramos_porcion: 100 },
  { nombre: "Papa, sin cáscara, cocida", tipo: "carbohidrato", gramos_porcion: 100 },
  { nombre: "Aguacate, sin cáscara, promedio", tipo: "grasa", gramos_porcion: 50 },
  { nombre: "Aceite, de oliva", tipo: "grasa", gramos_porcion: 10 },
  { nombre: "Almendra, seca", tipo: "grasa", gramos_porcion: 15 }
];

// Cargar recetas del localStorage (las que el usuario crea)
function cargarRecetasPersonalizadas() {
  const recetasGuardadas = localStorage.getItem('recetas_personalizadas');
  if (recetasGuardadas) {
    try {
      return JSON.parse(recetasGuardadas).map(function (receta) {
        return Object.assign({}, receta, {
          elaboracion: receta.elaboracion || "Preparar los ingredientes indicados, cocinarlos segun corresponda y servir la receta."
        });
      });
    } catch (e) {
      console.error("Error al cargar recetas personalizadas", e);
      return [];
    }
  }
  return [];
}

// Guardar nueva receta en localStorage
function guardarRecetaPersonalizada(receta) {
  let recetas = cargarRecetasPersonalizadas();
  receta.id = Date.now(); // generar un ID único
  receta.esPersonalizada = true;
  recetas.push(receta);
  localStorage.setItem('recetas_personalizadas', JSON.stringify(recetas));
  return receta;
}

// Obtener todas las recetas (predefinidas + personalizadas)
function obtenerTodasLasRecetas() {
  return [...recetas_db, ...cargarRecetasPersonalizadas()];
}
