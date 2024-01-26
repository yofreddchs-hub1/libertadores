import { conexiones } from "./conexiones";
import { nuevo_Valores, Ver_Valores } from "./valores"
import { encriptado } from './encriptado';
import { Resultado_encontrados, Usuario } from "./funciones";
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css';
import moment from "moment";
// import Mensualidad from "../page/sistema/pagar/mensualidades";

const Datastore= require("nedb-promises");
var ObjectID = require('bson-objectid');
const {Hash_chs,Hash_password, Codigo_chs} = encriptado;
const Table_modificar= 'uecla_Modificado';
const Table_Eliminados= 'uecla_Eliminados';
const Database=(tabla)=>{
    let db = new Datastore({
        filename: process.env.PUBLIC_URL + `/data1/${tabla}.db`, 
        autoload: true
    });
    return db
}
export const Iniciar_data = async () =>{
  console.log('Limpiando toda la base de datos>>>>>>>>>');
  let respuesta='Eliminando base de datos>>>>>>>>';
  let ultimos = Database(Table_modificar);
  await ultimos.remove({}, { multi: true });
  const tablas = Ver_Valores().valores && Ver_Valores().valores.models 
            ? Ver_Valores().valores.models 
            :[];
  respuesta = await Promise.all(tablas.map(async(data)=>{
    let db = Database(data);
    await db.remove({}, { multi: true });
      
  }))
  .then(()=>{
      // nuevo_Valores({sincronizado:true})
      //return 'Datos locales verificados, enviando a servidor...'
      console.log('Bases de datos limpiadas>>>>>>>>>>>>>');
      return 'Datos Eliminados';
      
  });
  return respuesta;
}
export const Ultima_fecha= async()=>{
  let ultimos = Database(Table_modificar);
  const ultimo = await ultimos.find({}).sort({fecha:-1}).limit(1);
  let fecha = ultimo.length===0 ? null : ultimo[0].fecha;
  // console.log('>>>>>>>>>>>>>>>>>>>>>>Ultima fecha',fecha)
  return fecha;
}
export const ActualizarDatos = async(data, Actualizando, noticia)=>{
  let {tabla, cantidad, cantidades, datos, pag, fecha, fechaa, fechaf}= data;
  const User = await Usuario();
  nuevo_Valores({sincronizando:true})
  // console.log('Inicia ....', pag, cantidad);
  for (let i=0; i<datos.length; i++){ 
    const val = datos[i];
    await Guardar_data(User,tabla,val,false)
  }
  // console.log('Termino ....', pag, cantidad);
  if (datos.length===cantidades){
    const porcentaje = (Number(pag)+1)*datos.length * 100 / cantidad;
    noticia(`${tabla.split('_')[1]} : sincronizando (${porcentaje.toFixed(2)}%)`,'warning');
    const Api = Ver_Valores().valores.app;
    Ver_Valores().socket.emit('Sincronizar',{tabla, datos:[], fecha, fechaa, pag:Number(pag)+1, Api});
  }else{
    noticia(`${tabla.split('_')[1]} : sincronizado`,'success');
    delete Actualizando[tabla];
    const tablas = Object.keys(Actualizando);
    if (tablas[0]!==undefined){
      Iniciar_transmision(tablas[0]);
    }
  }
  nuevo_Valores({Actualizando});
  if(Object.keys(Actualizando).length===0){
    Guardar_data(User,Table_modificar,{fecha:fechaf},false);
    nuevo_Valores({sincronizando:false});
  }
  return Actualizando; 
}

const Iniciar_transmision = async(data)=>{
  let db = Database(data);
  let ultimo = await db.find({}).sort({updatedAt:-1}).limit(1);
  // console.log('>>>>>>>>Ultimo',data, ultimo)
  let ultimoa = ultimo.length!==0 ? ultimo[0].updatedAt : null;
  ultimo = ultimo.length!==0 && ultimo[0].createdAt ? ultimo[0].createdAt : ultimo.length!==0 ? ultimo[0].updateAt : null;
  // ultimo = ultimo===undefined ? null : ultimo;
  // console.log('..........',data, ultimo)                    
  const datosl= await db.find({local:true});
  const Api = Ver_Valores().valores.app;
  Ver_Valores().socket.emit('Sincronizar',{tabla:data, datos:datosl, fecha:ultimo, fechaa:ultimoa, Api});
}
const Refrescar_data=async(nuevo, peticion)=>{
  const User = await Usuario();
  if (peticion==='/api/colegio/recibo'){
    for(let i=0;i<nuevo.length;i++){
      await Guardar_data(User,'uecla_Recibo',nuevo[i],false)
    }
  }else if (peticion==='/api/colegio/mensualidades'){
    for(let i=0;i<nuevo.length;i++){
      await Guardar_data(User,'uecla_Mensualidad',nuevo[i],false)
    }
  }else if (peticion==='/api/colegio/resumen'){
    // for (let i=0 ; i<nuevo.mensualidad.length; i++){
    //   await Guardar_data(User,'uecla_Mensualidad',nuevo.mensualidad[i],false);
    // }
    for (let i=0; i<nuevo.recibos.length; i++){
      await Guardar_data(User,'uecla_Recibo',nuevo.recibos[i],false);
    }
  }else{
    const campos = Object.keys(nuevo);
    
    for (let i=0; i<campos.length;i++){
      const campo = campos[i];
      if (campo.indexOf('_cantidad')===-1){
        for (var j=0;j<nuevo[campo].length;j++){
          const dato = nuevo[campo][j];
          // console.log('>>>>>>>>>>aquikkkkk')
          await Guardar_data(User,campo,dato,false)
        }
      }
    }
  }
}
export const Actualizar_datos = (local, remoto, peticion)=>{
  // console.log('en actulizar datos-------', peticion, local, remoto)
  let resultado = local.Respuesta ==='Ok' ? {...local} : {...remoto};
  const especiales = ['/api/colegio/recibo','/api/colegio/mensualidades']
  let nuevo ={};
  let actualizar ={};
  if (remoto.Respuesta==='Ok'){
    const datosl= peticion==='/api/colegio/recibo' ? local.recibos 
                  : peticion==='/api/colegio/mensualidades' ? local.mensualidades
                  : peticion==='/api/colegio/resumen' || peticion==='/api/colegio/solvencias'? local
                  :local.datos;
    const datosr= peticion==='/api/colegio/recibo' ? remoto.recibos 
                  : peticion==='/api/colegio/mensualidades' ? remoto.mensualidades
                  : peticion==='/api/colegio/resumen' || peticion==='/api/colegio/solvencias' ? remoto
                  : remoto.datos;
    const campos = especiales.indexOf(peticion)!==-1 || peticion==='/api/colegio/solvencias' ? [] : Object.keys(remoto.datos)
    // console.log(datosl, datosr)
    if (especiales.indexOf(peticion)!==-1){
      nuevo=[];
      actualizar=[];
      for (let i=0;i<datosr.length; i++){
        let dato = datosr[i];
        const pos = datosl.findIndex(f=>f._id===dato._id);
        if (pos!==-1){
          // dato = String(dato.updatedAt) >= String(datosl[pos].updatedAt) ? dato : datosl[pos];
          if (moment(dato.updatedAt).format("YYYY/MM/DD HH:mm:ss") > moment(datosl[pos].updatedAt).format("YYYY/MM/DD HH:mm:ss")){
            actualizar=[...actualizar, dato];
          }
          dato = moment(dato.updatedAt).format("YYYY/MM/DD HH:mm:ss") >= moment(datosl[pos].updatedAt).format("YYYY/MM/DD HH:mm:ss") ? dato : datosl[pos];
        }else{
          actualizar=[...actualizar, dato];
        }
        nuevo=[...nuevo,dato]
      }
    }else if (peticion==='/api/colegio/solvencias'){
      nuevo={estudiantes:[], mensualidades: [] }
      // console.log('>>..........',datosr, datosl)
      for (let i=0;i<datosr.estudiantes.length; i++){
        let dato = datosr.estudiantes[i];
        const pos = datosl.estudiantes.findIndex(f=>f._id===dato._id);
        if (pos!==-1){
          
          dato = moment(dato.updatedAt).format("YYYY/MM/DD HH:mm:ss") >= moment(datosl.estudiantes[pos].updatedAt).format("YYYY/MM/DD HH:mm:ss") ? dato : datosl.estudiantes[pos];
        }
        nuevo.estudiantes=[...nuevo.estudiantes,dato]
      }
      for (let i=0;i<datosr.mensualidades.length; i++){
        let dato = datosr.mensualidades[i];
        const pos = datosl.mensualidades.findIndex(f=>f._id===dato._id);
        if (pos!==-1){
          
          dato = moment(dato.updatedAt).format("YYYY/MM/DD HH:mm:ss") >= moment(datosl.mensualidades[pos].updatedAt).format("YYYY/MM/DD HH:mm:ss") ? dato : datosl.mensualidades[pos];
        }
        nuevo.mensualidades=[...nuevo.mensualidades,dato]
      }
    }else if (peticion==='/api/colegio/resumen'){
      nuevo={datos:local.datos, mensualidad:[], recibos: [] }
      actualizar = {mensualidad:[], recibos:[]}
      for (let i=0;i<datosr.mensualidad.length; i++){
        let dato = datosr.mensualidad[i];
        const pos = datosl.mensualidad.findIndex(f=>f._id===dato._id);
        if (pos!==-1){
          // dato = String(dato.updatedAt) >= String(datosl[pos].updatedAt) ? dato : datosl[pos];
          if (moment(dato.updatedAt).format("YYYY/MM/DD HH:mm:ss") > moment(datosl.recibos[pos].updatedAt).format("YYYY/MM/DD HH:mm:ss")){
            actualizar.mensualidad=[...actualizar.mensualidad, dato]
          }
          dato = moment(dato.updatedAt).format("YYYY/MM/DD HH:mm:ss") >= moment(datosl.mensualidad[pos].updatedAt).format("YYYY/MM/DD HH:mm:ss") ? dato : datosl.mensualidad[pos];
        }else{
          actualizar.mensualidad=[...actualizar.mensualidad, dato]
        }
        nuevo.mensualidad=[...nuevo.mensualidad,dato]
      }
      for (let i=0;i<datosr.recibos.length; i++){
        let dato = datosr.recibos[i];
        const pos = datosl.recibos.findIndex(f=>f._id===dato._id);
        if (pos!==-1){
          // dato = String(dato.updatedAt) >= String(datosl[pos].updatedAt) ? dato : datosl[pos];
          if (moment(dato.updatedAt).format("YYYY/MM/DD HH:mm:ss") > moment(datosl.recibos[pos].updatedAt).format("YYYY/MM/DD HH:mm:ss")){
            actualizar.recibos=[...actualizar.recibos, dato]
          }
          dato = moment(dato.updatedAt).format("YYYY/MM/DD HH:mm:ss") >= moment(datosl.recibos[pos].updatedAt).format("YYYY/MM/DD HH:mm:ss") ? dato : datosl.recibos[pos];
        }else{
          actualizar.recibos=[...actualizar.recibos, dato]
        }
        nuevo.recibos=[...nuevo.recibos,dato]
      }

    }else{
      for (let i=0; i<campos.length; i++){
        const campo = campos[i];
        if (campo.indexOf('_cantidad')===-1){
          nuevo[campo]=[];
          for(let j=0; j< datosr[campo].length; j++){
            let dato = datosr[campo][j];
            const pos = datosl[campo].findIndex(f=>f._id===dato._id);
            if (pos!==-1){
              if (moment(dato.updatedAt).format("YYYY/MM/DD HH:mm:ss") > moment(datosl[campo][pos].updatedAt).format("YYYY/MM/DD HH:mm:ss")){
                if (actualizar[campo]){
                  actualizar[campo]=[...actualizar[campo], dato]
                }else{
                  actualizar[campo]=[dato]
                }
                
                // console.log(campo, actualizar)
              }
              dato = moment(dato.updatedAt).format("YYYY/MM/DD HH:mm:ss") >= moment(datosl[campo][pos].updatedAt).format("YYYY/MM/DD HH:mm:ss") ? dato : datosl[campo][pos];
              
            }else{
              if (actualizar[campo]){
                actualizar[campo]=[...actualizar[campo], dato]
              }else{
                actualizar[campo]=[dato]
              }
            }
            nuevo[campo]=[...nuevo[campo], dato];
          }
        }else{
          nuevo[campo]=datosr[campo];
          actualizar[campo]=datosr[campo];
        }  
      }
    }  
  }
  Refrescar_data(actualizar, peticion);
  
  return {...resultado, 
    ...peticion==='/api/colegio/recibo' 
        ? {recibos:nuevo} 
        : peticion==='/api/colegio/mensualidades'
        ? {mensualidades:nuevo}
        : peticion==='/api/colegio/resumen' || peticion==='/api/colegio/solvencias'
        ? nuevo
        : {datos: nuevo} 
  };
}
export const Sincronizar=async(enviar=true, Tablas=undefined, FechaA=undefined)=>{
    console.log('en sincronizar ......')
    let enviars= false;
    const {online, conectadoserver} = Ver_Valores();
    if (!online || !conectadoserver) return 'Sin conexión';
    nuevo_Valores({sincronizando:true})
    let paso ='Verificando data local...';
    const tablas = Tablas ? ['uecla_Eliminados',...Tablas] : Ver_Valores().valores && Ver_Valores().valores.models 
            ? Ver_Valores().valores.models 
            :[];
    let tablase=[]; 
    const User = await Usuario();
    // console.log(paso)
    // let ultimos = Database(Table_modificar);
    // await ultimos.remove({}, { multi: true });
    // const ultimo = await ultimos.find({}).sort({fecha:-1}).limit(1);
    // let fechai = ultimo.length===0 ? null : ultimo[0].fecha;
    // console.log('>>>>>>>>>>>>>>>>>>>>>>Ultima fecha',fechai)
    let fechai = await Ultima_fecha();
    if (FechaA!==undefined){
      fechai= new Date(fechai);
      fechai.setDate(fechai.getDate() - FechaA);
    }
    // console.log('>>>>>>>>>>>>>>>>>>>',Object.keys(Ver_Valores()))
    let fechaf
    for (var i=0; i<tablas.length; i++){
      const data=tablas[i];
      let db = Database(data);
      const datosl= await db.find({local:true});
      if (datosl.length!==0){
        tablase=[...tablase, data];
        enviars= true;
      
        let resultado = await conexiones.Sincronizar(data, {fecha:fechai, datos:datosl});
        if (resultado.Respuesta==='Ok'){
          fechaf = resultado.fecha;
          if (data!==Table_Eliminados){
            for (let i=0; i<datosl.length; i++){ 
              const val = datosl[i];
              await Guardar_data(User,data,val,false)
            }
          }else{
            console.log('En eliminar>>>>>', datosl)
            
            for (let i=0; i<datosl.length;i++){
              const valor = datosl[i].valores;
              const Elimina= await Database(valor.tabla);
              await Elimina.deleteOne({_id:valor._id});
            }
            
            await db.remove({}, { multi: true });
          }
        }else{
          console.log('Error Sincronizando >>>>', data, resultado);
          paso='Error en respuesta de servidor'
        }
      }
    }
    // let Actualizando ={};
    // tablas.map(val=>{
    //   Actualizando[val]={
    //     cantidad:0, cantidades:'?', datos:[],
    //     pag:0, tabla:val,
    //   }
    //   return val
    // });
    // nuevo_Valores({Actualizando});
    // await Iniciar_transmision(tablas[0]);
    // paso = await Promise.all(tablas.map(async(data)=>{
      // const data = tablas[0]
      // let db = Database(data);
      // let ultimo = await db.find({}).sort({updatedAt:-1}).limit(1);
      // let ultimoa = ultimo.length!==0 ? ultimo[0].updatedAt : null;
      // ultimo = ultimo.length!==0 ? ultimo[0].createdAt : null;
      // console.log('..........',data, ultimo)                    
      // const datosl= await db.find({local:true});
      // const Api = Ver_Valores().valores.app;
      // Ver_Valores().socket.emit('Sincronizar',{tabla:data, datos:datosl, fecha:ultimo, fechaa:ultimoa, Api});
    // }))
    // .then(()=>{
    //   // Guardar_data(User,Table_modificar,{fecha:fechaf},false);
    //   // nuevo_Valores({sincronizado:true})
    //   //return 'Datos locales verificados, enviando a servidor...'
    //   return 'Datos sincronizados';
    // });
    /*paso = await Promise.all(tablas.map(async(data)=>{
        let db = Database(data);
        // console.log('Sincronizando >>>>', data);
        nuevo_Valores({mensaje_sincronizando:`Sincronizando: ${data} `})
        const datosl= await db.find({local:true});
        if (datosl.length!==0){
          if (FechaA!==undefined){
            console.log('>>>>>>>>Sincronizar Dias anteriores', data, moment(fechai).format("DD/MM/YYYY"))
          }else{
            console.log('>>>>>>>>Sincronizar', data, moment(fechai).format("DD/MM/YYYY"))
          }
        }
        // console.log('Local>>>>>>>>>>>>>>>', data,datosl.length);
        let resultado = await conexiones.Sincronizar(data, {fecha:fechai, datos:datosl});
        if (resultado.Respuesta==='Ok'){
          let datos = resultado.resultados;
          fechaf = resultado.fecha;
          // console.log('Server>>>>',data,datos);
          // await db.remove({}, { multi: true });
          if (data!==Table_Eliminados){
            for (let i=0; i<datos.length; i++){ 
              const val = datos[i];
              await Guardar_data(User,data,val,false)
            }
            if (datos.length!==0)
              console.log('Recibido>>>>>>', resultado.data, resultado.resultados.length)
          }else{
            console.log('En eliminar>>>>>', datos)
            
            for (let i=0; i<datos.length;i++){
              const valor = datos[i].valores;
              const Elimina= await Database(valor.tabla);
              await Elimina.deleteOne({_id:valor._id});
            }
            
            await db.remove({}, { multi: true });
          }
          // console.log('Sincronizado <<<<<<<', data);
        }else{
          console.log('Error Sincronizando >>>>', data, resultado);
          paso='Error en respuesta de servidor'
        }
    }))
    .then(()=>{
        Guardar_data(User,Table_modificar,{fecha:fechaf},false);
        nuevo_Valores({sincronizado:true})
        //return 'Datos locales verificados, enviando a servidor...'
        return 'Datos sincronizados';
    });
    */
    // console.log('2',paso)
    // let resultado = await conexiones.Sincronizar(tablas, nuevos);
    // if (resultado.Respuesta==='Ok'){
    //     let datos = resultado.resultados;

    //     paso = await Promise.all(tablas.map(async(data)=>{
    //         //Eliminar todos.....
    //         let db = Database(data);
    //         await db.remove({}, { multi: true });
    //         for (let i=0; i<datos[data].length; i++){ 
    //             const val = datos[data][i];
    //             await Guardar_data(User,data,val,false)
    //         }
            
            
    //     }))
    //     .then(()=>{
    //         nuevo_Valores({sincronizado:true})
    //         return 'Datos sincronizados';
    //     });
    //     // console.log('3',paso)
    // }else{
    //     console.log(resultado);
    //     paso='Error en respuesta de servidor'
    // }
    if (enviar && enviars){
      Ver_Valores().socket.emit('Sincronizado',{tablase, fechaf})
    }
    nuevo_Valores({sincronizando:false})
    
    return paso;
}

// Porcesos para el almacenamiento de datos de forma local
// cuando se trabaja con app electron
// el envio de archivos hay que ver

export const Procesar = async(props)=>{
    const {http_destino} = props;

    // console.log('>>>>>>>>>>>>> Por procesar',props);
    const Procesos={
        '/api/getall':async(props)=> await Getall(props),
        '/api/getallc':async(props)=> await Getall_C(props),
        '/api/setall':async(props)=> await Setall(props),
        '/api/delall':async(props)=> await Delall(props),
        '/api/serial':async(props)=> await PeticionSerial(props),
        '/api/colegio/mensualidades':async(props)=> await Mensualidades(props),
        '/api/colegio/enviarpago':async(props)=> await EnviarPago(props),
        '/api/colegio/resumen':async(props)=> await Resumen(props),
        '/api/colegio/recibo':async(props)=> await Recibo(props),
        '/api/colegio/solvencias':async(props)=> await Solvencias(props),
    }

    if (Procesos[http_destino]){
        const resp=await Procesos[http_destino](props);
        const {conectadoserver, sincronizado} = Ver_Valores();
        // console.log('Sincronizado', sincronizado)
        if(conectadoserver && !sincronizado && !Ver_Valores().esperaSincronizar){
            const SincronizarP = Ver_Valores().Sincronizar;
            if (SincronizarP){
                SincronizarP();
            }else{Sincronizar()}
        }
        return resp;
    }else{
        confirmAlert({
          title: 'Error',
          message: `No se encuentra la solicitud (${http_destino})`,
          buttons: [{label: 'OK'}]
        });
        return {Respuesta:'Error', mensaje:`No se encuentra la solicitud (${http_destino})`}
    }
    
}

const Getall= async(props) =>{
    const {tablas}= props.datos;
    // Sincronizar(false, tablas);
    const Resultado = await Ver_datos(tablas);
    // Sincronizar(false, tablas,1);
    return Resultado
}
const Getall_C= async(props) =>{
    const {tablas, condicion}= props.datos
    // Sincronizar(false, tablas);
    const Resultado = await Ver_datos_C(tablas, condicion);
    // Sincronizar(false, tablas,1);
    return Resultado
}
const Setall= async(props)=>{
    const {User,tabla}= props.datos;
    let newdatos= JSON.parse(props.datos.datos);
    try{
        //almacena imagen dentro del servidor
        // if ((tabla==='null' || tabla==='') && req.files ){
        //   req.files.map(val=>{
        //     newdatos[val.fieldname]='/api/imagen/'+val.filename//[...newdatos['filename'],req.files[val][0].filename];
        //     return val;
        //   })
          
        //   res.json({Respuesta:'Ok', newdatos});
        // }
        let DB = Database(tabla);
    
        if (newdatos['unico'] && newdatos._id===undefined){
          let datos = await DB.find(
              {$text: {$search: newdatos['multiples_valores'] ? newdatos.valores[newdatos['unico']] : newdatos[newdatos['unico']] , 
              $caseSensitive: false}});
          
          let continuar = true;
          
          datos.map(d=>{
            if ((newdatos['multiples_valores'] && d.valores[newdatos['unico']]===newdatos.valores[newdatos['unico']])
                || (!newdatos['multiples_valores'] && d[newdatos['unico']]===newdatos[newdatos['unico']])
            ){
              continuar = false
            }
            return d;
          })
          
          if (continuar===false){
            return{Respuesta:'Error', mensaje:`Nombre de usuario ya existe`};
          }
        }
        //subir imagen a cloudinary ver como realizar desde aqui
        // if (req.files){
          
        //   let archivos={}
        //   for  (var i=0; i<req.files.length; i++){
        //     const result = await cloudinary.uploader.upload(req.files[i].path);
        //     archivos[req.files[i].fieldname]= result.secure_url;
        //     archivos[req.files[i].fieldname+'-id']= result.public_id;
        //   }
          
        //   const valor_verificar = await DB.findOne({_id:newdatos._id})
        //   if(newdatos['multiples_valores']){
        //     req.files.map(val=>{
        //       if (valor_verificar!==null 
        //           && valor_verificar.valores[val.fieldname]!=='' 
        //           && valor_verificar.valores[val.fieldname]!==null 
        //           && valor_verificar.valores[val.fieldname]!==undefined
        //         ) 
        //         Eliminar_imagen(valor_verificar.valores[val.fieldname+'-id'])
        //       // newdatos.valores[val.fieldname]='/api/imagen/'+val.filename//[...newdatos['filename'],req.files[val][0].filename];
        //       newdatos.valores[val.fieldname]=archivos[val.fieldname];
        //       newdatos.valores[val.fieldname+'-id']=archivos[val.fieldname+'-id'];
        //       return val;
        //     })
        //   }else{
        //     req.files.map(val=>{
        //       if (valor_verificar!==null && valor_verificar[val.fieldname]!=='' && valor_verificar[val.fieldname]!==null && valor_verificar[val.fieldname]!==undefined) 
        //         Eliminar_imagen(valor_verificar[val.fieldname+'-id'])
        //       // newdatos[val.fieldname]='/api/imagen/'+val.filename//[...newdatos['filename'],req.files[val][0].filename];
        //       newdatos[val.fieldname]=archivos[val.fieldname]
        //       newdatos[val.fieldname+'-id']=archivos[val.fieldname+'-id']
        //       return val;
        //     })
        //   }
      
        // }
        // console.log(newdatos)
        
        if (newdatos.newpassword){
          newdatos.password= await Hash_password(newdatos.newpassword);
          delete newdatos.newpassword
        }else if (newdatos['multiples_valores'] && newdatos.valores.newpassword){
          newdatos.valores.password= await Hash_password(newdatos.valores.newpassword);
          delete newdatos.valores.newpassword
        }else{
          delete newdatos.password
        }
        // if (newdatos._id){//(newdatos._id){
        //   const hash_chs = await Hash_chs({...newdatos})
        //   await DB.updateOne({_id:newdatos._id},{...newdatos, hash_chs, actualizado:User.username},{ upsert: true });
        // } else {
        //   let cod_chs = await Codigo_chs({...newdatos['multiples_valores'] ? newdatos.valores : newdatos});
        //   const hash_chs = await Hash_chs({...newdatos, cod_chs})
        //   console.log('Por aquiiio dosdif')
        //     //   const Nuevo = new DB({...newdatos, cod_chs, hash_chs, actualizado:User.username});
        //     //   await Nuevo.save();
        //     await DB.insert({...newdatos, cod_chs, hash_chs, actualizado:User.username, createdAt: fecha, updatedAt:fecha});
        // }
        const resultado=await Guardar_data(User, tabla, newdatos);
        console.log('Actualizar_'+tabla)
        // global.io.emit('Actualizar_'+tabla,{tabla}) //datos:resultado})
        return{Respuesta:'Ok', resultado};
    }catch(error) {
        console.log('Error-Setall',error, error.keyValue);
        return{Respuesta:'Error', code: error.code};
    }
}
const Delall= async(props)=>{
    const {dato, tablas}= props.datos;
    const User = await Usuario();
    try{
        // const resultado = await Promise.all(tablas.map(async(data)=>{
            const data = tablas[0];
            let DB = Database(data);
            // const valor_verificar = await DB.findOne({_id:dato._id})
            // let imagenes= Object.keys(valor_verificar.valores).filter(f=>f.indexOf('-id')!==-1)
            // imagenes.map(val=>{
            //     Eliminar_imagen(valor_verificar.valores[val])
            // })
            let anterior = await DB.findOne({_id:dato._id});
            anterior.eliminado=true;
            anterior.local=true;
            
            // await DB.deleteOne({_id:dato._id});
            // const tablas = Ver_Valores().valores && Ver_Valores().valores.models 
            // ? Ver_Valores().valores.models 
            // :[];
            // const pos= tablas.findIndex(v=> v.indexOf('Eliminados')!==-1);
            // if (pos!==-1 && tablas[pos]){
                // Guardar_data(User,Table_Eliminados, {valores:{...dato, tabla:data}, tabla:data})
                let resp = await Guardar_data(User,data, {...anterior, eliminado:true});
                return{Respuesta:'Ok', resultado:resp};
            // }
            
        
            // try{
            //     // const direct = __dirname.replace('/src/controllers','/archivos/imagenes/');
            //     // dato.filename.map(img=>
            //     //   fs.unlinkSync(direct+img)  
            //     // )
            //     // await cloudinary.uploader.destroy(dato.fileid[0]);
            // }catch (err) {
                
            // }
            // // if (Object.keys(dato).indexOf('fileid')!==-1){
            // //   dato.fileid.map( fileid=>
            // //     global.gfs.delete(new mongoose.Types.ObjectId(fileid), (err, data) => {  
            // //     })
            // //   ) 
                
            // // }
            // return data;
        // })).then(async()=>{
        //     let condicion={};
        //     tablas.map(val=>{
        //         condicion[val]={};
        //         return val
        //     })
        //     let datos= await Ver_datos_C(tablas,condicion);
        //     // console.log('Despues de eliminar',datos);
        //     return {Respuesta:'Ok',datos} ;
        // });
        // return resultado;
      }catch(error) {
        console.log('Error-Delall',error);
        return {Respuesta:'Error'};
      }
}
//Del sistema
const Ver_Mensualidades = async(estu)=>{
  let mensualidades=[];
  let mensualidad = await Buscar('uecla_Mensualidad', estu._id, '_id_estudiante');
  mensualidades=[...mensualidades, ...mensualidad];
  mensualidad = await Buscar('uecla_Mensualidad', estu.cedula, 'cedula');
  // mensualidad.map(men=>{
  for(var i=0;i<mensualidad.length;i++){
    const men= mensualidad[i];
    const pos= mensualidades.findIndex(f=>f.valores.periodo===men.valores.periodo);
    if (pos===-1){
        mensualidades=[...mensualidades, {
            _id:men._id,
            actualizado: men.actualizado,
            cod_chs:men.cod_chs,
            createdAt: men.createdAt,
            hash_chs: men.hash_chs,
            seq_chs:men.seq_chs,
            updatedAt:men.updatedAt, 
            valores:{...men.valores, _id_estudiante:estu._id}
        }];
    }
  }//)
  return mensualidades;
}
const Mensualidades = async (props) =>{
  let {datos} = props.datos; //User, Api,
  datos= JSON.parse(datos);
  let mensualidades=[];
  for (var i=0; i<datos.Representados.length; i++){
      const estu= datos.Representados[i];
      let mensualidad = await Ver_Mensualidades(estu);//await Buscar('uecla_Mensualidad', estu._id, '_id_estudiante');
      mensualidades=[...mensualidades, ...mensualidad];
      // mensualidad = await Buscar('uecla_Mensualidad', estu.cedula, 'cedula');
      // mensualidad.map(men=>{
      //   const pos= mensualidades.findIndex(f=>f.valores.periodo===men.valores.periodo);
      //   if (pos===-1){
      //     mensualidades=[...mensualidades, {...men, valores:{...men.valores, _id_estudiante:estu._id}}];
      //   }
      // })
      
  }
  return ({Respuesta:'Ok', mensualidades});
}
const EnviarPago = async (props) =>{
  let {User, datos } = props.datos;
  User= typeof User==='string' ? JSON.parse(User) : User;
  const fecha = new Date();
  const Representante = Database(`uecla_Representante`);
  const Recibo = Database('uecla_Recibo');
  const Pago = Database('uecla_Pago');
  datos= JSON.parse(datos);
  let representante = await Representante.findOne({_id: datos.Representante});
  if (representante===null){
    representante = await Representante.findOne({'valores._id': datos.Representante});
  }
  if (representante===null){
    const nue = await conexiones.Leer_C(['uecla_Representante'],{
      uecla_Representante:{_id:datos._id}
    })
    representante= nue.datos.uecla_Representante[0]
  }
  
  let datonuevo = {...datos};
  datonuevo.fecha = new Date();
  datonuevo.Data = {
      cedula: representante.valores.cedula, 
      nombres:representante.valores.nombres, 
      apellidos:representante.valores.apellidos
  }
  console.log('>>>>>>>>>>>>>>>>>>>',datos);
  if (datos.pago===true){
      datonuevo.estatus = '0';
      // let cod_chs = await Codigo_chs({...datonuevo});
      // let hash_chs = await Hash_chs({...datonuevo, cod_chs})
      // const Nuevo = new Pago({valores:datonuevo, fecha:datonuevo.fecha, cod_chs, hash_chs, actualizado:User.username});
      // await Nuevo.save();
      await Guardar_data(User,'uecla_Pago', {valores:datonuevo, fecha:datonuevo.fecha, actualizado:User.username, multiples_valores:true})
      Ver_Valores().socket.emit('ActualizarPago','Pendiente')
      return({Respuesta:'Ok', pagoEnviado: true});
  }else if(datos.id_pago!==undefined && datos.Pendiente==='Aprobado'){
      // await Pago.deleteOne({_id:datos.id_pago});
      let anterior = await Pago.findOne({_id:datonuevo.id_pago});
      await Guardar_data(User,'uecla_Pago', {...anterior, eliminado:true})
  }else if(datos.id_pago!==undefined && datos.Pendiente==='Rechazar'){
      console.log('Por aqui por rechazado ..............')
      datonuevo.estatus = '1';
      let anterior = await Pago.findOne({_id:datonuevo.id_pago})
      // let hash_chs = await Hash_chs({...datonuevo, cod_chs: anterior.cod_chs})
      // await Pago.updateOne({_id:datonuevo.id_pago},{valores:datonuevo, hash_chs, actualizado:User.username},{ upsert: true });
      await Guardar_data(User,'uecla_Pago', {...anterior, valores:datonuevo})
      await Sincronizar();
      Ver_Valores().socket.emit('ActualizarPago','Pendiente')
      return({Respuesta:'Ok', pagoEnviado: true});
  }
  representante.valores.abono= datos.Totales.abono.toFixed(2);
  representante.valores.abonod= datos.Totales.abonod.toFixed(2);

  // let hash_chs = await Hash_chs({...representante.valores, cod_chs: representante.cod_chs})
  // await Representante.updateOne({_id:representante._id},{valores:representante.valores, hash_chs, actualizado:User.username},{ upsert: true });
  await Guardar_data(User,'uecla_Representante', {_id:representante._id, valores:representante.valores, actualizado:User.username, multiples_valores:true})
  
  if (!datos.venta){
    //En mensualidades
    await Guardar_Mensualidades(datos.Mensualidades, User)
  
  }
  //En Recibo
  
  let ultimo = await Recibo.find().limit(1).sort({'valores.recibo':-1});//await Serie({tabla:'uecla_Recibo',id:'', cantidad:6}); 
  if (ultimo.length===0){ 
    ultimo=Ver_Valores().config.Recibo
  }else{
      ultimo=Number(ultimo[0].valores.recibo)+1;
  }
  console.log('>>>>>>>>>>', ultimo)
  let recibo={
      recibo:String(ultimo),
      representante:representante.valores,
      Formas_pago: datos.Formas_pago,
      mensualidades:datos.Mensualidades,
      subtotalvalor: datos.Subtotalvalor,
      totales: datos.Totales,
      valorcambio: datos.valorCambio,
      fecha
  }
  // let cod_chs = await Codigo_chs({...recibo});
  // hash_chs = await Hash_chs({...recibo, cod_chs})
  // const Nuevo = new Recibo({valores:recibo, cod_chs, hash_chs, actualizado:User.username});
  // await Nuevo.save();
  let Nuevo = await Guardar_data(User,'uecla_Recibo', {valores:recibo, fecha: moment(fecha).format('YYYY-MM-DD'), actualizado:User.username, multiples_valores:true})
  console.log(Nuevo);
  Nuevo = Nuevo[Nuevo.length-1];
  Ver_Valores().socket.emit('ActualizarPago','Pagado')
  return({Respuesta:'Ok', dato:Nuevo});


}
const Guardar_Mensualidades = async(Mensualidades, User) =>{
  // const Mensualidad= Database(`uecla_Mensualidad`);
  const Estudiante= Database(`uecla_Estudiante`);
  const Inscripcion = Database(`uecla_Inscripcion`);
  let inscripcion = await Inscripcion.find({eliminado:false});
  inscripcion= inscripcion.sort((a,b) => a.valores.periodo> b.valores.periodo ? -1 : 1).filter(f=> f.valores.estatus);
  let mensualidades= [];
  for (var i=0; i<Mensualidades.meses.length; i++){
      const mes= Mensualidades.meses[i];
      if (mes.value==='inscripcion' && inscripcion.length!==0 && inscripcion[0].valores.periodo===mes.periodo){
        let estudiante = await Estudiante.findOne({_id:mes._id});
        estudiante.valores.estatus={
          _id :1,
          titulo :"Inscrito",
          value: "inscrito",
          permisos:""
        }
        await Guardar_data(User,'uecla_Estudiante',{...estudiante, actualizado:User.username, multiples_valores:true});
      }
      const pos = mensualidades.findIndex(f=> f._id_estudiante===mes._id && f.periodo===mes.periodo)
      if (pos===-1){
          mensualidades= [...mensualidades,
              {
                  _id_estudiante:mes._id, cedula:mes.cedula, nombres:mes.nombres, apellidos:mes.apellidos,
                  periodo: mes.periodo, [mes.value]: true, [`mensaje-${mes.value}`]:'Cancelado'
              }
          ]
      }else{
          mensualidades[pos]={...mensualidades[pos],
              [mes.value]: true, [`mensaje-${mes.value}`]:'Cancelado'
          }
      }
  }
  for (let i=0; i<mensualidades.length; i++){
      const mensual= mensualidades[i];
      let mensualidad = await Ver_Mensualidades({cedula:mensual.cedula, _id:mensual._id_estudiante});//await Buscar('uecla_Mensualidad', mensual._id_estudiante, '_id_estudiante');
      mensualidad= mensualidad.filter(f=> f.valores.periodo===mensual.periodo);
      if (mensualidad.length===0){
          let valores= mensual;
          // let cod_chs = await Codigo_chs({...valores});
          // const hash_chs = await Hash_chs({...valores, cod_chs})
          // const Nuevo = new Mensualidad({valores, cod_chs, hash_chs, actualizado:User.username});
          // await Nuevo.save();
          await Guardar_data(User,'uecla_Mensualidad',{valores, actualizado:User.username, multiples_valores:true});

      }else{
          let dato=mensualidad[0];
          let valores = dato.valores;
          valores={...valores, ...mensual}
          // const hash_chs = await Hash_chs({...valores, cod_chs: dato.cod_chs})
          // await Mensualidad.updateOne({_id:dato._id},{valores, hash_chs, actualizado:User.username},{ upsert: true });
          await Guardar_data(User,'uecla_Mensualidad',{_id:dato._id, valores, actualizado:User.username, multiples_valores:true});
      }
  }
}

const Buscar = async(tabla, dato, campo='_id') =>{
  
  const BD = Database(`${tabla}`);
  let resultado = dato !== undefined ? await BD.find({[`valores.${campo}`]:dato}) : await BD.find();//{$text: {$search: dato, $caseSensitive: true}})
  if (resultado.length!==0 && dato!==undefined){
      if (campo.indexOf('.')===-1){
          resultado= resultado.filter(f=> f.valores[campo]===dato);
      }else{
          campo= campo.split('.')
          resultado= resultado.filter(f=> f.valores[campo[0]][campo[1]]===dato);
      }
  }
  //Actulizar datos desde el servidor 
  // en prueba
  // Sincronizar(false, [tabla], 2);
  return resultado;
}

const Resumen = async (props)=>{
  let {datos} = props.datos; //User, 
  // User= typeof User==='string' ? JSON.parse(User) : User;
  
  datos= JSON.parse(datos);
  // let mensualidad = await Buscar('uecla_Mensualidad', datos._id, '_id_estudiante');
  let mensualidad = await Ver_Mensualidades(datos);
  mensualidad = mensualidad.map(val=>{
      return {...val.valores}
  }).sort((a,b)=> a.periodo>b.periodo ? -1 : 1);
  let recibos =  datos.representante && datos.representante._id  ? await Buscar('uecla_Recibo', datos.representante._id, 'representante._id') : [];
  let recibos1 = datos.representante && datos.representante._id  ? await Buscar('uecla_Recibo', datos.representante.cedula, 'representante.cedula'): [];
  recibos1.map(val=>{
    const pos = recibos.findIndex(f=>String(f._id)===String(val._id))
    if(pos===-1){
        recibos = [...recibos, val]
    }
    return val
  })
  recibos= recibos.sort((a,b)=> a.valores.recibo>b.valores.recibo ? -1 : 1)
  // recibos= recibos.filter(f=> f.valores.mensualidades.meses.filter(fi=> fi._id===datos._id));
  return ({Respuesta:'Ok', datos, mensualidad, recibos});
  
}

const Recibo = async (props)=>{
  let { datos} = props.datos; //User
  // User= typeof User==='string' ? JSON.parse(User) : User;
  
  datos= JSON.parse(datos);
  // var MyDate = new Date();
  // var MyOffset = (MyDate.getTimezoneOffset()) / -60;
  let {inicio,fin}= datos;
  inicio = new Date(inicio)//.toISOString();
  // inicio.setHours(MyOffset,0,0,1);
  // inicio = inicio.toISOString()
  fin = new Date(fin)
  // fin.setHours(23+MyOffset,59,59,999);
  // fin= fin.toISOString();
  inicio= moment(inicio).format('YYYY-MM-DD');
  fin= moment(fin).format('YYYY-MM-DD');
  const BD = Database(`uecla_Recibo`);
  let recibos =  await BD.find({ fecha: { $gte: inicio, $lte:fin } });
  
  
  recibos= recibos.sort((a,b)=> a.valores.recibo>b.valores.recibo ? -1 : 1)
  // recibos= recibos.filter(f=> f.valores.mensualidades.meses.filter(fi=> fi._id===datos._id));
  return ({Respuesta:'Ok', datos, recibos});
  
}

const Solvencias = async (props) =>{
  let {datos} = props.datos;//User, Api,hash
  // User= typeof User==='string' ? JSON.parse(User) : User;
  // Sincronizar(false, ['uecla_Estudiante','uecla_Mensualidad'], 1);
  datos= JSON.parse(datos);
  let DB = Database('uecla_Mensualidad');
  let Mensualidades = await DB.find({'valores.periodo':datos.periodo});
  let estudiantes = await Buscar('uecla_Estudiante', datos.grado, 'grado.titulo');
  // estudiantes = estudiantes.filter(f=> 
  //   datos.seccion && f.valores.seccion && f.valores.seccion.titulo===datos.seccion 
  //     && f.valores.estatus && f.valores.estatus.value==='inscrito'
  //   || datos.seccion===undefined && f.valores.estatus && f.valores.estatus.value==='inscrito'
  // ).map(val=>{
  //   return {...val.valores}
  // });
    // estudiantes = estudiantes.map(val=>{
    //     return {...val.valores}
    // })
  
  let nuevo=[];
  for (var i=0;i<estudiantes.length; i++){
      let f = estudiantes[i];
      if ((datos.seccion && f.valores.seccion && f.valores.seccion.titulo===datos.seccion 
          && f.valores.estatus && f.valores.estatus.value==='inscrito')
          || (datos.seccion===undefined && f.valores.estatus && f.valores.estatus.value==='inscrito')){
          nuevo=[...nuevo, f.valores]
      }
  }

  estudiantes= [...nuevo];
  let mensualidades=[];
  for (let i=0; i<estudiantes.length; i++){
      const estu= estudiantes[i];
      const pos = Mensualidades.findIndex(f=>f.valores._id===estu._id || f.valores.cedula===estu.cedula );
      // let mensualidad = await Ver_Mensualidades(estu);//await Buscar('uecla_Mensualidad', estu.cedula, 'cedula');
      // mensualidad = mensualidad.map(val=>{
      //     return {_id:val._id, ...val.valores}
      // })
      let mensualidad = {}
      if (pos!==-1){
          mensualidad = {_id:Mensualidades[pos]._id, ...Mensualidades[pos].valores}
      }
      // mensualidad = mensualidad.filter(f=> f.periodo===datos.periodo);
      mensualidades=[...mensualidades, mensualidad];
  }
  
  return({Respuesta:'Ok', estudiantes, mensualidades});
  

}
const PeticionSerial = async(props)=>{
  const {dato}= props.datos;
  const Recibo = await Serie(dato);
  return{Respuesta:'Ok', Recibo};
}

//Funciones generales
const Guardar_data=async(User, tabla,newdatos, local=true)=>{
  
    const fecha = new Date();
    if (tabla==='uecla_Recibo'){
      newdatos.valores.subtotalvalor.abono = newdatos.valores.subtotalvalor.abono['$numberDecimal'] 
          ? Number(newdatos.valores.subtotalvalor.abono['$numberDecimal'])
          : newdatos.valores.subtotalvalor.abono;
      newdatos.valores.subtotalvalor.abonod = newdatos.valores.subtotalvalor.abonod['$numberDecimal'] 
          ? Number(newdatos.valores.subtotalvalor.abonod['$numberDecimal'])
          : newdatos.valores.subtotalvalor.abonod;
      newdatos.valores.subtotalvalor.total = newdatos.valores.subtotalvalor.total['$numberDecimal'] 
          ? Number(newdatos.valores.subtotalvalor.total['$numberDecimal'])
          : newdatos.valores.subtotalvalor.total;
      newdatos.valores.subtotalvalor.totald = newdatos.valores.subtotalvalor.totald['$numberDecimal'] 
          ? Number(newdatos.valores.subtotalvalor.totald['$numberDecimal'])
          : newdatos.valores.subtotalvalor.totald;
      newdatos.valores.totales.abono = newdatos.valores.totales.abono['$numberDecimal'] 
          ? Number(newdatos.valores.totales.abono['$numberDecimal'])
          : newdatos.valores.totales.abono;
      newdatos.valores.totales.abonod = newdatos.valores.totales.abonod['$numberDecimal'] 
          ? Number(newdatos.valores.totales.abonod['$numberDecimal'])
          : newdatos.valores.totales.abonod;
      newdatos.valores.totales.bolivar = newdatos.valores.totales.bolivar['$numberDecimal'] 
          ? Number(newdatos.valores.totales.bolivar['$numberDecimal'])
          : newdatos.valores.totales.bolivar;
      newdatos.valores.totales.dolar = newdatos.valores.totales.dolar['$numberDecimal'] 
          ? Number(newdatos.valores.totales.dolar['$numberDecimal'])
          : newdatos.valores.totales.dolar;
      newdatos.valores.totales.restand = newdatos.valores.totales.restand['$numberDecimal'] 
          ? Number(newdatos.valores.totales.restand['$numberDecimal'])
          : newdatos.valores.totales.restand;
      newdatos.valores.totales.restan = newdatos.valores.totales.restan['$numberDecimal'] 
          ? Number(newdatos.valores.totales.restan['$numberDecimal'])
          : newdatos.valores.totales.restan;
      newdatos.valores.totales.total = newdatos.valores.totales.total['$numberDecimal'] 
          ? Number(newdatos.valores.totales.total['$numberDecimal'])
          : newdatos.valores.totales.total;
      newdatos.valores.totales.totald = newdatos.valores.totales.totald['$numberDecimal'] 
          ? Number(newdatos.valores.totales.totald['$numberDecimal'])
          : newdatos.valores.totales.totald;
    }
    let DB = Database(tabla);
    // console.log(tabla,newdatos )
    let ultimo ={}
    if (newdatos._id){//(newdatos._id){
        const hash_chs = await Hash_chs({...newdatos});
        ultimo={_id:newdatos._id, ...newdatos, hash_chs, actualizado:User.username, updatedAt:String(fecha), local};
        // console.log(tabla, newdatos._id, local, newdatos.valores.nombres)
       const resul= await DB.update({_id:newdatos._id},{...newdatos, eliminado:newdatos.eliminado,  hash_chs, actualizado:User.username, updatedAt:String(fecha), local},{ upsert: true });
       if (tabla==='uecla_Pago')
        console.log('Despues de guardar>>>>>',resul, tabla, newdatos.valores.estatus)
    } else {
        const _id = ObjectID(fecha.getTime()).toHexString();
        let cod_chs = await Codigo_chs({...newdatos['multiples_valores'] ? newdatos.valores : newdatos});
        const hash_chs = await Hash_chs({...newdatos, cod_chs})
        ultimo={_id,...newdatos, cod_chs, hash_chs, actualizado:User.username,fecha: String(fecha),createdAt: String(fecha), updatedAt:String(fecha), local}
        await DB.insert({_id, ...newdatos, cod_chs, hash_chs, actualizado:User.username,fecha: moment(fecha).format('YYYY-MM-DD'),createdAt: String(fecha), updatedAt:String(fecha), local});
    }
    let resultado = await DB.find({eliminado:false});
    nuevo_Valores({sincronizado:!local});
    resultado=[...resultado,ultimo]
    return resultado
}
const Movimiento = (dato)=>{
  return{
    _id: dato._id, codigo:dato.codigo, unidad:dato.unidad, descripcion: dato.descripcion,
    cantidad: dato.cantidad,
    ...dato.saco ? {saco:dato.saco} : {},
    ...dato.cantsaco ? {cantsaco:dato.cantsaco} : {}
  }
}
const Serie = async(dato)=>{
  const DB = Database(dato.tabla);
  let total = await DB.count({});
  // console.log('Cantidad ......', total)
  const Recibo = Generar_codigo(total,`${dato.id ? dato.id : 'S'}`, dato.cantidad ? dato.cantidad : 6);
  return Recibo;
}
const Generar_codigo = (valor, id='', cantidad=5)=>{
  let nuevo = String(Number(valor) + 1);
  let cero = cantidad-nuevo.length;
  for (var i=0; i<cero; i++){
    nuevo='0'+nuevo;
  }
  return `${id!=='' ? id+'-' : ''}${nuevo}`
}
//Leer valores
const Ver_datos = async (tablas, cantidad=20, eliminados=false) =>{
    let datos={};
    try{
      return Promise.all(tablas.map(async(data)=>{
        let DB = Database(data);
        let count = await DB.count({});
        const menos = await DB.count(!eliminados ? {eliminado:true} : {});
        count -= menos;
        // console.log('peticion>>>', data, count);
        if (count>=cantidad){
          // console.log(count)
          let pagina= 0;
          datos[data]=[];
          // while (pagina*cantidad<= count){
            const dbs = await DB.find({eliminado:eliminados}).limit(cantidad).skip(pagina*cantidad).exec();
            datos[data]=[...datos[data],...dbs];
            pagina+=1;
          // }
          // console.log('Cargados>>>>>',data, datos[data].length, datos[data].length)
        }else{
          const dbs = await DB.find({eliminado:eliminados});
          datos[data]=dbs;
        }
        
        datos[data+'_cantidad']=count;
        return data;
      })).then(()=>{
        return {Respuesta:'Ok', datos, dia: new Date()};
      });
    }catch(error) {
      console.log('Error-Getall',error);
      return {Respuesta:'Error'};
    }
}

//Leer valores por condicion 
const Ver_datos_C = async (tablas, condicion, eliminados=false) =>{
    let datos={};
    try{
      return Promise.all(tablas.map(async(data)=>{
        let DB = Database(data);
        let dbs;
        if (['Ultimo', 'ultimo'].indexOf(condicion[data])!==-1 ){
          dbs = await DB.find().sort({$natural:-1}).limit(1);
        }else if(['cantidad', 'Cantidad'].indexOf(condicion[data])!==-1 ){
          dbs = await DB.count({});
          const menos = await DB.count(!eliminados ? {eliminado:true} : {});
          dbs-=menos;
        }else if( condicion[data] !==undefined && Object.keys(condicion[data]).indexOf('pagina')!==-1 && Object.keys(condicion[data]).indexOf('condicion')!==-1){
          dbs = await DB.find(condicion[data].condicion)
                              .sort(condicion[data].sort ? condicion[data].sort : {$natural:-1})//'-createdAt')
                              .limit(condicion[data].cantidad)
                              .skip(condicion[data].pag*condicion[data].cantidad).exec();
          // console.log('Paginando', condicion[data].pag,condicion[data].cantidad, data, condicion[data].condicion)
        }else if( Object.keys(condicion[data] !==undefined && condicion[data]).indexOf('pagina')!==-1){
          dbs = await DB.find({eliminado:eliminados})
                              .limit(condicion[data].cantidad)
                              .skip(condicion[data].pag*condicion[data].cantidad).exec();
          // console.log('Paginando', condicion[data].pag,condicion[data].cantidad, data)
        }else if (Object.keys(condicion[data]).length!==0 && Object.keys(condicion[data]).indexOf('condicion')!==-1 && Object.keys(condicion[data]).indexOf('sort')!==-1){
          dbs = await DB.find(condicion[data].condicion).sort(condicion[data].sort);
        }else if (Object.keys(condicion[data]).length===0){
          dbs = await DB.find({eliminado:eliminados});
        }else{
            //   await DB.createIndexes()
            // console.log('><<<<<<<<<<?????????????????',condicion[data])
            if (condicion[data]['$text']){
              dbs = await DB.find({eliminado:eliminados});
              dbs = Resultado_encontrados(dbs, condicion[data]['$text']['$search'])
            }else{
              dbs = await DB.find(condicion[data]);
            }
        }
        datos[data]=dbs.sort((a, b) => (a.createAt > b.createAt ? -1 : a.createAt < b.createAt ? 1 : 0));
        return data;
  
      })).then(()=>{
        return {Respuesta:'Ok', datos, dia: new Date()};
      });
    }catch(error) {
      console.log('Error-Getall',error);
      return {Respuesta:'Error'};
    }
  }