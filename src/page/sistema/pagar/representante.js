import React, {useEffect, useState} from 'react';
// import Esperar from '../../../componentes/esperar/cargar';
import { Box } from '@mui/material';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
import { conexiones, nuevo_Valores, Ver_Valores} from '../../../constantes';
import { Form_todos, Titulos_todos } from '../../../constantes/formularios';
import Cargando from '../../../componentes/esperar/cargar';

function Representante_pagar (props) {
    
    const [state, setState]= useState({esperar:true});
    
    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }
    // const Actualizar_data = (valores)=>{
        
    //     cambiarState({cantidad:valores.cantidad, datos:valores.nuevodatos})
    // }
    
    // const Refrescar = ()=>{
    //     cambiarState({cantidad:-1, datos:[]})
    // }
    
    const Condiciones = (valores) =>{
        return valores
    }

    const Seleccion = (valores) =>{

        nuevo_Valores({datosActuales:{}});
        if (props.Cambio) props.Cambio({pantalla:'Pasos', datos:valores, Meses:{}, Mensualidades:{meses:[]}, 
                                            Formas:undefined, Formas_pago:undefined, formas_pago:undefined, 
                                            Subtotalvalor:{abono:valores.valores.abono, abonod:valores.valores.abonod},
                                            files:undefined, Pendiente:false, id_pago: undefined
                                        })
    }

    const Pendiente = async(dato)=>{
        let respu= await conexiones.Leer_C(['uecla_Representante'],{
            uecla_Representante:{_id:dato.valores.Representante}
        })
        
        if(respu.Respuesta==='Ok'){
            const repres = respu.datos.uecla_Representante[0];
            nuevo_Valores({datosActuales:{
                pantalla:'Pasos', datos:repres,
                Mensualidades:dato.valores.Mensualidades, 
                formapago:dato.valores.Formas_pago,
                Subtotalvalor:dato.valores.Subtotalvalor,
                Totales: dato.valores.Totales,
                Pendiente:true,
                id_pago: dato._id
            }});
            if (props.Cambio) 
            props.Cambio({pantalla:'Pasos', datos:respu.datos.uecla_Representante[0], 
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
        }
        
    }
    const Inicio = async() =>{
        const titulos = await Titulos_todos(`Titulos_Representante`, Config)
        let respu= await conexiones.Leer_C(['uecla_Pago'],{
            uecla_Pago:{"valores.estatus":"0"}
        })
        let porPagar=[];
        if(respu.Respuesta==='Ok'){
            porPagar = respu.datos.uecla_Pago.filter(f=> f.eliminado===false || f.eliminado===undefined);

        }
        cambiarState({esperar:false, titulos, porPagar})
    }

    useEffect(()=>{
        Ver_Valores().socket.on('ActualizarPago',data=>{
            Inicio();
        })
        Ver_Valores().socket.on('Actualizar',data=>{
            if (data==='uecla_Pago'){
                Inicio();
            }
        })
        Inicio()
        return ()=>{}
    }, [props])
    const {Config}= props;
    return state.esperar ? <Cargando open={state.esperar} Config={Config}/> : (
        <Box component={'div'}>
            <Stack sx={{ width: '100%' }} spacing={2}>
                {state.porPagar && state.porPagar.length!==0
                    ? <Alert severity="warning">Pagos pendientes: 
                        {
                            state.porPagar.map((val, i)=>
                            <Link href="#" key={val._id} 
                                onClick={()=>Pendiente(val)}
                            >
                                {` ${val.valores.Data.nombres} ${val.valores.Data.apellidos}${i < state.porPagar.length - 1 ? ',' : ''} `}
                            </Link>
                        )}</Alert>
                    : null
                
                }
            </Stack>
            <TablaMultiple
                Config={props.Config ? props.Config : Ver_Valores().config}
                multiples_valores={true}
                Agregar_mas={false}
                Condiciones={Condiciones}
                Columnas={2} 
                Form_origen = {Form_todos(`Form_Representante`, Config)}
                Titulo_tabla={'Representantes'}
                Table = {'uecla_Representante'}
                Eliminar_props={(dato)=>{
                    return `Desea eliminar`
                }}
                Titulo_dialogo ={(dato)=> dato._id ? `Registro `: `Nuevo Registro `}
                Titulos_tabla = {state.titulos}
                cargaporparte = {true}
                Acciones={
                    <div>Pagar Mensualidad</div>
                }
                Seleccion={Seleccion}
                // sinpaginacion = {true}
            />
        </Box>
      
    )
}

export default Representante_pagar;