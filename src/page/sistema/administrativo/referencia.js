import React, {useState, useEffect} from 'react';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
import { Ver_Valores, conexiones} from '../../../constantes';
import { Form_todos, Titulos_todos } from '../../../constantes/formularios';
import Cargando from '../../../componentes/esperar/cargar';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Icon from '@mui/material/Icon';

function Referencia (props) {
    
    const [state, setState]= useState({esperar:true});
    
    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }
    
    const Condiciones = (campos, datos) =>{
        let {valores}= datos
        return valores
    }

    const Refrescar = () =>{

    }

    const Seleccion = (dato)=>{
        console.log(dato);
    }
    const Actualizar_Referencia = async()=>{
        await conexiones.Actualizar_Referencia();
    }
    const Inicio = async() =>{
        const titulos = await Titulos_todos(`Titulos_Referencia`, Config)
        cambiarState({esperar:false, titulos})
    }
    const Botones = (datos)=>{
        console.log(datos)
        return
            <Stack direction="row" spacing={1}>
                <IconButton color={'primary'} title={'Refrescar valores de Referencia'} onClick={Refrescar}>
                    <AutorenewIcon style={color}/>
                </IconButton>
                <IconButton color={'primary'} title={'Actualizar referencia utilizadas en los recibos'} onClick={Actualizar_Referencia}>
                    <Icon style={color}>sticky_note_2</Icon>
                </IconButton>
            </Stack>
        
    }
    useEffect(()=>{
        Inicio()
    }, [props])
    const {Config}= props;
    const color =  props.Config.Estilos.Input_icono_t ? props.Config.Estilos.Input_icono_t : {};
    return state.esperar ? <Cargando open={state.esperar} Config={Config}/> :(
        
            <TablaMultiple
                Config={Config ? Config : Ver_Valores().config}
                multiples_valores={true}
                Agregar_mas={false}
                Condiciones={Condiciones}
                Columnas={2} 
                Form_origen = {Form_todos(`Form_Docente`, Config)}
                Titulo_tabla={'Referencias'}
                Table = {'uecla_Referencia'}
                Eliminar_props={(dato)=>{
                    return `Desea eliminar`
                }}
                Titulo_dialogo ={(dato)=> dato._id ? `Registro `: `Nuevo Registro `}
                Titulos_tabla = {state.titulos}
                cargaporparte = {true}
                Seleccion= {Seleccion}
                Acciones={
                    <Stack direction="row" spacing={1}>
                       
                        <IconButton color={'primary'} title={'Actualizar referencia utilizadas en los recibos'} onClick={Actualizar_Referencia}>
                            <Icon style={color}>sticky_note_2</Icon>
                        </IconButton>
                    </Stack>
                }
                
            />
        
      
    )
}

export default Referencia;