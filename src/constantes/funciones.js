import {const_procesos, nuevo_Valores, Ver_Valores} from '../constantes';
import moment from 'moment';
// import {categoria_usuario} from '../../constantes/datos';
// import {categorias} from '../datos/usuarios';
// localStorage.setItem(const_procesos.dir_config,null);
import {conexiones} from './conexiones';
import {encriptado} from './encriptado';
import {ExcelRenderer} from 'react-excel-renderer';
import { read, utils, writeFile, writeFileXLSX } from 'xlsx';

let categoria_usuario;

export const Moneda = (valor, moneda='Bs', mostrar=true, digitos=2)=>{
  
  if (moneda==='Bs'){
    const fBolivar = new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'VED',
      minimumFractionDigits: digitos
    })
    let resultado = fBolivar.format(valor);
    resultado = resultado.replace('VED',mostrar ? 'Bs.' : '')
    return resultado
  }else{
    const fDolar = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: digitos
    })
    let resultado = fDolar.format(valor);
    resultado = resultado.replace('$', mostrar ? '$' : '');
    return resultado
  }
}
export const formatoBolivar = new Intl.NumberFormat('es-VE', {
  style: 'currency',
  currency: 'VED',
  minimumFractionDigits: 2
})

export const formatoDolar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2
})

export const Inicio_api=async(nombre)=>{
  const api= {
    "_id":  "64597bdae55399730ed2f3ae",
    "seq_chs": 1,
    "api": "uecla",
    "key": "e4af0a575c60757ad2ee006a9d352f533c349a5bc37e38cc6c76cafbdf95b9b7",
    "cod_chs": "e4af0a575c60757ad2ee006a9d352f533c349a5bc37e38cc6c76cafbdf95b9b7",
    "master": false,
    "hash_chs": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb2RfY2hzIjoiZTRhZjBhNTc1YzYwNzU3YWQyZWUwMDZhOWQzNTJmNTMzYzM0OWE1YmMzN2UzOGNjNmM3NmNhZmJkZjk1YjliNyIsImFwaSI6Indlc2lfY2hzX3NlcnZlciIsImtleSI6ImU0YWYwYTU3NWM2MDc1N2FkMmVlMDA2YTlkMzUyZjUzM2MzNDlhNWJjMzdlMzhjYzZjNzZjYWZiZGY5NWI5YjciLCJpYXQiOjE2ODM1ODYwMTB9.Q0OCOKH5w9jh0hHaIGdF1UZRw-rV0ixc9rkxWNoHtfA",
  }
  //await conexiones.Ver_api(nombre);
  // let archivo='data/datos.js';
  // const respuesta = await conexiones.Leer_data(archivo, api);
  nuevo_Valores({[nombre]:{api}})
  return {api}
}
export const Estadolinea = ()=>{
  const estado = navigator.onLine ? true : false;
  nuevo_Valores({online: estado});
  console.log('Estado de linea', estado);
  return estado
}
export const Inicio=async()=>{
  //si se cambia wesi_chs_server hay que cambiarlo en conexiones
  Tasa_cambio({})
  let valores = await fetch("utilidad/json/config.json")
  .then(response => response.json())
  .then(datos => {
    return datos
  })
  .catch(err => {
    console.log(err);
    // this.setState({cargando:false, progreso:0})
    return {}
  } );
  let dir = window.location.protocol;
  if (dir==='http:'){
    valores.http = valores.http;
  }else{
    valores.http = valores.https
  }
  // valores.http = process.env.REACT_APP_HTTP ? process.env.REACT_APP_HTTP : valores.http;
  let config = await fetch(`utilidad/json/Api_${valores.app}.json`)
      .then(response => response.json())
      .then(datos => {
        return datos
      })
      .catch(err => {
        console.log(err);
        // this.setState({cargando:false, progreso:0})
        return {}
      } );
  //implementado para verificar si es electron
  let tipo = 'Web';
  try{
    // const remote = require('electron').remote;
    window.verificar.verificar()
    tipo='Electron';
  }catch(e){
    // console.log('sin electron')
  }
  nuevo_Valores({tipo, valores});
  const api= await conexiones.Ver_api(valores.app);
  window.addEventListener('online', Estadolinea);
  window.addEventListener('offline', Estadolinea);
  //   await localStorage.setItem(const_procesos.dir_config,respuesta.datos);
  
  categoria_usuario= config.Listas.lista_categoria;
  // console.log(config, categoria_usuario)
  nuevo_Valores({config, categoria_usuario, api, valores})
  return config
}
export const Tasa_cambio = async(props)=>{
  let {dato, status}= props;
  status = status===undefined ? 'Leer' : status;
  if (status==='Leer'){
    try{
      let tasa = await localStorage.getItem(const_procesos.dir_tasa);
      if (tasa!==null){
        tasa= JSON.parse(tasa);
        tasa =  tasa.tasa ? tasa.tasa : tasa;
        nuevo_Valores({tasa})
      }
      console.log('>>>>>>>>Tasa de cambio',tasa)
      return tasa
    }catch(error){
      return null
    }
  }else if (status==='Guardar'){
    localStorage.setItem(const_procesos.dir_tasa, JSON.stringify(dato.tasa));
  }
}
export const Usuario = async(props)=>{
  let {status,dato, api} = props ? props : {}
  status = status===undefined ? 'Leer' : status;
  api = api===undefined ? '' : `_${api}`;
  console.log('>>>>>>>>>>>>>>>>>>',const_procesos.dir_user+api)
  if (status==='Leer'){
    try{
      let User = await localStorage.getItem(const_procesos.dir_user+api);
      if (User!==null) 
        User = await encriptado.desencriptado(User);
      User = JSON.parse(User);
      conexiones.Inicio(User);
      nuevo_Valores({User});
      return User
    }catch(error){
      return null
    }
  }else if (status==='Guardar'){
    conexiones.Inicio(dato)
    let User= await encriptado.Encriptado(JSON.stringify(dato));
    localStorage.setItem(const_procesos.dir_user+api, User);
  }else{
    localStorage.setItem(const_procesos.dir_user+api,null);
    conexiones.Inicio(null)
  }  
  
}
export const MaysPrimera=(string)=>{
  let lista = string.split(' ');
  let resulta = '';
  for (var i=0; i<lista.length; i++){
    resulta+= lista[i].charAt(0).toUpperCase()+ lista[i].slice(1) + ' ';
  }
  return resulta;
  // return string.charAt(0).toUpperCase() + string.slice(1);
}

export const ArrayMaysPrimera=(datos)=>{
  return datos.map((valor)=> MaysPrimera(valor))
}

export const Titulo_default=(datos)=>{
  return Object.keys(datos).map((valor)=> {
    // if (valor === 'categoria') {
    //   return { title: MaysPrimera(valor), field: valor, lookup: categorias }
    // }else
    if (['createdAt','updatedAt','fecha', 'Fecha'].indexOf(valor)!==-1){
      return { title: MaysPrimera(valor), field: valor , editable: 'never' , fecha:true}
    }else if (['_id','__v','createdAt','updatedAt',
               'actualizado', 'cod_chs', 'seq_chs', 'hash_chs'].indexOf(valor)!==-1){
      return { title: MaysPrimera(valor), field: valor , editable: 'never'}
    }else{
      return { title: MaysPrimera(valor), field: valor }
    }
  })
}

export const Permiso =  async(accion, api, superadmin=false, Categoria = null) =>{
  let User = api ? await Usuario({api}) : await Usuario()//JSON.parse(localStorage.getItem(const_procesos.dir_user));
  if (User===null) return false
  let categoria = Categoria ? Categoria: api ? Ver_Valores()['config']['Listas'][`lista_${api}_categoria`] : categoria_usuario;
  categoria = categoria.map(val=>{
    return {...val, permisos: typeof val.permisos==='string' ? val.permisos.split(',') : val.permisos}
  })
  User.categoria = typeof User.categoria==='object' ? User.categoria._id : User.categoria;
  let resultado=categoria.filter(lis => String(lis._id)===String(User.categoria));
  if (!superadmin) {
    if (resultado.length!==0 && resultado[0].permisos!==undefined &&
          (resultado[0].permisos.indexOf(accion)!==-1 || resultado[0].permisos.indexOf('*')===0)
        ) {
        
      return true;

    }else {
      return false;
    }
  }else{
    if (resultado.length!==0 && resultado[0].permisos!==undefined && resultado[0].permisos.indexOf('**')===1) {
      return true;
    }else{
      return false;
    }
  }


}

export const Quitar_valores = (props) =>{
  const {datos,quitar}=props;
  let resultado={}
  Object.keys(datos).map((campo)=>{
    if (quitar.indexOf(campo)===-1){
      resultado={...resultado,[campo]:datos[campo]};
    }
    return campo;
  })
  return resultado;
}

export const Resultado_encontrados = (datos,valor) =>{
  let resultado=[];
  
  if (datos !== undefined && datos.length!==0)
    datos.map((dato)=>{
      
      if (Ver_igualdad(dato,valor)){
        resultado.push(dato);
      }
      return valor;
    })
  return resultado
}


export const Ver_igualdad = (dato, valor)=>{
    
    if (dato=== null || dato ===undefined)
      return false;
    const campos= Object.keys(dato);
    delete dato['$setOnInsert']
    const no=['password','passwordA','token'];
    let resultado=false;
    
    try{
     campos.map((campo)=>{
       if (typeof dato[campo]==='object' && dato[campo]!==null){
          
          if (dato[campo].length){
            dato[campo].map( val=>{
              if (Ver_igualdad(val,valor)){
                resultado=true;
              }
              return val
            })
          }else{
            if (Ver_igualdad(dato[campo],valor)){
              resultado=true;
            }
          }
        }
       const val= '' + dato[campo];
       if ((no.indexOf(campo)===-1 && val.toLowerCase().indexOf(valor.toLowerCase())!==-1)|| valor===''){
         resultado=true;
       }
       return campo
     })
    }catch(error) {
      console.log('Ver_igualdad',error, dato, valor, campos);
      
    }
    return resultado;
}

export const Resultado_encontrados_k = (datos,valor) =>{
  let resultado=[];
  datos.map((dato)=>{
    if (Ver_igualdad_K(dato,valor)){
      resultado.push(dato);
    }
    return valor;
  })
  return resultado
}

export const Resultado_encontrados_k_p = (datos,valor) =>{
  let resultado=-1;
  for(let i=0; i<datos.length;i++){
    if (Ver_igualdad_K(datos[i],valor)){
      resultado=i;
      break;
    }

  }
  return resultado
}

export const Ver_igualdad_K = (dato, valor)=>{
    const campos= Object.keys(valor);
    let resultado=false;
    let cont=0;
     campos.map((campo)=>{
       if (''+dato[campo]===''+valor[campo]){
         cont++;
       }
       return campo
     })

     if (cont>=campos.length){
       resultado=true;
     }
    return resultado;
}

export const Buscar_array = (datos,valor) => {
  let resultado=[];
  datos.map((dato)=>{
    let igual =0;

    valor.map((v,i)=> {
      if (v===dato[i]) {
        igual++;
      }
      return v;
    })
    if (igual===valor.length){
      resultado.push(dato);
    }

    return dato;
  })
  return resultado;
}
export const Buscar_array_posicion = (datos,valor) => {
  let resultado=-1;
  for (let i=0;i < datos.length;i++){

      if (valor===datos[i][0]){
        resultado=i;
        break;
      }
  }
  return resultado;
}

export const Paginas = (props) =>{
  let rdatos=[];
  let paginas=[1];
  // let cont=0;
  // let contp=2;
  const {datos,cantp,pagina,buscar, ctotal}=props;
  const inicio=cantp*(pagina-1);
  const fin=inicio+cantp;
  const datosE=Resultado_encontrados(datos,buscar);
  
  for (var i=0;i<datosE.length;i++){
    if (i>inicio-1 && i < fin){
        rdatos.push({...datosE[i],id:i+1});
    }
   
  }
  
  paginas=[1];
  const ttotal= ctotal ? ctotal : datosE.length
  for ( i=2; i<(ttotal/cantp)+1;i++){
    paginas.push(i);
  }
  
  const comienza=inicio+1;
  const finaliza= ttotal< fin ? ttotal : fin;
  const total='('+comienza+' al '+finaliza+') <> (Total:'+ttotal+')';
  return {datos:rdatos,paginas:paginas,total:total}

}
//Abrir Archivo excell
export const Excell = async(archivo)=>{
  // console.log(archivo.target.files[0])
  let resultados_xlsx = {};
  const promise = new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(archivo.target.files[0]);

    fileReader.onload = (e) => {
      const bufferArray = e.target.result;

      const wb = read(bufferArray, { type: "buffer" });

      const wsname = wb.SheetNames[0];

      resultados_xlsx.paginas= wb.SheetNames.map((val,i)=>{
        return {id:i, titulo:val }
      });
      resultados_xlsx.datos = {};
      wb.SheetNames.map(val=>{
        const w = wb.Sheets[val];
        const rows = utils.sheet_to_json(w, { header: 1 });
        /* column objects are generated based on the worksheet range */
        const range = utils.decode_range(w["!ref"]||"A1");
        const cols = Array.from({ length: range.e.c + 1 }, (_, i) => ({
          /* for an array of arrays, the keys are "0", "1", "2", ... */
          key: String(i),
          /* column labels: encode_col translates 0 -> "A", 1 -> "B", 2 -> "C", ... */
          name: utils.encode_col(i)
        }));
        resultados_xlsx.datos[val]={cols, rows}
        return val
      })
      // const ws = wb.Sheets[wsname];

      // const data = utils.sheet_to_json(ws);
      
      // const rows = utils.sheet_to_json(ws, { header: 1 });

      // /* column objects are generated based on the worksheet range */
      // const range = utils.decode_range(ws["!ref"]||"A1");
      // const columns = Array.from({ length: range.e.c + 1 }, (_, i) => ({
      //   /* for an array of arrays, the keys are "0", "1", "2", ... */
      //   key: String(i),
      //   /* column labels: encode_col translates 0 -> "A", 1 -> "B", 2 -> "C", ... */
      //   name: utils.encode_col(i)
      // }));
      
      resolve(resultados_xlsx);
      // console.log(data[0])
      // this.setState({
      //   file: data,
      // });

      // console.log(this.state);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });

  resultados_xlsx = await promise.then((d) => {
    console.log(d)
    return d
    
  });
  
  // let resultado={}
  let fileObj = archivo.target.files[0];
  // const wb = XLSX.read(bufferArray, { type: "buffer" });
  // console.log(wb)
  //just pass the fileObj as parameter
  // await ExcelRenderer(fileObj, (err, resp) => {
  //   if(err){
  //     console.log(err);            
  //   }
  //   else{
  //     console.log(resp)
  //     resultado={
  //       cols: resp.cols,
  //       rows: resp.rows,
  //     };
  //     return {filename: fileObj.name , datos:resultado}
  //   }
  //   return {filename: fileObj.name , datos:resultado}
  // });
  
  return {filename: fileObj.name , datos:resultados_xlsx}
}
//Guardar de json a excell
export const AExcell = async(data, pagina='Hoja 1', archivo='uecla.xlsx')=>{
  const wb =utils.book_new(), ws=utils.json_to_sheet(data);
  utils.book_append_sheet(wb,ws,pagina);
  let tamano = Object.keys(data[0]).map((key,i)=>{
    const max_width1 = data.reduce((w, r) => Math.max(w, String(r[key]).length), 10);
    return {wch: max_width1+1}
  })
  ws["!cols"] = tamano;
  writeFile(wb,archivo,{ compression: true }); 
}
export const ReporteExcell =async(data, Inicio, Fin, pagina='Reporte', archivo='reporte.xlsx')=>{

  let datos =[
    {
      No:'', fecha:'', representante:'', cedular:'', recibo:'', total:'',
      mensualidad:'', anterior:'', abono:'', diferido:'',tmensualidad:'',otro:'',
      cedula:'', nombres: ``,
      inscripcion:'', septiembre:'',octubre:'',noviembre:'',
      diciembre:'',enero:'',febrero:'',marzo:'', abril:'',
      mayo:'',junio:'', julio:'',agosto:'', tasa:'',
    },
    
  ]
  const agregar = datos[0];
  for (var i=0;i<3;i++){
      datos=[...datos, agregar];
  }
  datos=[
    ...datos,
    {
      No:"No.", fecha:"Fecha", representante:"Representante", cedular:"R.I.F.", recibo:"Recibo", total:"Factura",
      mensualidad:"Mensualidad", anterior:"Abono Aterior", abono:"Abono", diferido:"Diferido",tmensualidad:"Mensualidad",otro:'',
      cedula:"Estudiante", nombres: "Nombres y Apellidos",
      inscripcion:"Inscip.", septiembre:"Sep",octubre:"Oct",noviembre:"Nov",
      diciembre:"Dic",enero:"Ene",febrero:"Feb",marzo:"Mar", abril:"Abr",
      mayo:"May",junio:'Jun', julio:'Jul',agosto:'Ago', tasa:'Bs/$',
    }
  ]
  
  data.map((dato,i)=>{
    const fecha = moment(dato.valores.fecha).format('DD/MM/YYYY');
    const recibo = dato.valores.recibo;
    const cedular = dato.valores.representante.cedula;
    const representante = `${dato.valores.representante.nombres} ${dato.valores.representante.apellidos}`;
    const total = Number(dato.valores.totales.total).toFixed(2);
    const tasa = dato.valores.valorcambio;
    const tmensualidad = Number(dato.valores.subtotalvalor.total).toFixed(2);
    let meses=[];
    let abono = 0.00;
    let abono_anterior=0.00;
    let mensualidad = 0.00;
    dato.valores.mensualidades.meses.map(mes=>{
        if (mes.value==='abono_anterior'){
            abono_anterior=Number(mes.monto).toFixed(2);
        }
        if(mes.value==='abono'){
            console.log(recibo, mes.value, mes.monto)
            abono=Number(mes.monto).toFixed(2);
        }
        return mes
    })
    dato.valores.mensualidades.meses.map(mes=>{
      let pos = meses.findIndex(f=>f.cedula===mes.cedula);
      if (pos===-1 && mes.value!=='abono_anterior' && mes.value!=='abono'){
          meses=[...meses,{
              cedula:mes.cedula, nombres: `${mes.nombres} ${mes.apellidos}`,
              inscripcion:'', septiembre:'',octubre:'',noviembre:'',
              diciembre:'',enero:'',febrero:'',marzo:'', abril:'',
              mayo:'',junio:'', julio:'',agosto:'',
          }];
          
          meses[meses.length-1][mes.value]=mes.monto;
          mensualidad+=mes.monto;
      }else if (pos!==-1){
          meses[pos][mes.value]= Number(mes.monto).toFixed(2);
          mensualidad+=mes.monto;
      }
    })
    meses.map(val=>{
      datos=[...datos,{
          No:datos[datos.length -1].No === '' ? 1 : datos[datos.length -1].No+1 , fecha, representante, cedular, recibo, total,
          mensualidad:mensualidad.toFixed(2),anterior:abono_anterior, abono:abono, diferido:'??',tmensualidad,otro:'??',
          ...val, tasa
      }]
      return
    })
    
    return 
  })
  console.log(datos, archivo, pagina)
  const ws = utils.json_to_sheet(datos);
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, pagina);
  console.log('.........')
  
  utils.sheet_add_aoa(ws, [
    ["","Fecha:", "U.E. COLEGIO LIBERTADORES DE AMERICA","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["",moment().format("DD/MM/YYYY"),"REPORTE"],
    ["","",`DESDE: ${moment(Inicio).format('DD/MM/YYYY')} HASTA: ${moment(Fin).format('DD/MM/YYYY')}`],
    ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
    ["","","","Cédula ó","No.","Monto Bs.","","Mensualidad","Mensualidad","","Total por","","Cédula","","","","","","","","","","","","","","","Factor","Total en",""],
    ["No.","Fecha","Representante","R.I.F.","Recibo","Factura","Mensualidad","Abono Aterior","Abono","Diferido","Mensualidad","","Estudiante","Nombres y Apellidos","Inscip.","Sep","Oct","Nov","Dic","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Bs/$","Divisa",""],
  ], { origin: "A1" });
  let tamano = Object.keys(datos[0]).map((key,i)=>{  
    const max_width1 = datos.reduce((w, r) => Math.max(w, String(r[key]).length), 5);
    return {wch: max_width1}
  })
  ws["!cols"] = tamano;
  writeFile(wb,archivo,{ compression: true });
  // writeFileXLSX(wb, "SheetJSReactAoO11.xlsx");
}
const item_form = async(val, valores, _id)=>{
  let resultado={
    ...val,
    tipo: val.tipo ? val.tipo : '',
    placeholder: val.placeholder ? val.placeholder : val.label ? val.label : '',
    label: val.label ? val.label : val.placeholder ? val.placeholder : '',
    value: valores[val.name] && val.no_mostrar!==true ? valores[val.name] : val.value ? val.value : val.default ? val.default : '', 
    required: val.required,
    mensaje_error: val.mensaje_error ? val.mensaje_error : val.error,
    disabled: val.disabled
              ? val.disabled
              : valores[val.name] && val.no_modificar
              ? true
              : false
  }
  // console.log(',,,,,',resultado )
  if (val.tipo==='Lista'){
    // console.log('En lista',val, valores[val.name], typeof valores[val.name], val.lista[valores[val.name]])

    resultado={
      ...resultado,
      value: typeof valores[val.name]==='object' ? valores[val.name]._id : val.lista[valores[val.name]],
      getOptionLabel: val.tipo==='Lista' ? (option)=> `${option.title ? option.title : option.titulo ? option.titulo : option.label}` : null,
      getOptionSelected: val.tipo==='Lista' ? (option)=> `${option.value ? option.value : option.titulo}` : null

    }
  }else if (val.multiline){
    resultado={
      ...resultado,
      multiline:true,
      maxRows: val.numberOfLines ? val.numberOfLines : val.maxRows ?  val.maxRows : 4,
    }
  }else if (val.tipo==='auto-codigo'){
    let cod = 'S';
    let numeracion = 10;
    let cant = 6;
    
    if (val.mensaje_error){
      let dat = val.mensaje_error.split(';');
      if (dat.length===1){
        cod=dat[0];
      }else if (dat.length===2){
        cod=dat[0];
        numeracion=dat[1];
      }else if (dat.length===3){
        cod=dat[0];
        numeracion=dat[1];
        cant=dat[2];
      }

    }
    resultado={
      ...resultado,
      tipo:'',
      value:valores[val.name] ? valores[val.name] : Generar_id(cod, numeracion, cant)

    }
  }else if (val.tipo==='lista_multiuso'){
    let lista  
    const table=val.lista;
    if (val.cargar){
      if (typeof val.lista==='string' && val.lista.indexOf('lista_')===-1) {  
        const listado = await conexiones.Leer_C([val.lista],{[val.lista]:{}})
        lista= listado.datos[val.lista].map( v=>{
          return {...v.valores ? {_id:v._id, ...v.valores} : v}
        })
      }else 
      if (val.lista.indexOf('lista_')!==-1){
        lista = Ver_Valores()['config']['Listas'][val.lista]
        if (lista===undefined) lista=[]
      }else {
        lista= val.lista
      };
      
      if (val.ordenar){
        let ordenar = eval(val.ordenar);
        lista = ordenar(lista);
      }
    }else{
      lista= val.lista
    }
    resultado={
      ...resultado,
      lista,
      value: typeof valores[val.name]==='object' ? valores[val.name] : lista[valores[val.name]], 
      tipo:'Lista',
      table,
      getOptionLabel:(option) => {
        let mostrar=''
        val.getOptionLabel.map(vl=>{ 
          const datan= vl.indexOf('.')!==-1 ? option[vl.split('.')[0]][vl.split('.')[1]] : option[vl]!==undefined ? option[vl] : option;
          mostrar = mostrar + datan + ' ';
          return vl
        })
        
        return mostrar;
      },
      getOptionSelected:(option) => {
        let mostrar=''
        val.getOptionLabel.map(vl=>{ 
          mostrar = mostrar + option[vl] + ' ';
          return vl
        })
        
        return mostrar;
      },
    }
  }else if (val.tipo==='lista_representados'){
    let listado = await conexiones.Leer_C([val.lista],{[val.lista]:{}})
    const table=val.lista;
    const lista = listado.datos[val.lista].map( v=>{
      return {...v.valores}
    })
    let result=lista;
    
    if (val.filtro){
      const filtrado =eval(val.filtro)
      result=filtrado(lista) 
    }
    resultado={
      ...resultado,
      lista:result, 
      table,
      getOptionLabel:(option) => {
        let mostrar=''
        val.getOptionLabel.map(vl=>{ 
          mostrar = mostrar + option[vl] + ' ';
          return vl
        })
        
        return mostrar;
      },
    }
    
    
  }else if (val.tipo==='Checkbox'){
    let result={}
    Object.keys(resultado).map(v =>{
      if (['getOptionLabel','agregar','Subtotal'].indexOf(v)===-1){
        result[v]=resultado[v]
      }
      return v
    })
    resultado={
      ...result,
      label:val.label.indexOf('/')!==-1 ? val.label :'Seleccionado/No Seleccionado',
      value:valores[val.name]

    }
  }else if (val.tipo==='Fecha'){
    resultado={
      ...resultado,
      type:'date'

    }
  }else if (val.tipo==='Tabla'){
    let Subtotal = Ver_Valores()['config']['Subtotales'][val.Subtotal]
    
    resultado={
      ...resultado,
      value:valores[val.name],
      Subtotal: typeof Subtotal==='object' ? Subtotal : val.Subtotal
    }
  }

  delete resultado.numberOfLines
  return resultado
}

export const genera_formulario = async (datos, columnas=1)=>{
  let {campos, valores,_id} = datos;
  columnas=campos.columna;
  campos=campos.value;
  let titulos={};
  
  // campos.map(async val=>{
  const filas= Math.ceil(campos.length/columnas);
  for (var i=0; i<filas; i++){
    titulos[i]={ multiples:true, listo:false, value:{}}
  }
  for (var j=0; j<campos.length; j++){
      const val = campos[j];
      // delete val.numberOfLines
      if (columnas===1){
        titulos[val.name]= await item_form(val, valores, _id)
      }else{
        if (val.multiline || ['lista_representados', 'Avatar', 'avatar', 'Tabla'].indexOf(val.tipo)!==-1){
          // col=1;
          // fila=fila+1;
          // titulos[val.name]= await item_form(val, valores, _id);
          let pos= Object.keys(titulos).findIndex(f=> !titulos[f].listo && Object.keys(titulos[f].value).length===0);
          if (pos===-1) {
            titulos[Object.keys(titulos).length]={ multiples:true, listo:false, value:{}}
            pos=Object.keys(titulos).length-1;
          }
          titulos[pos].value[val.name]= await item_form(val, valores, _id);
          
          titulos[pos].listo=true ;
        }else{
          let pos= Object.keys(titulos).findIndex(f=> !titulos[f].listo && Object.keys(titulos[f].value).length<columnas);
          if (pos===-1) {
            titulos[Object.keys(titulos).length]={ multiples:true, listo:false, value:{}}
            pos=Object.keys(titulos).length-1;
          }
          
          titulos[pos].value[val.name]= await item_form(val, valores, _id);
          if (titulos[pos].value[val.name].length===columnas) titulos[pos].listo=true ;
        } 
        
        // if(col<columnas){
          
        //   if (!titulos[fila]) titulos[fila]={ multiples:true,value:{}}
        //   titulos[fila].value[val.name]= await item_form(val, valores, _id);
        //   // console.log(val.name)
        //   col=col+1
        // }else{
          
        //   fila=fila+1;
        //   col=1;
        //   titulos[fila]={ multiples:true,value:{}}
        //   titulos[fila].value[val.name]=await item_form(val, valores, _id);
        // }
      }
      
      // return val
  }//)
  
  titulos= Filtar_vacios(titulos);
  
  // console.log(titulos, valores)
  return {titulos, datos:{_id,...valores}}
}

const Filtar_vacios = (titulos) =>{
  let nuevotitulo={}
  Object.keys(titulos).map(val=>{
    if ((titulos[val].multiples && Object.keys(titulos[val].value).length!==0)||(!titulos[val].multiples)){
      nuevotitulo[val]=titulos[val]
    }
    return val
  })

  return nuevotitulo
}

export const crear_campos = async(campos, Form_origen)=>{
  let resultado=[]
  const list=Object.keys(campos)
  // Object.keys(campos).map(async val=>{
  // console.log(Form_origen)
  for (var i=0;i<list.length;i++){
      const val=list[i]
      if (campos[val].multiples){
          const otros= await crear_campos(campos[val].value, Form_origen)
          resultado=[...resultado,...otros.value]
      }else{

          let valor= campos[val]
          const pos= Form_origen.value.findIndex(v=> v.name===valor.name)
          
          if (Form_origen.value[pos] && (Form_origen.value[pos].tipo==='lista_multiuso' || Form_origen.value[pos].tipo==='lista_representados')){
              valor={
                  ...valor,
                  tipo:Form_origen.value[pos].tipo,
                  lista:Form_origen.value[pos].lista,
                  getOptionLabel:Form_origen.value[pos].getOptionLabel
              }
          }
          resultado=[...resultado, valor]
          
      }
      // return val;
  }//)
  
  return {columna:Form_origen.columna, value:resultado}
}

export const Generar_id =(id, numeracion=10, cant=6)=>{
  const id1 = Math.random().toString(numeracion).slice(-cant);
  // console.log('Id con math >>>', id1)
  return `${id ? id+'-' :''}${id1}`
  // return `${id ? id+'-' :''}${moment().format('x')}` 
}

export const Generar_codigo = (valor, id='', cantidad=5)=>{
  let nuevo = String(Number(valor) + 1);
  let cero = cantidad-nuevo.length;
  for (var i=0; i<cero; i++){
    nuevo='0'+nuevo;
  }
  return `${id!=='' ? id+'-' : ''}${nuevo}`
}

export const Dias_mes = (fecha=new Date())=>{
    var ultimoDia = new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0).getUTCDate();
    var mes = moment(fecha).format('MM');
    var ano = moment(fecha).format('YYYY');
    let meses = [];
    for (var dia=1; dia<=ultimoDia;dia++){
      const campo = `${ano}-${mes}-${dia<10 ? '0' + dia : dia}`;
      meses=[...meses, campo]
    }    
    return meses;
}
export const Filtrar_campos = (lista, campos)=>{
  let resultado={};
  Object.keys(lista).map(val=>{
    if (campos.indexOf(val)===-1){
      resultado[val]=lista[val];
    }
    return val
  })
  return resultado

}
export var numeroALetras = (function() {
  // Código basado en el comentario de @sapienman
  // Código basado en https://gist.github.com/alfchee/e563340276f89b22042a
  function Unidades(num) {

      switch (num) {
          case 1:
              return 'UN';
          case 2:
              return 'DOS';
          case 3:
              return 'TRES';
          case 4:
              return 'CUATRO';
          case 5:
              return 'CINCO';
          case 6:
              return 'SEIS';
          case 7:
              return 'SIETE';
          case 8:
              return 'OCHO';
          case 9:
              return 'NUEVE';
          default:
              return '';//colocardo para quitar alvertencia
      }

      // return '';
  } //Unidades()

  function Decenas(num) {

      let decena = Math.floor(num / 10);
      let unidad = num - (decena * 10);

      switch (decena) {
          case 1:
              switch (unidad) {
                  case 0:
                      return 'DIEZ';
                  case 1:
                      return 'ONCE';
                  case 2:
                      return 'DOCE';
                  case 3:
                      return 'TRECE';
                  case 4:
                      return 'CATORCE';
                  case 5:
                      return 'QUINCE';
                  default:
                      return 'DIECI' + Unidades(unidad);
              }
          case 2:
              switch (unidad) {
                  case 0:
                      return 'VEINTE';
                  default:
                      return 'VEINTI' + Unidades(unidad);
              }
          case 3:
              return DecenasY('TREINTA', unidad);
          case 4:
              return DecenasY('CUARENTA', unidad);
          case 5:
              return DecenasY('CINCUENTA', unidad);
          case 6:
              return DecenasY('SESENTA', unidad);
          case 7:
              return DecenasY('SETENTA', unidad);
          case 8:
              return DecenasY('OCHENTA', unidad);
          case 9:
              return DecenasY('NOVENTA', unidad);
          case 0:
              return Unidades(unidad);
          default:
              return '';//colocardo para quitar alvertencia
      }
  } //Unidades()

  function DecenasY(strSin, numUnidades) {
      if (numUnidades > 0)
          return strSin + ' Y ' + Unidades(numUnidades)

      return strSin;
  } //DecenasY()

  function Centenas(num) {
      let centenas = Math.floor(num / 100);
      let decenas = num - (centenas * 100);

      switch (centenas) {
          case 1:
              if (decenas > 0)
                  return 'CIENTO ' + Decenas(decenas);
              return 'CIEN';
          case 2:
              return 'DOSCIENTOS ' + Decenas(decenas);
          case 3:
              return 'TRESCIENTOS ' + Decenas(decenas);
          case 4:
              return 'CUATROCIENTOS ' + Decenas(decenas);
          case 5:
              return 'QUINIENTOS ' + Decenas(decenas);
          case 6:
              return 'SEISCIENTOS ' + Decenas(decenas);
          case 7:
              return 'SETECIENTOS ' + Decenas(decenas);
          case 8:
              return 'OCHOCIENTOS ' + Decenas(decenas);
          case 9:
              return 'NOVECIENTOS ' + Decenas(decenas);
          default:
            return Decenas(decenas);//colocardo para quitar alvertencia
      }

      // return Decenas(decenas);
  } //Centenas()

  function Seccion(num, divisor, strSingular, strPlural) {
      let cientos = Math.floor(num / divisor)
      let resto = num - (cientos * divisor)

      let letras = '';

      if (cientos > 0)
          if (cientos > 1)
              letras = Centenas(cientos) + ' ' + strPlural;
          else
              letras = strSingular;

      if (resto > 0)
          letras += '';

      return letras;
  } //Seccion()

  function Miles(num) {
      let divisor = 1000;
      let cientos = Math.floor(num / divisor)
      let resto = num - (cientos * divisor)

      let strMiles = Seccion(num, divisor, 'UN MIL', 'MIL');
      let strCentenas = Centenas(resto);

      if (strMiles === '')
          return strCentenas;

      return strMiles + ' ' + strCentenas;
  } //Miles()

  function Millones(num) {
      let divisor = 1000000;
      let cientos = Math.floor(num / divisor)
      let resto = num - (cientos * divisor)

      let strMillones = Seccion(num, divisor, 'UN MILLON DE', 'MILLONES DE');
      let strMiles = Miles(resto);

      if (strMillones === '')
          return strMiles;

      return strMillones + ' ' + strMiles;
  } //Millones()

  return function NumeroALetras(num, currency) {
      currency = currency || {};
      let data = {
          numero: num,
          enteros: Math.floor(num),
          centavos: (((Math.round(num * 100)) - (Math.floor(num) * 100))),
          letrasCentavos: '',
          letrasMonedaPlural: currency.plural || 'PESOS CHILENOS', //'PESOS', 'Dólares', 'Bolívares', 'etcs'
          letrasMonedaSingular: currency.singular || 'PESO CHILENO', //'PESO', 'Dólar', 'Bolivar', 'etc'
          letrasMonedaCentavoPlural: currency.centPlural || 'CHIQUI PESOS CHILENOS',
          letrasMonedaCentavoSingular: currency.centSingular || 'CHIQUI PESO CHILENO'
      };

      if (data.centavos > 0) {
          data.letrasCentavos = 'CON ' + (function() {
              if (data.centavos === 1)
                  return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoSingular;
              else
                  return Millones(data.centavos) + ' ' + data.letrasMonedaCentavoPlural;
          })();
      };

      if (data.enteros === 0)
          return 'CERO ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
      if (data.enteros === 1)
          return Millones(data.enteros) + ' ' + data.letrasMonedaSingular + ' ' + data.letrasCentavos;
      else
          return Millones(data.enteros) + ' ' + data.letrasMonedaPlural + ' ' + data.letrasCentavos;
  };

})();