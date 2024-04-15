import React, {useState, useEffect} from 'react';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
// import Tabla from '../../../componentes/herramientas/tabla';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import { Ver_Valores, Form_todos, Titulos_todos } from '../../../constantes';
import {Condicion_Estudiante, Condicion_Representante} from '../funciones'
import Cargando from '../../../componentes/esperar/cargar';
import Dialogo from '../../../componentes/herramientas/dialogo';
import Estadistica from '../../../componentes/herramientas/estadistica';

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
        // console.log(dato)
        const Cuerpo= <Estadistica representante={dato}/>
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
                    <Box sx={{ml:2}}>
                        <IconButton size="large" color="inherit" title={'Resumen de pagos'} onClick={()=>Resumen(dato)}>
                            <Icon >incomplete_circle</Icon>
                        </IconButton>
                    </Box>
                    { dato._id && !dato.password
                    ?   <Box sx={{ml:2, direction:'revert-layer'}}>
                            <Alert severity="error">
                                {`No a creado contraseña`}
                            </Alert>
                        </Box>
                        : null
                    }
                </Stack>

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
                Eliminar_props={(dato)=>{
                    return `Desea eliminar  al representante ${dato.nombres} ${dato.apellidos}`
                }}
                Titulo_dialogo ={Titulo}
                Titulos_tabla = {state.titulos}
                cargaporparte = {true}
                Tam_dialogo={'lg'}
            />
            <Dialogo {...state.Dialogo} config={Config}/>
        </Box>
    )
}

export default Representante;