import React, {useState, useEffect} from 'react';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';
import Dialogo from '../../../componentes/herramientas/dialogo';
import DialogoR from '../../../componentes/herramientas/dialogo';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Icon from '@mui/material/Icon';
import Alert from '@mui/material/Alert';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
import Tabla from '../../../componentes/herramientas/tabla';
import Cuerpo from '../../../componentes/herramientas/cuerpo'
import {Condicion_Estudiante, Condicion_Representante} from '../funciones';
import { Abrir_Recibo } from '../funciones';
import { Ver_Valores, conexiones, Form_todos, Titulos_todos, Moneda, genera_formulario } from '../../../constantes';
import moment from 'moment';
import Reporte from '../../../componentes/reporte';
import Recibopdf from '../pagar/pdf/recibonuevo';
import Constanciapdf from '../../reportes/constancia';
import Formulario from '../../../componentes/herramientas/formulario';
import Cargando from '../../../componentes/esperar/cargar';

function Estudiante (props) {
    
    const [state, setState]= useState({esperar:true, Dialogo:{open:false}, Dialogo1:{open:false}});
    let DialogoA ={open:false};
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

    const Constancia =async(dato, tipo)=>{
        let resultado = await conexiones.Resumen(dato);
        let {mensualidad} = resultado;
        resultado = await conexiones.Leer_C(['uecla_Inscripcion'],{uecla_Inscripcion:{}});
        let periodos = resultado.datos.uecla_Inscripcion.map(val=>{return {...val.valores}}).sort((a, b) => (a.periodo > b.periodo ? -1 : a.periodo < b.periodo ? 1 : 0));
        const periodo = periodos.length!==0 ? periodos[0].periodo : '';
        const pos = mensualidad.findIndex(f=> f.periodo===periodo);
        const inscrito= pos!==-1 ? mensualidad[pos].inscripcion : false;
        cambiarState({
            Dialogo:{
                open: !state.Dialogo.open,
            Titulo: `Constancia Estudio: ${dato.nombres} ${dato.apellidos}`,
            // tam:'xl',
            Cuerpo: inscrito 
                        ?   <Reporte datos={{...dato, periodo, inscrito}} reporte={Constanciapdf} sizeLetra={{Tletra:14, Tletrad:12}} tipo={tipo}/>
                        :   <Alert severity="error">{`Estudiante no se encuentra inscrito en periodo ${periodo}`}</Alert>
            ,
            Cerrar: ()=>cambiarState({Dialogo: {open:false}}),
            }
        })

    }
    const Abrir_recibo = async(valores)=>{
        if (state.Dialogo.open===true){
            DialogoA={...state.Dialogo}
        }
        const {recibo}=valores.valores;
        // const resultado = Recibopdf(valores);
        // let Cuerpo= <embed src={`${resultado}#view=Fit&toolbar=1&navpanes=1&scrollbar=1`} type="application/pdf" width="100%" height={window.innerHeight * 0.75} />
        cambiarState({
            Dialogo:{...DialogoA},
            Dialogo1:{
                open: !state.Dialogo1.open,
                Titulo: `Recibo: ${recibo}`,
                Cuerpo: <Reporte  datos={valores} reporte={Recibopdf} sizePagina= {{width:612, height:396}} />,
                Cerrar: ()=>cambiarState({Dialogo1: {open:false}, Dialogo:{...DialogoA}}),
            }
        })
        
    }
    const Abrir = async(valores) =>{
        if (state.Dialogo.open===true){
            DialogoA={...state.Dialogo}
        }
        const resulta = await Abrir_Recibo(valores, Abrir_recibo);
        cambiarState({
            Dialogo:{...DialogoA},
            Dialogo1:{
                open: !state.Dialogo1.open,
                Titulo: resulta.Titulo,
                Cuerpo: resulta.Cuerpo,
                Cerrar: ()=>cambiarState({Dialogo1: {open:false}, Dialogo:{...DialogoA}}),
            }
        })
    }
    const Resumen = async(dato)=>{
        const resultado = await conexiones.Resumen(dato);
        let {recibos, mensualidad} = resultado;
        const TituloS= await Titulos_todos(`Titulos_Solvencias`);
        const TituloR =await Titulos_todos(`Titulos_Recibo`);
        let Bloques={
            Solvencias: <Tabla  Titulo={"Solvencias"}
                            Config={Ver_Valores().config}
                            titulos={TituloS}
                            table={'uecla_Mensualidad'}
                            cantidad={mensualidad ? mensualidad.length : 0}
                            datos={mensualidad ? mensualidad : []}
                            cargaporparte={true }
                            sinpaginacion
                            alto={window.innerHeight * 0.58}
                                
                        />,
            Recibos:    <Tabla  Titulo={"Recibos"}
                            Config={Ver_Valores().config}
                            titulos={TituloR}
                            table={'uecla_Recibo'}
                            cantidad={recibos ? recibos.length : 0}
                            datos={recibos ? recibos : []}
                            Accion={Abrir}
                            cargaporparte={false}
                            sinpaginacion
                            alto={window.innerHeight * 0.58}         
                        />
        }
        DialogoA={
            open: !state.Dialogo.open,
            tam:'xl',
            Titulo: `Resumen: ${dato.nombres} ${dato.apellidos}`,
            Cuerpo: <Cuerpo Bloques={Bloques} Config={Config}/>,
            Cerrar: ()=>cambiarState({Dialogo: {open:false}}),
        };
        cambiarState({
            Dialogo:{
                open: !state.Dialogo.open,
                tam:'xl',
                Titulo: `Resumen: ${dato.nombres} ${dato.apellidos}`,
                Cuerpo: <Cuerpo Bloques={Bloques} Config={Config}/>,
                Cerrar: ()=>cambiarState({Dialogo: {open:false}}),
            }
        })
    }
    const Titulo = (dato)=>{
        const texto = dato._id ? `Estudiante ${dato.nombres} ${dato.apellidos}`: `Nuevo Estudiante `
        return <Stack
                    direction={ 'row' }
                    spacing={1}
                    justifyContent="center" alignItems="center"
                >
                    {texto}
                    { dato._id 
                    ?   <Box>
                            <IconButton size="large" color="inherit" title={'Resumen'} onClick={()=>Resumen(dato)}>
                                <Icon >assignment</Icon>
                            </IconButton>
                            <IconButton size="large" color="inherit" title={'Constancia de Inscripción'} onClick={()=>Constancia(dato, 'inscripcion')}>
                                <Icon >contact_page</Icon>
                            </IconButton>
                            <IconButton size="large" color="inherit" title={'Constancia de Estudio'} onClick={()=>Constancia(dato,'estudio')}>
                                <Icon >portrait</Icon>
                            </IconButton>
                        </Box>
                        : null
                    }
                </Stack>

    }
    const Inicio = async() =>{
        const titulos = await Titulos_todos(`Titulos_Estudiante`, Config)
        cambiarState({esperar:false, titulos})
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
                Form_origen = {Form_todos(`Form_Estudiante`, Config)}
                Titulo_tabla={'Estudiantes'}
                Table = {'uecla_Estudiante'}
                Eliminar_props={(dato)=>{
                    return `Desea eliminar al estudiante ${dato.nombres} ${dato.apellidos}`
                }}
                Titulo_dialogo ={Titulo}
                Titulos_tabla = {state.titulos}
                cargaporparte = {true}
                sinpaginacion = {false}
                Tam_dialogo={'lg'}
                
            />
            <Dialogo {...state.Dialogo} config={Config}/>
            <DialogoR {...state.Dialogo1} config={Config}/>
        </Box>
    )
}

export default Estudiante;