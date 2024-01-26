import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Representante from './representante';
import Pasos from './pasos';
import { conexiones } from '../../../constantes';



export default function Productos(props) {
  
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
    // console.log('Bolivar',bolivar, total, restan,'Dolar', dolar, totald, restand)
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
    const {datos, formapago, Mensualidades, Subtotalvalor, Totales, valorCambio} = state;
    setState({...state, enviando:true})
    const Formas_pago = formapago;
    const resultado = await conexiones.Enviar_pago({Representante:datos._id, Formas_pago, Mensualidades, Subtotalvalor, Totales, valorCambio, venta:true})
    if (resultado.Respuesta==='Ok'){
      // console.log(resultado.dato)
      setState({...state, enviando:false, Recibo: resultado.dato})
    }else{
      setState({...state, enviando:false})
    }
    return resultado.Respuesta
  }
  return state.pantalla==='Representante'
    ? <Representante  Cambio={Cambio} Config={props.Config}/>
    : state.pantalla==='Pasos'
    ? <Pasos {...state} Cambio={Cambio} Enviar={Enviar}/>
    : (
        <Box sx={{ flexGrow: 1 }}>
        
        </Box>
      );
}