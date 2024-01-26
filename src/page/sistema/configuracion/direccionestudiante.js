import React, {useState, useEffect} from 'react';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';
import Dialogo from '../../../componentes/herramientas/dialogo';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Alert from '@mui/material/Alert';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
import Tabla from '../../../componentes/herramientas/tabla';

import { Ver_Valores, conexiones, Form_todos, Titulos_todos } from '../../../constantes';

import * as XLSX from 'xlsx';

const downloadExcel = (data) => {
    data = data.map(v=>v.valores);
    console.log(data);
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    //let buffer = XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
    //XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
    XLSX.writeFile(workbook, "Direcciones.xlsx");
};


function DireccionEstudiante (props) {
    
    const [state, setState]= useState({datos:[],esperar:false, Dialogo:{open:false}});
    
    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }
    
    const Inicio = async()=>{
        let resultado = await conexiones.Leer_C(['uecla_Estudiante', 'uecla_Representante'],{'uecla_Estudiante':{},'uecla_Representante':{}}); 
        let datos=[];
        if (resultado.Respuesta==='Ok'){
            datos= resultado.datos.uecla_Estudiante.filter(f=> f.valores.grado && f.valores.grado.titulo==='1er año');
            datos =  datos.map(val=>{
                let telefono;
                if (val.valores.representante){
                    const pos =  resultado.datos.uecla_Representante.findIndex(f=> f.valores.cedula === val.valores.representante.cedula);
                    if (pos!==-1){
                        telefono=resultado.datos.uecla_Representante[pos].valores.telefono_movil;
                    }
                }
                return {...val, valores:{...val.valores, telefono}}
            })
            cambiarState({datos})
            console.log(datos)
        }
    }
    const Actualizar_data = (valores)=>{
        cambiarState({cantidad:valores.cantidad, datos:valores.nuevodatos})
    }
    
    const {Config}= props;
    useEffect(()=>{
        Inicio()
        return ()=>{}
    }, [])
    return (
        <Box>
            <Tabla
                alto={window.innerHeight * 0.72}
                Config={Config ? Config : Ver_Valores().config}
                // Condiciones={Condiciones}
                Titulo={'Estudiantes'}
                table = {'uecla_Estudiante'}
                titulos = {Titulos_todos(`Titulos_EstudianteT`, Config)}
                cargaporparte = {true}
                sinpaginacion = {false}
                cantidad={state.cantidad ? state.cantidad : null}
                cargacompleta={Actualizar_data}
                datos={state.datos}
                acciones={
                    <Stack direction="row" spacing={0.5}>
                        <IconButton color={'primary'} title={'Refrescar valores de Solvencias'} onClick={()=>downloadExcel(state.datos)}>
                            <Icon>table_view</Icon>
                        </IconButton>
                    </Stack>
                        
                }
                
            />
            <Dialogo {...state.Dialogo} config={Config}/>
            
        </Box>
    )
}

export default DireccionEstudiante;