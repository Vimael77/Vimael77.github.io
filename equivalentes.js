(function () {
  "use strict";

  const STORAGE_PREFIX = "muyAlimentado:sistemaEquivalentes:v3:";
  const LEGACY_STORAGE_V2 = "muyAlimentado:sistemaEquivalentes:v2:";
  const STEP_EQUIVALENTE = 0.01;
  const STEP_DISTRIBUCION = 0.25;
  const TOLERANCIA = 0.001;

  // Matriz de Intercambios USFQ - 2da Edición 2024 adaptada con la lógica dietosintética del Excel
  const GRUPOS_EXCEL_USFQ = [
    // 1. CEREALES, TUBÉRCULOS Y PLÁTANOS
    {
      id: "cereal_alto_cho_baja_grasa",
      grupo: "Cereales, tubérculos y plátanos",
      subgrupo: "⬆️ CHO, ⬇️GRASA",
      guiaRaciones: "3.83",
      tipo: "cereal",
      proteina: 4,
      grasa: 1,
      carbohidrato: 30,
      energia: 145,
      nota: "65% - 70%: Amaranto grano/pop, Quinua, Avena, Arroz blanco/cebada, Fideo, Maíz mote, Camote, Papa chaucha/cáscara, Plátano verde/maduro."
    },
    {
      id: "cereal_medio_cho_media_grasa",
      grupo: "Cereales, tubérculos y plátanos",
      subgrupo: "〰️ CHO, 〰️GRASA",
      guiaRaciones: "5.75",
      tipo: "cereal",
      proteina: 2,
      grasa: 6,
      carbohidrato: 20,
      energia: 142,
      nota: "Galletas de avena/soda/chocolate/María, chulpi, canguil con sal."
    },
    {
      id: "cereal_medio_cho_baja_grasa",
      grupo: "Cereales, tubérculos y plátanos",
      subgrupo: "〰️ CHO, ⬇️GRASA",
      guiaRaciones: "5.75",
      tipo: "cereal",
      proteina: 3,
      grasa: 1,
      carbohidrato: 20,
      energia: 101,
      nota: "30% - 35%: Máchica, harina de maíz integral, mellocos, pan integral, zanahoria blanca."
    },

    // 2. LÁCTEOS
    {
      id: "lacteo_entero",
      grupo: "Lácteos",
      subgrupo: "ENTEROS ⬆️ GRASA",
      guiaRaciones: "2 - 4",
      tipo: "lacteo",
      proteina: 8,
      grasa: 8,
      carbohidrato: 11,
      energia: 148,
      nota: "Leche entera, yogur entero, leche en polvo."
    },
    {
      id: "lacteo_semidescremado",
      grupo: "Lácteos",
      subgrupo: "SEMI 〰️ GRASA",
      guiaRaciones: "2 - 4",
      tipo: "lacteo",
      proteina: 8,
      grasa: 4,
      carbohidrato: 11,
      energia: 112,
      nota: "Yogur, leche semidescremada."
    },
    {
      id: "lacteo_descremado",
      grupo: "Lácteos",
      subgrupo: "DESCREM ⬇️GRASA",
      guiaRaciones: "2 - 4",
      tipo: "lacteo",
      proteina: 8,
      grasa: 1,
      carbohidrato: 12,
      energia: 89,
      nota: "Yogur griego, leche descremada."
    },
    {
      id: "lacteo_descremado_alto_cho",
      grupo: "Lácteos",
      subgrupo: "DESCREM ⬆️ CHO",
      guiaRaciones: "2 - 4",
      tipo: "lacteo",
      proteina: 6,
      grasa: 3,
      carbohidrato: 25,
      energia: 151,
      nota: "Yogur con fruta, leche con chocolate."
    },
    {
      id: "queso",
      grupo: "Lácteos",
      subgrupo: "QUESOS 〰️o ⬇️ GRASA",
      guiaRaciones: "2 - 4",
      tipo: "queso",
      proteina: 6,
      grasa: 5,
      carbohidrato: 1,
      energia: 73,
      nota: "Valores revisados según tablas nutricionales: queso Nutri, Sigseño, Lenutrit, semidescremado."
    },

    // 3. LEGUMINOSAS
    {
      id: "leguminosa",
      grupo: "Leguminosas",
      subgrupo: "LEGUMINOSAS",
      guiaRaciones: "1 - 2",
      tipo: "leguminosa",
      proteina: 9,
      grasa: 1,
      carbohidrato: 20,
      energia: 125,
      nota: "Lenteja, frejol, garbanzo, arveja seca, chocho."
    },

    // 4. VEGETALES
    {
      id: "vegetal_bajo_cho",
      grupo: "Vegetales",
      subgrupo: "⬇️ CHO",
      guiaRaciones: "2 - 3",
      tipo: "verdura",
      proteina: 1,
      grasa: 0,
      carbohidrato: 5,
      energia: 24,
      nota: "El resto que no sean de libre consumo (zanahoria, brócoli, coliflor, etc.)."
    },
    {
      id: "vegetal_libre",
      grupo: "Vegetales",
      subgrupo: "LIBRE CONSUMO",
      guiaRaciones: "2 - 3",
      tipo: "verdura",
      proteina: 2,
      grasa: 0,
      carbohidrato: 3,
      energia: 20,
      nota: "1.Acelga 2.Alfalfa brotes 3.Apio 4.Berro 5.Champiñones 6.Lechuga crespa/romana 7.Lechuga criolla 8.Pepinillo 9.Rábano 10.Rúcula."
    },

    // 5. CARNES, PESCADOS Y HUEVOS
    {
      id: "carne_alta_grasa",
      grupo: "Carnes, pescados y huevos",
      subgrupo: "⬆️ GRASA",
      guiaRaciones: "—",
      tipo: "animal",
      proteina: 11,
      grasa: 15,
      carbohidrato: 1,
      energia: 183,
      nota: "1.Cerdo costilla 2.Cordero costilla 3.Res intestinos 4.Res carne sin hueso 5.Res carne molida alto % 6.Res costilla 7.Res lengua 8.Res ubre."
    },
    {
      id: "carne_media_grasa",
      grupo: "Carnes, pescados y huevos",
      subgrupo: "〰️ GRASA",
      guiaRaciones: "—",
      tipo: "animal",
      proteina: 11,
      grasa: 7,
      carbohidrato: 0,
      energia: 107,
      nota: "1.Cerdo semimagro/chuleta/pierna 2.Pescado salmón/sardinas 3.Pollo con piel 4.Res bife/bistec/lomofalda."
    },
    {
      id: "huevo",
      grupo: "Carnes, pescados y huevos",
      subgrupo: "HUEVOS",
      guiaRaciones: "1",
      tipo: "animal",
      proteina: 7,
      grasa: 6,
      carbohidrato: 0,
      energia: 82,
      nota: "1.Huevo de gallina 2.Huevo de codorniz (según TCA USFQ)."
    },
    {
      id: "carne_baja_grasa",
      grupo: "Carnes, pescados y huevos",
      subgrupo: "⬇️GRASA",
      guiaRaciones: "2.5",
      tipo: "animal",
      proteina: 11,
      grasa: 2,
      carbohidrato: 0,
      energia: 62,
      nota: "1.Pollo pechuga sin piel 2.Atún fresco/en agua 3.Corvina, tilapia, trucha 4.Camarón, calamar 5.Pavo pechuga 6.Res lomo fino/magra."
    },
    {
      id: "embutido",
      grupo: "Carnes, pescados y huevos",
      subgrupo: "EMBUTIDOS",
      guiaRaciones: "—",
      tipo: "animal",
      proteina: 7,
      grasa: 7,
      carbohidrato: 1,
      energia: 95,
      nota: "Chorizo de res/cerdo, jamón cerdo/pavo/pollo, morcilla, mortadela, salchicha."
    },

    // 6. GRASAS Y FRUTOS SECOS
    {
      id: "grasa_alta",
      grupo: "Grasas y frutos secos",
      subgrupo: "⬆️ GRASA",
      guiaRaciones: "3.36",
      tipo: "grasa",
      proteina: 1,
      grasa: 12,
      carbohidrato: 1,
      energia: 116,
      nota: "1.Aceite de oliva 2.Aceite de girasol 3.Nuez de nogal 4.Maní con sal."
    },
    {
      id: "grasa_media",
      grupo: "Grasas y frutos secos",
      subgrupo: "〰️ GRASA",
      guiaRaciones: "3.36",
      tipo: "grasa",
      proteina: 1,
      grasa: 7,
      carbohidrato: 2,
      energia: 75,
      nota: "1.Aceituna enlatada 2.Aguacate 3.Crema agria."
    },
    {
      id: "grasa_alta_bajo_cho",
      grupo: "Grasas y frutos secos",
      subgrupo: "⬆️ GRASA ⬇️ CHO",
      guiaRaciones: "3.36",
      tipo: "grasa",
      proteina: 4,
      grasa: 10,
      carbohidrato: 8,
      energia: 138,
      nota: "1.Almendra 2.S.Ajonjolí 3.S.Chía 4.S.Linaza 5.S.Pistacho 6.S.Sambo."
    },
    {
      id: "grasa_media_bajo_cho",
      grupo: "Grasas y frutos secos",
      subgrupo: "〰️ GRASA, ⬇️CHO",
      guiaRaciones: "3.36",
      tipo: "grasa",
      proteina: 2,
      grasa: 7,
      carbohidrato: 12,
      energia: 119,
      nota: "Chocolate crunch, cocoa, crema de avellana, helado de crema, hojuelas de coco."
    },

    // 7. AZÚCARES
    {
      id: "azucar",
      grupo: "Azúcares",
      subgrupo: "AZÚCARES",
      guiaRaciones: "1",
      tipo: "azucar",
      proteina: 0,
      grasa: 0,
      carbohidrato: 10,
      energia: 40,
      nota: "Azúcar blanca, azúcar morena, panela, miel."
    },

    // 8. FRUTAS
    {
      id: "fruta_media_cho",
      grupo: "Frutas",
      subgrupo: "〰️ EN CHO",
      guiaRaciones: "3",
      tipo: "fruta",
      proteina: 1,
      grasa: 0,
      carbohidrato: 20,
      energia: 84,
      nota: "1.Guineo 2.Durazno 3.Capulí 4.Chirimoya 5.Granadilla 6.Guanábana 7.Higo 8.Kiwi 9.Mango criollo/grande 10.Manzana 11.Maracuyá 12.Naranja 13.Pera 14.Piña 15.Pitahaya 16.Tuna 17.Uva 18.Uvilla."
    },
    {
      id: "fruta_baja_cho",
      grupo: "Frutas",
      subgrupo: "⬇️EN CHO",
      guiaRaciones: "3",
      tipo: "fruta",
      proteina: 1,
      grasa: 0,
      carbohidrato: 10,
      energia: 44,
      nota: "1.Arazá 2.Babaco 3.Cereza 4.Agua de coco 5.Frutillas 6.Guaba 7.Guayaba 8.Mandarina 9.Mango verde 10.Melón 11.Moras 12.Mortiño 13.Naranjilla 14.Papaya 15.Pepino dulce 16.Pitahaya roja 17.Sandía 18.Tomate de árbol 19.Toronja."
    },
    {
      id: "fruta_deshidratada",
      grupo: "Frutas",
      subgrupo: "DESHIDRATADAS",
      guiaRaciones: "—",
      tipo: "fruta",
      proteina: 1,
      grasa: 0,
      carbohidrato: 20,
      energia: 84,
      nota: "1.Arándanos 2.Ciruela pasa 3.Higo seco 4.Pasas negras 5.Tamarindo."
    }
  ];

  const GRUPOS_CLASICOS = [
    { id: "cereal_sin_grasa", grupo: "Cereales, tubérculos y plátanos", subgrupo: "Sin grasa", guiaRaciones: "4 - 8", tipo: "cereal", proteina: 2, grasa: 0, carbohidrato: 15, energia: 68, nota: "Arroz, avena, papa, fideo." },
    { id: "lacteo_descremado", grupo: "Lácteos", subgrupo: "Descremados", guiaRaciones: "2 - 3", tipo: "lacteo", proteina: 8, grasa: 2, carbohidrato: 12, energia: 98, nota: "Leche descremada, yogur natural bajo en grasa." },
    { id: "lacteo_semidescremado", grupo: "Lácteos", subgrupo: "Semidescremados", guiaRaciones: "1 - 2", tipo: "lacteo", proteina: 8, grasa: 4, carbohidrato: 12, energia: 116, nota: "Leche semidescremada." },
    { id: "lacteo_entero", grupo: "Lácteos", subgrupo: "Enteros", guiaRaciones: "0 - 1", tipo: "lacteo", proteina: 9, grasa: 8, carbohidrato: 12, energia: 156, nota: "Leche entera." },
    { id: "queso_semidescremado", grupo: "Quesos", subgrupo: "Semidescremado", guiaRaciones: "1 - 2", tipo: "queso", proteina: 7, grasa: 3, carbohidrato: 1, energia: 59, nota: "Queso fresco semidescremado." },
    { id: "queso_descremado", grupo: "Quesos", subgrupo: "Descremado", guiaRaciones: "0 - 1", tipo: "queso", proteina: 7, grasa: 1, carbohidrato: 1, energia: 41, nota: "Queso ricotta o magro." },
    { id: "leguminosa_seca", grupo: "Leguminosas", subgrupo: "Secas", guiaRaciones: "1 - 2", tipo: "leguminosa", proteina: 8, grasa: 1, carbohidrato: 20, energia: 121, nota: "Lenteja, frejol, garbanzo." },
    { id: "verdura_libre", grupo: "Verduras y hortalizas", subgrupo: "Libres", guiaRaciones: "2 - 3", tipo: "verdura", proteina: 2, grasa: 0, carbohidrato: 4, energia: 24, nota: "Hojas verdes, pepino, apio." },
    { id: "verdura_baja_cho", grupo: "Verduras y hortalizas", subgrupo: "Bajas en CHO", guiaRaciones: "1 - 2", tipo: "verdura", proteina: 1, grasa: 0, carbohidrato: 5, energia: 24, nota: "Zanahoria, tomate, vainitas." },
    { id: "animal_muy_bajo", grupo: "Alimentos de origen animal", subgrupo: "Muy bajos en grasa", guiaRaciones: "3 - 5", tipo: "animal", proteina: 7, grasa: 1, carbohidrato: 0, energia: 37, nota: "Pechuga de pollo, clara de huevo, tilapia." },
    { id: "animal_bajo", grupo: "Alimentos de origen animal", subgrupo: "Bajos en grasa", guiaRaciones: "1 - 2", tipo: "animal", proteina: 7, grasa: 3, carbohidrato: 0, energia: 55, nota: "Carne magra, atún en agua." },
    { id: "animal_moderado", grupo: "Alimentos de origen animal", subgrupo: "Moderados en grasa", guiaRaciones: "1", tipo: "animal", proteina: 7, grasa: 5, carbohidrato: 0, energia: 73, nota: "Huevo entero, carne semigrasa." },
    { id: "animal_alto", grupo: "Alimentos de origen animal", subgrupo: "Altos en grasa", guiaRaciones: "0 - 1", tipo: "animal", proteina: 7, grasa: 8, carbohidrato: 0, energia: 100, nota: "Costilla, cortes grasos." },
    { id: "grasa_sin_proteina", grupo: "Aceites y grasas", subgrupo: "Sin proteína", guiaRaciones: "3 - 5", tipo: "grasa", proteina: 0, grasa: 5, carbohidrato: 0, energia: 45, nota: "Aceite de oliva, aguacate." },
    { id: "grasa_con_proteina", grupo: "Aceites y grasas", subgrupo: "Con proteína", guiaRaciones: "1 - 2", tipo: "grasa", proteina: 3, grasa: 5, carbohidrato: 3, energia: 69, nota: "Nueces, almendras, maní." },
    { id: "azucar_sin_grasa", grupo: "Azúcares", subgrupo: "Sin grasa", guiaRaciones: "0 - 1", tipo: "azucar", proteina: 0, grasa: 0, carbohidrato: 10, energia: 40, nota: "Miel, panela, azúcar." },
    { id: "azucar_con_grasa", grupo: "Azúcares", subgrupo: "Con grasa", guiaRaciones: "0", tipo: "azucar", proteina: 0, grasa: 5, carbohidrato: 10, energia: 85, nota: "Chocolate, postres." },
    { id: "fruta", grupo: "Frutas", subgrupo: "Frutas", guiaRaciones: "2 - 4", tipo: "fruta", proteina: 1, grasa: 0, carbohidrato: 10, energia: 44, nota: "Manzana, papaya, frutillas." }
  ];

  const matrices = {
    usfq: GRUPOS_EXCEL_USFQ,
    clasica: GRUPOS_CLASICOS
  };

  const nombresMatriz = {
    usfq: "USFQ · 2da Ed. 2024 (Lógica y equivalentes del Excel)",
    clasica: "Matriz clásica de equivalentes"
  };

  let matriz = "usfq";
  const planesDeSesion = Object.create(null);
  function gruposActivos() { return matrices[matriz]; }

  // Ejemplo base exacto del archivo Excel: 1700 kcal, 70 kg, 20% P, 26% L, 54% CHO
  const EQUIVALENTES_EJEMPLO_EXCEL = {
    cereal_alto_cho_baja_grasa: 2.5,
    cereal_medio_cho_media_grasa: 0,
    cereal_medio_cho_baja_grasa: 2,
    lacteo_entero: 0,
    lacteo_semidescremado: 1,
    lacteo_descremado: 1,
    lacteo_descremado_alto_cho: 0,
    queso: 1,
    leguminosa: 1,
    vegetal_bajo_cho: 2.5,
    vegetal_libre: 0.5,
    carne_alta_grasa: 0,
    carne_media_grasa: 0,
    huevo: 1,
    carne_baja_grasa: 2,
    embutido: 0,
    grasa_alta: 1,
    grasa_media: 1,
    grasa_alta_bajo_cho: 0.75,
    grasa_media_bajo_cho: 0,
    azucar: 0,
    fruta_media_cho: 1,
    fruta_baja_cho: 2,
    fruta_deshidratada: 0
  };

  const PRESETS_COMIDAS = {
    4: [
      { nombre: "Desayuno", hora: "08:00" },
      { nombre: "Almuerzo", hora: "13:00" },
      { nombre: "Media tarde", hora: "16:30" },
      { nombre: "Merienda", hora: "19:30" }
    ],
    5: [
      { nombre: "Desayuno", hora: "07:00" },
      { nombre: "Media mañana (MM)", hora: "10:00" },
      { nombre: "Almuerzo", hora: "13:00" },
      { nombre: "Media tarde (MT)", hora: "16:00" },
      { nombre: "Merienda", hora: "19:00" }
    ],
    6: [
      { nombre: "Desayuno", hora: "07:00" },
      { nombre: "Media mañana (MM)", hora: "10:00" },
      { nombre: "Almuerzo", hora: "13:00" },
      { nombre: "Media tarde (MT)", hora: "16:00" },
      { nombre: "Merienda", hora: "19:00" },
      { nombre: "Colación nocturna", hora: "21:30" }
    ]
  };

  const PESOS_BASE_5 = [0.22, 0.10, 0.36, 0.10, 0.22];
  const PESOS_BASE_4 = [0.25, 0.38, 0.12, 0.25];
  const PESOS_BASE_6 = [0.20, 0.10, 0.34, 0.10, 0.18, 0.08];

  const PESOS_BASE = {
    4: PESOS_BASE_4,
    5: PESOS_BASE_5,
    6: PESOS_BASE_6
  };

  const MASCARAS_POR_TIPO = {
    cereal: { 4: [1, 1, 0.5, 1], 5: [1, 0.5, 1.2, 0.5, 1], 6: [1, 0.5, 1.2, 0.5, 1, 0.5] },
    lacteo: { 4: [1, 0, 1, 0], 5: [1, 1, 0, 1, 0], 6: [1, 1, 0, 1, 0, 1] },
    queso: { 4: [1, 0, 0, 1], 5: [1, 0, 0, 1, 1], 6: [1, 0, 0, 1, 1, 0] },
    leguminosa: { 4: [0, 1, 0, 0], 5: [0, 0, 1, 0, 0], 6: [0, 0, 1, 0, 0, 0] },
    verdura: { 4: [0, 1, 0, 1], 5: [0, 0, 1.2, 0, 1], 6: [0, 0, 1.2, 0, 1, 0] },
    animal: { 4: [0.8, 1.2, 0, 0.8], 5: [0.8, 0, 1.5, 0, 0.8], 6: [0.8, 0, 1.5, 0, 0.8, 0] },
    grasa: { 4: [1, 1, 0.5, 1], 5: [1, 0.5, 1, 0.5, 1], 6: [1, 0.5, 1, 0.5, 1, 0.5] },
    azucar: { 4: [1, 1, 1, 1], 5: [1, 1, 1, 1, 1], 6: [1, 1, 1, 1, 1, 1] },
    fruta: { 4: [1, 0.5, 1, 0.5], 5: [1, 1, 0.8, 1, 0.5], 6: [1, 1, 0.8, 1, 0.5, 0.5] }
  };

  const formatoNumero = new Intl.NumberFormat("es-EC", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  let estado = crearEstadoInicial();
  let temporizadorGuardado = 0;

  function crearEstadoInicial() {
    return {
      objetivos: { energia: 1700, pesoIdeal: 70, proteinaPct: 20, grasaPct: 26 },
      equivalentes: { ...EQUIVALENTES_EJEMPLO_EXCEL },
      comidas: PRESETS_COMIDAS[5].map(copiarComida),
      distribucion: {}
    };
  }

  function copiarComida(comida) {
    return { nombre: comida.nombre, hora: comida.hora };
  }

  function numeroSeguro(valor, respaldo) {
    const normalizado = typeof valor === "string" ? valor.replace(",", ".") : valor;
    const numero = Number(normalizado);
    return Number.isFinite(numero) ? numero : (respaldo === undefined ? 0 : respaldo);
  }

  function limitarNoNegativo(valor) {
    return Math.max(0, numeroSeguro(valor));
  }

  function redondearPaso(valor, paso) {
    return Math.max(0, Math.round(limitarNoNegativo(valor) / paso) * paso);
  }

  function escaparHtml(valor) {
    return String(valor === undefined || valor === null ? "" : valor)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatear(valor, decimales) {
    const numero = numeroSeguro(valor);
    if (typeof decimales === "number") return numero.toFixed(decimales);
    return formatoNumero.format(numero);
  }

  function energiaDeMacros(proteina, grasa, carbohidrato) {
    return proteina * 4 + grasa * 9 + carbohidrato * 4;
  }

  function energiaUnitaria(grupo) {
    return grupo.energia ?? energiaDeMacros(grupo.proteina, grupo.grasa, grupo.carbohidrato);
  }

  function calcularObjetivos(datos) {
    const energia = numeroSeguro(datos.energia);
    const pesoIdeal = numeroSeguro(datos.pesoIdeal);
    const proteinaPct = numeroSeguro(datos.proteinaPct);
    const grasaPct = numeroSeguro(datos.grasaPct);
    const carbohidratoPct = 100 - proteinaPct - grasaPct;
    const valido = energia > 0 && pesoIdeal > 0 && proteinaPct >= 0 && grasaPct >= 0 &&
      proteinaPct <= 100 && grasaPct <= 100 && carbohidratoPct >= 0;
    const proteinaKcal = valido ? energia * proteinaPct / 100 : 0;
    const grasaKcal = valido ? energia * grasaPct / 100 : 0;
    const carbohidratoKcal = valido ? energia * carbohidratoPct / 100 : 0;
    return {
      valido, energia, pesoIdeal, proteinaPct, grasaPct, carbohidratoPct,
      proteina: proteinaKcal / 4,
      grasa: grasaKcal / 9,
      carbohidrato: carbohidratoKcal / 4,
      proteinaKcal, grasaKcal, carbohidratoKcal
    };
  }

  function calcularTotales(equivalentes, fuente = matriz) {
    return matrices[fuente].reduce(function (total, grupo) {
      const cantidad = limitarNoNegativo(equivalentes[grupo.id]);
      total.proteina += cantidad * grupo.proteina;
      total.grasa += cantidad * grupo.grasa;
      total.carbohidrato += cantidad * grupo.carbohidrato;
      total.energia += cantidad * (grupo.proteina * 4 + grupo.grasa * 9 + grupo.carbohidrato * 4);
      total.equivalentes += cantidad;
      return total;
    }, { proteina: 0, grasa: 0, carbohidrato: 0, equivalentes: 0, energia: 0 });
  }

  function calcularAporteGrupo(grupo, cantidad) {
    const equivalentes = limitarNoNegativo(cantidad);
    const proteina = grupo.proteina * equivalentes;
    const grasa = grupo.grasa * equivalentes;
    const carbohidrato = grupo.carbohidrato * equivalentes;
    const energia = proteina * 4 + grasa * 9 + carbohidrato * 4;
    return { proteina, grasa, carbohidrato, energia };
  }

  function leerObjetivosFormulario() {
    return {
      energia: numeroSeguro(document.getElementById("equiv_energia").value),
      pesoIdeal: numeroSeguro(document.getElementById("equiv_peso_ideal").value),
      proteinaPct: numeroSeguro(document.getElementById("equiv_proteina_pct").value),
      grasaPct: numeroSeguro(document.getElementById("equiv_grasa_pct").value)
    };
  }

  function aplicarObjetivosFormulario() {
    document.getElementById("equiv_energia").value = estado.objetivos.energia;
    document.getElementById("equiv_peso_ideal").value = estado.objetivos.pesoIdeal;
    document.getElementById("equiv_proteina_pct").value = estado.objetivos.proteinaPct;
    document.getElementById("equiv_grasa_pct").value = estado.objetivos.grasaPct;
  }

  function obtenerObjetivos() {
    return calcularObjetivos(leerObjetivosFormulario());
  }

  function mensajeObjetivos(objetivos) {
    if (objetivos.energia <= 0) return "Ingresa una energía diaria mayor que cero.";
    if (objetivos.pesoIdeal <= 0) return "Ingresa un peso ideal mayor que cero.";
    if (objetivos.proteinaPct < 0 || objetivos.proteinaPct > 100 || objetivos.grasaPct < 0 || objetivos.grasaPct > 100) {
      return "Los porcentajes deben estar entre 0 y 100.";
    }
    if (objetivos.carbohidratoPct < 0) return "La suma de proteínas y grasas no puede superar 100%.";
    return "";
  }

  function renderizarObjetivos() {
    const objetivos = obtenerObjetivos();
    document.getElementById("equiv_carbohidrato_pct").value = formatear(Math.max(0, objetivos.carbohidratoPct), 1);
    document.getElementById("equiv_objetivo_error").textContent = mensajeObjetivos(objetivos);

    // Actualizar encabezados de la tabla con las metas en gramos (exactamente como en el Excel)
    const colMetaProt = document.getElementById("col_meta_proteina");
    const colMetaGrasa = document.getElementById("col_meta_grasa");
    const colMetaCho = document.getElementById("col_meta_carbohidrato");
    if (colMetaProt) colMetaProt.innerHTML = `Prote&iacute;nas <br><small class="text-muted fw-normal">${formatear(objetivos.proteina, 1)} g</small>`;
    if (colMetaGrasa) colMetaGrasa.innerHTML = `L&iacute;pidos <br><small class="text-muted fw-normal">${formatear(objetivos.grasa, 1)} g</small>`;
    if (colMetaCho) colMetaCho.innerHTML = `Carbohidratos <br><small class="text-muted fw-normal">${formatear(objetivos.carbohidrato, 1)} g</small>`;

    const macros = [
      {
        nombre: "Proteínas",
        porcentaje: objetivos.proteinaPct,
        kcal: objetivos.proteinaKcal,
        gramos: objetivos.proteina,
        divisor: 7,
        racionesExcel: 8,
        clase: "proteina",
        nota: "Guía: 8 raciones (12.1 rac. teóricas / 7 g)"
      },
      {
        nombre: "Grasas",
        porcentaje: objetivos.grasaPct,
        kcal: objetivos.grasaKcal,
        gramos: objetivos.grasa,
        divisor: 5,
        racionesExcel: 8,
        clase: "grasa",
        nota: "Guía: 8 raciones (9.8 rac. teóricas / 5 g)"
      },
      {
        nombre: "Carbohidratos",
        porcentaje: Math.max(0, objetivos.carbohidratoPct),
        kcal: objetivos.carbohidratoKcal,
        gramos: objetivos.carbohidrato,
        divisor: 15,
        racionesExcel: 12.14,
        clase: "carbohidrato",
        nota: "4.5 raciones corresponden a C, TyP; el resto a otros grupos con CHO."
      }
    ];

    document.getElementById("equiv_objetivos_resumen").innerHTML = macros.map(function (macro) {
      const gKg = objetivos.pesoIdeal > 0 ? macro.gramos / objetivos.pesoIdeal : 0;
      return `
        <div class="equivalentes-macro-card equivalentes-macro-card--${macro.clase}">
          <div class="equivalentes-macro-card-top">
            <span>${macro.nombre}</span>
            <strong>${formatear(macro.porcentaje, 1)}%</strong>
          </div>
          <strong class="equivalentes-macro-value">${formatear(macro.gramos, 2)} g</strong>
          <div class="equivalentes-macro-meta">
            <span>${formatear(macro.kcal, 0)} kcal</span>
            <span>${formatear(gKg, 2)} g/kg</span>
            <span>${macro.nota}</span>
          </div>
        </div>`;
    }).join("");
    return objetivos;
  }

  function calcularSubtotalesSecuenciales() {
    const equiv = estado.equivalentes;
    let protVegetalLactea = 0;
    let lipidosHastaCarnes = 0;
    let choHastaAzucares = 0;

    gruposActivos().forEach(function (grupo) {
      const cantidad = limitarNoNegativo(equiv[grupo.id]);
      const aporte = calcularAporteGrupo(grupo, cantidad);

      // 1. Proteínas vegetales y lácteas (Cereales + Lácteos + Leguminosas + Vegetales)
      if (["cereal", "lacteo", "queso", "leguminosa", "verdura"].includes(grupo.tipo)) {
        protVegetalLactea += aporte.proteina;
      }

      // 2. Lípidos acumulados hasta Carnes y Huevos
      if (["cereal", "lacteo", "queso", "leguminosa", "verdura", "animal"].includes(grupo.tipo)) {
        lipidosHastaCarnes += aporte.grasa;
      }

      // 3. Carbohidratos acumulados hasta Azúcares (todos excepto Frutas)
      if (grupo.tipo !== "fruta") {
        choHastaAzucares += aporte.carbohidrato;
      }
    });

    return { protVegetalLactea, lipidosHastaCarnes, choHastaAzucares };
  }

  function renderizarFilasGrupos() {
    const body = document.getElementById("equiv_grupos_body");
    let grupoAnterior = "";
    const htmlFilas = [];

    gruposActivos().forEach(function (grupo) {
      const esInicio = grupo.grupo !== grupoAnterior;
      grupoAnterior = grupo.grupo;
      const cantidad = limitarNoNegativo(estado.equivalentes[grupo.id]);

      htmlFilas.push(`
        <tr class="${esInicio ? "equivalentes-group-start" : ""}" data-equivalent-row="${grupo.id}">
          <td class="text-center text-muted fw-bold small">${escaparHtml(grupo.guiaRaciones || "—")}</td>
          <th scope="row" class="equivalentes-group-name">${escaparHtml(grupo.grupo)}</th>
          <td>
            <span class="equivalentes-subgroup">${escaparHtml(grupo.subgrupo)}</span>
            <small class="text-muted d-block">${formatear(grupo.proteina)} g P · ${formatear(grupo.grasa)} g G · ${formatear(grupo.carbohidrato)} g CHO · ${formatear(energiaUnitaria(grupo))} kcal</small>
          </td>
          <td class="text-center">
            <input type="number" class="form-control form-control-sm equivalentes-count-input"
              min="0" step="${STEP_EQUIVALENTE}" value="${cantidad}" data-equivalent-input="${grupo.id}"
              aria-label="Equivalentes de ${escaparHtml(grupo.grupo)}, ${escaparHtml(grupo.subgrupo)}">
          </td>
          <td class="text-end" data-aporte="proteina">0 g</td>
          <td class="text-end" data-aporte="grasa">0 g</td>
          <td class="text-end" data-aporte="carbohidrato">0 g</td>
          <td class="alimentos-nota">${escaparHtml(grupo.nota || "")}</td>
        </tr>`);

      // Control Intermedio 1: tras Vegetales (Proteínas vegetales y lácteas)
      if (grupo.id === "vegetal_libre") {
        htmlFilas.push(`
          <tr class="equivalentes-control-row" id="control_subtotal_proteinas">
            <td colspan="4" class="text-end">
              <strong>Control: Prote&iacute;nas vegetales / l&aacute;cteas acumuladas</strong>
            </td>
            <td class="text-end"><strong id="val_control_proteinas">0 g</strong></td>
            <td colspan="3" id="meta_control_proteinas" class="small"></td>
          </tr>`);
      }

      // Control Intermedio 2: tras Carnes, Pescados y Huevos (Lípidos acumulados)
      if (grupo.id === "embutido" || grupo.id === "animal_alto") {
        htmlFilas.push(`
          <tr class="equivalentes-control-row" id="control_subtotal_lipidos">
            <td colspan="4" class="text-end">
              <strong>Control: L&iacute;pidos acumulados (antes de grasas y frutos secos)</strong>
            </td>
            <td></td>
            <td class="text-end"><strong id="val_control_lipidos">0 g</strong></td>
            <td colspan="2" id="meta_control_lipidos" class="small"></td>
          </tr>`);
      }

      // Control Intermedio 3: tras Azúcares (Carbohidratos acumulados)
      if (grupo.id === "azucar" || grupo.id === "azucar_con_grasa") {
        htmlFilas.push(`
          <tr class="equivalentes-control-row" id="control_subtotal_carbohidratos">
            <td colspan="4" class="text-end">
              <strong>Control: Carbohidratos acumulados (antes de frutas)</strong>
            </td>
            <td colspan="2"></td>
            <td class="text-end"><strong id="val_control_carbohidratos">0 g</strong></td>
            <td id="meta_control_carbohidratos" class="small"></td>
          </tr>`);
      }
    });

    body.innerHTML = htmlFilas.join("");
    actualizarCalculosGrupos();
  }

  function claseAdecuacion(porcentaje) {
    if (!Number.isFinite(porcentaje)) return "equiv-adequacy-neutral";
    if (porcentaje >= 90 && porcentaje <= 110) return "equiv-adequacy-ok";
    if (porcentaje < 90) return "equiv-adequacy-warning";
    return "equiv-adequacy-over";
  }

  function actualizarCalculosGrupos() {
    gruposActivos().forEach(function (grupo) {
      const fila = document.querySelector(`[data-equivalent-row="${grupo.id}"]`);
      if (!fila) return;
      const aporte = calcularAporteGrupo(grupo, estado.equivalentes[grupo.id]);
      fila.querySelector('[data-aporte="proteina"]').textContent = `${formatear(aporte.proteina, 1)} g`;
      fila.querySelector('[data-aporte="grasa"]').textContent = `${formatear(aporte.grasa, 1)} g`;
      fila.querySelector('[data-aporte="carbohidrato"]').textContent = `${formatear(aporte.carbohidrato, 1)} g`;
    });

    const objetivos = renderizarObjetivos();
    const totales = calcularTotales(estado.equivalentes);
    const subtotales = calcularSubtotalesSecuenciales();

    // Actualizar los 3 Controles Intermedios del Excel
    const valCtrlP = document.getElementById("val_control_proteinas");
    const metaCtrlP = document.getElementById("meta_control_proteinas");
    if (valCtrlP && metaCtrlP) {
      valCtrlP.textContent = `${formatear(subtotales.protVegetalLactea, 1)} g`;
      const restanteP = Math.max(0, objetivos.proteina - subtotales.protVegetalLactea);
      metaCtrlP.innerHTML = `Meta total: <strong>${formatear(objetivos.proteina, 1)} g</strong> · <span class="control-badge">Restan ${formatear(restanteP, 1)} g para Carnes y Huevos</span>`;
    }

    const valCtrlL = document.getElementById("val_control_lipidos");
    const metaCtrlL = document.getElementById("meta_control_lipidos");
    if (valCtrlL && metaCtrlL) {
      valCtrlL.textContent = `${formatear(subtotales.lipidosHastaCarnes, 1)} g`;
      const restanteL = Math.max(0, objetivos.grasa - subtotales.lipidosHastaCarnes);
      metaCtrlL.innerHTML = `Meta total: <strong>${formatear(objetivos.grasa, 1)} g</strong> · <span class="control-badge">Restan ${formatear(restanteL, 1)} g para Grasas y Frutos Secos</span>`;
    }

    const valCtrlCho = document.getElementById("val_control_carbohidratos");
    const metaCtrlCho = document.getElementById("meta_control_carbohidratos");
    if (valCtrlCho && metaCtrlCho) {
      valCtrlCho.textContent = `${formatear(subtotales.choHastaAzucares, 1)} g`;
      const restanteCho = Math.max(0, objetivos.carbohidrato - subtotales.choHastaAzucares);
      metaCtrlCho.innerHTML = `Meta total: <strong>${formatear(objetivos.carbohidrato, 1)} g</strong> · <span class="control-badge">Restan ${formatear(restanteCho, 1)} g para Frutas</span>`;
    }

    // Pie de tabla idéntico al Excel: Total en gramos, % Adecuación, Total en Kcal
    const adecP = objetivos.proteina > 0 ? (totales.proteina / objetivos.proteina) * 100 : 0;
    const adecL = objetivos.grasa > 0 ? (totales.grasa / objetivos.grasa) * 100 : 0;
    const adecCho = objetivos.carbohidrato > 0 ? (totales.carbohidrato / objetivos.carbohidrato) * 100 : 0;
    const adecKcal = objetivos.energia > 0 ? (totales.energia / objetivos.energia) * 100 : 0;

    const kcalP = totales.proteina * 4;
    const kcalL = totales.grasa * 9;
    const kcalCho = totales.carbohidrato * 4;

    document.getElementById("equiv_grupos_foot").innerHTML = `
      <tr class="table-light">
        <th scope="row" colspan="3">TOTAL EN GRAMOS</th>
        <td class="text-center"><strong>${formatear(totales.equivalentes, 2)}</strong></td>
        <td class="text-end"><strong>${formatear(totales.proteina, 1)} g</strong></td>
        <td class="text-end"><strong>${formatear(totales.grasa, 1)} g</strong></td>
        <td class="text-end"><strong>${formatear(totales.carbohidrato, 1)} g</strong></td>
        <td></td>
      </tr>
      <tr class="table-light">
        <th scope="row" colspan="4">% ADECUACIÓN</th>
        <td class="text-end"><strong class="${claseAdecuacion(adecP)}">${formatear(adecP, 1)}%</strong></td>
        <td class="text-end"><strong class="${claseAdecuacion(adecL)}">${formatear(adecL, 1)}%</strong></td>
        <td class="text-end"><strong class="${claseAdecuacion(adecCho)}">${formatear(adecCho, 1)}%</strong></td>
        <td><strong class="${claseAdecuacion(adecKcal)}">Calórica: ${formatear(adecKcal, 1)}%</strong></td>
      </tr>
      <tr class="table-light">
        <th scope="row" colspan="4">TOTAL EN KCAL</th>
        <td class="text-end"><span>${formatear(kcalP, 0)} kcal</span></td>
        <td class="text-end"><span>${formatear(kcalL, 0)} kcal</span></td>
        <td class="text-end"><span>${formatear(kcalCho, 0)} kcal</span></td>
        <td><strong class="text-success">${formatear(totales.energia, 0)} kcal</strong></td>
      </tr>`;

    renderizarAdecuacion(totales, totales.energia);
    actualizarResumenDistribucion();
  }

  function renderizarAdecuacion(totales, energia) {
    const objetivos = obtenerObjetivos();
    const items = [
      { nombre: "Energía", valor: energia, objetivo: objetivos.energia, unidad: "kcal" },
      { nombre: "Proteínas", valor: totales.proteina, objetivo: objetivos.proteina, unidad: "g" },
      { nombre: "Lípidos", valor: totales.grasa, objetivo: objetivos.grasa, unidad: "g" },
      { nombre: "Carbohidratos", valor: totales.carbohidrato, objetivo: objetivos.carbohidrato, unidad: "g" }
    ];
    document.getElementById("equiv_adecuacion_resumen").innerHTML = items.map(function (item) {
      const porcentaje = item.objetivo > 0 ? item.valor / item.objetivo * 100 : (item.valor === 0 ? 100 : Infinity);
      const textoPorcentaje = Number.isFinite(porcentaje) ? `${formatear(porcentaje, 1)}%` : "—";
      return `<div class="equivalentes-adequacy-card ${claseAdecuacion(porcentaje)}">
        <span>${item.nombre}</span>
        <strong>${textoPorcentaje}</strong>
        <small>${formatear(item.valor, 1)} de ${formatear(item.objetivo, 1)} ${item.unidad}</small>
      </div>`;
    }).join("");
  }

  // ALGORITMO DIETOSINTÉTICO SECUENCIAL BASADO EN EL EXCEL
  function propuestaExcelUSFQ(objetivos) {
    if (!objetivos.valido) return null;
    const sugeridos = {};
    gruposActivos().forEach(g => { sugeridos[g.id] = 0; });

    // Factor de escala calórica respecto al ejemplo base de 1700 kcal
    const factorEscala = objetivos.energia / 1700;

    // 1. CEREALES (4.5 raciones para 1700 kcal / 230 g CHO)
    // 55% Cereal alto CHO baja grasa, 45% Cereal medio CHO baja grasa
    const racionesCerealTotales = redondearPaso(4.5 * factorEscala, 0.5);
    sugeridos.cereal_alto_cho_baja_grasa = redondearPaso(racionesCerealTotales * (2.5 / 4.5), 0.5);
    sugeridos.cereal_medio_cho_baja_grasa = Math.max(0, racionesCerealTotales - sugeridos.cereal_alto_cho_baja_grasa);

    // 2. LÁCTEOS (Guía 2 - 4: 1 semi, 1 descremado, 1 queso)
    sugeridos.lacteo_semidescremado = 1;
    sugeridos.lacteo_descremado = 1;
    sugeridos.queso = 1;

    // 3. LEGUMINOSAS (Guía 1 - 2: 1 ración)
    sugeridos.leguminosa = 1;

    // 4. VEGETALES (Guía 2 - 3: 2.5 bajo CHO, 0.5 libre consumo)
    sugeridos.vegetal_bajo_cho = 2.5;
    sugeridos.vegetal_libre = 0.5;

    // 5. BALANCE SECUENCIAL DE PROTEÍNAS:
    // Calcular proteínas aportadas hasta aquí
    let pAcumulada = 0;
    ["cereal_alto_cho_baja_grasa", "cereal_medio_cho_baja_grasa", "lacteo_semidescremado", "lacteo_descremado", "queso", "leguminosa", "vegetal_bajo_cho", "vegetal_libre"].forEach(id => {
      const g = GRUPOS_EXCEL_USFQ.find(item => item.id === id);
      if (g) pAcumulada += sugeridos[id] * g.proteina;
    });

    const pFaltante = objetivos.proteina - pAcumulada;
    sugeridos.huevo = 1; // 7 g P, 6 g L
    const pParaCarne = Math.max(0, pFaltante - 7);
    // Carne baja en grasa aporta 11 g P por equivalente
    sugeridos.carne_baja_grasa = redondearPaso(pParaCarne / 11, 0.5);

    // 6. BALANCE SECUENCIAL DE LÍPIDOS:
    // Calcular grasas acumuladas hasta carnes y huevos
    let lAcumulado = 0;
    Object.keys(sugeridos).forEach(id => {
      const g = GRUPOS_EXCEL_USFQ.find(item => item.id === id);
      if (g) lAcumulado += sugeridos[id] * g.grasa;
    });

    const lFaltante = objetivos.grasa - lAcumulado;
    // Asignar grasas base: 1 eq alta en grasa (12 g L), 1 eq media en grasa (7 g L) = 19 g L
    sugeridos.grasa_alta = 1;
    sugeridos.grasa_media = 1;
    const lParaFrutosSecos = Math.max(0, lFaltante - 19);
    // Grasa alta bajo CHO (frutos secos) aporta 10 g L por equivalente
    sugeridos.grasa_alta_bajo_cho = redondearPaso(lParaFrutosSecos / 10, 0.25);

    // 7. BALANCE SECUENCIAL DE CARBOHIDRATOS:
    // Calcular carbohidratos acumulados hasta azúcares
    let choAcumulado = 0;
    Object.keys(sugeridos).forEach(id => {
      const g = GRUPOS_EXCEL_USFQ.find(item => item.id === id);
      if (g) choAcumulado += sugeridos[id] * g.carbohidrato;
    });

    const choFaltante = objetivos.carbohidrato - choAcumulado;
    // Frutas: 1 eq media en CHO (20 g CHO)
    sugeridos.fruta_media_cho = 1;
    const choParaFrutaBaja = Math.max(0, choFaltante - 20);
    // Fruta baja en CHO aporta 10 g CHO por equivalente
    sugeridos.fruta_baja_cho = redondearPaso(choParaFrutaBaja / 10, 0.5);

    return sugeridos;
  }

  function propuestaClasica(objetivos) {
    const sugeridos = {};
    gruposActivos().forEach(function (grupo) { sugeridos[grupo.id] = 0; });
    sugeridos.lacteo_descremado = 1;
    sugeridos.lacteo_semidescremado = 1;
    sugeridos.queso_semidescremado = 1;
    sugeridos.leguminosa_seca = 1;
    sugeridos.verdura_libre = 2.5;
    sugeridos.verdura_baja_cho = 0.5;
    sugeridos.animal_moderado = 2;
    sugeridos.grasa_con_proteina = 1;
    sugeridos.cereal_sin_grasa = Math.max(0, Math.round(objetivos.carbohidrato / 2 / 15));
    let totales = calcularTotales(sugeridos, "clasica");
    sugeridos.animal_muy_bajo = Math.max(0, Math.round((objetivos.proteina - totales.proteina) / 7));
    totales = calcularTotales(sugeridos, "clasica");
    sugeridos.grasa_sin_proteina = redondearPaso((objetivos.grasa - totales.grasa) / 5, 0.5);
    totales = calcularTotales(sugeridos, "clasica");
    sugeridos.fruta = redondearPaso((objetivos.carbohidrato - totales.carbohidrato) / 10, 0.5);
    return sugeridos;
  }

  function sugerirEquivalentes() {
    const objetivos = obtenerObjetivos();
    if (["equiv_energia", "equiv_peso_ideal", "equiv_proteina_pct", "equiv_grasa_pct"]
      .some(id => !document.getElementById(id).value.trim()) || !objetivos.valido) {
      establecerMensaje(mensajeObjetivos(objetivos) || "Completa y revisa los cuatro datos del objetivo antes de sugerir equivalentes.", "error", "equiv_mensaje_en_tabla");
      return;
    }

    const sugeridos = matriz === "usfq" ? propuestaExcelUSFQ(objetivos) : propuestaClasica(objetivos);
    if (!sugeridos) {
      establecerMensaje("No se pudo calcular una propuesta automática. Revisa el objetivo dietosintético.", "error", "equiv_mensaje_en_tabla");
      return;
    }

    estado.equivalentes = sugeridos;
    renderizarFilasGrupos();
    distribuirAutomaticamente(false);
    programarGuardado();

    const totales = calcularTotales(sugeridos);
    establecerMensaje(
      `Sugerencia aplicada según la lógica del Excel: ${formatear(totales.energia, 0)} kcal (${formatear((totales.energia / objetivos.energia) * 100, 1)}% adecuación calórica). Equivalentes distribuidos en tus comidas.`,
      "success",
      "equiv_mensaje_en_tabla"
    );
  }

  function pesosParaGrupo(grupo, cantidadComidas) {
    const base = PESOS_BASE[cantidadComidas] || PESOS_BASE[5];
    const mascarasTipo = MASCARAS_POR_TIPO[grupo.tipo] || MASCARAS_POR_TIPO.cereal;
    const mascara = mascarasTipo[cantidadComidas] || mascarasTipo[5];
    const combinados = base.map(function (peso, indice) { return peso * (mascara[indice] || 0); });
    const suma = combinados.reduce(function (total, valor) { return total + valor; }, 0);
    return suma <= 0 ? base.slice() : combinados.map(function (valor) { return valor / suma; });
  }

  function distribuirUnidades(total, pesos, paso) {
    const unidad = paso || STEP_EQUIVALENTE;
    const unidades = Math.max(0, Math.round(limitarNoNegativo(total) / unidad));
    const sumaPesos = pesos.reduce(function (suma, peso) { return suma + Math.max(0, numeroSeguro(peso)); }, 0);
    if (!unidades || !sumaPesos) return pesos.map(function () { return 0; });
    const calculados = pesos.map(function (peso, indice) {
      const exacto = unidades * Math.max(0, numeroSeguro(peso)) / sumaPesos;
      return { indice, entero: Math.floor(exacto), residuo: exacto - Math.floor(exacto) };
    });
    let asignadas = calculados.reduce(function (suma, item) { return suma + item.entero; }, 0);
    calculados.slice().sort(function (a, b) { return b.residuo - a.residuo || a.indice - b.indice; }).forEach(function (item) {
      if (asignadas < unidades) { calculados[item.indice].entero += 1; asignadas += 1; }
    });
    return calculados.map(function (item) { return item.entero * unidad; });
  }

  function distribuirAutomaticamente(mostrarMensaje) {
    const cantidadComidas = estado.comidas.length;
    gruposActivos().forEach(function (grupo) {
      const total = limitarNoNegativo(estado.equivalentes[grupo.id]);
      const unidadesDeCuarto = total / STEP_DISTRIBUCION;
      const admiteCuartos = Math.abs(unidadesDeCuarto - Math.round(unidadesDeCuarto)) <= TOLERANCIA;
      const paso = admiteCuartos ? STEP_DISTRIBUCION : STEP_EQUIVALENTE;
      estado.distribucion[grupo.id] = distribuirUnidades(total, pesosParaGrupo(grupo, cantidadComidas), paso);
    });
    renderizarEstructuraDistribucion();
    programarGuardado();
    if (mostrarMensaje !== false) establecerMensaje("Los equivalentes se distribuyeron entre los tiempos de comida sin alterar el total diario.", "success");
  }

  function normalizarDistribucion() {
    const cantidad = estado.comidas.length;
    gruposActivos().forEach(function (grupo) {
      const actual = Array.isArray(estado.distribucion[grupo.id]) ? estado.distribucion[grupo.id] : [];
      estado.distribucion[grupo.id] = Array.from({ length: cantidad }, function (_, indice) { return limitarNoNegativo(actual[indice]); });
    });
  }

  function renderizarConfiguracionComidas() {
    document.getElementById("equiv_comidas_config").innerHTML = estado.comidas.map(function (comida, indice) {
      return `<div class="equivalentes-meal-card"><span class="equivalentes-meal-number">${indice + 1}</span>
        <label for="equiv_comida_nombre_${indice}">Comida</label>
        <input type="text" id="equiv_comida_nombre_${indice}" class="form-control form-control-sm" value="${escaparHtml(comida.nombre)}" data-meal-field="nombre" data-meal-index="${indice}" maxlength="40">
        <label for="equiv_comida_hora_${indice}">Hora</label>
        <input type="time" id="equiv_comida_hora_${indice}" class="form-control form-control-sm" value="${escaparHtml(comida.hora)}" data-meal-field="hora" data-meal-index="${indice}"></div>`;
    }).join("");
  }

  function renderizarEstructuraDistribucion() {
    normalizarDistribucion();
    const head = document.getElementById("equiv_distribucion_head");
    const body = document.getElementById("equiv_distribucion_body");
    head.innerHTML = `<tr>
      <th scope="col">Grupo</th>
      <th scope="col">Subgrupo</th>
      ${estado.comidas.map(function (comida, indice) {
        return `<th scope="col" class="text-center">
          <span data-meal-heading="${indice}">${escaparHtml(comida.nombre || `Comida ${indice + 1}`)}</span>
          <small class="d-block text-muted">${escaparHtml(comida.hora)}</small>
        </th>`;
      }).join("")}
      <th scope="col" class="text-center">Asignado / Requerido</th>
      <th scope="col">Estado</th>
    </tr>`;

    let grupoAnterior = "";
    body.innerHTML = gruposActivos().map(function (grupo) {
      const esInicio = grupo.grupo !== grupoAnterior;
      grupoAnterior = grupo.grupo;
      return `<tr class="${esInicio ? "equivalentes-group-start" : ""}" data-distribution-row="${grupo.id}">
        <th scope="row" class="equivalentes-group-name">${escaparHtml(grupo.grupo)}</th>
        <td>${escaparHtml(grupo.subgrupo)}</td>
        ${estado.comidas.map(function (_, indice) {
          const valor = limitarNoNegativo(estado.distribucion[grupo.id][indice]);
          return `<td class="text-center">
            <input type="number" class="form-control form-control-sm equivalentes-allocation-input" min="0" step="${STEP_EQUIVALENTE}" value="${valor}"
              data-allocation-group="${grupo.id}" data-allocation-meal="${indice}" aria-label="${escaparHtml(grupo.grupo)}, ${escaparHtml(grupo.subgrupo)}, ${escaparHtml(estado.comidas[indice].nombre)}">
          </td>`;
        }).join("")}
        <td class="text-center" data-distribution-sum></td>
        <td data-distribution-status></td>
      </tr>`;
    }).join("");

    renderizarPieDistribucion();
    actualizarResumenDistribucion();
  }

  function totalesPorComida() {
    return estado.comidas.map(function (_, indiceComida) {
      return gruposActivos().reduce(function (total, grupo) {
        const cantidad = limitarNoNegativo((estado.distribucion[grupo.id] || [])[indiceComida]);
        total.proteina += cantidad * grupo.proteina;
        total.grasa += cantidad * grupo.grasa;
        total.carbohidrato += cantidad * grupo.carbohidrato;
        total.energia += cantidad * (grupo.proteina * 4 + grupo.grasa * 9 + grupo.carbohidrato * 4);
        return total;
      }, { proteina: 0, grasa: 0, carbohidrato: 0, energia: 0 });
    });
  }

  function renderizarPieDistribucion() {
    const etiquetas = [
      { key: "energia", label: "Energía", unidad: "kcal" },
      { key: "proteina", label: "Proteínas", unidad: "g" },
      { key: "grasa", label: "Lípidos", unidad: "g" },
      { key: "carbohidrato", label: "Carbohidratos", unidad: "g" },
      { key: "relacion", label: "Relación CHO/P", unidad: "" }
    ];
    document.getElementById("equiv_distribucion_foot").innerHTML = etiquetas.map(function (item) {
      return `<tr class="equivalentes-distribution-summary-row"><th scope="row" colspan="2">${item.label}</th>
        ${estado.comidas.map(function (_, indice) { return `<td class="text-center" data-meal-total="${item.key}" data-meal-total-index="${indice}">0${item.unidad ? ` ${item.unidad}` : ""}</td>`; }).join("")}
        <td colspan="2"></td></tr>`;
    }).join("");
  }

  function estadoDistribucion(asignado, requerido) {
    const diferencia = asignado - requerido;
    if (Math.abs(diferencia) <= TOLERANCIA) return { clase: "equiv-distribution-ok", texto: "Completo" };
    if (diferencia < 0) return { clase: "equiv-distribution-warning", texto: `Faltan ${formatear(Math.abs(diferencia))}` };
    return { clase: "equiv-distribution-over", texto: `Excede ${formatear(diferencia)}` };
  }

  function actualizarResumenDistribucion() {
    const body = document.getElementById("equiv_distribucion_body");
    if (!body) return;
    gruposActivos().forEach(function (grupo) {
      const fila = body.querySelector(`[data-distribution-row="${grupo.id}"]`);
      if (!fila) return;
      const asignado = (estado.distribucion[grupo.id] || []).reduce(function (suma, valor) { return suma + limitarNoNegativo(valor); }, 0);
      const requerido = limitarNoNegativo(estado.equivalentes[grupo.id]);
      const estadoFila = estadoDistribucion(asignado, requerido);
      fila.querySelector("[data-distribution-sum]").textContent = `${formatear(asignado)} / ${formatear(requerido)}`;
      const celdaEstado = fila.querySelector("[data-distribution-status]");
      celdaEstado.className = estadoFila.clase;
      celdaEstado.textContent = estadoFila.texto;
    });

    const comidaTotales = totalesPorComida();
    comidaTotales.forEach(function (total, indice) {
      const relacion = total.proteina > 0 ? total.carbohidrato / total.proteina : null;
      const valores = {
        energia: `${formatear(total.energia, 0)} kcal`,
        proteina: `${formatear(total.proteina, 1)} g`,
        grasa: `${formatear(total.grasa, 1)} g`,
        carbohidrato: `${formatear(total.carbohidrato, 1)} g`,
        relacion: relacion === null ? "—" : formatear(relacion, 2)
      };
      Object.keys(valores).forEach(function (key) {
        const celda = document.querySelector(`[data-meal-total="${key}"][data-meal-total-index="${indice}"]`);
        if (celda) celda.textContent = valores[key];
      });
    });

    // Tarjeta destacada de Almuerzo (exactamente como en el archivo Excel)
    const contenedorAlmuerzo = document.getElementById("equiv_almuerzo_resumen");
    if (contenedorAlmuerzo) {
      const indiceAlmuerzo = estado.comidas.findIndex(c => /almuerzo/i.test(c.nombre));
      if (indiceAlmuerzo >= 0) {
        const almuerzo = comidaTotales[indiceAlmuerzo];
        const relChoProt = almuerzo.proteina > 0 ? almuerzo.carbohidrato / almuerzo.proteina : 0;
        contenedorAlmuerzo.innerHTML = `
          <div class="equivalentes-almuerzo-card">
            <div class="equivalentes-almuerzo-heading">
              <h5>Lógica del Excel: Resumen Nutricional del Almuerzo</h5>
              <span class="badge bg-success">Horario: ${escaparHtml(estado.comidas[indiceAlmuerzo].hora)}</span>
            </div>
            <div class="equivalentes-almuerzo-grid">
              <div class="equivalentes-almuerzo-item">
                <span>Carbohidrato Almuerzo</span>
                <strong>${formatear(almuerzo.carbohidrato, 1)} g</strong>
              </div>
              <div class="equivalentes-almuerzo-item">
                <span>Proteína Almuerzo</span>
                <strong>${formatear(almuerzo.proteina, 1)} g</strong>
              </div>
              <div class="equivalentes-almuerzo-item">
                <span>Relación CHO / Prot</span>
                <strong>${formatear(relChoProt, 2)}</strong>
              </div>
            </div>
            <p class="equivalentes-almuerzo-note">
              Nota del Excel: La relación CHO/Prot en almuerzo es de ${formatear(relChoProt, 2)} (puede aumentarse a ~2.9 sumando 2 cdtas de miel y 0.5 raciones de CHO).
            </p>
          </div>`;
      } else {
        contenedorAlmuerzo.innerHTML = "";
      }
    }
  }

  function cambiarCantidadComidas(nuevaCantidad) {
    const cantidad = Math.min(6, Math.max(4, Math.round(numeroSeguro(nuevaCantidad, 5))));
    if (cantidad === estado.comidas.length) return;
    estado.comidas = PRESETS_COMIDAS[cantidad].map(copiarComida);
    renderizarConfiguracionComidas();
    distribuirAutomaticamente(false);
    establecerMensaje(`Se aplicaron los horarios sugeridos para ${cantidad} comidas y se redistribuyeron los equivalentes sin cambiar el total diario.`, "info");
  }

  function cargarDesdeCalculadora() {
    const campoEnergia = document.getElementById("input_energia_calculada_requerimiento");
    const campoPeso = document.getElementById("macro_peso_ideal");
    const campoProteina = document.getElementById("macro_proteina_porcentaje");
    const campoGrasa = document.getElementById("macro_grasa_porcentaje");
    const energia = campoEnergia && campoEnergia.value.trim() ? numeroSeguro(campoEnergia.value, NaN) : NaN;
    const pesoIdeal = campoPeso && campoPeso.value.trim() ? numeroSeguro(campoPeso.value, NaN) : NaN;
    const proteinaPct = campoProteina && campoProteina.value.trim() ? numeroSeguro(campoProteina.value, NaN) : NaN;
    const grasaPct = campoGrasa && campoGrasa.value.trim() ? numeroSeguro(campoGrasa.value, NaN) : NaN;
    if (!Number.isFinite(energia) || energia <= 1) {
      establecerMensaje("Primero define un requerimiento de energía válido en la Calculadora.", "error");
      return;
    }
    if (!Number.isFinite(pesoIdeal) || pesoIdeal <= 0) {
      establecerMensaje("Define un peso ideal válido en la distribución de macronutrientes de la Calculadora.", "error");
      return;
    }
    if (!Number.isFinite(proteinaPct) || !Number.isFinite(grasaPct) || proteinaPct < 0 || grasaPct < 0 || proteinaPct + grasaPct > 100) {
      establecerMensaje("Revisa los porcentajes de proteínas y grasas en la Calculadora antes de importarlos.", "error");
      return;
    }
    document.getElementById("equiv_energia").value = energia;
    document.getElementById("equiv_peso_ideal").value = pesoIdeal;
    document.getElementById("equiv_proteina_pct").value = proteinaPct;
    document.getElementById("equiv_grasa_pct").value = grasaPct;
    actualizarObjetivosDesdeFormulario();
    establecerMensaje("Datos cargados desde la Calculadora. Usa «Sugerir equivalentes» si deseas recalcular las raciones.", "success");
  }

  function actualizarObjetivosDesdeFormulario() {
    estado.objetivos = leerObjetivosFormulario();
    renderizarObjetivos();
    actualizarCalculosGrupos();
    programarGuardado();
  }

  function establecerMensaje(texto, tipo, contenedor = "equiv_mensaje_general") {
    const mensaje = document.getElementById("equiv_mensaje");
    if (!mensaje) return;
    const destino = document.getElementById(contenedor);
    if (destino && mensaje.parentElement !== destino) destino.appendChild(mensaje);
    mensaje.textContent = texto || "";
    mensaje.className = `equivalentes-message${texto ? " is-visible" : ""}${tipo ? ` equivalentes-message--${tipo}` : ""}`;
  }

  function programarGuardado() {
    window.clearTimeout(temporizadorGuardado);
    temporizadorGuardado = window.setTimeout(guardarEstado, 180);
  }

  function guardarEstado() {
    planesDeSesion[matriz] = estado;
    try {
      estado.objetivos = leerObjetivosFormulario();
      window.localStorage.setItem(STORAGE_PREFIX + matriz, JSON.stringify(estado));
      window.localStorage.setItem(STORAGE_PREFIX + "activa", matriz);
    } catch (error) { console.warn("No se pudo guardar el sistema de equivalentes.", error); }
  }

  function estadoGuardadoValido(datos) {
    return datos && typeof datos === "object" && datos.objetivos && datos.equivalentes &&
      Array.isArray(datos.comidas) && datos.comidas.length >= 4 && datos.comidas.length <= 6;
  }

  function leerPlanGuardado(fuente) {
    if (planesDeSesion[fuente]) return planesDeSesion[fuente];
    try {
      const texto = window.localStorage.getItem(STORAGE_PREFIX + fuente) ??
        window.localStorage.getItem(LEGACY_STORAGE_V2 + fuente);
      const datos = JSON.parse(texto);
      return estadoGuardadoValido(datos) ? datos : null;
    } catch (_error) { return null; }
  }

  function cargarEstado(guardado) {
    try {
      if (!estadoGuardadoValido(guardado)) return false;
      estado = crearEstadoInicial();
      estado.objetivos = Object.assign({}, estado.objetivos, guardado.objetivos);
      for (const grupo of gruposActivos()) {
        estado.equivalentes[grupo.id] = limitarNoNegativo(guardado.equivalentes[grupo.id] ?? estado.equivalentes[grupo.id]);
      }
      estado.comidas = guardado.comidas.map(function (comida, indice) {
        const respaldo = (PRESETS_COMIDAS[guardado.comidas.length] || PRESETS_COMIDAS[5])[indice];
        return { nombre: String(comida.nombre || respaldo.nombre), hora: String(comida.hora || respaldo.hora) };
      });
      estado.distribucion = guardado.distribucion && typeof guardado.distribucion === "object" ? guardado.distribucion : {};
      normalizarDistribucion();
      return true;
    } catch (_error) { estado = crearEstadoInicial(); return false; }
  }

  function activarMatriz(fuente, objetivosPrevios) {
    matriz = fuente;
    estado = crearEstadoInicial();
    const teniaPlan = cargarEstado(leerPlanGuardado(matriz));
    if (!teniaPlan && objetivosPrevios) estado.objetivos = { ...objetivosPrevios };
    const usfq = matriz === "usfq";
    const selector = document.getElementById("equiv_matriz");
    if (selector) selector.value = matriz;
    document.getElementById("equiv_sugerir").disabled = !gruposActivos().length;
    document.getElementById("equiv_fuente_matriz").textContent = usfq
      ? "Fuente: USFQ Press, Lista de intercambios de alimentos ecuatorianos (2.ª Ed. 2024) y metodología clínica del Excel."
      : nombresMatriz.clasica + ". La energía se calcula a partir de proteínas, grasas y carbohidratos (4/9/4).";
    aplicarObjetivosFormulario();
    document.getElementById("equiv_num_comidas").value = String(estado.comidas.length);
    renderizarFilasGrupos();
    renderizarConfiguracionComidas();
    if (teniaPlan) renderizarEstructuraDistribucion();
    else distribuirAutomaticamente(false);
  }

  function cambiarMatriz(fuente) {
    if (fuente === matriz || !matrices[fuente]?.length) return;
    window.clearTimeout(temporizadorGuardado);
    guardarEstado();
    activarMatriz(fuente, estado.objetivos);
    guardarEstado();
    establecerMensaje("Tabla cambiada. Cada matriz conserva sus propias raciones y distribución.", "info");
  }

  function reiniciarSistema() {
    if (!window.confirm("¿Reiniciar el sistema de equivalentes y cargar los valores base recomendados del Excel (1700 kcal / 70 kg)?")) return;
    estado = crearEstadoInicial();
    aplicarObjetivosFormulario();
    document.getElementById("equiv_num_comidas").value = "5";
    renderizarFilasGrupos();
    renderizarConfiguracionComidas();
    distribuirAutomaticamente(false);
    guardarEstado();
    establecerMensaje("Sistema de equivalentes restablecido con la configuración recomendada del Excel.", "success");
  }

  // EXPORTACIÓN A EXCEL IDÉNTICA AL FORMATO PROPORCIONADO POR EL USUARIO
  function exportarExcel() {
    const objetivos = obtenerObjetivos();
    if (!objetivos.valido) { establecerMensaje(mensajeObjetivos(objetivos) || "Revisa el objetivo antes de exportar.", "error"); return; }
    if (!window.XLSX || !window.XLSX.utils) {
      establecerMensaje("No se pudo cargar la herramienta de Excel. Revisa la conexión e inténtalo nuevamente.", "error"); return;
    }

    const totales = calcularTotales(estado.equivalentes);
    const subtotales = calcularSubtotalesSecuenciales();

    const filasHoja1 = [
      ["PESO IDEAL [KG]:", "", objetivos.pesoIdeal],
      ["ENERGÍA CALCULADA [KCAL]:", "", objetivos.energia],
      ["CUADRO DIETO-SINTÉTICO: ENERGÍA Y NUTRIENTES", "", "", "", "", "", "", "", objetivos.proteina, objetivos.proteina / 7],
      ["Macronutrientes", "Porcentaje", "Kcal", "gr", "N° Raciones", "gr/Kg", "", "", objetivos.grasa, objetivos.grasa / 5],
      ["Proteínas", objetivos.proteinaPct / 100, objetivos.proteinaKcal, objetivos.proteina, 8, objetivos.pesoIdeal > 0 ? objetivos.proteina / objetivos.pesoIdeal : 0, "", "", objetivos.carbohidrato, objetivos.carbohidrato / 15],
      ["Grasas", objetivos.grasaPct / 100, objetivos.grasaKcal, objetivos.grasa, 8, objetivos.pesoIdeal > 0 ? objetivos.grasa / objetivos.pesoIdeal : 0],
      ["Carbohidratos", objetivos.carbohidratoPct / 100, objetivos.carbohidratoKcal, objetivos.carbohidrato, 12.14, objetivos.pesoIdeal > 0 ? objetivos.carbohidrato / objetivos.pesoIdeal : 0, "4.5 raciones corresponde a C,TyP, el resto corresponde al resto de grupo de alimentos con CHO."],
      ["Total", 1, objetivos.energia],
      [],
      ["", "LISTA DE INTERCAMBIOS DE ALIMENTOS ECUATORIANOS - USFQ - 2da Ed. 2024"],
      ["", "SISTEMA DE EQUIVALENTES"],
      ["", "GRUPOS DE ALIMENTOS", "", "EQUIVALENTES", "PROTEÍNAS", "LÍPIDOS", "CARBOHIDRATOS"],
      ["N° raciones", "", "", "", objetivos.proteina, objetivos.grasa, objetivos.carbohidrato]
    ];

    gruposActivos().forEach(function (grupo) {
      const cantidad = limitarNoNegativo(estado.equivalentes[grupo.id]);
      const aporte = calcularAporteGrupo(grupo, cantidad);
      filasHoja1.push([
        grupo.guiaRaciones || "",
        grupo.grupo,
        grupo.subgrupo,
        cantidad,
        aporte.proteina,
        aporte.grasa,
        aporte.carbohidrato,
        grupo.nota || ""
      ]);

      if (grupo.id === "vegetal_libre") {
        filasHoja1.push(["", "", "", "", subtotales.protVegetalLactea, "", "", "Control: Proteínas vegetales/lácteas acumuladas"]);
      }
      if (grupo.id === "embutido" || grupo.id === "animal_alto") {
        filasHoja1.push(["", "", "", "", "", subtotales.lipidosHastaCarnes, "", "Control: Lípidos acumulados"]);
      }
      if (grupo.id === "azucar" || grupo.id === "azucar_con_grasa") {
        filasHoja1.push(["", "", "", "", "", "", subtotales.choHastaAzucares, "Control: Carbohidratos acumulados"]);
      }
    });

    filasHoja1.push([]);
    filasHoja1.push(["", "", "", "PROTEÍNAS", "LÍPIDOS", "CARBOHIDRATOS"]);
    filasHoja1.push(["", "", "TOTAL EN GRAMOS", "", totales.proteina, totales.grasa, totales.carbohidrato]);
    filasHoja1.push(["", "", "% ADECUACIÓN", "", objetivos.proteina > 0 ? totales.proteina / objetivos.proteina : 0, objetivos.grasa > 0 ? totales.grasa / objetivos.grasa : 0, objetivos.carbohidrato > 0 ? totales.carbohidrato / objetivos.carbohidrato : 0, objetivos.energia > 0 ? totales.energia / objetivos.energia : 0]);
    filasHoja1.push(["", "", "TOTAL EN KCAL", "", totales.proteina * 4, totales.grasa * 9, totales.carbohidrato * 4, totales.energia]);

    // Hoja 2: Distribución por horarios
    const comidaTotales = totalesPorComida();
    const indiceAlmuerzo = estado.comidas.findIndex(c => /almuerzo/i.test(c.nombre));
    const almuerzo = indiceAlmuerzo >= 0 ? comidaTotales[indiceAlmuerzo] : { carbohidrato: 0, proteina: 0 };
    const relChoProt = almuerzo.proteina > 0 ? almuerzo.carbohidrato / almuerzo.proteina : 0;

    const encabezadosHorario = ["", "HORARIO", ""].concat(estado.comidas.map(c => c.hora));
    const encabezadosComidas = ["", "GRUPOS DE ALIMENTOS", ""].concat(estado.comidas.map(c => c.nombre), ["SUMA", "EQUIVALENTES"]);

    const filasHoja2 = [
      ["DISTRIBUCIÓN POR TIEMPOS DE COMIDA"],
      encabezadosHorario,
      encabezadosComidas
    ];

    gruposActivos().forEach(function (grupo) {
      const valores = estado.distribucion[grupo.id] || [];
      const asignado = valores.reduce((s, v) => s + limitarNoNegativo(v), 0);
      const requerido = limitarNoNegativo(estado.equivalentes[grupo.id]);
      filasHoja2.push(["", grupo.grupo, grupo.subgrupo].concat(valores, [asignado, requerido]));
    });

    filasHoja2.push([]);
    filasHoja2.push(["CARBOHIDRATO ALMUERZO", "", almuerzo.carbohidrato, "SUMANDO CADA VALOR DE CARBOHIDRATO SEGÚN ASIGNACIÓN EN ALMUERZO"]);
    filasHoja2.push(["PROTEINA ALMUERZO", "", almuerzo.proteina, "SUMANDO CADA VALOR DE PROTEÍNA SEGÚN ASIGNACIÓN EN ALMUERZO"]);
    filasHoja2.push(["RELACIÓN CHO/PROT", "", relChoProt, "puede aumentar a ~2.9 si le sumamos 2 cdtas de miel y 0.5 raciones de CHO"]);

    const libro = window.XLSX.utils.book_new();
    const hoja1 = window.XLSX.utils.aoa_to_sheet(filasHoja1);
    const hoja2 = window.XLSX.utils.aoa_to_sheet(filasHoja2);

    hoja1["!cols"] = [{ wch: 14 }, { wch: 32 }, { wch: 28 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 50 }];
    hoja2["!cols"] = [{ wch: 26 }, { wch: 32 }, { wch: 26 }].concat(estado.comidas.map(() => ({ wch: 16 })), [{ wch: 12 }, { wch: 14 }, { wch: 45 }]);

    window.XLSX.utils.book_append_sheet(libro, hoja1, "Equivalentes");
    window.XLSX.utils.book_append_sheet(libro, hoja2, "Distribución");

    const fecha = new Date();
    const nombreFecha = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
    window.XLSX.writeFile(libro, `Sistema_Equivalentes_USFQ_${nombreFecha}.xlsx`);
    establecerMensaje("Archivo Excel generado con la lógica exacta de equivalentes y distribución.", "success");
  }

  function configurarEventos() {
    const selMatriz = document.getElementById("equiv_matriz");
    if (selMatriz) selMatriz.addEventListener("change", event => cambiarMatriz(event.target.value));
    window.addEventListener("pagehide", guardarEstado);
    ["equiv_energia", "equiv_peso_ideal", "equiv_proteina_pct", "equiv_grasa_pct"].forEach(function (id) {
      const el = document.getElementById(id);
      if (el) el.addEventListener("input", actualizarObjetivosDesdeFormulario);
    });

    document.getElementById("equiv_grupos_body").addEventListener("input", function (event) {
      const input = event.target.closest("[data-equivalent-input]");
      if (!input) return;
      estado.equivalentes[input.dataset.equivalentInput] = limitarNoNegativo(input.value);
      actualizarCalculosGrupos();
      programarGuardado();
    });

    document.getElementById("equiv_grupos_body").addEventListener("change", function (event) {
      const input = event.target.closest("[data-equivalent-input]");
      if (!input) return;
      const valor = redondearPaso(input.value, STEP_EQUIVALENTE);
      input.value = valor;
      estado.equivalentes[input.dataset.equivalentInput] = valor;
      actualizarCalculosGrupos();
      programarGuardado();
    });

    document.getElementById("equiv_distribucion_body").addEventListener("input", function (event) {
      const input = event.target.closest("[data-allocation-group]");
      if (!input) return;
      const grupo = input.dataset.allocationGroup;
      const indice = Number(input.dataset.allocationMeal);
      estado.distribucion[grupo][indice] = limitarNoNegativo(input.value);
      actualizarResumenDistribucion();
      programarGuardado();
    });

    document.getElementById("equiv_distribucion_body").addEventListener("change", function (event) {
      const input = event.target.closest("[data-allocation-group]");
      if (!input) return;
      const grupo = input.dataset.allocationGroup;
      const indice = Number(input.dataset.allocationMeal);
      const valor = redondearPaso(input.value, STEP_EQUIVALENTE);
      input.value = valor;
      estado.distribucion[grupo][indice] = valor;
      actualizarResumenDistribucion();
      programarGuardado();
    });

    document.getElementById("equiv_comidas_config").addEventListener("input", function (event) {
      const campo = event.target.closest("[data-meal-field]");
      if (!campo) return;
      const indice = Number(campo.dataset.mealIndex);
      estado.comidas[indice][campo.dataset.mealField] = campo.value;
      const encabezado = document.querySelector(`[data-meal-heading="${indice}"]`);
      if (encabezado && campo.dataset.mealField === "nombre") encabezado.textContent = campo.value || `Comida ${indice + 1}`;
      if (campo.dataset.mealField === "hora") {
        const hora = encabezado ? encabezado.parentElement.querySelector("small") : null;
        if (hora) hora.textContent = campo.value;
      }
      programarGuardado();
    });

    document.getElementById("equiv_num_comidas").addEventListener("change", function (event) { cambiarCantidadComidas(event.target.value); });
    document.getElementById("equiv_cargar_calculadora").addEventListener("click", cargarDesdeCalculadora);
    document.getElementById("equiv_sugerir").addEventListener("click", sugerirEquivalentes);
    document.getElementById("equiv_distribuir").addEventListener("click", function () { distribuirAutomaticamente(true); });
    document.getElementById("equiv_exportar").addEventListener("click", exportarExcel);
    document.getElementById("equiv_reiniciar").addEventListener("click", reiniciarSistema);
  }

  function inicializarEquivalentes() {
    if (!document.getElementById("equivalentes")) return;
    let inicial = "usfq";
    try {
      const ultima = window.localStorage.getItem(STORAGE_PREFIX + "activa");
      if (ultima === "clasica" || ultima === "usfq") inicial = ultima;
    } catch (_error) { }
    activarMatriz(inicial);
    configurarEventos();
    if (window.lucide) window.lucide.createIcons();
  }

  window.SistemaEquivalentes = {
    get grupos() { return gruposActivos().map(grupo => ({ ...grupo })); },
    get matriz() { return matriz; },
    calcularObjetivos,
    calcularTotales,
    distribuirUnidades
  };

  document.addEventListener("DOMContentLoaded", inicializarEquivalentes);
})();
