import React,{useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Formulario from '../../../componentes/herramientas/formulario';
import Dialogo from '../../../componentes/herramientas/dialogo';

import { genera_formulario, conexiones, Form_todos, nuevo_Valores, Ver_Valores } from '../../../constantes';
import moment from 'moment';
import Confirmar from './confirmar';

export default function Verificar(props) {
    const [formulario, setFormulario] = useState();
    const [pendiente, setPendiente] = useState();
    const [rechazado, setRechazado] = useState();
    const [dialogo, setDialogo] = useState({open:false});
    const Inicio = async() =>{
        let {datos} = props
        let respu= await conexiones.Leer_C(['uecla_Pago'],{
            uecla_Pago:{ $and: [ { "valores.Representante":datos._id}]}
        })
        if (respu.Respuesta==='Ok'){
            let pend = [];
            let rech = [];
            respu.datos.uecla_Pago.map(val=>{
                if (val.valores.estatus==='0' && val.eliminado!==true){
                    pend=[...pend, val];
                }else if(val.valores.estatus==='1' && val.eliminado!==true){
                    rech=[...rech, val];
                }
                return val
            })
            setPendiente(pend);
            setRechazado(rech);
            if (pend.length!==0){
                const dato = pend[0];
                
                nuevo_Valores({
                    datosActuales:{
                        pantalla:'Pasos', datos,
                        Mensualidades:dato.valores.Mensualidades, 
                        formapago:dato.valores.Formas_pago,
                        Subtotalvalor:dato.valores.Subtotalvalor,
                        Totales: dato.valores.Totales,
                        Pendiente:true,
                        id_pago: dato._id,
                        Recibo: Ver_Valores().datosActuales ? Ver_Valores().datosActuales.Recibo : undefined
                    }
                });
                if (props.Cambio) 
                props.Cambio({
                    pantalla:'Pasos', datos, 
                    Meses:{}, 
                    Mensualidades:dato.valores.Mensualidades, 
                    Formas:undefined, 
                    Formas_pago:dato.valores.Formas_pago, 
                    formas_pago:dato.valores.Formas_pago,
                    formapago:dato.valores.Formas_pago,
                    Subtotalvalor:dato.valores.Subtotalvalor,
                    Totales: dato.valores.Totales,
                    files:dato.valores.files,
                    valorCambio:dato.valores.valorCambio,
                    Pendiente:true,
                    id_pago: dato._id
                })
            }else{
                nuevo_Valores({datosActuales:{Recibo: Ver_Valores().datosActuales ? Ver_Valores().datosActuales.Recibo : undefined}});
                if (props.Cambio) props.Cambio({
                    pantalla:'Pasos', datos, 
                    Meses:{}, 
                    Mensualidades:{meses:[]}, 
                    Formas:undefined, 
                    Formas_pago:undefined, 
                    formas_pago:undefined, 
                    Subtotalvalor:{abono:datos.valores.abono, abonod:datos.valores.abonod},
                    files:undefined, Pendiente:false, id_pago: undefined
                })
            }
        }
        // let nuevo = Form_todos('Form_Representados');
        let nuevos = await genera_formulario({valores:datos.valores, campos: Form_todos('Form_Representados', Config) })
        nuevos.titulos.representados.nopaginar=true;
        nuevos.titulos.representados.noeliminar=true;
        nuevos.titulos.representados.style={height:window.innerWidth > 750 ? window.innerHeight * 0.35 : window.innerHeight * 0.3};//220};
        setFormulario(nuevos)
    }
    const Cancelar = async(id)=>{
        const resp= await conexiones.Eliminar({_id:id},['uecla_Pago']);
        if (resp.Respuesta==='Ok'){
            setDialogo({open:false});
            Inicio();
        }
    }
    const Mostrar = (dato)=>{
        let {datos} = props
        setDialogo({
            open:true,
            tam:'lg',
            Titulo:'Pago Pendiente',
            Cuerpo: <Confirmar {...{pantalla:'Pasos', datos, 
                                    Meses:{}, 
                                    Mensualidades:dato.valores.Mensualidades, 
                                    Formas:undefined, 
                                    Formas_pago:dato.valores.Formas_pago, 
                                    formas_pago:dato.valores.Formas_pago,
                                    formapago:dato.valores.Formas_pago,
                                    Subtotalvalor:dato.valores.Subtotalvalor,
                                    Totales: dato.valores.Totales,
                                    files:dato.valores.files,
                                    valorCambio:dato.valores.valorCambio,
                                    Pendiente:dato.valores.estatus==='0' ? true : dato.valores.Pendiente,
                                    Motivo_rechazo: dato.valores.Motivo_rechazo,
                                    id_pago:dato.valores.id_pago ? dato.valores.id_pago : dato._id,
                                    Cancelar
                                }}
                    />,
            Cerrar: ()=>{
                setDialogo({open:false});
            },
        })
    }
    const {Config}=props;
    useEffect(()=>{
        Ver_Valores().socket.on('ActualizarPago',data=>{
            console.log(props.pantalla);
            Inicio();
        })
        Ver_Valores().socket.on('Actualizar',data=>{
            console.log(props.pantalla);
            if (data==='uecla_Pago'){
                Inicio();
            }
        })
        Inicio();
        return ()=>{
            
        }
    },[])
    return (
        <Box sx={{ textAlign:'left', pb:9 }}>
            {pendiente && pendiente.length!==0
                ?   <Alert severity="warning">Pagos pendientes: 
                    {
                        pendiente.map((val, i)=>
                        <Link href="#" key={val._id}
                            onClick={()=> Mostrar(val)}
                        >
                            {` ${moment(val.valores.fecha).format('DD/MM/YYYY')} ${i < pendiente.length - 1 ? ',' : ''} `}
                        </Link>
                    )}</Alert>
                : null
            }
            {rechazado && rechazado.length!==0
                ?   <Alert severity="error">Pagos Rechazados: 
                    {
                        rechazado.map((val, i)=>
                        <Link href="#" key={val._id}
                            onClick={()=> Mostrar(val)}
                        >
                            {` ${moment(val.valores.fecha).format('DD/MM/YYYY')} ${i < rechazado.length - 1 ? ',' : ''} `}
                        </Link>
                    )}</Alert>
                : null
            }
            <Typography variant={window.innerWidth > 750 ? "h6" : "subtitle1"} component="div" sx={{...Config ? {color:Config.Estilos.Input_label.color} : {} }}>
                DATOS DEL REPRESENTANTE
            </Typography>
            <Divider />
            
            <Typography variant={window.innerWidth > 750 ? "h6" : "subtitle1"}  component="div" sx={{...Config ? {color:Config.Estilos.Input_label.color} : {} }}>
                Cedula: {props.datos.valores.cedula}
            </Typography>
            <Typography variant={window.innerWidth > 750 ? "h6" : "subtitle1"} component="div" sx={{...Config ? {color:Config.Estilos.Input_label.color} : {} }}>
                Nombres y Apellidos : {props.datos.valores.nombres} {props.datos.valores.apellidos}
            </Typography>
            <Typography variant={window.innerWidth > 750 ? "h6" : "subtitle1"} component="div" sx={{...Config ? {color:Config.Estilos.Input_label.color} : {} }}>
                Direccion : {props.datos.valores.direccion}
            </Typography>
            
            {formulario
                ? <Formulario {...formulario} Config={Config}/>
                : null
            }
            <Dialogo  {...dialogo} config={props.Config}/>
        </Box>
    );
}
