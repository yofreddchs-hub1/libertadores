import React, {useState, useEffect} from 'react';
import TablaMultiple from '../../componentes/herramientas/tabla/tabla_multiple';
import Tabla from '../../componentes/herramientas/tabla';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';
import Dialogo from '../../componentes/herramientas/dialogo';
import { Ver_Valores, conexiones, Form_todos, Titulos_todos } from '../../constantes';
import {Condicion_Estudiante, Condicion_Representante, Estadisticas} from '../sistema/funciones' 
import Cargando from '../../componentes/esperar/cargar';
import moment from 'moment';
import Estadistica from '../../componentes/herramientas/estadistica';

function Representante (props) {
    
    const [state, setState]= useState({esperar:true, Dialogo:{open:false}});
    
    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }
    
    const Condiciones = async(campo, datos) =>{
        let {valores}= datos
        switch (campo) {
            case 'uecla_Estudiante':{
                valores= await Condicion_Estudiante(datos);
                return valores
            }
            case 'uecla_Representante':{
                valores = await Condicion_Representante(datos);
                return valores
            }
            default:
                return valores;
        }
    
    }
    const Inicio = async() =>{
        const titulos = await Titulos_todos(`Titulos_Representante`, Config)
        cambiarState({esperar:false, titulos})
    }
    const Resumen = async(dato)=>{
        const resultado = await conexiones.Resumen(dato);
        let {recibos, mensualidad} = resultado;
        const Cuerpo= 
            <div>
                <Tabla  Titulo={"Solvencias"}
                        Config={Ver_Valores().config}
                        titulos={Titulos_todos(`Titulos_Solvencias`)}
                        table={'uecla_Mensualidad'}
                        cantidad={mensualidad ? mensualidad.length : 0}
                        datos={mensualidad ? mensualidad : []}
                        cargaporparte={true }
                        sinpaginacion
                        alto={window.innerHeight * 0.25}
                        
                />
                <Tabla  Titulo={"Recibos"}
                    Config={Ver_Valores().config}
                    titulos={Titulos_todos(`Titulos_Recibo`)}
                    table={'uecla_Recibo'}
                    cantidad={recibos ? recibos.length : 0}
                    datos={recibos ? recibos : []}
                    // Accion={Abrir}
                    cargaporparte={true}
                    sinpaginacion
                    alto={window.innerHeight * 0.40}         
                />
            </div>
        cambiarState({
            Dialogo:{
                open: !state.Dialogo.open,
                tam:'xl',
                Titulo: `Resumen: ${dato.nombres} ${dato.apellidos}`,
                Cuerpo: Cuerpo,
                Cerrar: ()=>cambiarState({Dialogo: {open:false}}),
            }
        })
    }
    const Titulo = (dato)=>{
        const texto = dato._id 
                        ? `Representante ${dato.nombres} ${dato.apellidos}`
                        : `Nuevo Registro`
        return <Stack
                    direction={ 'row' }
                    spacing={1}
                    justifyContent="center" alignItems="center"
                >
                    {texto}
                    { dato._id && !dato.password
                    ?   <Box>
                            <Alert severity="error">
                                {`No a creado contraseña`}
                            </Alert>
                        </Box>
                        : null
                    }
                </Stack>

    }
    const Abrir = async(valor)=>{
        const representante = valor.valores;
        // Estadisticas(valor.valores)
        // codigo de estadistica
        //dias del mes considerado limite 
        // const dias=5;
        
        // const meses = Ver_Valores().config.Listas.lista_Meses;
        // let dato = {
        //     ...representante.representados[0], 
        //     representante:{
        //         _id: representante._id,
        //         cedula: representante.cedula,
        //         nombres:representante.nombres,
        //         apellidos:representante.apellidos,
        //     }
        // }
        // console.log(dato)
        // let respuesta= await conexiones.Resumen(dato);
        // let recibos = []
        // let orden_pago = {};
        // if(respuesta.Respuesta==='Ok'){
        //     recibos = respuesta.recibos.map(val=>{
        //         val.valores.mensualidades.meses.map(mes=>{
        //             let pos = meses.findIndex(f=> f.value===mes.value);
        //             pos = pos!==-1 ? meses[pos].mes : pos;
        //             if(!orden_pago[mes.periodo]){
        //                 orden_pago[mes.periodo]={}
        //             }
        //             if(!orden_pago[mes.periodo][mes.value]){
        //                 orden_pago[mes.periodo][mes.value]={}
        //             }
        //             let fecham;
        //             let fechaM;
        //             const pago = new Date(val.valores.fecha);
        //             if (pos!==-1){
        //                 const peri = mes.periodo.split('-');
        //                 let ano = pos>8 || pos===0 ? peri[0] : peri[1];
        //                 fecham= new Date(`${ano}/${pos}/01`);
        //                 fechaM= new Date(`${ano}/${pos}/${dias}`);
        //             }
        //             orden_pago[mes.periodo][mes.value]={
        //                 ...orden_pago[mes.periodo][mes.value],
                        
        //                 [`${mes.nombres} ${mes.apellidos}`]:{
        //                     //fecha en que cancelo
        //                     fecha:pago,
        //                     //fecha en que deberia cancelar
        //                     pagar_en: pos,
        //                     fecham, fechaM,
        //                     //
        //                     condicion_dias: fechaM ? pago<fechaM.setDate(fechaM.getDate() + 1) ? 'Puntual' : 'Impuntual' : '',
        //                     condicion_mes : fecham ? pago.getMonth()<=fecham.getMonth() ? 'Puntual' : 'Impuntual' : ''

        //                 }
        //             }
        //             return mes
        //         })
        //         return {
        //             recibo: val.valores.recibo, 
        //             fecha: val.valores.fecha, 
        //             mensualidades: val.valores.mensualidades.meses, 
        //             sistema_viejo: val.valores.sistema_viejo, 
        //         }
        //     });
        //     console.log(orden_pago);
        // }

        cambiarState({
            Dialogo:{
                open:true,
                Titulo:'Estadistica',
                tam:'xl',
                Cuerpo: <Estadistica {...{representante}}/>,
                Cerrar: ()=>cambiarState({dialogo : {open:false}})
            }
        })
    }
    useEffect(()=>{
        Inicio()
    }, [props])

    const {Config}= props;
    return state.esperar ? <Cargando open={state.esperar} Config={Config}/> : (
        <Box>
            <TablaMultiple
                Config={Config ? Config : Ver_Valores().config}
                multiples_valores={true}
                Agregar_mas={false}
                Condiciones={Condiciones}
                Columnas={2} 
                Form_origen = {Form_todos(`Form_Representante`, Config)}
                Titulo_tabla={'Representantes'}
                Table = {'uecla_Representante'}
                Seleccion = {Abrir}
                Eliminar_props={(dato)=>{
                    return `Desea eliminar  al representante ${dato.nombres} ${dato.apellidos}`
                }}
                Titulo_dialogo ={Titulo}
                Titulos_tabla = {state.titulos}
                cargaporparte = {true}
            />
            <Dialogo {...state.Dialogo} config={Config}/>
        </Box>
    )
}

export default Representante;