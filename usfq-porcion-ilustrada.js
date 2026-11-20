// Una sola porción para la ilustración. La ficha conserva todas las alternativas de la guía.
(function () {
  "use strict";
  // Casos que dependen del tamaño, el estado del alimento, el corte o la cáscara.
  const opciones = Object.freeze({
    "cereal_alto_cho_baja_grasa-oca": "6 unidades grandes",
    "cereal_alto_cho_baja_grasa-papa-con-cascara": "1 unidad grande",
    "cereal_alto_cho_baja_grasa-papa-pelada": "1 unidad grande",
    "cereal_alto_cho_baja_grasa-platano-verde": "⅓ de una unidad grande",
    "cereal_medio_cho_media_grasa-canguil-con-sal": "Cocido: 4 tazas",
    "cereal_medio_cho_media_grasa-galleta-de-avena": "1 galleta grande",
    "cereal_medio_cho_media_grasa-galleta-oreja": "1 galleta grande",
    "fruta_media_cho-banano-guineo-o-platano-de-seda": "1 unidad mediana",
    "fruta_media_cho-claudia-o-ciruela-amarilla-o-roja": "6 ciruelas amarillas",
    "fruta_media_cho-naranja-nacional": "½ unidad grande",
    "fruta_media_cho-pina": "1 taza en cubos",
    "fruta_media_cho-uva-verde": "20 unidades pequeñas",
    "fruta_media_cho-uva-roja": "7 unidades grandes",
    "fruta_media_cho-uvilla": "6 unidades medianas",
    "fruta_baja_cho-frutilla": "8 unidades medianas",
    "fruta_baja_cho-guayaba": "½ unidad grande",
    "fruta_baja_cho-mandarina": "1 mandarina costeña",
    "fruta_baja_cho-naranjilla": "2 unidades pequeñas",
    "fruta_baja_cho-pomarrosa": "2 unidades pequeñas",
    "fruta_baja_cho-tomate-de-arbol": "2 unidades medianas",
    "fruta_deshidratada-mango-deshidratado": "10 láminas",
    "vegetal_bajo_cho-achogcha-cruda-o-cocida": "5 unidades pequeñas",
    "vegetal_bajo_cho-esparrago": "Cocido: 9 unidades",
    "vegetal_bajo_cho-nabo-crudo-o-cocido": "Cocido: ½ taza",
    "vegetal_bajo_cho-vainita-cruda": "Cruda: ½ taza",
    "vegetal_bajo_cho-vainita-cocida": "Cocida: ¾ taza",
    "vegetal_libre-apio-tallos-o-cubos": "1 taza en palitos",
    "vegetal_libre-pepinillo": "1½ tazas en cubos",
    "queso-queso-suizo": "1 trozo (5.9 × 5.7 × 1 cm)",
    "queso-queso-ricota-leche-entera": "2 trozos largos (9.1 × 4.5 × 0.6 cm)",
    "carne_alta_grasa-res-carne-molida-alta-en-grasa": "Cruda: 2 cdas. colmadas",
    "carne_alta_grasa-res-lengua-cruda-o-cocida": "Cocida: 1 trozo (6 × 5 × 1.4 cm)",
    "carne_alta_grasa-res-ubre-cruda-o-cocida": "Cocida: 1 trozo (8 × 5 × 1.5 cm)",
    "carne_media_grasa-cerdo-chuleta": "Cocida: 1 chuleta pequeña",
    "carne_media_grasa-huevo-de-gallina-entero-crudo-o-cocido": "1 unidad mediana",
    "carne_media_grasa-pescado-pampanito-o-carita-crudo-o-cocido": "Cocido: 1 unidad pequeña",
    "carne_media_grasa-pescado-salmon": "Cocido: 1 filete (12.1 × 3.5 × 2.2 cm)",
    "carne_baja_grasa-calamar": "Cocido: ¼ taza",
    "carne_baja_grasa-camaron-pelado-crudo-o-cocido": "4 unidades grandes",
    "carne_baja_grasa-cerdo-carne-magra-lomo-crudo": "1 filete",
    "carne_baja_grasa-cerdo-carne-magra-lomo-cocido": "1 filete",
    "carne_baja_grasa-pavo-pechuga-sin-piel": "1 filete",
    "carne_baja_grasa-pescado-albacora-o-atun-blanco": "1 filete",
    "carne_baja_grasa-pescado-bagre": "1 trozo",
    "carne_baja_grasa-pescado-corvina-cruda": "1 filete",
    "carne_baja_grasa-pescado-lenguado": "1 filete",
    "carne_baja_grasa-pescado-pargo": "1 filete",
    "carne_baja_grasa-pescado-trucha-cruda": "1 filete",
    "carne_baja_grasa-pollo-mollejas-crudas-o-cocidas": "2 unidades pequeñas",
    "carne_baja_grasa-res-guata": "Cocida: ¾ taza",
    "carne_baja_grasa-res-librillo": "Cocido: 1 taza",
    "carne_baja_grasa-res-molida-1-3-grasa": "Cruda: 2 cdas. colmadas",
    "carne_baja_grasa-res-molida-3-5-grasa": "Cruda: 2 cdas. colmadas",
    "carne_baja_grasa-res-pata": "1 trozo",
    "grasa_alta-nuez-de-nogal": "6 mitades",
    "grasa_alta_bajo_cho-semilla-de-girasol": "Con cáscara: ½ taza",
    "grasa_alta_bajo_cho-pistacho-con-sal-tostado": "Sin cáscara: ¼ taza"
});
  function de(alimento) {
    if (Object.hasOwn(opciones, alimento.id)) return opciones[alimento.id];
    const opcionesMedida = alimento.medida.split(";").map(m => m.trim());
    return opcionesMedida.find(m => /tazas?\b/i.test(m)) || opcionesMedida[0];
  }
  window.PorcionIlustradaUSFQ = Object.freeze({de});
})();
