import React, {useEffect, useState} from 'react';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Cuerpo from '../../../componentes/herramientas/cuerpo';
import { genera_formulario, crear_campos, Form_todos, Ver_Valores, conexiones, nuevo_Valores } from '../../../constantes' 

import Formulario from '../../../componentes/herramientas/formulario';
import Dialogo from '../../../componentes/herramientas/dialogo';
import Cargando from '../../../componentes/esperar/cargar';
import Pagar from '../pagar';
import { Condicion_Estudiante, Condicion_Representante } from '../funciones';
import RConstancia from '../pdf/constancia';
import Reporte from '../../../componentes/reporte';
import moment from 'moment';

//Iconos
import AddIcon from '@mui/icons-material/AddCircle';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';


import Logo from '../../../imagenes/logo512.png';
import { Icon } from '@mui/material';
import Scrollbars from '../../../componentes/herramientas/scrolbars';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


  
export default function Inscripcion(props) {
    const [state,setState] = useState({buscar:'', dialogo:{open:false}, esperar:false})
    const {Config}= props
    const CambioState = (nuevo)=>{
        setState({...state, ...nuevo})
    }
    const Inicio = async()=>{
        let inscripcion =  await conexiones.Leer_C(['uecla_Inscripcion'], {uecla_Inscripcion:{}});
        if (inscripcion.Respuesta==='Ok'){
            inscripcion= inscripcion.datos.uecla_Inscripcion.sort((a,b) => a.valores.periodo> b.valores.periodo ? -1 : 1).filter(f=> f.valores.estatus);
            if (inscripcion.length!==0){
                inscripcion= inscripcion[0].valores
                CambioState({inscripcion})
            }else{
                CambioState({inscripcion:{titulo:'El proceso de Inscripción no esta activo'}})
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
    const Guardar=(table, Form_origen) => async(valores, campos)=>{

        CambioState({esperar:true});
        campos = await crear_campos(campos, Form_origen)
        
        valores = await Condiciones(table, {campos, valores})    
        let nuevos;
        if (!valores.finalizado_condicion){
            
            nuevos= await conexiones.Guardar({campos, valores, multiples_valores:true},table);
        }else{
            nuevos=valores
        }
        Buscar();
    }

    const Agregar = async(dato)=>{
        let representante = {
            _id: dato._id, cedula:dato.cedula, nombres:dato.nombres, apellidos: dato.apellidos, parentesco:dato.parentesco ?  dato.parentesco.titulo : ''
        }
        let festudiante = await genera_formulario({ valores:{representante}, campos: Form_todos('Form_Estudiante', Config) });
        festudiante.titulos[7].value.estatus.disabled=true;
        festudiante.titulos[8].value.representante.disabled=true;
        festudiante.botones=[
            {
                name:'guardar', label:'Guardar', title:'Guardar datos de estudiante',
                variant:"contained", color:"success", icono:<CheckIcon/>,
                onClick: Guardar('uecla_Estudiante', Form_todos('Form_Estudiante', Config)), validar:'true', 
                sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
            },
            {
                name:'cancelar', label:'Cancelar', title:'Cancelar',
                variant:"contained", color:"success", icono:<CancelIcon/>,
                onClick:()=>{
                    CambioState({dialogo:{open:false}})
                    Buscar()
                }, 
                sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Cancelar : {}},
            }
        ]
        let dialogo = {
            ...state.dialogo, 
            open: !state.dialogo.open,
            Titulo:'Agregar Estudiante',
            Cuerpo: <Formulario {...festudiante} Config={Config}/>,
            Cerrar: ()=>{
                CambioState({dialogo:{open:false}})
                Buscar()
            },
        }
        CambioState({dialogo})
    }
    const Constancia = async(valor)=>{
        let resultado = await conexiones.Resumen(valor);
        let representante = await conexiones.Leer_C(['uecla_Representante'],{uecla_Representante:{_id:valor.representante._id}});
        representante = representante.Respuesta==='Ok' && representante.datos.uecla_Representante.length!==0 ? representante.datos.uecla_Representante[0].valores : {}
        valor.representante = {...valor.representante, ...representante}
        if (resultado.Respuesta==='Ok'){
            let recibos = resultado.recibos.map(val=> val);
            
            let pos=-1;
            recibos.map((val,i)=>{
                const p = val.valores.mensualidades.meses.findIndex(f=> f.periodo===state.inscripcion.periodo && f.value==='inscripcion')
                if (p!==-1){
                    pos=i;
                }
            })
            if (pos!==-1){
                valor.recibo = recibos[pos].valores.recibo;
                valor.fechainscripcion = moment(recibos[pos].createdAt).format('DD/MM/YYYY');
            }
        }
        let dialogo = {
            ...state.dialogo, 
            open: !state.dialogo.open,
            // tam:'xl',
            Titulo:'Constacia de Inscripción',
            Cuerpo: <Reporte datos={valor} reporte={RConstancia}  />,
            Cerrar: ()=>{
                CambioState({dialogo:{open:false}});
                Buscar();
            },
        }
        CambioState({dialogo})
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
            let frepresentante = await genera_formulario({ valores:representante, campos: Form_todos('Form_Representante', Config) })
            let Bloques={
                
            }
            if (representante.nombres){
                frepresentante.botones=[
                    {
                      name:'guardar', label:'Guardar', title:'Guardar ',
                      variant:"contained", color:"success", icono:<CheckIcon/>,
                      onClick: Guardar('uecla_Representante', Form_todos('Form_Representante', Config)), validar:'true', 
                      sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                    },
                    {
                        name:'agregar', label:'Agregar', title:'Agregar un nuevo estudiante',
                        variant:"contained", color:"success", icono:<AddIcon/>,
                        onClick:()=> Agregar(representante), validar:'true', 
                        sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                      },
                ]
                
                Bloques[`${representante.nombres} ${representante.apellidos}`]= 
                    <div>
                        {representante.password ? null 
                                    :   <Alert severity="error">
                                            {`El Representante ${representante.nombres} ${representante.apellidos}, no a creado contraseña`}
                                        </Alert>
                        }
                        <Formulario {...frepresentante} config={Config}/>
                    </div>
                let mens= await conexiones.Mensualidades({Representados:representante.representados});
                mens= mens.mensualidades;
                let pendientes=0;
                for (var i=0; i<representante.representados.length; i++){
                    let val = representante.representados[i];
                    const pos = mens.findIndex(f=> f.valores._id_estudiante===val._id && f.valores.periodo===state.inscripcion.periodo && f.valores.inscripcion)
                    if (pos!==-1){
                        pendientes+=1;
                    }
                    val = await conexiones.Leer_C(['uecla_Estudiante'],{uecla_Estudiante:{_id:val._id}});
                    val= {...val.datos.uecla_Estudiante[0].valores, _id:val.datos.uecla_Estudiante[0]._id};
                    let festudiante = await genera_formulario({ valores:val, campos: Form_todos('Form_Estudiante', Config) });
                    festudiante.titulos[7].value.estatus.disabled=true;
                    festudiante.botones=[
                        {
                          name:'guardar', label:'Guardar', title:'Guardar datos de estudiante',
                          variant:"contained", color:"success", icono:<CheckIcon/>,
                          onClick: Guardar('uecla_Estudiante', Form_todos('Form_Estudiante', Config)), validar:'true', 
                          sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                        }
                    ]
                    Bloques[`${val.nombres} ${val.apellidos}`]= 
                        <div>
                            {pos===-1   ? null 
                                        :   <Alert severity="success">
                                                {`El estudiante ${val.nombres} ${val.apellidos}, esta inscripto en el periodo ${state.inscripcion.periodo}`}
                                                <IconButton onClick={()=>Constancia(val)}>
                                                    <Icon>note</Icon>
                                                </IconButton>
                                            </Alert>
                            }
                            <Formulario {...festudiante} config={Config}/>
                        </div>
                        
                }
                nuevo_Valores({datosActuales:undefined})
                const {tipo} = Ver_Valores();
                Bloques['INSCRIPCION']= pendientes< representante.representados.length
                    ?   
                        <Scrollbars sx={{height:tipo==='Electron' ? window.innerHeight * 0.7 : window.innerHeight * 0.6}}>
                            <Pagar Config={Config} Representante={Representante} Inscripcion={state.inscripcion.periodo} Refrescar={Buscar} 
                                    Subtotalvalor={{abono:Representante.valores.abono, abonod:Representante.valores.abonod}}
                                    Formas_pago={undefined} formapago={undefined}
                            />
                        </Scrollbars>
                        
                    :   <div>
                            <Alert severity="success">{`Sus representados estan inscripto en el periodo ${state.inscripcion.periodo}`}</Alert>
                        </div>
            }else{
                frepresentante.titulos[0].value.cedula.value=state.buscar
                frepresentante.datos.cedula= state.buscar;
                frepresentante.botones=[
                    {
                      name:'guardar', label:'Guardar', title:'Guardar ',
                      variant:"contained", color:"success", icono:<CheckIcon/>,
                      onClick: Guardar('uecla_Representante', Form_todos('Form_Representante', Config)), validar:'true', 
                      sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                    },
        
                ]
                Bloques[`Nuevo`]= <Formulario {...frepresentante} config={Config}/>
            }
            CambioState({Bloques, esperar:false})
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
                            <Grid item xs={4}>
                                <Paper sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: '100%' }}>
                                    <InputBase
                                        sx={{ ml: 1, flex: 1 }}
                                        placeholder="Cedula de Representante"
                                        title={'Cedula del representante que desea inscribir estudiante'}
                                        onChange={(value)=>CambioState({buscar:value.target.value})}
                                        disabled={state.inscripcion ? !state.inscripcion.estatus : true}
                                        onKeyPress={(event) =>{
                                            if (event.key==='Enter')
                                              Buscar()
                                        }}
                                    />
                                    <IconButton sx={{ p: '10px' }} onClick={Buscar}
                                                disabled={state.inscripcion ? !state.inscripcion.estatus : true}
                                    >
                                        <SearchIcon />
                                    </IconButton>
                                </Paper>
                            </Grid> 
                            <Grid item xs={8}>
                                <Alert severity="info">{state.inscripcion ? state.inscripcion.titulo : '...'}</Alert>
                            </Grid>       
                        </Grid>
                    </Item>
                </Grid>
                <Grid item xs={12}>
                    <Item sx={{height:'79vh'}}>
                        <Scrollbars>
                        {state.Bloques
                            ?   <Cuerpo Bloques={state.Bloques ? state.Bloques : {}} Config={Config}/>
                            :   <Box sx={{ display:'flex', flexDirection:'column' , height:'100%', alignItems:'center', justifyContent:'center'}}>
                                    <Box>
                                        <Typography variant="h5" gutterBottom component="div" sx={{...Config ? {color:Config.Estilos.Input_label.color} : {} }}>
                                            {state.inscripcion ? state.inscripcion.titulo : '...'}
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