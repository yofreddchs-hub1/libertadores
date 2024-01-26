import React,{useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Dialogo from '../../../componentes/herramientas/dialogo';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import { Icon } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Formulario from '../../../componentes/herramientas/formulario';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import Cargando from '../../../componentes/esperar/cargar';

import { genera_formulario, Form_todos, Ver_Valores, conexiones } from '../../../constantes';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    marginBottom:theme.spacing(0.5),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
width: 1,
});
export default function Formapago(props) {
    const [state, setState] = useState({cargando:true, Dialogo:{open:false}});
    let Formas;
    let Formas_pago;
    const Modificar = async(valores)=>{
        props.Cambio({formapago:valores.resultados.formapago});
        return valores
    }
    const Imagen_modificar = async(e)=>{
        const {name, files} = e.target;
        const url =Object.keys(files).map(ur => {
            return URL.createObjectURL(files[ur])
        })
        // console.log(name, files, url)
        setState({...state, files, url});
        props.Cambio({files});
    }
    const Formularios = async(item, props)=>{
        let datosActuales = Ver_Valores().datosActuales;
        let campos = {...Form_todos('Form_FormasPago', Config)};
        let inicio_valores = datosActuales ? {...datosActuales, totales: {Tasa:props.valorCambio,...props.Subtotalvalor}} : {fecha: new Date(), totales: {Tasa:props.valorCambio,...props.Subtotalvalor}};
       
        let nuevos = await genera_formulario({valores:inicio_valores, campos });
        // nuevos.titulos[0].value.formapago.onChange = select_formapago(item, props);
        // if (inicio_valores.formapago===undefined){
        //     inicio_valores.formapago=nuevos.titulos[0].value.formapago.lista[0];
        // }
        nuevos.titulos.formapago.onChange= Modificar;
        return {Forma: nuevos, Forma_dato: inicio_valores}
    }


    const Cambios = (item,props)=> (valores) =>{
        const {name, resultados}=valores;
        Formas_pago= props.Formas_pago ? props.Formas_pago : [];
        Formas_pago[item]={...Formas_pago[item],[name]:resultados[name]}
        props.Cambio({Formas_pago})
    }

    const select_formapago= (item,props) => async(valores)=>{    
        const {name} = valores
        const valor =valores.resultados[name]
        Formas= props.Formas ? props.Formas : [];
        Formas_pago= props.Formas_pago ? props.Formas_pago : [];
        Formas_pago[item] = {...Formas_pago[item], formapago: valor}
        let nuevos = await Formularios(item,{Formas, Formas_pago})
        Formas[item] = nuevos.Forma;
        Formas_pago[item] = nuevos.Forma_dato
        
        setState({Formas, Formas_pago})
        props.Cambio({Formas, Formas_pago})
    }
    
    const Agregar = async() =>{
        Formas= props.Formas ? props.Formas : [];
        Formas_pago= props.Formas_pago ? props.Formas_pago : [];

        let inicio_valores = {fecha: new Date()};
        Formas_pago = [...Formas_pago, inicio_valores]
        let nuevos = await Formularios(Formas_pago.length-1,{Formas, Formas_pago})
        Formas = [...Formas, nuevos.Forma];
        Formas_pago[Formas_pago.length-1]=nuevos.Forma_dato
        setState({Formas, Formas_pago})
        props.Cambio({Formas, Formas_pago})
    }

    const Quitar = () =>{
        Formas= props.Formas ? props.Formas : [];
        Formas = Formas.slice(0, Formas.length-1);
        Formas_pago= props.Formas_pago ? props.Formas_pago : [];
        Formas_pago = Formas_pago.slice(0, Formas_pago.length-1);
        setState({Formas, Formas_pago})
        props.Cambio({Formas, Formas_pago})
    }

    const Mostrar = (image) =>{
        setState({...state,
            Dialogo:{
                open:true,
                Titulo:'IMAGEN SUBIDA',
                Cuerpo: <Box component={'div'}>
                            <img src={image} />
                        </Box>,
                Cerrar: ()=>{
                    setState({...state,Dialogo:{open:false}});
                },
            }
        })
    }
    const Pendiente = (data)=>{
        props.Cambio({Pendiente:data, Motivo_rechazo:''});
    }
    const Motivo = (event)=>{
        const {name, value} = event.target;
        props.Cambio({Motivo_rechazo:value});
    }
    useEffect(()=>{
        const Inicio = async() =>{
            setState({...state, cargando:true })
            Formas= props.Formas ? props.Formas : [];
            // let nuevo = Form_todos('Form_Representados');
            Formas_pago= props.Formas_pago ? props.Formas_pago : []
            if (Formas.length===0){
                let nuevos = await Formularios(0,props)
                Formas = nuevos.Forma;
                // props.Cambio({Formas, Formas_pago:[nuevos.Forma_dato]})
            }
            
            if (props.Formas && props.Formas_pago){
                Formas=[]
                for (var i=0 ; i<props.Formas_pago.length; i++ ){
                    let nuevos = await Formularios(i,props)
                    Formas = [...Formas, nuevos.Forma];
                }
            }
            let bancos =await conexiones.Leer_C('uecla_Cuenta',{'uecla_Cuenta':{}})
            bancos= bancos.datos.uecla_Cuenta
            // console.log(props.files, typeof props.files)
            let url = props.files && props.files.length!==0 
                        ? Object.keys(props.files).map(ur=>{
                            // console.log('>>>>>>>>', typeof props.files[ur],props.files[ur] )
                            return typeof props.files[ur]==='string' && props.files[ur].indexOf('http')!==-1 ? props.files[ur] :  URL.createObjectURL(props.files[ur])
                        }) : [];
            
            setState({...state, Formas, Formas_pago, bancos, url, cargando:false })
        }
        Inicio();
        // console.log('Entro por aqui>>>>')
    },[props]);

    const {Config}=props;
    const {User}=Ver_Valores()
    
    return (
        <Box sx={{ textAlign:'left' }}>
            <Grid container spacing={0.5} alignItems="center">
                <Grid item xs={6}>
                    <Typography variant="h5" gutterBottom component="div" sx={{...Config ? {color:Config.Estilos.Input_label.color} : {} }}>
                        Total a Cancelar: {`$ ${props.Subtotalvalor.totald.toFixed(2)}  Bs. ${props.Subtotalvalor.total.toFixed(3)}`}
                    </Typography>
                </Grid>
                <Grid item xs={6}>
                    <Alert severity={props.Totales && props.Totales.mensaje==='Puede continuar' && props.Pendiente!==true ? "success" : props.Pendiente===true ? "warning" :"error"}>
                        {props.Totales 
                            ? `${props.Pendiente===true ? 'Pago pendiente por: Aprobar o Rechazar para continuar': props.Totales.mensaje}`
                            : 'El monto es menor al monto a cancelar, Debe indicar todos los datos' 
                        }
                    </Alert>
                    {props.Pendiente
                        ?   <Box component={'div'} sx={{textAlign:'center',p:1}}>
                                <IconButton title={'Aprobar'} style={{backgroundColor:'green'}} onClick={()=>Pendiente('Aprobado')}>
                                    <Icon sx={{color:'#fff'}}>done</Icon>
                                </IconButton>
                                <IconButton title={'Rechazar'} style={{backgroundColor:'red', marginLeft:10}} onClick={()=>Pendiente('Rechazar')}>
                                    <Icon sx={{color:'#fff'}}>cancel</Icon>
                                </IconButton>
                            </Box>
                        :   null
                    }
                    { props.Pendiente && ['Aprobado','Rechazar'].indexOf(props.Pendiente)!==-1
                        ?   <Alert severity={props.Pendiente==='Aprobado' ? "success" :"error"}>
                                {props.Pendiente==='Aprobado' ? props.Pendiente : 'Rechazado'}
                            </Alert>
                        :   null

                    }
                    {props.Pendiente && props.Pendiente==='Rechazar'
                        ?   <Box component={'div'} >
                                <TextField
                                    label="Motivo de rechazo"
                                    multiline
                                    maxRows={2}
                                    fullWidth
                                    onChange={Motivo}
                                    value={props.Motivo_rechazo ? props.Motivo_rechazo :''}
                                />
                            </Box>
                        : null
                    }
                </Grid>
                {[4,'4'].indexOf(User.categoria)!==-1 &&state && state.bancos ?
                    <Grid container spacing={0.5} >
                        <Grid item xs={2}>
                            <Item sx={{bgcolor:'grey'}}><Typography color={'#fff'} variant="subtitle1" >{'BANCO'}</Typography> </Item>
                        </Grid>
                        <Grid item xs={3}>
                            <Item sx={{bgcolor:'grey'}}><Typography color={'#fff'} variant="subtitle1" >{'NUMERO DE CUENTA'}</Typography> </Item>
                        </Grid>
                        <Grid item xs={3}>
                            <Item sx={{bgcolor:'grey'}}><Typography color={'#fff'} variant="subtitle1" >{'TITULAR'}</Typography> </Item>
                        </Grid>
                        <Grid item xs={2}>
                            <Item sx={{bgcolor:'grey'}} ><Typography color={'#fff'} variant="subtitle1" >{'RIF'}</Typography> </Item>
                        </Grid>
                        <Grid item xs={2}>
                            <Item sx={{bgcolor:'grey'}}><Typography color={'#fff'} variant="subtitle1" >{'TIPO'}</Typography> </Item>
                        </Grid>
                        
                    </Grid>
                    : null
                }
                
                {[4,'4'].indexOf(User.categoria)!==-1 &&state && state.bancos ? state.bancos.map(banco=>
                    <Grid container spacing={0.5} key={banco._id}>
                        <Grid item xs={2}>
                            <Item title={banco.valores.banco.titulo}><Typography noWrap variant="subtitle2" >{banco.valores.banco.titulo}</Typography> </Item>
                        </Grid>
                        <Grid item xs={3}>
                            <Item title={banco.valores.numero} ><Typography noWrap variant="subtitle2" >{banco.valores.numero}</Typography> </Item>
                        </Grid>
                        <Grid item xs={3}>
                            <Item title={banco.valores.titular}><Typography noWrap variant="subtitle2" >{banco.valores.titular}</Typography> </Item>
                        </Grid>
                        <Grid item xs={2}>
                            <Item title={banco.valores.rif}><Typography noWrap variant="subtitle2" >{banco.valores.rif}</Typography> </Item>
                        </Grid>
                        <Grid item xs={2}>
                            <Item title={banco.valores.tipo}><Typography noWrap variant="subtitle2" >{banco.valores.tipo}</Typography> </Item>
                        </Grid>
                    </Grid>
                ): null}
                
                {[4,'4'].indexOf(User.categoria)!==-1  ?
                    <Grid container spacing={0.5} >
                        <Grid item xs={12} >
                            <Item >
                                <Typography variant="subtitle1" > PARA INGRESAR CAPTURE</Typography>
                                <IconButton title={'Agregar Capture'} component="label" style={{backgroundColor:'green'}}>
                                    <Icon sx={{color:'#fff'}}>add_circle</Icon>
                                    <VisuallyHiddenInput type="file" accept="image/*" name={'files'} multiple onChange={Imagen_modificar}/> 
                                </IconButton>
                            </Item>
                        </Grid>
                        
                    </Grid>
                    : null
                }
                <Grid container spacing={0.5} >
                    {state && state.url ? 
                        state.url.map((val,i)=>
                            <Grid item xs={2} key={i}>
                                <Item style={{cursor:'pointer'}} onClick={()=>Mostrar(val)}>
                                    <img src={val} style={{width:'90%'}}/>
                                </Item>
                            </Grid>
                        )
                        : null
                    }
                </Grid>
                
            </Grid> 
            <Divider />
            
            {state && state.Formas
                ? 
                    <div key={'Formulario-'} >
                        <Formulario {...state.Formas} config={Config}/>
                        <Divider />
                    </div>
                
                : null
            }
            <Dialogo  {...state.Dialogo} config={props.Config}/>
            <Cargando open={state.cargando} Config={Config}/>
        </Box>
    );
}
