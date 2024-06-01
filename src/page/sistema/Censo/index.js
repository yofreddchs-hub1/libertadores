import React, {useEffect, useState} from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Icon from '@mui/material/Icon';
import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link';

import { genera_formulario, Form_todos,  conexiones } from '../../../constantes' 

import Formulario from '../../../componentes/herramientas/formulario';
import Dialogo from '../../../componentes/herramientas/dialogo';
import Cargando from '../../../componentes/esperar/cargar';

import { Condicion_Estudiante, Condicion_Representante, Mayuscula } from '../funciones';

//Iconos
import CheckIcon from '@mui/icons-material/Check';

import Logo from '../../../imagenes/logo512.png';
import Scrollbars from '../../../componentes/herramientas/scrolbars';
import { Censados } from '../administrativo/censos';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


  
export default function Censo(props) {
    const [state,setState] = useState({buscar:'', dialogo:{open:false}, esperar:false})
    const {Config}= props
    const CambioState = (nuevo)=>{
        setState({...state, ...nuevo})
    }
    const Inicio = async()=>{
        let censo =  await conexiones.Leer_C(['uecla_Censo'], {uecla_Censo:{}});
        
        if (censo.Respuesta==='Ok'){
            censo= censo.datos.uecla_Censo.sort((a,b) => a.valores.periodo> b.valores.periodo ? -1 : 1).filter(f=> f.valores.estatus || f.valores.publicar);
            // console.log(censo)
            if (censo.length!==0){
                censo= censo[0].valores
                let frepresentante = await genera_formulario({ valores:{...censo,_id:undefined}, campos: Form_todos('Form_Censar', Config) })
                frepresentante.botones=[
                    {
                    name:'guardar', label:'Guardar', title:'Guardar ',
                    variant:"contained", color:"success", icono:<CheckIcon/>,
                    onClick: Guardar,  validar:'true',
                    sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                    },
        
                ]
                CambioState({censo, DFormulario: frepresentante, esperar:false})
                
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
    
    const Listado = async()=>{
        CambioState({dialogo:{
            open:true,
            tam:"xl",
            Titulo:`Listado del "${state.censo.titulo}"`,
            Cuerpo:<Censados mostrar/>,
            Cerrar: ()=>CambioState({dialogo : {open:false}}),
        }})
    }
    const Documentos = async()=>{
        CambioState({dialogo:{
            open:true,
            Titulo:`Documentos Necesarios`,
            Cuerpo:<Box sx={{height:window.innerHeight * 0.8}}>
                <embed onClick={()=>console.log('Paoaooa')} src={`${process.env.PUBLIC_URL +'/utilidad/catalogos/documento estudiante.pdf'}`} type="application/pdf" width="100%" height="100%" />
            </Box>,
            Cerrar: ()=>CambioState({dialogo : {open:false}}),
        }})
    }
    const Buscar = async()=>{
        if (state.buscar==='') return
        CambioState({Bloques:null, esperar:true});
        let representante= await conexiones.Leer_C(['uecla_Representante'],{uecla_Representante:{'valores.cedula':state.buscar}})
        if (representante.Respuesta==='Ok'){
            representante= representante.datos.uecla_Representante.filter(f=>f.valores.cedula===state.buscar);
            let Representante = {}
            if (representante.length!==0){
                Representante ={...representante[0]};
                representante = {...representante[0].valores, _id:representante[0]._id};
            }else{

                representante = {}
            }
            if (representante._id){
                representante.existe={
                    permisos: "",
                    titulo: "SI",
                    value: "si",
                    _id: 0
                }
            }else{
                representante.existe={
                    permisos: "",
                    titulo: "NO",
                    value: "no",
                    _id: 1
                }
            }
            let frepresentante = await genera_formulario({ valores:representante, campos: Form_todos('Form_Censar', Config) })
            frepresentante.botones=[
                {
                  name:'guardar', label:'Guardar', title:'Guardar ',
                  variant:"contained", color:"success", icono:<CheckIcon/>,
                  onClick: Guardar,  validar:'true',
                  sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                },
    
            ]
            CambioState({ DFormulario: frepresentante, esperar:false})
        }
    }
    useEffect(()=>{
        Inicio()
    },[])

    return (
        <Box sx={{ flexGrow: 1, position:'relative' }}>
            <Grid container spacing={0.5}>
                <Grid item xs={12}>
                    <Item elevation={3} >
                        <Grid container spacing={0.5}>
                            {/* <Grid item xs={4}>
                                <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <InputBase
                                        sx={{ ml: 1, flex: 1 }}
                                        placeholder="Cedula de Representante"
                                        title={'Cedula del representante que desea censar estudiante'}
                                        onChange={(value)=>CambioState({buscar:value.target.value})}
                                        disabled={state.censo ? !state.censo.estatus : true}
                                        onKeyPress={(event) =>{
                                            if (event.key==='Enter')
                                              Buscar()
                                        }}
                                    />
                                    <IconButton sx={{ p: '10px' }} onClick={Buscar}
                                                disabled={state.censo ? !state.censo.estatus : true}
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                </Paper>
                            </Grid>  */}
                            <Grid item xs={12}>
                                <Alert severity="info">
                                    <Stack spacing={0} direction={'row'} sx={{width:window.innerWidth * 0.9}}>
                                        <Box sx={{ width:'60%'}}>
                                            <Typography variant="subtitle1" sx={{textAlign:'left'}} >{state.censo ? state.censo.titulo + ' ' : '...'}</Typography>
                                        </Box>
                                        <Box sx={{width:'40%', alignContent:'end', alignItems:'end'}}>
                                            <Link color="inherit" onClick={Documentos}>
                                                <Stack spacing={0} direction={'row'}>
                                                    <Icon>plagiarism</Icon>
                                                    <Typography variant="subtitle1"  >
                                                        Documentos Necesarios             
                                                    </Typography>
                                                </Stack>
                                            </Link>
                                        </Box>
                                    </Stack>
                                </Alert>
                                {state.censo && state.censo.publicar  
                                    ?   <Alert onClick={Listado} severity="success" sx={{cursor:'pointer'}}>{ `Listado del "${state.censo.titulo}"`}</Alert>
                                    :   null
                                }
                            </Grid>       
                        </Grid>
                    </Item>
                </Grid>
                <Grid item xs={12}>
                    <Item sx={{height:'auto', minHeight:'79vh'}}>
                        <Scrollbars>
                        {state.DFormulario && state.censo && state.censo.estatus
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