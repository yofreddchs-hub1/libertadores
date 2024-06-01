import React, {useEffect, useState} from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';


import { genera_formulario, Form_todos,  conexiones, Ver_Valores } from '../../../constantes' 

import Formulario from '../../../componentes/herramientas/formulario';
import Dialogo from '../../../componentes/herramientas/dialogo';
import Cargando from '../../../componentes/esperar/cargar';

import { Condicion_Estudiante, Condicion_Representante, Mayuscula } from '../funciones';

//Iconos
import CheckIcon from '@mui/icons-material/Check';

import Logo from '../../../imagenes/logo512.png';
import Scrollbars from '../../../componentes/herramientas/scrolbars';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


  
export default function EnviarWhatsapp(props) {
    const [state,setState] = useState({buscar:'', dialogo:{open:false}, esperar:false})
    const {Config}= props
    let Formularios;
    const CambioState = (nuevo)=>{
        setState({...state, ...nuevo})
    }
    const Cambio_dato = async (valores)=>{
        const {periodo, grado}=valores.resultados;
        if (periodo===null || grado===null) return
        let formulario = state.formulario ? state.formulario : Formularios;
        formulario.titulos[0].value.grado.value=grado
        formulario.titulos[0].value.periodo.value=periodo
        Formularios= formulario
        Ver_data(periodo, grado, formulario)
        
    }
    const Ver_data = async(periodo, grado, formulario=null)=>{
        CambioState({esperar:true});
        var y = new Date().getFullYear();
        var y1= Number(y)-1;
        let actual = `${y1}-${y}`;
        periodo=periodo ? periodo.periodo : actual;
        const seccion = grado.seccion;
        grado=grado.grado 
        const resultado = await conexiones.Solvencias({periodo,grado,seccion});
        Formularios= formulario!==null ? formulario : Formularios;
        // const titulos = await Titulos_todos(`Titulos_Solvencias`, Config)
        console.log(formulario, resultado)
        if (resultado.Respuesta==='Ok'){
            CambioState({datos:resultado.mensualidades, DFormulario: formulario, esperar:false, grado, seccion})
        }else{
            CambioState({esperar:false, grado, seccion});
        }

    }
    const Inicio = async()=>{
        let censo =  await conexiones.Leer_C(['uecla_Censo'], {uecla_Censo:{}});
        
        if (censo.Respuesta==='Ok'){
            censo= censo.datos.uecla_Censo.sort((a,b) => a.valores.periodo> b.valores.periodo ? -1 : 1).filter(f=> f.valores.estatus || f.valores.publicar);
            // console.log(censo)
            if (censo.length!==0){
                censo= censo[0].valores
                let frepresentante = await genera_formulario({ valores:{}, campos: Form_todos('Form_Seleccion_Estudiantes', Config) })
                const periodos =frepresentante.titulos[0].value.periodo.lista.sort((a,b) => a.periodo> b.periodo ? -1 : 1)
                frepresentante.titulos[0].value.periodo.value= periodos[0];
                frepresentante.titulos[0].value.periodo.lista= periodos;
                frepresentante.titulos[0].value.periodo.onChange= Cambio_dato;
                let grados =  Ver_Valores().config.Listas.lista_colegio_grado;
                let seccion = Ver_Valores().config.Listas.lista_colegio_seccion;
                let ngrados=[{titulo:`Sin grado`, grado:undefined, seccion: undefined}];
                grados.map(val=>{
                    let dato= seccion.map(sec=>{
                        return {...val, titulo:`${val.titulo} ${sec.titulo}`, grado:val.titulo, seccion: sec.titulo}
                    })
                    ngrados=[...ngrados, ...dato]
                    return dato
                })

                frepresentante.titulos[0].value.grado.value= ngrados[0];
                frepresentante.titulos[0].value.grado.lista=ngrados
                frepresentante.titulos[0].value.grado.onChange= Cambio_dato;
                // frepresentante.botones=[
                //     {
                //     name:'guardar', label:'Guardar', title:'Guardar ',
                //     variant:"contained", color:"success", icono:<CheckIcon/>,
                //     onClick: Guardar,  validar:'true',
                //     sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                //     },
        
                // ]
                CambioState({censo, DFormulario: frepresentante, esperar:false})
                Formularios= frepresentante;
                Ver_data(periodos[0], ngrados[0], frepresentante)
                
            }else{
                CambioState({censo:{titulo:'El proceso de censo no esta activo'}})
            }
            
        }
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
    const Guardar= async(valores, campos)=>{
        // console.log(valores, campos, valores.cedula_estu)
        valores= Mayuscula(valores);
        let resulta= await conexiones.Leer_C(['uecla_Estudiante','uecla_Censado'],{
            uecla_Estudiante:{
                // 'valores.cedula':valores.cedula_estu
                $or:[{'valores.cedula':valores.cedula_estu},{'valores.cedula_estudiantil':valores.cedula_estudiantil}]
            },
            uecla_Censado:{
                // 'valores.cedula_estu':valores.cedula_estu
                $and:[
                    {'valores.periodo':valores.periodo},
                    {$or:[
                        {'valores.cedula_estu':valores.cedula_estu},{'valores.cedula_estudiantil':valores.cedula_estudiantil}
                    ]}
                ]
            }
        });
        let nuevos;
        if (resulta.Respuesta==='Ok'){
            let estudiante = resulta.datos.uecla_Estudiante
                .filter(f=> (valores.cedula_estu==='' && f.valores.cedula_estudiantil===valores.cedula_estudiantil)
                            || (valores.cedula_estudiantil==='' && f.valores.cedula_estu===valores.cedula_estu)
                            || (valores.cedula_estu===f.valores.cedula_estu && valores.cedula_estudiantil===f.valores.cedula_estudiantil)
                        );
            let censado = resulta.datos.uecla_Censado
                .filter(f=> (valores.cedula_estu==='' && f.valores.cedula_estudiantil===valores.cedula_estudiantil)
                            || (valores.cedula_estudiantil==='' && f.valores.cedula_estu===valores.cedula_estu)
                            || (valores.cedula_estu===f.valores.cedula_estu && valores.cedula_estudiantil===f.valores.cedula_estudiantil)
                        );
            if (estudiante.length===0 && censado.length===0){
                // console.log('guardar...')
                nuevos= await conexiones.Guardar({valores, multiples_valores:true},'uecla_Censado');
                // setTimeout(() => {
                //     window.location.reload();
                // }, 2000);
            }else{
                nuevos={Respuesta:'Error',mensaje:`Verifique los datos del estudiante:${estudiante.length!==0 ? ' "Estudiante se encuentra en sistema"':''}${censado.length!==0 ? ' "Estudiante ya se encuentra censado en este periodo"' :''}`}
            }
        }
        return nuevos
    }
    
    
    useEffect(()=>{
        Inicio()
    },[])

    return (
        <Box sx={{ flexGrow: 1, position:'relative' }}>
            <Grid container spacing={0.5}>
                <Grid item xs={12}>
                    <Item sx={{height:'auto', minHeight:'79vh'}}>
                        <Scrollbars>
                        {state.DFormulario
                            ?   <Formulario {...state.DFormulario}/>
                            :   <Box sx={{ display:'flex', flexDirection:'column' , height:'100%', alignItems:'center', justifyContent:'center'}}>
                                    <Box>
                                        <Typography variant="h5" gutterBottom component="div" sx={{...Config ? {color:Config.Estilos.Input_label.color} : {} }}>
                                            {state.censo ? state.censo.titulo : '...'}
                                        </Typography>
                                    </Box>
                                    <Box>
                                    <img
                                        src={Logo}
                                        alt={'Inscripcion'}
                                        loading="lazy"
                                        style={{height:window.innerHeight * 0.25}}
                                    />
                                    </Box>

                                </Box>
                        }
                        </Scrollbars>
                    </Item>
                </Grid>
                
            </Grid>
            <Dialogo  {...state.dialogo} config={Config}/>
            <Cargando open={state.esperar} Config={Config}/>
        </Box>
    )
}