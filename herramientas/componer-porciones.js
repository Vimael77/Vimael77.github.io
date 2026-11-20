// deno run --allow-read --allow-write --allow-run --allow-env=USFQ_BROWSER herramientas/componer-porciones.js reglas.json carpeta-de-fuentes carpeta-de-destino
// Reglas: [{id, tipo, cantidad, medida}]. Cada fuente es una ilustración generada:
// textura para recipientes/cucharas, UNA pieza para recuentos o el corte ya porcionado para «directa».
// Todo se compone sin red. Las cantidades se dibujan con Canvas, no se estiman a partir de píxeles.
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { Buffer } from "node:buffer";

// Función autónoma: se ejecuta en Chromium, con las imágenes de un lote ya decodificadas.
function componer(img, { tipo, cantidad, medida }) {
  const canvas = document.createElement("canvas");
  canvas.width = 400; canvas.height = 320;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.lineJoin = "round"; ctx.lineCap = "round"; ctx.imageSmoothingQuality = "high";
  const pieza = tipo === "piezas" || tipo === "directa";
  const cuchara = tipo === "cda" || tipo === "cdta";
  const n = tipo === "directa" ? 1 : Math.ceil(cantidad);
  const textura = (x, y, w, h) => {
    // Se usa un recorte central de la textura, no una fotografía en miniatura de otro recipiente.
    const sw = img.naturalWidth, sh = img.naturalHeight;
    const lado = Math.min(sw, sh) * 0.77;
    ctx.drawImage(img, (sw - lado) / 2, (sh - lado) / 2, lado, lado, x, y, w, h);
  };
  const trazo = (d, color, ancho) => {
    ctx.strokeStyle = color; ctx.lineWidth = ancho;
    ctx.stroke(new Path2D(d));
  };
  const degradado = (x, y, x2, y2, desde, hasta) => {
    const grad = ctx.createLinearGradient(x, y, x2, y2);
    grad.addColorStop(0, desde); grad.addColorStop(1, hasta); return grad;
  };
  const fraccion = (i) => Math.min(1, cantidad - i);
  // Los recortes de cada unidad se ajustan al alimento: media unidad no es medio fondo blanco.
  function limites() {
    const prueba = document.createElement("canvas"); prueba.width = prueba.height = 96;
    const p = prueba.getContext("2d", { willReadFrequently: true });
    p.drawImage(img, 0, 0, 96, 96);
    const pixels = p.getImageData(0, 0, 96, 96).data;
    let iz = 96, der = -1, arriba = 96, abajo = -1;
    for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) {
      const pos = (y * 96 + x) * 4;
      if (pixels[pos + 3] > 64 && Math.min(pixels[pos], pixels[pos+1], pixels[pos+2]) < 217) {
        iz = Math.min(iz,x); der = Math.max(der,x); arriba = Math.min(arriba,y); abajo = Math.max(abajo,y);
      }
    }
    if (der <= iz || abajo <= arriba) return [0,0,img.naturalWidth,img.naturalHeight];
    const sx = img.naturalWidth / 96, sy = img.naturalHeight / 96;
    iz = Math.max(0,iz-2); arriba = Math.max(0,arriba-2); der = Math.min(96,der+3); abajo = Math.min(96,abajo+3);
    return [iz*sx, arriba*sy, (der-iz)*sx, (abajo-arriba)*sy];
  }
  const limitesUnidad = pieza ? limites() : null;
  function unidad(x,y,w,h,f) {
    const [sx,sy,sw,sh] = limitesUnidad;
    const escala = Math.min(w/sw, h/sh);
    const dw = sw*escala, dh = sh*escala;
    // Una porción fraccionaria aislada ya viene cortada en la ilustración generada.
    const parte = tipo === "directa" ? 1 : f;
    ctx.drawImage(img, sx, sy, sw*parte, sh, x - dw*parte/2, y-dh/2, dw*parte, dh);
  }
  function cucharaLlena(f) {
    // Vista superior del hueco y mango; «colmada» lleva una silueta de alimento más alta.
    const mango = new Path2D("M60 28 Q85 26 145 20 Q158 19 158 26 Q157 31 148 32 L62 39 Z");
    ctx.fillStyle = degradado(0,20,0,40,"#a5b8b8","#eaf0ef"); ctx.fill(mango);
    ctx.strokeStyle = "#91a6a5"; ctx.lineWidth = 1.5; ctx.stroke(mango);
    const base = new Path2D(); base.ellipse(36,34,32,21,-0.10,0,2*Math.PI);
    ctx.fillStyle = degradado(6,15,65,54,"#edf2f1","#9dafaf"); ctx.fill(base);
    ctx.strokeStyle = "#8ca09f"; ctx.stroke(base);
    const alto = /colmad/i.test(medida) ? 23 : 17;
    const comida = new Path2D(); comida.ellipse(36,32-(alto-17),28.5,alto,-0.10,0,2*Math.PI);
    ctx.save(); ctx.clip(comida); ctx.beginPath(); ctx.rect(4,0,3+57*f,64); ctx.clip();
    textura(3,2,67,56); ctx.restore();
    if(f===1){ctx.strokeStyle="rgba(84,89,72,.25)";ctx.lineWidth=.9;ctx.stroke(comida);}
  }
  function recipiente(f) {
    const taza = tipo === "taza", bowl = tipo === "bowl";
    const iz = taza ? 17 : 24, der = taza ? 111 : 108, techo = 14, piso = 110;
    const vaso = bowl
      ? new Path2D("M4 30 L124 30 Q117 106 74 110 L55 110 Q13 105 4 30 Z")
      : new Path2D(`M${iz} ${techo} L${der} ${techo} L${der} 103 Q${der} 110 ${der-7} 110 L${iz+7} 110 Q${iz} 110 ${iz} 103 Z`);
    if(taza) {
      const asa = "M112 32 C152 20 151 83 112 82";
      trazo(asa,"#809da0",10); trazo(asa,"#e2eeef",6);
    }
    ctx.fillStyle = degradado(iz,techo,der,piso,"#fbfdfd","#e2edef"); ctx.fill(vaso);
    // El vaso y la taza tienen paredes rectas (la altura es proporcional al volumen).
    // Para un bowl hemisférico se invierte el volumen normalizado del casquete.
    let nivel = f;
    if (bowl) {
      let a=0,b=1; for(let i=0;i<22;i++){const h=(a+b)/2;if(h*h*(3-h)/2<f)a=h;else b=h;}
      nivel=(a+b)/2;
    }
    const y = piso - (piso-(bowl?30:techo))*nivel;
    ctx.save(); ctx.clip(vaso); ctx.beginPath();ctx.rect(0,y,150,piso-y+2);ctx.clip();
    textura(0,techo,135,piso-techo);
    ctx.fillStyle=degradado(0,y,0,piso,"rgba(255,255,255,0)","rgba(68,73,49,.10)");
    ctx.fillRect(0,y,150,piso-y+2);ctx.restore();
    if(f===1 && /colmad/i.test(medida)) {
      const monte=new Path2D(`M${iz},${techo+1} Q${(iz+der)/2},-9 ${der},${techo+1} Z`);
      ctx.save();ctx.clip(monte);textura(0,-10,135,piso+20);ctx.restore();
    }
    ctx.strokeStyle="#647d80";ctx.lineWidth=2.2;ctx.stroke(vaso);
    if(!bowl) {
      trazo(`M${iz+5} 20 L${iz+5} 98`,"rgba(255,255,255,.72)",2.5);
      for(let j=1;j<8;j++) {
        const y0=piso-(piso-techo)*j/8, d=`M${der-(j%2?6:10)} ${y0} L${der} ${y0}`;
        trazo(d,"#f6f9f8",2.8); trazo(d,"#4a686b",1.1);
      }
    }
  }
  let ancho = pieza ? 104 : cuchara ? 164 : 150;
  let alto = pieza ? 100 : cuchara ? 65 : 124;
  let cols=1, mejor=0;
  for(let c=1;c<=n;c++) {
    const zoom=Math.min(372/(c*ancho),284/(Math.ceil(n/c)*alto));
    if(zoom>mejor){mejor=zoom;cols=c;}
  }
  const filas=Math.ceil(n/cols), cw=ancho*mejor, ch=alto*mejor;
  for(let i=0;i<n;i++) {
    const fila=Math.floor(i/cols), columnasFila=Math.min(cols,n-fila*cols);
    const x=200 - columnasFila*cw/2 + (i%cols+.5)*cw, y=160-filas*ch/2+(fila+.5)*ch;
    if(pieza) {unidad(x,y,cw*.94,ch*.91,fraccion(i));continue;}
    ctx.save();ctx.translate(x-cw*.46,y-ch*.46);ctx.scale(mejor*.92,mejor*.92);
    if(cuchara)cucharaLlena(fraccion(i));else recipiente(fraccion(i));ctx.restore();
  }
  return canvas.toDataURL("image/webp",.89).split(",")[1];
}

async function ejecutar() {
  const [reglas, fuente, salida] = Deno.args;
  if (!salida || Deno.args.length !== 3) throw Error("Uso: componer-porciones.js reglas.json carpeta-fuentes carpeta-destino");
  if(resolve(fuente)===resolve(salida)) throw Error("Usa carpetas separadas para las fuentes y las porciones.");
  const lista = JSON.parse(await Deno.readTextFile(reglas));
  const ids = new Set(), tipos = new Set(["taza","vaso","bowl","cda","cdta","piezas","directa"]);
  if (!Array.isArray(lista) || !lista.length) throw Error("La lista de reglas está vacía.");
  for(const {id,tipo,cantidad,medida} of lista) {
    if(typeof id!=="string" || !/^[a-z0-9_-]+$/.test(id) || ids.has(id) || !tipos.has(tipo) ||
        typeof medida!=="string" || !Number.isFinite(cantidad) || cantidad<=0 || cantidad>50)
      throw Error("Regla inválida: "+id);
    ids.add(id);
  }
  let navegador = Deno.env.get("USFQ_BROWSER");
  if(!navegador && Deno.build.os==="windows") for(const ruta of [
    "C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ]) {try {if((await Deno.stat(ruta)).isFile){navegador=ruta;break;}}catch(e){if(!(e instanceof Deno.errors.NotFound))throw e;}}
  navegador ||= Deno.build.os === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : "chromium";
  const temporal=await Deno.makeTempDir({prefix:"porcion-usfq-"}), salidas=[];
  try {
    const ruta=join(temporal,"generar.html");
    for(let j=0;j<lista.length;j+=40) {
      const lote=lista.slice(j,j+40);
      const imagenes=await Promise.all(lote.map(async ({id})=>{
        const base=Buffer.from(await Deno.readFile(join(fuente,id+".webp"))).toString("base64");
        return '<img src="data:image/webp;base64,'+base+'">';
      }));
      await Deno.writeTextFile(ruta,'<!doctype html><meta charset="utf-8"><body>'+imagenes.join("")+'<script>window.onload=()=>{try{const r='+JSON.stringify(lote).replace(/</g,"\\u003c")+'; const a=Array.from(document.images,(im,i)=>{if(!im.naturalWidth)throw Error(r[i].id);return ('+componer.toString()+')(im,r[i]);});document.body.replaceChildren();const e=document.createElement("output");e.textContent=JSON.stringify(a);document.body.append(e);}catch(err){document.body.textContent="Error de composición: "+err;}};</script>');
      const {code,stdout,stderr}=await new Deno.Command(navegador,{args:["--headless","--disable-gpu","--disable-background-networking","--disable-extensions","--no-first-run","--user-data-dir="+join(temporal,"perfil"),"--dump-dom",pathToFileURL(ruta).href],stdout:"piped",stderr:"piped"}).output();
      const dom=new TextDecoder().decode(stdout), match=dom.match(/<output>([^<]+)<\/output>/);
      if(code!==0 || !match) throw Error("Falló la composición del lote "+j+": "+(dom.match(/Error de composición:[^<]*/)?.[0] || new TextDecoder().decode(stderr).slice(-400)));
      const imgs=JSON.parse(match[1]);if(imgs.length!==lote.length) throw Error("Lote incompleto.");
      for(const b64 of imgs) {
        const bytes=Buffer.from(b64,"base64");
        if(bytes.toString("ascii",8,12)!=="WEBP")throw Error("Chromium no produjo WebP.");
        salidas.push(bytes);
      }
    }
    // No reemplazar resultados parciales si faltó una ilustración o falló la composición.
    await Deno.mkdir(salida,{recursive:true});
    for(let i=0;i<lista.length;i++) await Deno.writeFile(join(salida,lista[i].id+".webp"),salidas[i]);
    console.log(salidas.length+" porciones compuestas en "+resolve(salida));
  } finally {await Deno.remove(temporal,{recursive:true});}
}
if(import.meta.main) await ejecutar();
