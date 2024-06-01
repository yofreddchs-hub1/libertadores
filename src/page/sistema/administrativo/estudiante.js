import React, {useState, useEffect} from 'react';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';
import Dialogo from '../../../componentes/herramientas/dialogo';
import DialogoR from '../../../componentes/herramientas/dialogo';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
import Tabla from '../../../componentes/herramientas/tabla';
import Cuerpo from '../../../componentes/herramientas/cuerpo'
import {Condicion_Estudiante, Condicion_Representante} from '../funciones';
import { Abrir_Recibo } from '../funciones';
import { Ver_Valores, conexiones, Form_todos, Titulos_todos, AExcell } from '../../../constantes';
import Reporte from '../../../componentes/reporte';
import Recibopdf from '../pagar/pdf/recibonuevo';
import Constanciapdf from '../../reportes/constancia';
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
    
    const FormatoPSB = async() =>{
        if (state.cargando){
            console.log('buscando...');
            return
        }
        cambiarState({cargando:true})
        let resultado = await conexiones.Leer_C(['uecla_Estudiante'],{uecla_Estudiante:{}});
        console.log(resultado);
        if (resultado.Respuesta==='Ok'){
            let datos = resultado.datos.uecla_Estudiante
                        .filter(f=> (f.valores.estatus && f.valores.estatus.titulo!=='Graduado' && f.valores.estatus.titulo!=='Retirado'))// || !f.valores.estatus)
            let datosn=[];
            for (var i=0; i<datos.length;i++ ){
                const dat = datos[i].valores;
                const fecha= new Date(dat.fecha_nacimiento);
                const hoy= new Date();
                let edad = hoy.getFullYear() - fecha.getFullYear()
                let diferenciaMeses = hoy.getMonth() - fecha.getMonth()
                let representa
                if (!dat.representante){
                    console.log(dat)
                }else{
                    representa = await conexiones.Leer_C(['uecla_Representante'],{uecla_Representante:{_id:dat.representante._id}});
                }
                if (representa && representa.Respuesta==='Ok'){
                    representa = representa.datos.uecla_Representante[0] ? representa.datos.uecla_Representante[0].valores : null;
                }else{
                    representa = null
                }
                if (
                    diferenciaMeses < 0 ||
                    (diferenciaMeses === 0 && hoy.getDate() < fecha.getDate())
                ) {
                    edad--
                }

                datosn=[...datosn,
                    {
                        Nucleo:'',
                        Modulo:'',
                        Cedula:dat.cedula,
                        'Apellidos y Nombres': `${dat.apellidos} ${dat.nobres}`,
                        Dia:dat.fecha_nacimiento ? dat.fecha_nacimiento.split('-')[2] : '',
                        Mes:dat.fecha_nacimiento ? dat.fecha_nacimiento.split('-')[1] : '',
                        Ano:dat.fecha_nacimiento ? dat.fecha_nacimiento.split('-')[0] : '',
                        Edad:edad,
                        'Lugar de Nacimiento':dat.lugar_nacimiento,
                        'Apellidos y Nombres de su Madre':dat.representante && dat.representante.parentesco._id===0 ? `${dat.representante.apellidos} ${dat.representante.nombres}` :'',
                        'Cédula de Identidad': dat.representante && dat.representante.parentesco._id===0 ? `${dat.representante.cedula}` :'',
                        'Apellidos y Nombres del Representante':dat.representante ? `${dat.representante.apellidos} ${dat.representante.nombres}` : '',
                        'Cédula de IdentidadR':dat.representante ? dat.representante.cedula :'',
                        'Teléfonos':representa ? `${representa.telefono_movil ? `${representa.telefono_movil}, ` : ''}${representa.telefono_fijo ? `${representa.telefono_fijo}, ` : ''}${representa.telefono_trabajo ? `${representa.telefono_trabajo}` : ''}` :'',
                        'Dirección de Habitación':representa ? representa.direccion : ''
                    }
                ]

            }
                        // .map(async val=>{
                        //     const dat = val.valores
                        //     const fecha= new Date(dat.fecha_nacimiento);
                        //     const hoy= new Date();
                        //     let edad = hoy.getFullYear() - fecha.getFullYear()
                        //     let diferenciaMeses = hoy.getMonth() - fecha.getMonth()
                        //     let representa = await conexiones.Leer_C(['uecla_Representante'],{uecla_Representante:{_id:dat.representante._id}});
                        //     if (representa.Respuesta==='Ok'){
                        //         representa = representa.datos.uecla_Representante;
                        //     }else{
                        //         representa = null
                        //     }
                        //     console.log(representa)
                        //     if (
                        //         diferenciaMeses < 0 ||
                        //         (diferenciaMeses === 0 && hoy.getDate() < fecha.getDate())
                        //     ) {
                        //         edad--
                        //     }

                        //     return {
                        //         Nucleo:'',
                        //         Modulo:'',
                        //         Cedula:dat.cedula,
                        //         'Apellidos y Nombres': `${dat.apellidos} ${dat.nobres}`,
                        //         Dia:dat.fecha_nacimiento ? dat.fecha_nacimiento.split('-')[2] : '',
                        //         Mes:dat.fecha_nacimiento ? dat.fecha_nacimiento.split('-')[1] : '',
                        //         Ano:dat.fecha_nacimiento ? dat.fecha_nacimiento.split('-')[0] : '',
                        //         Edad:edad,
                        //         'Lugar de Nacimiento':dat.lugar_nacimiento,
                        //         'Apellidos y Nombres de su Madre':dat.representante && dat.representante.parentesco._id===0 ? `${dat.representante.apellidos} ${dat.representante.nombres}` :'',
                        //         'Cédula de Identidad': dat.representante && dat.representante.parentesco._id===0 ? `${dat.representante.cedula}` :'',
                        //         'Apellidos y Nombres del Representante':dat.representante ? `${dat.representante.apellidos} ${dat.representante.nombres}` : '',
                        //         'Cédula de IdentidadR':dat.representante ? dat.representante.cedula :'',
                        //         'Teléfonos':'',
                        //         'Dirección de Habitación':''
                        //     }
                        // })
            AExcell(datosn, 'Data del PSB Falcón','Data del PSB Falcón.xlsx')
        }
        cambiarState({cargando:false})
    }
    useEffect(()=>{
        Inicio()
    }, [props])

    const {Config}= props;
    const color =  props.Config.Estilos.Input_icono_t ? props.Config.Estilos.Input_icono_t : {};

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
                AgregarAccion={
                    <div>
                        <IconButton color={'primary'} title={'Generar Formato Data del PSB Falcón'} onClick={ FormatoPSB }>
                            {state.cargando 
                                ? <CircularProgress  />
                                : <Icon style={color}>audio_file</Icon>
                            }
                        </IconButton>
                    </div>
                }
                
            />
            <Dialogo {...state.Dialogo} config={Config}/>
            <DialogoR {...state.Dialogo1} config={Config}/>
        </Box>
    )
}

export default Estudiante;