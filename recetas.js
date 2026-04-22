// Base de datos predefinida de recetas
var recetas_db = [
  // --- DESAYUNOS (1 - 12) ---
  {
    id: 1,
    nombre: "Avena con nueces y proteína",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Avena, molida, Quaker", gramos: 40 },
      { nombre: "Nuez, almendra, sin cascara, cruda", gramos: 15 },
      { nombre: "Proteína en polvo (Whey Protein)", gramos: 30 }
    ]
  },
  {
    id: 2,
    nombre: "Huevos revueltos con vegetales",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Huevo, de gallina, entero, fresco, crudo", gramos: 100 },
      { nombre: "Tomate, riñón, crudo", gramos: 50 },
      { nombre: "Cebolla, blanca, cruda", gramos: 30 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 3,
    nombre: "Mote Pillo Proteico",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Mote, cocido", gramos: 100 },
      { nombre: "Huevo, de gallina, entero, fresco, crudo", gramos: 100 },
      { nombre: "Cebolla, blanca, cruda", gramos: 20 },
      { nombre: "Leche, descremada, fluida", gramos: 30 }
    ]
  },
  {
    id: 4,
    nombre: "Panqueques de avena y proteína",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Avena, molida, Quaker", gramos: 40 },
      { nombre: "Huevo, de gallina, entero, fresco, crudo", gramos: 50 },
      { nombre: "Proteína en polvo (Whey Protein)", gramos: 20 },
      { nombre: "Leche, descremada, fluida", gramos: 50 }
    ]
  },
  {
    id: 5,
    nombre: "Tigrillo al horno (Versión Fit)",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Plátano, verde, cocido", gramos: 120 },
      { nombre: "Huevo, de gallina, entero, fresco, crudo", gramos: 50 },
      { nombre: "Queso, fresco, bajo en grasa", gramos: 40 }
    ]
  },
  {
    id: 6,
    nombre: "Tostadas con aguacate y huevo pochado",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Pan, integral, en rebanadas", gramos: 60 },
      { nombre: "Aguacate, crudo", gramos: 40 },
      { nombre: "Huevo, de gallina, entero, fresco, crudo", gramos: 50 }
    ]
  },
  {
    id: 7,
    nombre: "Omelette de espinaca y queso",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Huevo, de gallina, entero, fresco, crudo", gramos: 100 },
      { nombre: "Espinaca, cruda", gramos: 50 },
      { nombre: "Queso, mozzarella, bajo en grasa", gramos: 30 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 8,
    nombre: "Bowl de Kéfir con chía y frutas",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Kéfir, de leche entera", gramos: 200 },
      { nombre: "Semilla, de chía, desecada", gramos: 15 },
      { nombre: "Fresa, cruda", gramos: 80 }
    ]
  },
  {
    id: 9,
    nombre: "Arepa de maíz con pollo desmechado",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Harina, de maíz, precocida", gramos: 40 },
      { nombre: "Pollo, pechuga, sin piel, cocida", gramos: 60 },
      { nombre: "Tomate, riñón, crudo", gramos: 30 }
    ]
  },
  {
    id: 10,
    nombre: "Batido verde de proteína",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Proteína en polvo (Whey Protein)", gramos: 30 },
      { nombre: "Espinaca, cruda", gramos: 40 },
      { nombre: "Plátano, seda, crudo", gramos: 50 },
      { nombre: "Leche, descremada, fluida", gramos: 150 }
    ]
  },
  {
    id: 11,
    nombre: "Sandwich de pavo y vegetales",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Pan, integral, en rebanadas", gramos: 60 },
      { nombre: "Pavo, jamón, tajado", gramos: 60 },
      { nombre: "Lechuga, romana, cruda", gramos: 20 },
      { nombre: "Tomate, riñón, crudo", gramos: 30 }
    ]
  },
  {
    id: 12,
    nombre: "Porridge de quinua con manzana",
    tipo: "Desayuno",
    ingredientes: [
      { nombre: "Quinua, cruda", gramos: 40 }, // Se hidrata al cocinar
      { nombre: "Leche, descremada, fluida", gramos: 100 },
      { nombre: "Manzana, con piel, cruda", gramos: 70 },
      { nombre: "Nuez, almendra, sin cascara, cruda", gramos: 10 }
    ]
  },

  // --- ALMUERZOS (13 - 28) ---
  {
    id: 13,
    nombre: "Pollo a la plancha con ensalada",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Pollo, pechuga, sin piel, cruda", gramos: 150 },
      { nombre: "Lechuga, romana, cruda", gramos: 50 },
      { nombre: "Tomate, riñón, crudo", gramos: 50 },
      { nombre: "Aceite, de oliva", gramos: 10 }
    ]
  },
  {
    id: 14,
    nombre: "Pescado al horno con brócoli",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Pescado, corvina, cruda", gramos: 150 },
      { nombre: "Brocoli, crudo", gramos: 100 },
      { nombre: "Aceite, de oliva", gramos: 10 }
    ]
  },
  {
    id: 15,
    nombre: "Encebollado de Albacora (Versión Fit)",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Pescado, albacora, fresca, cruda", gramos: 150 },
      { nombre: "Yuca, cruda", gramos: 120 },
      { nombre: "Cebolla, paiteña, cruda", gramos: 40 },
      { nombre: "Tomate, riñón, crudo", gramos: 30 },
      { nombre: "Cilantro, crudo", gramos: 5 }
    ]
  },
  {
    id: 16,
    nombre: "Ceviche de Camarón Ecuatoriano",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Camarón, cocido", gramos: 150 },
      { nombre: "Cebolla, paiteña, cruda", gramos: 40 },
      { nombre: "Tomate, riñón, crudo", gramos: 60 },
      { nombre: "Jugo, de naranja, natural", gramos: 30 },
      { nombre: "Jugo, de limón, natural", gramos: 20 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 17,
    nombre: "Ceviche Peruano de Pescado Blanco",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Pescado, corvina, cruda", gramos: 150 },
      { nombre: "Cebolla, paiteña, cruda", gramos: 40 },
      { nombre: "Jugo, de limón, natural", gramos: 40 },
      { nombre: "Camote, amarillo, cocido", gramos: 80 },
      { nombre: "Maíz, choclo desgranado, cocido", gramos: 50 }
    ]
  },
  {
    id: 18,
    nombre: "Burrito Bowl Alto en Proteína",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Carne de res, magra, cruda", gramos: 130 },
      { nombre: "Arroz, integral, cocido", gramos: 100 },
      { nombre: "Frijol, negro, cocido", gramos: 80 },
      { nombre: "Aguacate, crudo", gramos: 40 },
      { nombre: "Tomate, riñón, crudo", gramos: 40 }
    ]
  },
  {
    id: 19,
    nombre: "Lasaña de Plátano Maduro con Carne Magra",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Plátano, maduro, crudo", gramos: 150 },
      { nombre: "Carne de res, magra, cruda", gramos: 120 },
      { nombre: "Queso, mozzarella, bajo en grasa", gramos: 40 },
      { nombre: "Salsa de tomate, natural, sin azúcar", gramos: 60 }
    ]
  },
  {
    id: 20,
    nombre: "Pasta Integral con Pavo y Pesto Light",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Fideo, pasta integral, cruda", gramos: 60 },
      { nombre: "Pavo, pechuga, cruda", gramos: 120 },
      { nombre: "Tomate, cherry, crudo", gramos: 40 },
      { nombre: "Aceite, de oliva", gramos: 10 }
    ]
  },
  {
    id: 21,
    nombre: "Seco de Pollo Fit con Arroz Integral",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Pollo, pechuga, sin piel, cruda", gramos: 150 },
      { nombre: "Arroz, integral, cocido", gramos: 100 },
      { nombre: "Tomate, riñón, crudo", gramos: 50 },
      { nombre: "Cebolla, paiteña, cruda", gramos: 20 },
      { nombre: "Cilantro, crudo", gramos: 5 }
    ]
  },
  {
    id: 22,
    nombre: "Lomo de Cerdo al Horno con Camote",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Cerdo, lomo, magro, crudo", gramos: 150 },
      { nombre: "Camote, amarillo, cocido", gramos: 120 },
      { nombre: "Brocoli, crudo", gramos: 80 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 23,
    nombre: "Guatita Vegetariana de Chochos",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Chocho, pelado, cocido", gramos: 120 },
      { nombre: "Papa, cocida", gramos: 100 },
      { nombre: "Mantequilla, de maní, natural", gramos: 15 },
      { nombre: "Cebolla, blanca, cruda", gramos: 30 }
    ]
  },
  {
    id: 24,
    nombre: "Risotto de Quinua con Champiñones",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Quinua, cruda", gramos: 60 },
      { nombre: "Champiñón, crudo", gramos: 80 },
      { nombre: "Queso, parmesano, rallado", gramos: 15 },
      { nombre: "Cebolla, blanca, cruda", gramos: 20 }
    ]
  },
  {
    id: 25,
    nombre: "Lomo Saltado Fit",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Carne de res, magra, cruda", gramos: 150 },
      { nombre: "Cebolla, paiteña, cruda", gramos: 50 },
      { nombre: "Tomate, riñón, crudo", gramos: 50 },
      { nombre: "Papa, al horno", gramos: 100 }
    ]
  },
  {
    id: 26,
    nombre: "Hamburguesa de Lentejas con Ensalada",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Lenteja, cocida", gramos: 120 },
      { nombre: "Avena, molida, Quaker", gramos: 20 },
      { nombre: "Tomate, riñón, crudo", gramos: 50 },
      { nombre: "Lechuga, romana, cruda", gramos: 30 }
    ]
  },
  {
    id: 27,
    nombre: "Ají de Gallina (Versión Yogur Griego)",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Pollo, pechuga, sin piel, cocida", gramos: 120 },
      { nombre: "Yogurt, natural, bajo en grasa", gramos: 50 },
      { nombre: "Nuez, almendra, sin cascara, cruda", gramos: 15 },
      { nombre: "Arroz, integral, cocido", gramos: 100 }
    ]
  },
  {
    id: 28,
    nombre: "Atún a la Plancha con Yuca y Ensalada",
    tipo: "Almuerzo",
    ingredientes: [
      { nombre: "Pescado, atún, fresco, crudo", gramos: 150 },
      { nombre: "Yuca, cruda", gramos: 100 },
      { nombre: "Tomate, riñón, crudo", gramos: 50 },
      { nombre: "Cebolla, paiteña, cruda", gramos: 20 }
    ]
  },

  // --- CENAS (29 - 40) ---
  {
    id: 29,
    nombre: "Atún con aguacate",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Atun, enlatado en agua, escurrido", gramos: 120 },
      { nombre: "Aguacate, crudo", gramos: 50 }
    ]
  },
  {
    id: 30,
    nombre: "Tacos de Pollo al Cilantro",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Pollo, pechuga, sin piel, cruda", gramos: 120 },
      { nombre: "Tortilla, de maíz", gramos: 60 },
      { nombre: "Aguacate, crudo", gramos: 30 },
      { nombre: "Cebolla, blanca, cruda", gramos: 20 },
      { nombre: "Cilantro, crudo", gramos: 5 }
    ]
  },
  {
    id: 31,
    nombre: "Fajitas de Res Livianas",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Carne de res, magra, cruda", gramos: 120 },
      { nombre: "Pimiento, rojo, crudo", gramos: 50 },
      { nombre: "Cebolla, paiteña, cruda", gramos: 40 },
      { nombre: "Tortilla, de maíz", gramos: 30 }
    ]
  },
  {
    id: 32,
    nombre: "Wrap de Lechuga con Carne Molida",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Lechuga, romana, cruda", gramos: 80 },
      { nombre: "Carne de res, molida, magra", gramos: 120 },
      { nombre: "Tomate, riñón, crudo", gramos: 40 },
      { nombre: "Aguacate, crudo", gramos: 30 }
    ]
  },
  {
    id: 33,
    nombre: "Crema de Zucchini con Cubos de Pollo",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Zucchini, crudo", gramos: 150 },
      { nombre: "Pollo, pechuga, sin piel, cocida", gramos: 100 },
      { nombre: "Leche, descremada, fluida", gramos: 50 },
      { nombre: "Queso, parmesano, rallado", gramos: 10 }
    ]
  },
  {
    id: 34,
    nombre: "Pescado al Vapor con Espárragos",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Pescado, corvina, cruda", gramos: 150 },
      { nombre: "Espárrago, crudo", gramos: 100 },
      { nombre: "Aceite, de oliva", gramos: 5 },
      { nombre: "Jugo, de limón, natural", gramos: 15 }
    ]
  },
  {
    id: 35,
    nombre: "Ensalada Caprese con Pollo",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Tomate, riñón, crudo", gramos: 100 },
      { nombre: "Queso, mozzarella, fresco", gramos: 40 },
      { nombre: "Pollo, pechuga, sin piel, cocida", gramos: 100 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 36,
    nombre: "Quesadillas Fit de Champiñones",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Tortilla, de maíz", gramos: 60 },
      { nombre: "Queso, mozzarella, bajo en grasa", gramos: 40 },
      { nombre: "Champiñón, crudo", gramos: 60 },
      { nombre: "Espinaca, cruda", gramos: 30 }
    ]
  },
  {
    id: 37,
    nombre: "Pizza con Base de Coliflor",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Coliflor, cruda", gramos: 150 },
      { nombre: "Huevo, de gallina, entero, fresco, crudo", gramos: 50 },
      { nombre: "Salsa de tomate, natural, sin azúcar", gramos: 40 },
      { nombre: "Queso, mozzarella, bajo en grasa", gramos: 30 }
    ]
  },
  {
    id: 38,
    nombre: "Ensalada de Atún con Garbanzos",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Atun, enlatado en agua, escurrido", gramos: 100 },
      { nombre: "Garbanzo, cocido", gramos: 80 },
      { nombre: "Tomate, cherry, crudo", gramos: 40 },
      { nombre: "Cebolla, paiteña, cruda", gramos: 20 }
    ]
  },
  {
    id: 39,
    nombre: "Sopa de Tomate Asado con Huevo Duro",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Tomate, riñón, crudo", gramos: 150 },
      { nombre: "Huevo, de gallina, duro", gramos: 100 },
      { nombre: "Aceite, de oliva", gramos: 5 },
      { nombre: "Ajo, crudo", gramos: 5 }
    ]
  },
  {
    id: 40,
    nombre: "Rollitos de Berenjena con Carne",
    tipo: "Cena",
    ingredientes: [
      { nombre: "Berenjena, cruda", gramos: 150 },
      { nombre: "Carne de res, molida, magra", gramos: 100 },
      { nombre: "Salsa de tomate, natural, sin azúcar", gramos: 40 },
      { nombre: "Queso, parmesano, rallado", gramos: 10 }
    ]
  },

  // --- SNACKS Y PRE/POST ENTRENO (41 - 50) ---
  {
    id: 41,
    nombre: "Yogurt griego con frutas",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Yogurt, natural, bajo en grasa", gramos: 150 },
      { nombre: "Fresa, cruda", gramos: 100 }
    ]
  },
  {
    id: 42,
    nombre: "Batido de Kéfir y Frutos Rojos",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Kéfir, de leche entera", gramos: 200 },
      { nombre: "Mora, cruda", gramos: 80 },
      { nombre: "Semilla, de chía, desecada", gramos: 10 }
    ]
  },
  {
    id: 43,
    nombre: "Tortitas de Arroz con Crema de Maní",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Galleta, de arroz inflado", gramos: 20 },
      { nombre: "Mantequilla, de maní, sin azúcar", gramos: 20 },
      { nombre: "Plátano, seda, crudo", gramos: 50 }
    ]
  },
  {
    id: 44,
    nombre: "Ceviche de Chochos",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Chocho, pelado, cocido", gramos: 80 },
      { nombre: "Tomate, riñón, crudo", gramos: 40 },
      { nombre: "Cebolla, paiteña, cruda", gramos: 20 },
      { nombre: "Jugo, de limón, natural", gramos: 15 }
    ]
  },
  {
    id: 45,
    nombre: "Batido Post-Entreno de Chocolate y Plátano",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Proteína en polvo (Whey Protein)", gramos: 30 },
      { nombre: "Plátano, seda, crudo", gramos: 100 },
      { nombre: "Leche, descremada, fluida", gramos: 150 },
      { nombre: "Cacao, en polvo, sin azúcar", gramos: 10 }
    ]
  },
  {
    id: 46,
    nombre: "Manzana con Mantequilla de Almendras",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Manzana, con piel, cruda", gramos: 120 },
      { nombre: "Mantequilla, de almendras, natural", gramos: 20 }
    ]
  },
  {
    id: 47,
    nombre: "Mix de Frutos Secos Energético",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Nuez, almendra, sin cascara, cruda", gramos: 15 },
      { nombre: "Nuez, de castilla, cruda", gramos: 15 },
      { nombre: "Uva pasa", gramos: 10 }
    ]
  },
  {
    id: 48,
    nombre: "Palitos de Zanahoria con Hummus",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Zanahoria, cruda", gramos: 100 },
      { nombre: "Garbanzo, cocido (en puré)", gramos: 50 },
      { nombre: "Aceite, de oliva", gramos: 5 }
    ]
  },
  {
    id: 49,
    nombre: "Rollitos de Pavo y Queso",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Pavo, jamón, tajado", gramos: 50 },
      { nombre: "Queso, mozzarella, bajo en grasa", gramos: 30 }
    ]
  },
  {
    id: 50,
    nombre: "Pudín de Chía Cacao",
    tipo: "Snack",
    ingredientes: [
      { nombre: "Semilla, de chía, desecada", gramos: 20 },
      { nombre: "Leche, de almendras, sin azúcar", gramos: 100 },
      { nombre: "Cacao, en polvo, sin azúcar", gramos: 5 },
      { nombre: "Stevia o endulzante", gramos: 1 }
    ]
  }
];

// Base de datos de guarniciones estándar
var guarniciones_db = [
  { nombre: "Arroz blanco grano largo, cocido", tipo: "carbohidrato", gramos_porcion: 100 },
  { nombre: "Papa, chola, hervida sin piel", tipo: "carbohidrato", gramos_porcion: 100 },
  { nombre: "Aguacate, crudo", tipo: "grasa", gramos_porcion: 50 },
  { nombre: "Aceite, de oliva", tipo: "grasa", gramos_porcion: 10 },
  { nombre: "Nuez, almendra, sin cascara, cruda", tipo: "grasa", gramos_porcion: 15 }
];

// Cargar recetas del localStorage (las que el usuario crea)
function cargarRecetasPersonalizadas() {
  const recetasGuardadas = localStorage.getItem('recetas_personalizadas');
  if (recetasGuardadas) {
    try {
      return JSON.parse(recetasGuardadas);
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
