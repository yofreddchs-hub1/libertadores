import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Horarios from '../../../componentes/horario';
import Formulario from '../../../componentes/herramientas/formulario';
import { genera_formulario, conexiones, Form_todos, Ver_Valores } from '../../../constantes';

import Cargando from '../../../componentes/esperar/cargar';
import Logo from '../../../imagenes/logo.png';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : 'rgb(5, 30, 52)',
  backgroundImage: "linear-gradient(180deg, #00ffff 0, #00e5ff 12.5%, #10a6f8 25%, #10a6fa 37.5%, #1e6ca3 50%, #1e6ca5 62.5%, #153959 75%, #15395b 87.5%, #000000 100%)",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  
}));

export default function Horarios_uecla(props) {
    const [state, setState] = React.useState({cargando:true});
    const [cargando, setCargando] = React.useState(true);
    const cambio = (valores)=>{
        setState({...state,...valores})
    }

    const Seleccion_Horario = (formulario)=> async(valores)=>{
        const {name, resultados}= valores;
        formulario.titulos[0].value.lista.onChange= Seleccion_Horario(formulario);
        cambio({datos:{...resultados[name], periodo:resultados.periodo.periodo, tipo: resultados.tipo.value}, formulario})
    }

    const Seleccion = async(valores)=>{
        const {resultados}= valores;
        console.log(resultados)
        if(resultados.tipo && resultados.periodo && resultados.lista && resultados.grado){
            setCargando(valores)
        }
        
        return valores
    }
    
    
    React.useEffect(()=>{
        let active = true;

        if (!cargando) {
        return undefined;
        }

        if (cargando && state.formulario===undefined){
            //Inicio
            (async () => {
                let formulario = await genera_formulario({ valores:{}, campos: Form_todos('Form_horario') });
                formulario.titulos[0].value.grado.onChange = Seleccion;
                formulario.titulos[0].value.periodo.onChange = Seleccion;
                formulario.titulos[0].value.tipo.onChange = Seleccion;
                formulario.titulos[0].value.lista.onChange = Seleccion;
                formulario.titulos[0].value.periodo.value= formulario.titulos[0].value.periodo.lista.length!==0 ? formulario.titulos[0].value.periodo.lista[0]:null;
                formulario.titulos[0].value.grado.value= formulario.titulos[0].value.grado.lista.length!==0 ? formulario.titulos[0].value.grado.lista[0]:null;
                formulario.titulos[0].value.tipo.value= formulario.titulos[0].value.tipo.lista.length!==0 ? formulario.titulos[0].value.tipo.lista[0]:null;
                formulario.titulos[0].value.lista.value= formulario.titulos[0].value.lista.lista.length!==0 ? formulario.titulos[0].value.lista.lista[0]:null;
                formulario.titulos[0].value.lista.placeholder='Sección';
                
                
                if (active) {
                    cambio({formulario, datos:[]});
                    setCargando(false)
                    setTimeout(() => {
                        Seleccion({resultados:{
                            periodo:formulario.titulos[0].value.periodo.value,
                            grado:formulario.titulos[0].value.grado.value,
                            tipo:formulario.titulos[0].value.tipo.value,
                            lista:formulario.titulos[0].value.lista.value
                        }})
                    }, 500);
                }
            })();
            return
        }
        (async () => {
            //Buscar los datos
            const {resultados}= cargando;
            let datos= await conexiones.Leer_C([`uecla_horarios_${resultados.tipo.value}`, ...resultados.tipo.value==='seccion' ? ['uecla_asignatura','uecla_docente'] :[]], 
                {
                    [`uecla_horarios_${resultados.tipo.value}`]:{},//{$text: {$search: resultados.carrera.nombres, $caseSensitive: false}},
                    ...resultados.tipo.value==='seccion' ? {uecla_asignatura:{}, uecla_docente:{}} :{}
                }
            );
            if (datos.Respuesta==='Ok'){
                let asignaturas = datos.datos[`uecla_asignatura`].map(val=>{return {_id:val._id,...val.valores}});
                let docentes = datos.datos[`uecla_docente`].map(val=>{return {_id:val._id,...val.valores}});
                console.log(docentes)
                datos= datos.datos[`uecla_horarios_${resultados.tipo.value}`]
                if (resultados.tipo.value==='seccion'){
                    datos = datos.filter(f=>{
                        return f.valores.carrera.nombres===resultados.carrera.nombres
                    }).map(val=>{return {...val.valores, titulo:val.valores.seccion, _id:val._id}})
                    asignaturas = asignaturas.filter(f=>{
                        return f.grado.value===resultados.grado.value
                    }).map(val=>{return {_id:val._id, ...val, titulo:`${val.asignatura}`}});
                    docentes = docentes.filter(f=>{
                        const o = f.grados ? f.grados.filter(f1=>f1.value===resultados.grado.value):[];
                        return o.length!==0
                    }).map(val=>{return {...val, titulo:`${val.nombres} ${val.apellidos}`}});
                    console.log(docentes)
                    // datos= datos.map(val=>{
                    //     let asig= asignaturas.filter(f=> f.semestre && f.semestre.value===val.semestre.value)
                    //     let docen = docentes.filter(f=>{
                    //         const o = f.asignaturas.filter(f1=>f1.semestre.value===val.semestre.value);
                    //         return o.length!==0
                    //     })
                    //     return {...val, asignaturas:asig, docentes:docen}
                    // })
                    datos =[ {asignaturas, docentes}]
                }else if(resultados.tipo.value==='docente'){
                    datos = datos.filter(f=>{
                        const o = f.valores.carreras ? f.valores.carreras.filter(f1=>f1.nombres===resultados.carrera.nombres) : [];
                        return o.length!==0
                    }).map(val=>{
                        const asignaturas = val.valores.asignaturas.map(v=>{return {...v, titulo:v.nombre}})
                        return {...val.valores, titulo:`${val.valores.nombres} ${val.valores.apellidos}`, asignaturas, _id:val._id}
                    })
                }else{
                    datos=datos.map(val=>{return {...val.valores, titulo:val.valores.nombre, _id:val._id}})
                }
            
                console.log(datos)
                let formulario = await genera_formulario({ valores:{...resultados}, campos: Form_todos('Form_horario') });
                formulario.titulos[0].value.grado.onChange = Seleccion;
                formulario.titulos[0].value.periodo.onChange = Seleccion;
                formulario.titulos[0].value.tipo.onChange = Seleccion;
                formulario.titulos[0].value.lista.onChange = Seleccion;
                // formulario.titulos[0].value.lista.disabled= false;
                // formulario.titulos[0].value.lista.lista= datos;
                // formulario.titulos[0].value.lista.value= null;
                formulario.titulos[0].value.lista.onChange= Seleccion_Horario(formulario);
                if (active) {
                    cambio({formulario, datos})   
                }
                
            }

            setCargando(false)
        })();

        return () => {
        active = false;
        };

    },[cargando])




    // if (state.formulario===undefined){
    //     Inicio()
        
    // }
    console.log(state)
    return state.formulario ? (
        <Box sx={{ flexGrow: 1, position: "relative"}}>
            <Grid container spacing={0.5}>
                <Grid item xs={12}>
                    <Item style={{height: 100, color:'#fff'}}>
                        <Formulario {...state.formulario}
                            config={{
                                Estilos:{
                                    Input_label:{color:'#fff'},
                                    Input_fondo:'#fff',
                                    Input_input:{color:'#fff'}
                                }
                            }}
                        />
                    </Item>
                </Grid>
                <Grid item xs={12} >
                    <Item style={{}}>
                        <Horarios {...props} Datos={state.datos} Table={'unefa_horario'} Logo={Logo}/>
                    </Item>
                </Grid>
            </Grid>
            <Cargando open={cargando} Logo={Logo} Fondo={'#ffffff'}/>
        </Box>
    ): null;
}
