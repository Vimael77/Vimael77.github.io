// leer el archivo CSV de alimentos
const alimentos = [];
var alimentos_seleccionados = {};
var alimentos_seleccionados_en_orden = {};
var alimentos_total = {};
var alimentos_total_kc = {};
var alimentos_requerimiento = {};
var alimentos_adecuacion = {};
const baseGramos = 100;
var contador = 0

document.getElementById("file-input").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (event) {
    const fileContent = event.target.result;
    const lineas = fileContent.split('\n');
    for (const linea of lineas) {
      valores = linea.split(";");
      alimentos.push(
        {
          nombre: valores[0],
          energia_calculada: parseFloat(valores[2].replace(",", ".")),
          proteina: parseFloat(valores[3].replace(",", ".")),
          grasa_total: parseFloat(valores[4].replace(",", ".")),
          carbohidratos: parseFloat(valores[5].replace(",", ".")),
          fibra: parseFloat(valores[6].replace(",", ".")),
          ags: parseFloat(valores[7].replace(",", ".")),
          agm: parseFloat(valores[8].replace(",", ".")),
          agpi: parseFloat(valores[9].replace(",", ".")),
          colesterol: parseFloat(valores[10].replace(",", ".")),
          calcio: parseFloat(valores[11].replace(",", ".")),
          fosforo: parseFloat(valores[12].replace(",", ".")),
          hierro: parseFloat(valores[13].replace(",", ".")),
          potasio: parseFloat(valores[14].replace(",", ".")),
          sodio: parseFloat(valores[15].replace(",", ".")),
          zinc: parseFloat(valores[16].replace(",", ".")),
          vitamina_c: parseFloat(valores[17].replace(",", ".")),
          vitamina_a: parseFloat(valores[18].replace(",", ".")),
          folatos: parseFloat(valores[19].replace(",", ".")),
          vitamina_b12: parseFloat(valores[20].replace(",", ".")),
        },          
      )
  }
  };
  reader.readAsText(file);
});

document.getElementById("file-input2").addEventListener("change", function (event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    var data = new Uint8Array(e.target.result);
    var workbook = XLSX.read(data, { type: 'array' });
    var worksheet = workbook.Sheets[workbook.SheetNames[0]];

    var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (alimentos.length > 0){
      for (var i = 1; i < jsonData.length; i++) {
        var row = jsonData[i];
        var nombreAlimento = row[0];
        var gramos = row[1];
        if (nombreAlimento != "Total" && nombreAlimento != 'Requerimiento' 
                                      && nombreAlimento != 'Total Kilocalorias' 
                                      && nombreAlimento != 'Porcentaje de Adecuación'){
          agregarAlimentos(gramos, nombreAlimento);
        }
        if (nombreAlimento === 'Requerimiento'){
          document.getElementById('input_energia_calculada_requerimiento').value = row[2];        
          document.getElementById('input_proteina_requerimiento').value = row[3];
          document.getElementById('input_grasa_requerimiento').value = row[4];
          document.getElementById('input_carbohidratos_requerimiento').value = row[5];
          document.getElementById('input_fibra_requerimiento').value = row[6];
          document.getElementById("input_ags_requerimiento").value = row[7];
          document.getElementById("input_agm_requerimiento").value = row[8];
          document.getElementById("input_agpi_requerimiento").value = row[9];
          document.getElementById("input_colesterol_requerimiento").value = row[10];
          document.getElementById("input_calcio_requerimiento").value = row[11];
          document.getElementById("input_fosforo_requerimiento").value = row[12];
          document.getElementById("input_hierro_requerimiento").value = row[13];
          document.getElementById("input_potasio_requerimiento").value = row[14];
          document.getElementById("input_sodio_requerimiento").value = row[15];
          document.getElementById("input_zinc_requerimiento").value = row[16];
          document.getElementById("input_vitamina_c_requerimiento").value = row[17];
          document.getElementById("input_vitamina_a_requerimiento").value = row[18];
          document.getElementById("input_folatos_requerimiento").value = row[19];
          document.getElementById("input_vitamina_b12_requerimiento").value = row[20];
          calcular();
          break;
        }      
      }
    }else{
      alert('Por favor cargue la base de datos antes de recuperar el trabajo.');
    }
    

  };
  reader.readAsArrayBuffer(file);

});

//Descarga alimentos

function total_kilocalorias(){

  alimentos_total_kc['gramos'] = "";
  alimentos_total_kc['nombre'] = "Total Kilocalorias";
  alimentos_total_kc['energia_calculada'] = "";
  alimentos_total_kc['proteina'] = alimentos_total['proteina']*4
  alimentos_total_kc['grasa_total'] = alimentos_total['grasa_total']*9
  alimentos_total_kc['carbohidratos'] = alimentos_total['carbohidratos']*4

}

const ordenDeseado = [
  "nombre",
  "gramos",
  "energia_calculada",
  "proteina",
  "grasa_total",
  "carbohidratos",
  "fibra",
  "ags",
  "agm",
  "agpi",
  "colesterol",
  "calcio",
  "fosforo",
  "hierro",
  "potasio",
  "sodio",
  "zinc",
  "vitamina_c",
  "vitamina_a",
  "folatos",
  "vitamina_b12"
];

function descargar(){
  nuevoOrden();
  total_kilocalorias();
  info = []
  for (const clave in alimentos_seleccionados_en_orden) {
    aux_info = {}
    for (let i = 0; i < ordenDeseado.length; i++) {
      aux_info[ordenDeseado[i]] = alimentos_seleccionados_en_orden[clave][ordenDeseado[i]];
    }
    info.push(aux_info)
  }
  info.push(alimentos_total);
  info.push(alimentos_total_kc);
  info.push(alimentos_requerimiento);
  info.push(alimentos_adecuacion);
    
  (async() => {
    const worksheet = XLSX.utils.json_to_sheet(info);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
    XLSX.writeFile(workbook, "datos_pacientes.xlsx", { compression: true });
  })();
  
}

function nuevoOrden(){
  //Limpio el diccionario para cada vez que se descargue el archivo.
  alimentos_seleccionados_en_orden = {};

  // Obtener la referencia a la tabla
  var tabla = document.getElementById("valores");
  // Obtener todas las filas de la tabla
  var filas = tabla.getElementsByTagName("tr");
  // Iterar sobre cada fila
  for (var i = 0; i < filas.length; i++) {
    // Obtener todas las celdas de la fila actual
    var celdas = filas[i].getElementsByTagName("td");
    if(celdas[0]!=null){
      alimentos_seleccionados_en_orden[celdas[0].innerText] = alimentos_seleccionados[celdas[0].innerText]
    }    
  }
}

// Buscar alimentos y mostrarlos en una lista
function calcular() {
  const energia_calculada_T = parseFloat(document.getElementById('energia_calculada_total').textContent);
  const proteina_T = parseFloat(document.getElementById('proteina_total').textContent);
  const grasa_T = parseFloat(document.getElementById('grasa_total').textContent);
  const carbohidratos_T = parseFloat(document.getElementById('carbohidratos_total').textContent);
  const fibra_T = parseFloat(document.getElementById('fibra_total').textContent);
  const ags_T = parseFloat(document.getElementById('ags_total').textContent);
  const agm_T = parseFloat(document.getElementById('agm_total').textContent);
  const agpi_T = parseFloat(document.getElementById('agpi_total').textContent);
  const colesterol_T = parseFloat(document.getElementById('colesterol_total').textContent);
  const calcio_T = parseFloat(document.getElementById('calcio_total').textContent);
  const fosforo_T = parseFloat(document.getElementById('fosforo_total').textContent);
  const hierro_T = parseFloat(document.getElementById('hierro_total').textContent);
  const potasio_T = parseFloat(document.getElementById('potasio_total').textContent);
  const sodio_T = parseFloat(document.getElementById('sodio_total').textContent);
  const zinc_T = parseFloat(document.getElementById('zinc_total').textContent);
  const vitamina_c_T = parseFloat(document.getElementById('vitamina_c_total').textContent);
  const vitamina_a_T = parseFloat(document.getElementById('vitamina_a_total').textContent);
  const folatos_T = parseFloat(document.getElementById('folatos_total').textContent);
  const vitamina_b12_T = parseFloat(document.getElementById('vitamina_b12_total').textContent);

  alimentos_total['gramos'] = "";
  alimentos_total['nombre'] = "Total";
  alimentos_total['energia_calculada'] = energia_calculada_T;
  alimentos_total['proteina'] = proteina_T;
  alimentos_total['grasa_total'] = grasa_T;
  alimentos_total['carbohidratos'] = carbohidratos_T;
  alimentos_total['fibra'] = fibra_T;
  alimentos_total['ags'] = ags_T;
  alimentos_total['agm'] = agm_T;
  alimentos_total['agpi'] = agpi_T;
  alimentos_total['colesterol'] = colesterol_T;
  alimentos_total['calcio'] = calcio_T;
  alimentos_total['fosforo'] = fosforo_T;
  alimentos_total['hierro'] = hierro_T;
  alimentos_total['potasio'] = potasio_T;
  alimentos_total['sodio'] = sodio_T;
  alimentos_total['zinc'] = zinc_T;
  alimentos_total['vitamina_c'] = vitamina_c_T;
  alimentos_total['vitamina_a'] = vitamina_a_T;
  alimentos_total['folatos'] = folatos_T;
  alimentos_total['vitamina_b12'] = vitamina_b12_T;


  const energia_calculada_R = parseFloat(document.getElementById('input_energia_calculada_requerimiento').value);
  const proteina_R = parseFloat(document.getElementById('input_proteina_requerimiento').value);
  const grasa_R = parseFloat(document.getElementById('input_grasa_requerimiento').value);
  const carbohidratos_R = parseFloat(document.getElementById('input_carbohidratos_requerimiento').value);
  const fibra_R = parseFloat(document.getElementById('input_fibra_requerimiento').value);
  const ags_R = parseFloat(document.getElementById("input_ags_requerimiento").value);
  const agm_R = parseFloat(document.getElementById("input_agm_requerimiento").value);
  const agpi_R = parseFloat(document.getElementById("input_agpi_requerimiento").value);
  const colesterol_R = parseFloat(document.getElementById("input_colesterol_requerimiento").value);
  const calcio_R = parseFloat(document.getElementById("input_calcio_requerimiento").value);
  const fosforo_R = parseFloat(document.getElementById("input_fosforo_requerimiento").value);
  const hierro_R = parseFloat(document.getElementById("input_hierro_requerimiento").value);
  const potasio_R = parseFloat(document.getElementById("input_potasio_requerimiento").value);
  const sodio_R = parseFloat(document.getElementById("input_sodio_requerimiento").value);
  const zinc_R = parseFloat(document.getElementById("input_zinc_requerimiento").value);
  const vitamina_c_R = parseFloat(document.getElementById("input_vitamina_c_requerimiento").value);
  const vitamina_a_R = parseFloat(document.getElementById("input_vitamina_a_requerimiento").value);
  const folatos_R = parseFloat(document.getElementById("input_folatos_requerimiento").value);
  const vitamina_b12_R = parseFloat(document.getElementById("input_vitamina_b12_requerimiento").value);


  alimentos_requerimiento['gramos'] = "";
  alimentos_requerimiento['nombre'] = "Requerimiento";
  alimentos_requerimiento['energia_calculada'] = energia_calculada_R;
  alimentos_requerimiento['proteina'] = (proteina_R);
  alimentos_requerimiento['grasa_total'] = (grasa_R);
  alimentos_requerimiento['carbohidratos'] = (carbohidratos_R);
  alimentos_requerimiento['fibra'] = (fibra_R);
  alimentos_requerimiento['ags'] = (ags_R);
  alimentos_requerimiento['agm'] = (agm_R);
  alimentos_requerimiento['agpi'] = (agpi_R);
  alimentos_requerimiento['colesterol'] = (colesterol_R);
  alimentos_requerimiento['calcio'] = (calcio_R);
  alimentos_requerimiento['fosforo'] = (fosforo_R);
  alimentos_requerimiento['hierro'] = (hierro_R);
  alimentos_requerimiento['potasio'] = (potasio_R);
  alimentos_requerimiento['sodio'] = (sodio_R);
  alimentos_requerimiento['zinc'] = (zinc_R);
  alimentos_requerimiento['vitamina_c'] = (vitamina_c_R);
  alimentos_requerimiento['vitamina_a'] = (vitamina_a_R);
  alimentos_requerimiento['folatos'] = (folatos_R);
  alimentos_requerimiento['vitamina_b12'] = (vitamina_b12_R);
  

  var energia_calculada_A = document.getElementById('adecuacion_energia_calculada');
  var proteina_A = document.getElementById('adecuacion_proteina');
  var grasa_A = document.getElementById('adecuacion_grasa');
  var carbohidratos_A = document.getElementById('adecuacion_carbohidratos');
  var fibra_A = document.getElementById('adecuacion_fibra');
  var ags_A = document.getElementById('adecuacion_ags');
  var agm_A = document.getElementById('adecuacion_agm');
  var agpi_A = document.getElementById('adecuacion_agpi');
  var colesterol_A = document.getElementById('adecuacion_colesterol');
  var calcio_A = document.getElementById('adecuacion_calcio');
  var fosforo_A = document.getElementById('adecuacion_fosforo');
  var hierro_A = document.getElementById('adecuacion_hierro');
  var potasio_A = document.getElementById('adecuacion_potasio');
  var sodio_A = document.getElementById('adecuacion_sodio');
  var zinc_A = document.getElementById('adecuacion_zinc');
  var vitamina_c_A = document.getElementById('adecuacion_vitamina_c');
  var vitamina_a_A = document.getElementById('adecuacion_vitamina_a');
  var folatos_A = document.getElementById('adecuacion_folatos');
  var vitamina_b12_A = document.getElementById('adecuacion_vitamina_b12');


  energia_calculada_A.textContent = (100*energia_calculada_T/energia_calculada_R).toFixed(2) + '%';
  proteina_A.textContent = (100*proteina_T/proteina_R).toFixed(2) + '%';
  grasa_A.textContent = (100*grasa_T/grasa_R).toFixed(2) + '%';
  carbohidratos_A.textContent = (100*carbohidratos_T/carbohidratos_R).toFixed(2) + '%';
  fibra_A.textContent = (100*fibra_T/fibra_R).toFixed(2) + '%';
  ags_A.textContent = (100*ags_T/ags_R).toFixed(2) + '%';
  agm_A.textContent = (100*agm_T/agm_R).toFixed(2) + '%';
  agpi_A.textContent = (100*agpi_T/agpi_R).toFixed(2) + '%';
  colesterol_A.textContent = (100*colesterol_T/colesterol_R).toFixed(2) + '%';
  calcio_A.textContent = (100*calcio_T/calcio_R).toFixed(2) + '%';
  fosforo_A.textContent = (100*fosforo_T/fosforo_R).toFixed(2) + '%';
  hierro_A.textContent = (100*hierro_T/hierro_R).toFixed(2) + '%';
  potasio_A.textContent = (100*potasio_T/potasio_R).toFixed(2) + '%';
  sodio_A.textContent = (100*sodio_T/sodio_R).toFixed(2) + '%';
  zinc_A.textContent = (100*zinc_T/zinc_R).toFixed(2) + '%';
  vitamina_c_A.textContent = (100*vitamina_c_T/vitamina_c_R).toFixed(2) + '%';
  vitamina_a_A.textContent = (100*vitamina_a_T/vitamina_a_R).toFixed(2) + '%';
  folatos_A.textContent = (100*folatos_T/folatos_R).toFixed(2) + '%';
  vitamina_b12_A.textContent = (100*vitamina_b12_T/vitamina_b12_R).toFixed(2) + '%';


  alimentos_adecuacion['gramos'] = "";
  alimentos_adecuacion['nombre'] = "Porcentaje de Adecuación";
  alimentos_adecuacion['energia_calculada'] = parseFloat(energia_calculada_A.textContent);
  alimentos_adecuacion['proteina'] = parseFloat(proteina_A.textContent);
  alimentos_adecuacion['grasa_total'] = parseFloat(grasa_A.textContent);
  alimentos_adecuacion['carbohidratos'] = parseFloat(carbohidratos_A.textContent);
  alimentos_adecuacion['fibra'] = parseFloat(fibra_A.textContent);
  alimentos_adecuacion['ags'] = parseFloat(ags_A.textContent);
  alimentos_adecuacion['agm'] = parseFloat(agm_A.textContent);
  alimentos_adecuacion['agpi'] = parseFloat(agpi_A.textContent);
  alimentos_adecuacion['colesterol'] = parseFloat(colesterol_A.textContent);
  alimentos_adecuacion['calcio'] = parseFloat(calcio_A.textContent);
  alimentos_adecuacion['fosforo'] = parseFloat(fosforo_A.textContent);
  alimentos_adecuacion['hierro'] = parseFloat(hierro_A.textContent);
  alimentos_adecuacion['potasio'] = parseFloat(potasio_A.textContent);
  alimentos_adecuacion['sodio'] = parseFloat(sodio_A.textContent);
  alimentos_adecuacion['zinc'] = parseFloat(zinc_A.textContent);
  alimentos_adecuacion['vitamina_c'] = parseFloat(vitamina_c_A.textContent);
  alimentos_adecuacion['vitamina_a'] = parseFloat(vitamina_a_A.textContent);
  alimentos_adecuacion['folatos'] = parseFloat(folatos_A.textContent);
  alimentos_adecuacion['vitamina_b12'] = parseFloat(vitamina_b12_A.textContent);
}

function buscar() {
  const busqueda = document.getElementById('busqueda').value;
  const lista = document.getElementById('lista');
  lista.innerHTML = '';

  lista.classList.add('table', 'table-striped', 'table-hover', 'table-sm', 'custom-width-table');
  
  const th_nombre = document.createElement('th');
  const th_energia_calculada = document.createElement('th');
  const th_proteina = document.createElement('th');
  const th_grasa_total = document.createElement('th');
  const th_carbohidratos = document.createElement('th');
  const th_fibra = document.createElement('th');
  const th_ags = document.createElement('th');
  const th_agm = document.createElement('th');
  const th_agpi = document.createElement('th');
  const th_colesterol = document.createElement('th');
  const th_calcio = document.createElement('th');
  const th_fosforo = document.createElement('th');
  const th_hierro = document.createElement('th');
  const th_potasio = document.createElement('th');
  const th_sodio = document.createElement('th');
  const th_zinc = document.createElement('th');
  const th_vitamina_c = document.createElement('th');
  const th_vitamina_a = document.createElement('th');
  const th_folatos = document.createElement('th');
  const th_vitamina_b12 = document.createElement('th');

  //Se agregan clases a cada uno de los componentes.
  th_nombre.classList.add('ancho-alimento');
  th_energia_calculada.classList.add('ancho-celda');
  th_proteina.classList.add('ancho-celda');
  th_grasa_total.classList.add('ancho-celda');
  th_carbohidratos.classList.add('ancho-celda');
  th_fibra.classList.add('ancho-celda');
  th_ags.classList.add('ancho-celda');
  th_agm.classList.add('ancho-celda');
  th_agpi.classList.add('ancho-celda');
  th_colesterol.classList.add('ancho-celda');
  th_calcio.classList.add('ancho-celda');
  th_fosforo.classList.add('ancho-celda');
  th_hierro.classList.add('ancho-celda');
  th_potasio.classList.add('ancho-celda');
  th_sodio.classList.add('ancho-celda');
  th_zinc.classList.add('ancho-celda');
  th_vitamina_c.classList.add('ancho-celda');
  th_vitamina_a.classList.add('ancho-celda');
  th_folatos.classList.add('ancho-celda');
  th_vitamina_b12.classList.add('ancho-celda');
  
  //
  th_nombre.textContent = "Nombre";
  th_energia_calculada.textContent = "Energía calculada";
  th_proteina.textContent = "Proteína";
  th_grasa_total.textContent = "Grasa total";
  th_carbohidratos.textContent = "Carbohidratos";
  th_fibra.textContent = "Fibra";    
  th_ags.textContent = "AGS"; 
  th_agm.textContent = "AGM"; 
  th_agpi.textContent = "AGPI"; 
  th_colesterol.textContent = "Colesterol";  
  th_calcio.textContent = "Calcio"; 
  th_fosforo.textContent = "Fosforo"; 
  th_hierro.textContent = "Hierro"; 
  th_potasio.textContent = "Potasio"; 
  th_sodio.textContent = "Sodio"; 
  th_zinc.textContent = "Zinc"; 
  th_vitamina_c.textContent = "Vitamina C"; 
  th_vitamina_a.textContent = "Vitamina A"; 
  th_folatos.textContent = "Folatos"; 
  th_vitamina_b12.textContent = "Vitamina B12"; 


  const encabezado = document.createElement('thead');
  encabezado.classList.add('table-primary');

  encabezado.appendChild(th_nombre);
  encabezado.appendChild(th_energia_calculada);
  encabezado.appendChild(th_proteina);
  encabezado.appendChild(th_grasa_total);
  encabezado.appendChild(th_carbohidratos);
  encabezado.appendChild(th_fibra);
  encabezado.appendChild(th_ags);
  encabezado.appendChild(th_agm);
  encabezado.appendChild(th_agpi);
  encabezado.appendChild(th_colesterol);
  encabezado.appendChild(th_calcio);
  encabezado.appendChild(th_fosforo);
  encabezado.appendChild(th_hierro);
  encabezado.appendChild(th_potasio);
  encabezado.appendChild(th_sodio);
  encabezado.appendChild(th_zinc);
  encabezado.appendChild(th_vitamina_c);
  encabezado.appendChild(th_vitamina_a);
  encabezado.appendChild(th_folatos);
  encabezado.appendChild(th_vitamina_b12);


  lista.appendChild(encabezado);

  const tbody = document.createElement('tbody');

  for (let i = 0; i < alimentos.length; i++) {
    if (alimentos[i].nombre.toLowerCase().includes(busqueda.toLowerCase())) {

      const td_nombre = document.createElement('td');
      const td_energia_calculada = document.createElement('td');
      const td_proteina = document.createElement('td');
      const td_grasa_total = document.createElement('td');
      const td_carbohidratos = document.createElement('td');
      const td_fibra = document.createElement('td');
      const td_ags = document.createElement('td');
      const td_agm = document.createElement('td');
      const td_agpi = document.createElement('td');
      const td_colesterol = document.createElement('td');
      const td_calcio = document.createElement('td');
      const td_fosforo = document.createElement('td');
      const td_hierro = document.createElement('td');
      const td_potasio = document.createElement('td');
      const td_sodio = document.createElement('td');
      const td_zinc = document.createElement('td');
      const td_vitamina_c = document.createElement('td');
      const td_vitamina_a = document.createElement('td');
      const td_folatos = document.createElement('td');
      const td_vitamina_b12 = document.createElement('td');

      td_nombre.textContent = alimentos[i].nombre;
      td_energia_calculada.textContent = alimentos[i].energia_calculada;
      td_proteina.textContent = alimentos[i].proteina;
      td_grasa_total.textContent = alimentos[i].grasa_total;
      td_carbohidratos.textContent = alimentos[i].carbohidratos;
      td_fibra.textContent = alimentos[i].fibra;
      td_ags.textContent = alimentos[i].ags;
      td_agm.textContent = alimentos[i].agm;
      td_agpi.textContent = alimentos[i].agpi;
      td_colesterol.textContent = alimentos[i].colesterol;
      td_calcio.textContent = alimentos[i].calcio;
      td_fosforo.textContent = alimentos[i].fosforo;
      td_hierro.textContent = alimentos[i].hierro;
      td_potasio.textContent = alimentos[i].potasio;
      td_sodio.textContent = alimentos[i].sodio;
      td_zinc.textContent = alimentos[i].zinc;
      td_vitamina_c.textContent = alimentos[i].vitamina_c;
      td_vitamina_a.textContent = alimentos[i].vitamina_a;
      td_folatos.textContent = alimentos[i].folatos;
      td_vitamina_b12.textContent = alimentos[i].vitamina_b12;

      const fila = document.createElement('tr');

      fila.addEventListener('click', () => agregar(baseGramos, alimentos[i]));

      fila.appendChild(td_nombre);
      fila.appendChild(td_energia_calculada);
      fila.appendChild(td_proteina);
      fila.appendChild(td_grasa_total);
      fila.appendChild(td_carbohidratos);
      fila.appendChild(td_fibra);
      fila.appendChild(td_ags);
      fila.appendChild(td_agm);
      fila.appendChild(td_agpi);      
      fila.appendChild(td_colesterol);
      fila.appendChild(td_calcio);
      fila.appendChild(td_fosforo);
      fila.appendChild(td_hierro);
      fila.appendChild(td_potasio);
      fila.appendChild(td_sodio);
      fila.appendChild(td_zinc);
      fila.appendChild(td_vitamina_c);
      fila.appendChild(td_vitamina_a);
      fila.appendChild(td_folatos);
      fila.appendChild(td_vitamina_b12);

      tbody.append(fila);
    }
  }

  lista.appendChild(tbody);

}

function agregarAlimentos(gramos, nombreAlimento){
  for (let i = 0; i < alimentos.length; i++) {
    if (alimentos[i].nombre.includes(nombreAlimento)) {
      agregar(gramos, alimentos[i]);
    }
  }
}

function calculoActualizarValores(alimento, inputGramos, factor, energia_calculada, proteina, grasa_total, carbohidratos, fibra,
  ags, agm, agpi, colesterol, calcio, fosforo, hierro, potasio, sodio, zinc, vitamina_c, vitamina_a, folatos, vitamina_b12){

  var valor_energia_calculada = parseFloat(alimento.energia_calculada);
  var valor_proteina = parseFloat(alimento.proteina);
  var valor_grasa_total = parseFloat(alimento.grasa_total);
  var valor_carbohidratos = parseFloat(alimento.carbohidratos);
  var valor_fibra = parseFloat(alimento.fibra);
  var valor_ags = parseFloat(alimento.ags);
  var valor_agm = parseFloat(alimento.agm);
  var valor_agpi = parseFloat(alimento.agpi);
  var valor_colesterol = parseFloat(alimento.colesterol);
  var valor_calcio = parseFloat(alimento.calcio);
  var valor_fosforo = parseFloat(alimento.fosforo);
  var valor_hierro = parseFloat(alimento.hierro);
  var valor_potasio = parseFloat(alimento.potasio);
  var valor_sodio = parseFloat(alimento.sodio);
  var valor_zinc = parseFloat(alimento.zinc);
  var valor_vitamina_c = parseFloat(alimento.vitamina_c);
  var valor_vitamina_a = parseFloat(alimento.vitamina_a);
  var valor_folatos = parseFloat(alimento.folatos);
  var valor_vitamina_b12 = parseFloat(alimento.vitamina_b12);

  alimentos_seleccionados[alimento.nombre]['gramos'] = inputGramos;
  alimentos_seleccionados[alimento.nombre]['energia_calculada'] = factor*valor_energia_calculada;
  alimentos_seleccionados[alimento.nombre]["proteina"] = factor*valor_proteina;
  alimentos_seleccionados[alimento.nombre]["grasa_total"] = factor*valor_grasa_total;
  alimentos_seleccionados[alimento.nombre]["carbohidratos"] = factor*valor_carbohidratos;
  alimentos_seleccionados[alimento.nombre]["fibra"] = factor*valor_fibra;
  alimentos_seleccionados[alimento.nombre]["ags"] = factor*valor_ags;
  alimentos_seleccionados[alimento.nombre]["agm"] = factor*valor_agm;
  alimentos_seleccionados[alimento.nombre]["agpi"] = factor*valor_agpi;
  alimentos_seleccionados[alimento.nombre]["colesterol"] = factor*valor_colesterol;
  alimentos_seleccionados[alimento.nombre]["calcio"] = factor*valor_calcio;
  alimentos_seleccionados[alimento.nombre]["fosforo"] = factor*valor_fosforo;
  alimentos_seleccionados[alimento.nombre]["hierro"] = factor*valor_hierro;
  alimentos_seleccionados[alimento.nombre]["potasio"] = factor*valor_potasio;
  alimentos_seleccionados[alimento.nombre]["sodio"] = factor*valor_sodio;
  alimentos_seleccionados[alimento.nombre]["zinc"] = factor*valor_zinc;
  alimentos_seleccionados[alimento.nombre]["vitamina_c"] = factor*valor_vitamina_c;
  alimentos_seleccionados[alimento.nombre]["vitamina_a"] = factor*valor_vitamina_a;
  alimentos_seleccionados[alimento.nombre]["folatos"] = factor*valor_folatos;
  alimentos_seleccionados[alimento.nombre]["vitamina_b12"] = factor*valor_vitamina_b12;
  
  energia_calculada.textContent = (valor_energia_calculada*factor).toFixed(2);
  proteina.textContent = (valor_proteina*factor).toFixed(2);
  grasa_total.textContent = (valor_grasa_total*factor).toFixed(2);
  carbohidratos.textContent = (valor_carbohidratos*factor).toFixed(2);
  fibra.textContent = (valor_fibra*factor).toFixed(2);
  ags.textContent = (valor_ags*factor).toFixed(2);
  agm.textContent = (valor_agm*factor).toFixed(2);
  agpi.textContent = (valor_agpi*factor).toFixed(2);
  colesterol.textContent = (valor_colesterol*factor).toFixed(2);
  calcio.textContent = (valor_calcio*factor).toFixed(2);
  fosforo.textContent = (valor_fosforo*factor).toFixed(2);
  hierro.textContent = (valor_hierro*factor).toFixed(2);
  potasio.textContent = (valor_potasio*factor).toFixed(2);
  sodio.textContent = (valor_sodio*factor).toFixed(2);
  zinc.textContent = (valor_zinc*factor).toFixed(2);
  vitamina_c.textContent = (valor_vitamina_c*factor).toFixed(2);
  vitamina_a.textContent = (valor_vitamina_a*factor).toFixed(2);
  folatos.textContent = (valor_folatos*factor).toFixed(2);
  vitamina_b12.textContent = (valor_vitamina_b12*factor).toFixed(2);

  actualizarTotal(alimentos_seleccionados);
  calcular();
  }


function actualizarValores(event, alimento, energia_calculada, proteina, grasa_total, carbohidratos, fibra,
  ags, agm, agpi, colesterol, calcio, fosforo, hierro, potasio, sodio, zinc, vitamina_c, vitamina_a, folatos, vitamina_b12){      
  var inputGramos = 0;

    if (isNaN(event.target.value) || event.target.value === "" || parseFloat(event.target.value) < 0) {
      inputGramos = 0;
    }else{
      inputGramos = parseFloat(event.target.value);
    }
    if (event === null){
      inputGramos = 0;
    }

  var factor = inputGramos / 100;

  calculoActualizarValores(alimento, inputGramos, factor, energia_calculada, proteina, grasa_total, carbohidratos, fibra,
  ags, agm, agpi, colesterol, calcio, fosforo, hierro, potasio, sodio, zinc, vitamina_c, vitamina_a, folatos, vitamina_b12);
  
}
function eliminar(alimento){
  var respuesta = confirm('¿Estás seguro de eliminar el alimento?');
  if (respuesta) {
    var row = document.getElementById(alimento);
    row.remove();
    delete alimentos_seleccionados[alimento];
    actualizarTotal(alimentos_seleccionados);
    calcular();
  }
}
// agregar un alimento a la tabla de valores nutricionales
function agregar(valorGramos, alimento) {
  if (!alimentos_seleccionados.hasOwnProperty(alimento.nombre)){
    const valores = document.getElementById('valores');

    Sortable.create(valores, {
      animation: 150,
      dragClass: "drag"
    });
    const valores_tbody = document.createElement('tbody');

    const encabezado = document.getElementById("encabezado_valores");
    encabezado.classList.add('table-primary');


    //Crea una fila y le agrega un id.
    const fila = document.createElement('tr');
    fila.id = alimento.nombre;
    //fila.setAttribute('data-id', contador);
    fila.addEventListener('dblclick', () => eliminar(alimento.nombre));

    const nombre = document.createElement('td');
    nombre.textContent = alimento.nombre;

    fila.appendChild(nombre);

    //Colocamos un elemento input en el td
    const gramos = document.createElement('td');
    const campoTexto = document.createElement('input');
    campoTexto.type = 'text';
    campoTexto.style.maxWidth = "80px";
    campoTexto.value = valorGramos;
    campoTexto.id = alimento.nombre + '_' + 'input';
    campoTexto.addEventListener('keyup', (event) => actualizarValores(event, 
      alimento, energia_calculada, proteina, grasa_total, carbohidratos, fibra,
      ags, agm, agpi, colesterol, calcio, fosforo, hierro, potasio, sodio, zinc,
      vitamina_c, vitamina_a, folatos, vitamina_b12));

    gramos.appendChild(campoTexto);
    fila.appendChild(gramos);

    const energia_calculada = document.createElement('td');
    energia_calculada.textContent = alimento.energia_calculada;
    fila.appendChild(energia_calculada);

    const proteina = document.createElement('td');
    proteina.textContent = alimento.proteina;
    fila.appendChild(proteina);

    const grasa_total = document.createElement('td');
    grasa_total.textContent = alimento.grasa_total;
    fila.appendChild(grasa_total);

    const carbohidratos = document.createElement('td');
    carbohidratos.textContent = alimento.carbohidratos;    
    fila.appendChild(carbohidratos);
    
    const fibra = document.createElement('td');
    fibra.textContent = alimento.fibra;
    fila.appendChild(fibra);

    const ags = document.createElement('td');
    ags.textContent = alimento.ags;
    fila.appendChild(ags);

    const agm = document.createElement('td');
    agm.textContent = alimento.fibra;
    fila.appendChild(agm);

    const agpi = document.createElement('td');
    agpi.textContent = alimento.agm;
    fila.appendChild(agpi);

    const colesterol = document.createElement('td');
    colesterol.textContent = alimento.colesterol;
    fila.appendChild(colesterol);

    const calcio = document.createElement('td');
    calcio.textContent = alimento.calcio;
    fila.appendChild(calcio);

    const fosforo = document.createElement('td');
    fosforo.textContent = alimento.fosforo;
    fila.appendChild(fosforo);

    const hierro = document.createElement('td');
    hierro.textContent = alimento.hierro;
    fila.appendChild(hierro);

    const potasio = document.createElement('td');
    potasio.textContent = alimento.potasio;
    fila.appendChild(potasio);

    const sodio = document.createElement('td');
    sodio.textContent = alimento.sodio;
    fila.appendChild(sodio);

    const zinc = document.createElement('td');
    zinc.textContent = alimento.zinc;
    fila.appendChild(zinc);

    const vitamina_c = document.createElement('td');
    vitamina_c.textContent = alimento.vitamina_c;
    fila.appendChild(vitamina_c);

    const vitamina_a = document.createElement('td');
    vitamina_a.textContent = alimento.vitamina_a;
    fila.appendChild(vitamina_a);

    const folatos = document.createElement('td');
    folatos.textContent = alimento.folatos;
    fila.appendChild(folatos);

    const vitamina_b12 = document.createElement('td');
    vitamina_b12.textContent = alimento.vitamina_b12;
    fila.appendChild(vitamina_b12);

    valores_tbody.appendChild(fila);

    valores.appendChild(valores_tbody);

    alimentos_seleccionados[alimento.nombre] = Object.assign({}, alimento);

    calculoActualizarValores(alimento, 100, 1, energia_calculada, proteina, grasa_total, carbohidratos, fibra,
      ags, agm, agpi, colesterol, calcio, fosforo, hierro, potasio, sodio, zinc, vitamina_c, vitamina_a, folatos, vitamina_b12);

  }
        
  actualizarTotal(alimentos_seleccionados);
  calcular();
}

function actualizarTotal(alimentos_seleccionados){
  aux_alimento = "";
  aux_energia_calculada = 0.0;
  aux_proteina = 0.0;
  aux_grasa_total = 0.0;
  aux_carbohidratos = 0.0;
  aux_fibra = 0.0;
  aux_ags = 0.0;
  aux_agm = 0.0;
  aux_agpi = 0.0;
  aux_colesterol = 0.0;
  aux_calcio = 0.0;
  aux_fosforo = 0.0;
  aux_hierro = 0.0;
  aux_potasio = 0.0;
  aux_sodio = 0.0;
  aux_zinc = 0.0;
  aux_vitamina_c = 0.0;
  aux_vitamina_a = 0.0;
  aux_folatos = 0.0;
  aux_vitamina_b12 = 0.0;

  for (const clave in alimentos_seleccionados) {
    aux_energia_calculada += parseFloat(alimentos_seleccionados[clave].energia_calculada);
    aux_proteina += parseFloat(alimentos_seleccionados[clave].proteina);
    aux_grasa_total += parseFloat(alimentos_seleccionados[clave].grasa_total);
    aux_carbohidratos += parseFloat(alimentos_seleccionados[clave].carbohidratos);
    aux_fibra += parseFloat(alimentos_seleccionados[clave].fibra);
    aux_ags += parseFloat(alimentos_seleccionados[clave].ags);
    aux_agm += parseFloat(alimentos_seleccionados[clave].agm);
    aux_agpi += parseFloat(alimentos_seleccionados[clave].agpi);
    aux_colesterol += parseFloat(alimentos_seleccionados[clave].colesterol);
    aux_calcio += parseFloat(alimentos_seleccionados[clave].calcio);
    aux_fosforo += parseFloat(alimentos_seleccionados[clave].fosforo);
    aux_hierro += parseFloat(alimentos_seleccionados[clave].hierro);
    aux_potasio += parseFloat(alimentos_seleccionados[clave].potasio);
    aux_sodio += parseFloat(alimentos_seleccionados[clave].sodio);
    aux_zinc += parseFloat(alimentos_seleccionados[clave].zinc);
    aux_vitamina_c += parseFloat(alimentos_seleccionados[clave].vitamina_c);
    aux_vitamina_a += parseFloat(alimentos_seleccionados[clave].vitamina_a);
    aux_folatos += parseFloat(alimentos_seleccionados[clave].folatos);
    aux_vitamina_b12 += parseFloat(alimentos_seleccionados[clave].vitamina_b12);

  }


  const energia_calculada_total = document.getElementById('energia_calculada_total');
  const proteina_total = document.getElementById('proteina_total');
  const grasa_total_total = document.getElementById('grasa_total');
  const carbohidratos_total = document.getElementById('carbohidratos_total');
  const fibra_total = document.getElementById('fibra_total');
  const ags_total = document.getElementById('ags_total');
  const agm_total = document.getElementById('agm_total');
  const agpi_total = document.getElementById('agpi_total');
  const colesterol_total = document.getElementById('colesterol_total');
  const calcio_total = document.getElementById('calcio_total');
  const fosforo_total = document.getElementById('fosforo_total');
  const hierro_total = document.getElementById('hierro_total');
  const potasio_total = document.getElementById('potasio_total');
  const sodio_total = document.getElementById('sodio_total');
  const zinc_total = document.getElementById('zinc_total');
  const vitamina_c_total = document.getElementById('vitamina_c_total');
  const vitamina_a_total = document.getElementById('vitamina_a_total');
  const folatos_total = document.getElementById('folatos_total');
  const vitamina_b12_total = document.getElementById('vitamina_b12_total');

  energia_calculada_total.textContent = aux_energia_calculada.toFixed(2);
  proteina_total.textContent = aux_proteina.toFixed(2);
  grasa_total_total.textContent = aux_grasa_total.toFixed(2);
  carbohidratos_total.textContent = aux_carbohidratos.toFixed(2);
  fibra_total.textContent = aux_fibra.toFixed(2);
  ags_total.textContent = aux_ags.toFixed(2);
  agm_total.textContent = aux_agm.toFixed(2);
  agpi_total.textContent = aux_agpi.toFixed(2);
  colesterol_total.textContent = aux_colesterol.toFixed(2);
  calcio_total.textContent = aux_calcio.toFixed(2);
  fosforo_total.textContent = aux_fosforo.toFixed(2);
  hierro_total.textContent = aux_hierro.toFixed(2);
  potasio_total.textContent = aux_potasio.toFixed(2);
  sodio_total.textContent = aux_sodio.toFixed(2);
  zinc_total.textContent = aux_zinc.toFixed(2);
  vitamina_c_total.textContent = aux_vitamina_c.toFixed(2);
  vitamina_a_total.textContent = aux_vitamina_a.toFixed(2);
  folatos_total.textContent = aux_folatos.toFixed(2);
  vitamina_b12_total.textContent = aux_vitamina_b12.toFixed(2);

}