// leer el archivo CSV de alimentos
const alimentos = [];
var alimentos_seleccionados = {};
var alimentos_total = {};
var alimentos_requerimiento = {};
var alimentos_adecuacion = {};
const baseGramos = 100;

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

    console.log(jsonData);

    for (var i = 1; i < jsonData.length; i++) {
      var row = jsonData[i];
      var nombreAlimento = row[0];
      var gramos = row[20];
      if (nombreAlimento != "Total"){
        agregarAlimentos(gramos, nombreAlimento);
      }else{
        break;
      }      
    }

  };
  reader.readAsArrayBuffer(file);

});

//Descarga alimentos
function descargar(){
  var datos = Object.values(alimentos_seleccionados);
  datos.push(alimentos_total);
  datos.push(alimentos_requerimiento);
  datos.push(alimentos_adecuacion);
  console.log(datos);
  (async() => {
    const worksheet = XLSX.utils.json_to_sheet(datos);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dates");
    XLSX.writeFile(workbook, "datos_pacientes.xlsx", { compression: true });
  })();
}
// Buscar alimentos y mostrarlos en una lista

function calcular() {
  const energia_calculada_T = document.getElementById('energia_calculada_total').textContent;
  const proteina_T = document.getElementById('proteina_total').textContent;
  const grasa_T = document.getElementById('grasa_total').textContent;
  const carbohidratos_T = document.getElementById('carbohidratos_total').textContent;
  const fibra_T = document.getElementById('fibra_total').textContent;

  alimentos_total['gramos'] = "";
  alimentos_total['nombre'] = "Total";
  alimentos_total['energia_calculada'] = energia_calculada_T;
  alimentos_total['proteina'] = (proteina_T);
  alimentos_total['grasa_total'] = (grasa_T);
  alimentos_total['carbohidratos'] = (carbohidratos_T);
  alimentos_total['fibra'] = (fibra_T);


  const energia_calculada_R = document.getElementById('input_energia_calculada_requerimiento').value;
  const proteina_R = document.getElementById('input_proteina_requerimiento').value;
  const grasa_R = document.getElementById('input_grasa_requerimiento').value;
  const carbohidratos_R = document.getElementById('input_carbohidratos_requerimiento').value;
  const fibra_R = document.getElementById('input_fibra_requerimiento').value;

  alimentos_requerimiento['gramos'] = "";
  alimentos_requerimiento['nombre'] = "Requerimiento";
  alimentos_requerimiento['energia_calculada'] = energia_calculada_R;
  alimentos_requerimiento['proteina'] = (proteina_R);
  alimentos_requerimiento['grasa_total'] = (grasa_R);
  alimentos_requerimiento['carbohidratos'] = (carbohidratos_R);
  alimentos_requerimiento['fibra'] = (fibra_R);
  

  const energia_calculada_A = document.getElementById('adecuacion_energia_calculada');
  const proteina_A = document.getElementById('adecuacion_proteina');
  const grasa_A = document.getElementById('adecuacion_grasa');
  const carbohidratos_A = document.getElementById('adecuacion_carbohidratos');
  const fibra_A = document.getElementById('adecuacion_fibra');


  energia_calculada_A.textContent = (100*energia_calculada_T/energia_calculada_R).toFixed(2) + '%';
  proteina_A.textContent = (100*proteina_T/proteina_R).toFixed(2) + '%';
  grasa_A.textContent = (100*grasa_T/grasa_R).toFixed(2) + '%';
  carbohidratos_A.textContent = (100*carbohidratos_T/carbohidratos_R).toFixed(2) + '%';
  fibra_A.textContent = (100*fibra_T/fibra_R).toFixed(2) + '%';

  alimentos_adecuacion['gramos'] = "";
  alimentos_adecuacion['nombre'] = "Porcentaje de Adecuación";
  alimentos_adecuacion['energia_calculada'] = energia_calculada_A.textContent;
  alimentos_adecuacion['proteina'] = proteina_A.textContent;
  alimentos_adecuacion['grasa_total'] = grasa_A.textContent;
  alimentos_adecuacion['carbohidratos'] = carbohidratos_A.textContent;
  alimentos_adecuacion['fibra'] = fibra_A.textContent;

}

function buscar() {
  const busqueda = document.getElementById('busqueda').value;
  const lista = document.getElementById('lista');
  lista.innerHTML = '';

  lista.classList.add('table', 'table-striped', 'table-hover', 'table-borderless');
  
  const th_nombre = document.createElement('th');
  const th_energia_calculada = document.createElement('th');
  const th_proteina = document.createElement('th');
  const th_grasa_total = document.createElement('th');
  const th_carbohidratos = document.createElement('th');
  const th_fibra = document.createElement('th');

  th_nombre.textContent = "Nombre";
  th_energia_calculada.textContent = "Energía calculada";
  th_proteina.textContent = "Proteína";
  th_grasa_total.textContent = "Grasa total";
  th_carbohidratos.textContent = "Carbohidratos";
  th_fibra.textContent = "Fibra";      

  const encabezado = document.createElement('thead');
  encabezado.classList.add('table-primary');

  encabezado.appendChild(th_nombre);
  encabezado.appendChild(th_energia_calculada);
  encabezado.appendChild(th_proteina);
  encabezado.appendChild(th_grasa_total);
  encabezado.appendChild(th_carbohidratos);
  encabezado.appendChild(th_fibra);

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

      td_nombre.textContent = alimentos[i].nombre;
      td_energia_calculada.textContent = alimentos[i].energia_calculada;
      td_proteina.textContent = alimentos[i].proteina;
      td_grasa_total.textContent = alimentos[i].grasa_total;
      td_carbohidratos.textContent = alimentos[i].carbohidratos;
      td_fibra.textContent = alimentos[i].fibra;

      const fila = document.createElement('tr');

      fila.addEventListener('click', () => agregar(baseGramos, alimentos[i]));

      fila.appendChild(td_nombre);
      fila.appendChild(td_energia_calculada);
      fila.appendChild(td_proteina);
      fila.appendChild(td_grasa_total);
      fila.appendChild(td_carbohidratos);
      fila.appendChild(td_fibra);

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

function actualizarValores(event, alimento, energia_calculada, proteina, grasa_total, carbohidratos, fibra){      
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

  var valor_energia_calculada = parseFloat(alimento.energia_calculada);
  var valor_proteina = parseFloat(alimento.proteina);
  var valor_grasa_total = parseFloat(alimento.grasa_total);
  var valor_carbohidratos = parseFloat(alimento.carbohidratos);
  var valor_fibra = parseFloat(alimento.fibra);

  alimentos_seleccionados[alimento.nombre]['gramos'] = inputGramos;
  alimentos_seleccionados[alimento.nombre]['energia_calculada'] = factor*valor_energia_calculada;
  alimentos_seleccionados[alimento.nombre]["proteina"] = factor*valor_proteina;
  alimentos_seleccionados[alimento.nombre]["grasa_total"] = factor*valor_grasa_total;
  alimentos_seleccionados[alimento.nombre]["carbohidratos"] = factor*valor_carbohidratos;
  alimentos_seleccionados[alimento.nombre]["fibra"] = factor*valor_fibra;
  
  energia_calculada.textContent = (valor_energia_calculada*factor).toFixed(2);
  proteina.textContent = (valor_proteina*factor).toFixed(2);
  grasa_total.textContent = (valor_grasa_total*factor).toFixed(2);
  carbohidratos.textContent = (valor_carbohidratos*factor).toFixed(2);
  fibra.textContent = (valor_fibra*factor).toFixed(2);


  actualizarTotal(alimentos_seleccionados);

  calcular();
}

function actualizarValores2(alimento, energia_calculada, proteina, grasa_total, carbohidratos, fibra){      
  var valor_energia_calculada = parseFloat(alimento.energia_calculada);
  var valor_proteina = parseFloat(alimento.proteina);
  var valor_grasa_total = parseFloat(alimento.grasa_total);
  var valor_carbohidratos = parseFloat(alimento.carbohidratos);
  var valor_fibra = parseFloat(alimento.fibra);
 
  console.log('alimentos_seleccionados');
  console.log(alimentos_seleccionados);
  console.log('alimentos_seleccionados[alimento.nombre]');
  console.log(alimentos_seleccionados[alimento.nombre]);
  console.log('alimento.nombre');
  console.log(alimento.nombre);
  alimentos_seleccionados[alimento.nombre]['gramos'] = parseFloat("100");
  alimentos_seleccionados[alimento.nombre]['energia_calculada'] = valor_energia_calculada;
  alimentos_seleccionados[alimento.nombre]["proteina"] = valor_proteina;
  alimentos_seleccionados[alimento.nombre]["grasa_total"] = valor_grasa_total;
  alimentos_seleccionados[alimento.nombre]["carbohidratos"] = valor_carbohidratos;
  alimentos_seleccionados[alimento.nombre]["fibra"] = valor_fibra;
  
  energia_calculada.textContent = (valor_energia_calculada).toFixed(2);
  proteina.textContent = (valor_proteina).toFixed(2);
  grasa_total.textContent = (valor_grasa_total).toFixed(2);
  carbohidratos.textContent = (valor_carbohidratos).toFixed(2);
  fibra.textContent = (valor_fibra).toFixed(2);

  actualizarTotal(alimentos_seleccionados);

  calcular();
}

function eliminar(alimento){
  var respuesta = confirm('¿Estás seguro de eliminar el alimento?');
  if (respuesta) {
    var row = document.getElementById(alimento);
    row.remove();
    delete alimentos_seleccionados[alimento];
    actualizarTotal(alimentos_seleccionados);
  }
}
// agregar un alimento a la tabla de valores nutricionales
function agregar(valorGramos, alimento) {
  if (!alimentos_seleccionados.hasOwnProperty(alimento.nombre)){
    const valores = document.getElementById('valores');
    //Crea una fila y le agrega un id.
    const fila = document.createElement('tr');
    fila.id = alimento.nombre;
    fila.addEventListener('dblclick', () => eliminar(alimento.nombre));

    const nombre = document.createElement('td');
    nombre.className = "td_principal";
    nombre.textContent = alimento.nombre;
    fila.appendChild(nombre);

    //Colocamos un elemento input en el td
    const gramos = document.createElement('td');
    const campoTexto = document.createElement('input');
    campoTexto.type = 'text';
    campoTexto.style.maxWidth = "100px";
    campoTexto.value = valorGramos;
    campoTexto.id = alimento.nombre+'_'+'input';
    campoTexto.addEventListener('keyup', (event) => actualizarValores(event, 
      alimento, energia_calculada, proteina, grasa_total, carbohidratos, fibra));

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

    valores.appendChild(fila);

    //actualizarValores2(alimento, energia_calculada, proteina, grasa_total, carbohidratos, fibra);

  }
  
  alimentos_seleccionados[alimento.nombre] = Object.assign({}, alimento);    
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

  for (const clave in alimentos_seleccionados) {
    aux_energia_calculada += parseFloat(alimentos_seleccionados[clave].energia_calculada);
    aux_proteina += parseFloat(alimentos_seleccionados[clave].proteina);
    aux_grasa_total += parseFloat(alimentos_seleccionados[clave].grasa_total);
    aux_carbohidratos += parseFloat(alimentos_seleccionados[clave].carbohidratos);
    aux_fibra += parseFloat(alimentos_seleccionados[clave].fibra);
  }
  const energia_calculada_total = document.getElementById('energia_calculada_total');
  const proteina_total = document.getElementById('proteina_total');
  const grasa_total_total = document.getElementById('grasa_total');
  const carbohidratos_total = document.getElementById('carbohidratos_total');
  const fibra_total = document.getElementById('fibra_total');

  energia_calculada_total.textContent = aux_energia_calculada.toFixed(2);
  proteina_total.textContent = aux_proteina.toFixed(2);
  grasa_total_total.textContent = aux_grasa_total.toFixed(2);
  carbohidratos_total.textContent = aux_carbohidratos.toFixed(2);
  fibra_total.textContent = aux_fibra.toFixed(2);
}