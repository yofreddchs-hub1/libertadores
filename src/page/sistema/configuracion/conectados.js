import React, {useState, useEffect} from 'react';
import Tabla from '../../../componentes/herramientas/tabla';
import {Ver_Valores, conexiones, genera_formulario, Moneda, Form_todos, Titulos_todos, ReporteExcell} from '../../../constantes';
import Dialogo from '../../../componentes/herramientas/dialogo';
import IconButton from '@mui/material/IconButton';
import Esperar from '../../../componentes/esperar/cargar';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import moment from 'moment';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Reporte from '../../../componentes/reporte';
import Recibopdf from '../pagar/pdf/recibonuevo';
import { Abrir_Recibo } from '../funciones';
//Iconos
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Icon from '@mui/material/Icon';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css';
import Formulario from '../../../componentes/herramientas/formulario';
import Cargando from '../../../componentes/esperar/cargar';
import Scrollbars from '../../../componentes/herramientas/scrolbars';
// import Prueba from '../../pruebas';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

function Conectados (props) {
    const {Config} = props;
    const {User} = Ver_Valores();
    // const estilos= Config && Config.Estilos.Usuarios ? Config.Estilos.Usuarios : Ver_Valores().config.Estilos.Usuarios ? Ver_Valores().config.Estilos.Usuarios : {} //props.config.Estilos.Usuarios ? props.config.Estilos.Usurios : {}
    // const classes= Estilos(estilos);
    const [state, setState]= useState({esperar:true});
    const [dialogo, setDialogo]= useState({
        open:false,  
    });
    
    let Formularios;
    let FInicio;
    let FFin;

    const Refrescar = ()=>{
        let formulario = state.formulario ? state.formulario : Formularios;
        FInicio= formulario.titulos[0].value.inicio.value;
        FFin = formulario.titulos[0].value.fin.value;
        
    }

    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }
    const Actualizar_data = (valores)=>{
        cambiarState({cantidad:valores.cantidad, datos:valores.nuevodatos})
    }

    const Abrir_recibo = async(valores)=>{
        const {recibo}=valores.valores;
        // const resultado = Recibopdf(valores);
        // let Cuerpo= <embed src={`${resultado}#view=Fit&toolbar=1&navpanes=1&scrollbar=1`} type="application/pdf" width="100%" height={window.innerHeight * 0.75} />
        setDialogo({
            ...dialogo, 
            open: !dialogo.open,
            // tam:'xl',
            Titulo: `Recibo: ${recibo}`,
            Cuerpo: <Reporte  datos={valores} reporte={Recibopdf} sizePagina= {{width:612, height:396}} />,
            Cerrar: ()=>setDialogo({...dialogo,open:false}),
        })

    }

    const ReporteM = () =>{
        ReporteExcell(state.datos,state.inicio, state.fin, `${moment(state.inicio).format('DD-MM-YYYY')} al ${moment(state.fin).format('DD-MM-YYYY')}`,`Reporte${moment(state.inicio).format('DD-MM-YYYY')}al${moment(state.fin).format('DD-MM-YYYY')}.xlsx`)
        // let formulario = state.formulario ? state.formulario : Formularios;
        // FInicio= formulario.titulos[0].value.inicio.value;
        // FFin = formulario.titulos[0].value.fin.value;
        // console.log(FInicio, FFin)
        // setDialogo({
        //     ...dialogo, 
        //     open: !dialogo.open,
        //     Titulo: `Reporte ${moment(FInicio).format('DD/MM/YYYY')} - ${moment(FFin).format('DD/MM/YYYY')}`,
        //     tam:'xl',
        //     Cuerpo: <Prueba Datos={state.datos} Inicio={FInicio} Fin={FFin}/>,
        //     Cerrar: ()=>setDialogo({...dialogo,open:false}),
        // })
    }

    const Abrir = async(valores) =>{
        const resultado= await Abrir_Recibo(valores, Abrir_recibo);
        // const {mensualidades, Formas_pago, recibo, subtotalvalor, totales}=valores.valores
        // let Fmensualidad = await genera_formulario({valores:mensualidades, campos: Form_todos('Form_Mensualidades') })
        // Fmensualidad.titulos.meses.noeliminar=true;
        // Fmensualidad.titulos.meses.nopaginar=true;
        // Fmensualidad.titulos.meses.label='Pagos a Realizados';
        // Fmensualidad.titulos.meses.style={height:320};
        // let nuevos = Formas_pago.map((val, i)=>{
        //     return {...val,
        //         id:i+1, 
        //         formapago: val.titulo, bancoorigen: val.bancoorigen ? val.bancoorigen : '', 
        //         bancodestino: val.bancodestino ? val.bancodestino : '',
        //         fecha: val.fecha===null ? '' : typeof val.fecha==='string' ? val.fecha : moment(val.fecha).format('DD/MM/YYYY')
        //     }
        // })

        // let Formapago = await genera_formulario({valores:{formapago:nuevos}, campos: Form_todos('Form_FormasPago') })
        // Formapago.titulos.formapago.noeliminar=true;
        // Formapago.titulos.formapago.nopaginar=true;
        // Formapago.titulos.formapago.Form=undefined;
        // Formapago.titulos.formapago.Subtotal=undefined;
        // Formapago.titulos.formapago.editables='no';
        // Formapago.titulos.formapago.style={height:250}; 

        // let Cuerpo =
        // <Box sx={{ textAlign:'left' }}>
        //     <div style={{marginTop:-30}}/>
            
        //     <Formulario {...Fmensualidad}/>
        //     <div style={{marginTop:-30}}/>
            
        //     <Formulario {...Formapago}/>
                
        //     <div style={{ paddingRight:10}}>
        //         <Stack
        //             direction={ 'column' }
        //             spacing={1}
        //             justifyContent="center"
        //             alignItems="flex-end"
        //         >
        //             <Typography variant="h5" gutterBottom component="div">
        //                 Total : {`${Moneda(subtotalvalor.total) }`}
        //             </Typography>
        //             <Typography variant="h5" gutterBottom component="div">
        //                 Total Cancelado: {`${Moneda(totales.total)}`}
        //             </Typography>
        //             <Typography variant="h5" >
        //                 Abono: {`${Moneda(totales.abono)}`}
        //             </Typography>
                
                    
        //         </Stack>
        //     </div>
        // </Box>

        // let Titulo = 
        //         <Stack
        //             direction={ 'row' }
        //             spacing={1}
        //             justifyContent="center" alignItems="center"
        //         >
        //             Recibo: {recibo}
        //             <IconButton size="large" color="inherit" title={'Mostra recibo'} onClick={()=>Abrir_recibo(valores)}>
        //                 <Icon >text_snippet</Icon>
        //             </IconButton>
        //         </Stack>
        
        setDialogo({
            ...dialogo, 
            open: !dialogo.open,
            Titulo: resultado.Titulo,
            Cuerpo: resultado.Cuerpo,
            Cerrar: ()=>setDialogo({...dialogo,open:false}),
        })
    }
    
   
    const Inicio = async() =>{

        Ver_Valores().socket.on("users", async (datos) =>{
            
            let nuevo = datos.users.filter(f=> f.api===Ver_Valores().valores.app)
            nuevo = nuevo.map(val=>{
                return {...val, categoria: val.categoria._id!==undefined ? val.categoria._id : val.categoria }
            })
            

            let condicionU ={$or:[]};
            let condicionR = {$or:[]};
            nuevo.map(val=>{
                if ([4,"4"].indexOf(val.categoria)!==-1){
                    condicionR['$or']=[...condicionR['$or'], {_id:val._id}]
                }else{
                    condicionU['$or']=[...condicionU['$or'], {_id:val._id}]
                }
                return val
            })
            const result= await conexiones.Leer_C(['uecla_Representante','uecla_User_api'],{
                uecla_Representante: condicionR,
                uecla_User_api:condicionU
            })
            
            if (result.Respuesta==='Ok'){
                result.datos.uecla_Representante.map(val=>{
                    const pos = nuevo.findIndex(f=>f._id===val._id);
                    if (pos!==-1){
                        nuevo[pos]={...nuevo[pos], nombres:`${val.valores.nombres} ${val.valores.apellidos}`}
                    }
                    return val
                })
                result.datos.uecla_User_api.map(val=>{
                    const pos = nuevo.findIndex(f=>f._id===val._id);
                    if (pos!==-1){
                        nuevo[pos]={...nuevo[pos], nombres:`${val.valores.nombre}`}
                    }
                    return val
                })
            }

            let titulos = [...await Titulos_todos(`Titulos_User_api`, Ver_Valores().config)];
            titulos = titulos.filter(f=>f.field!=='foto')
            titulos[0].formato= (dato)=>{return dato.username}
            titulos[2].formato= (dato)=>{return dato.nombres}
            
            cambiarState({ titulos, datos:nuevo, esperar:false})
        })
        Ver_Valores().socket.emit('Presentes')
        // Ver_data()
    }
    const Inicio1 = async() =>{
        const titulos = await Titulos_todos(`Titulos_Recibo`, Config)
        cambiarState({ titulos})
        
    }
   
    useEffect(()=>{
        Inicio()
        return ()=>{
            
        }
    }, [props])
    if (!state.titulos){
        Inicio1();
    }
    
    const color =  props.Config.Estilos.Input_icono_t ? props.Config.Estilos.Input_icono_t : {};
    const alto = Ver_Valores().tipo==='Web' 
        ?   window.innerHeight * 0.80
        :   window.innerHeight * 0.68
    return state.esperar ? <Cargando open={state.esperar} Config={Config}/> 
        :!state.titulos? null: (
        <div >
            <Tabla  Titulo={"Usuarios en linea"}
                    alto={alto}
                    Config={Config ? Config : Ver_Valores().config}
                    titulos={state.titulos}
                    table={'uecla_Recibo'}
                    cantidad={state.cantidad ? state.cantidad : null}
                    cargacompleta={Actualizar_data}
                    datos={state.datos}
                    Accion={Abrir}
                    Noactualizar
                    cargaporparte={true}
                    sinpaginacion={true}
                    
                    
            />
            <Dialogo  {...dialogo} config={Ver_Valores().config}/>
            <Esperar open={state.esperar}/>
        
        </div>
    )
}

export default Conectados;