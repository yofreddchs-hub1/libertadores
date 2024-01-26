import React, {useState, useEffect} from 'react';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
import { Ver_Valores} from '../../../constantes';
import { Form_todos, Titulos_todos } from '../../../constantes/formularios';
import Cargando from '../../../componentes/esperar/cargar';

function RAranceles (props) {
    
    const [state, setState]= useState({esperar:true});
    
    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }

    const Inicio = async() =>{
        const titulos = await Titulos_todos(`Titulos_Arancel`, Config)
        cambiarState({esperar:false, titulos})
    }
    const ordenar = (dato)=>{
        let lista = [];
        const nuevo = dato.filter(f=> {
            const pos = lista.indexOf(f._id);
            if (pos===-1){
                lista = [...lista, f._id];
            }
            return pos===-1
        }).sort((a,b)=> a.valores.periodo.periodo>b.valores.periodo.periodo ? -1 :1)
        return nuevo
    }
    useEffect(()=>{
        Inicio()
    }, [props])
    const {Config}= props;
    return state.esperar ? <Cargando open={state.esperar} Config={Config}/> :(
            <TablaMultiple
                ordenar={ordenar}
                Config={Config ? Config : Ver_Valores().config}
                multiples_valores={true}
                Agregar_mas={false}
                Columnas={2} 
                Form_origen = {Form_todos(`Form_Arancel`, Config)}
                Titulo_tabla={'Registro de Aranceles'}
                Table = {'uecla_Arancel'}
                Eliminar_props={(dato)=>{
                    const lista = Ver_Valores().config.Listas.lista_Meses;
                    return `Desea eliminar periodo ${dato.periodo.periodo}, ${lista[dato.mes_inicio._id!==undefined ? dato.mes_inicio._id : dato.mes_inicio].titulo} - ${lista[dato.mes_final._id!==undefined ? dato.mes_final._id : dato.mes_final].titulo}`
                }}
                
                Titulo_dialogo ={(dato)=> {
                    const lista = Ver_Valores().config.Listas.lista_Meses
                    const titulo = dato._id 
                        ? `Arancel ${dato.periodo.periodo}, ${lista[dato.mes_inicio._id!==undefined ? dato.mes_inicio._id : dato.mes_inicio].titulo} - ${lista[dato.mes_final._id!==undefined ? dato.mes_final._id : dato.mes_final].titulo}`
                        : `Nuevo Arancel`
                    return titulo
                }}
                Titulos_tabla = {state.titulos}
                cargaporparte = {true}
                sinpaginacion = {true}    
            />
    )
}

export default RAranceles;