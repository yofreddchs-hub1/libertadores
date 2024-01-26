import React, {useState, useEffect} from 'react';
// import Esperar from '../../../componentes/esperar/cargar';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
import { nuevo_Valores, Ver_Valores} from '../../../constantes';
import { Form_todos, Titulos_todos } from '../../../constantes/formularios';
import Cargando from '../../../componentes/esperar/cargar';

function Representante_pagar (props) {
    const [state, setState]= useState({esperar:true});
    
    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }

    const Condiciones = (valores) =>{
        return valores
    }

    const Seleccion = (valores) =>{
        nuevo_Valores({datosActuales:{}});
        if (props.Cambio) props.Cambio({pantalla:'Pasos', datos:valores, Meses:{}, Mensualidades:{meses:[]}, 
                                            Formas:undefined, Formas_pago:undefined, formas_pago:undefined, 
                                            Subtotalvalor:{abono:valores.valores.abono, abonod:valores.valores.abonod}
                                        })
    }

    const Inicio = async() =>{
        const titulos = await Titulos_todos(`Titulos_RepresentanteP`, Config)
        cambiarState({esperar:false, titulos})
    }

    useEffect(()=>{
        Inicio()
    }, [props])

    const {Config}= props;
    return state.esperar ? <Cargando open={state.esperar} Config={Config}/> :(
        
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
                    <div>Venta Producto</div>
                }
                Seleccion={Seleccion}
                
            />
        
      
    )
}

export default Representante_pagar;