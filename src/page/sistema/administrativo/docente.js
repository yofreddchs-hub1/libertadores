import React, {useState, useEffect} from 'react';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
import { Ver_Valores} from '../../../constantes';
import { Form_todos, Titulos_todos } from '../../../constantes/formularios';
import Cargando from '../../../componentes/esperar/cargar';

function Docente (props) {
    
    const [state, setState]= useState({esperar:true});
    
    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }
    
    const Condiciones = (campos, datos) =>{
        let {valores}= datos
        return valores
    }

    const Inicio = async() =>{
        const titulos = await Titulos_todos(`Titulos_Docente`, Config)
        cambiarState({esperar:false, titulos})
    }
    useEffect(()=>{
        Inicio()
    }, [props])
    const {Config}= props;
    return state.esperar ? <Cargando open={state.esperar} Config={Config}/> :(
        
            <TablaMultiple
                Config={Config ? Config : Ver_Valores().config}
                multiples_valores={true}
                Agregar_mas={false}
                Condiciones={Condiciones}
                Columnas={2} 
                Form_origen = {Form_todos(`Form_Docente`, Config)}
                Titulo_tabla={'Docentes'}
                Table = {'uecla_Docente'}
                Eliminar_props={(dato)=>{
                    return `Desea eliminar`
                }}
                Titulo_dialogo ={(dato)=> dato._id ? `Registro `: `Nuevo Registro `}
                Titulos_tabla = {state.titulos}
                cargaporparte = {true}
               
                
            />
        
      
    )
}

export default Docente;