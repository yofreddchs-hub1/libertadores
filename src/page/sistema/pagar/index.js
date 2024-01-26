import React, {useState} from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Representante from './representante';
import Pasos from './pasos';
import { Ver_Valores, conexiones, nuevo_Valores } from '../../../constantes';
import Cargando from '../../../componentes/esperar/cargar';
import { useEffect } from 'react';
import moment from 'moment';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height:window.innerHeight * 0.8,

}));

export default function Pagar(props) {
  
  const [state, setState]= useState({
    pantalla:props.Representante ? 'Pasos' : 'Representante', 
    datos: props.Representante ? props.Representante : [],
    monstrar_representante: !props.Representante,
    inscripcion: props.Inscripcion,
    Refrescar: props.Refrescar,
    formapago: props.formapago,
    Formas_pago:props.Formas_pago,
    Config:props.Config,
    Subtotalvalor: props.Subtotalvalor ? props.Subtotalvalor : {}
  });
  
  const Cambio = (valor) =>{
    valor={...state, ...valor}
    if (valor.formapago){
      valor = Calcular(valor)
    }
    setState({...valor})
  }
  const Aprobar = (val)=>{
    let aprobar = true;
    if ([undefined, null, ''].indexOf(val)!==-1){
      aprobar=false;
    }
    return aprobar
  }
  const Calcular = (valores) =>{
    let {formapago}= valores;
    const {valorCambio}= state;
    let bolivar=0;
    let dolar=0;
    let abono=0;
    let abonod=0;
    let aprobar = true;
    formapago.map(val=>{
      
      // Object.keys(val).filter(f=>['_id','titulo','value','permisos','id'].indexOf(f)===-1).map(n=>{
      //   console.log(val.value, n);
      //   if(val.value==='debito' && ['bancod'].indexOf(n)===-1){
      //     aprobar = Aprobar(val[n]);
      //   }else if (['efectivobolivar','efectivodolar'].indexOf(val.value)!==-1 && ['monto'].indexOf(n)!==-1){
      //     aprobar = Aprobar(val[n]);
      //   }
      //   return n
      // })
      if (['efectivodolar','zelle','otro'].indexOf(val.value)===-1 ||(val.value==='otro' && val.moneda==='Bs')){
        bolivar+= val.monto ? Number(val.monto) : 0;
      }else{
        dolar+= val.monto ? Number(val.monto) : 0;
      }
      
      return val
    })
    const total= bolivar + (dolar * valorCambio);
    const totald= dolar + (bolivar / valorCambio);
    abono = bolivar!==0 ? total - state.Subtotalvalor.total : 0;
    abonod = dolar!==0 && bolivar===0 ? totald - state.Subtotalvalor.totald : 0;
    let restan = total - state.Subtotalvalor.total;
    let restand = totald - state.Subtotalvalor.totald;
    
    let mensaje = '';
    if (Number(restan.toFixed(2))<0){
      mensaje= 'El monto es menor al monto a cancelar, ';
    }
    if (!aprobar){
      mensaje = mensaje + 'Debe indicar todos los datos';
    }
    if (mensaje==='') mensaje = 'Puede continuar'
    return {...valores, Totales:{bolivar, total, abono, restan, dolar, totald, abonod, restand, mensaje}}
  }

  const Enviar = async() =>{
    const fecha = moment().format('DD/MM/YYYY');
    const {User, tipo}= Ver_Valores();
    if (tipo==='Electron'){
      const result= await conexiones.Leer_C(['uecla_Recibo'], 
        {
          uecla_Recibo:{pagina: 1, condicion:{$or:[{eliminado:false},{eliminado:undefined}]}, cantidad:1, pag:0, sort:{'valores.recibo':-1}},
        }
      );
    }
    const {datos, formapago, Mensualidades, Subtotalvalor, Totales, valorCambio, files, id_pago, Pendiente, Motivo_rechazo} = state;
    const Formas_pago = formapago.map(valor=>{
      return {...valor, fecha : [undefined, null, false].indexOf(valor.fecha)!==-1 ? fecha: valor.fecha}
    });
    setState({...state, enviando:true})
    const pago = [4,'4'].indexOf(User.categoria)!==-1;
    const resultado = await conexiones.Enviar_pago({Representante:datos._id, Formas_pago, Mensualidades, Subtotalvalor, Totales, valorCambio, files, pago, id_pago, Pendiente, Motivo_rechazo})
    if (resultado.Respuesta==='Ok'){
      nuevo_Valores({datosActuales:{...Ver_Valores().datosActuales,Recibo:resultado.dato, pagoEnviado:resultado.pagoEnviado}})
      setState({...state, enviando:false, Recibo: resultado.dato, pagoEnviado:resultado.pagoEnviado})
    }else{
      setState({...state, enviando:false})
    }
    
    return resultado
  }
  const Inicio =async()=>{
    const {User}= Ver_Valores();
    let respu= await conexiones.Leer_C(['uecla_Representante'],{
      uecla_Representante:{_id:User._id}
    })
    
    const representate=respu.datos.uecla_Representante[0];
    if ([4,'4'].indexOf(User.categoria)!==-1){
      
      Cambio({
          datos:representate, pantalla:'Pasos', 
          monstrar_representante:false, 
          Subtotalvalor: {abono:representate.valores.abono, abonod:representate.valores.abonod},
          Mensualidades:{meses:[]},
          Meses:{},
          Formas:undefined, Formas_pago:undefined, formas_pago:undefined, 
      })
    }
    
  }
  useEffect(()=>{
    Inicio();
    return ()=>{

    }
  },[])
  return state.pantalla==='Representante'
    ? <Representante  Cambio={Cambio} Config={props.Config}/>
    : state.pantalla==='Pasos'
    ? <Pasos {...state} Cambio={Cambio} Enviar={Enviar}/>
    : (
        <Box sx={{ flexGrow: 1 }}>
          <Cargando open={true} Config={state.Config}/>
        </Box>
      );
}