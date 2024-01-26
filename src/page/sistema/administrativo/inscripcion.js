import React, {useState, useEffect} from 'react';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
import { Ver_Valores} from '../../../constantes';
import { Form_todos, Titulos_todos } from '../../../constantes/formularios';
import Cargando from '../../../componentes/esperar/cargar';

function RInscripcion (props) {
    
    const [state, setState]= useState({esperar:false});
    
    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }
    
    const Inicio = async() =>{
        const titulos = await Titulos_todos(`Titulos_Inscripcion`, Config)
        cambiarState({esperar:false, titulos})
    }
    const ordenar = (dato)=>{
        const nuevo = dato.filter(f=> f.valores).sort((a,b)=> a.valores.periodo>b.valores.periodo ? -1 :1)
        return nuevo
    }
    useEffect(()=>{
        Inicio()
    }, [props])
    const {Config}= props;
    return state.esperar ? <Cargando open={state.esperar} Config={Config}/> :(
        
            <TablaMultiple
                ordenar ={ordenar}
                Config={Config ? Config : Ver_Valores().config}
                multiples_valores={true}
                Agregar_mas={false}
                Columnas={2} 
                Form_origen = {Form_todos(`Form_Inscripcion`, Config)}
                Titulo_tabla={'Registro Inscripciones'}
                Table = {'uecla_Inscripcion'}
                
                Eliminar= {'titulo'}
                Titulo_dialogo ={(dato)=> dato._id ? `Registro `: `Nueva Inscripción `}
                Titulos_tabla = {state.titulos}
                cargaporparte = {true}
                sinpaginacion = {true}
                
            />
        
      
    )
}

export default RInscripcion;