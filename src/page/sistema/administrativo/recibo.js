import React, {useState, useEffect} from 'react';
import Tabla from '../../../componentes/herramientas/tabla';
import {Ver_Valores, conexiones, genera_formulario, Moneda, Form_todos, Titulos_todos} from '../../../constantes';
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
//Iconos
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Icon from '@mui/material/Icon';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css';
import Formulario from '../../../componentes/herramientas/formulario';
import Cargando from '../../../componentes/esperar/cargar';
import Scrollbars from '../../../componentes/herramientas/scrolbars';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

function Recibo (props) {
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
        Ver_data(FInicio, FFin, formulario)
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
    const Abrir = async(valores) =>{
        const {mensualidades, Formas_pago, recibo, subtotalvalor, totales}=valores.valores
        let Fmensualidad = await genera_formulario({valores:mensualidades, campos: Form_todos('Form_Mensualidades') })
        Fmensualidad.titulos.meses.noeliminar=true;
        Fmensualidad.titulos.meses.nopaginar=true;
        Fmensualidad.titulos.meses.label='Pagos a Realizados';
        Fmensualidad.titulos.meses.style={height:320};
        let nuevos = Formas_pago.map((val, i)=>{
            return {...val,
                id:i+1, 
                formapago: val.titulo, bancoorigen: val.bancoorigen ? val.bancoorigen : '', 
                bancodestino: val.bancodestino ? val.bancodestino : '',
                fecha: val.fecha===null ? '' : typeof val.fecha==='string' ? val.fecha : moment(val.fecha).format('DD/MM/YYYY')
            }
        })

        let Formapago = await genera_formulario({valores:{formapago:nuevos}, campos: Form_todos('Form_FormasPago') })
        Formapago.titulos.formapago.noeliminar=true;
        Formapago.titulos.formapago.nopaginar=true;
        Formapago.titulos.formapago.Form=undefined;
        Formapago.titulos.formapago.Subtotal=undefined;
        Formapago.titulos.formapago.editables='no';
        Formapago.titulos.formapago.style={height:250}; 

        let Cuerpo =
        <Box sx={{ textAlign:'left' }}>
            <div style={{marginTop:-30}}/>
            
            <Formulario {...Fmensualidad}/>
            <div style={{marginTop:-30}}/>
            
            <Formulario {...Formapago}/>
                
            <div style={{ paddingRight:10}}>
                <Stack
                    direction={ 'column' }
                    spacing={1}
                    justifyContent="center"
                    alignItems="flex-end"
                >
                    <Typography variant="h5" gutterBottom component="div">
                        Total : Bs. {`${subtotalvalor.total.toFixed(3) }`}
                    </Typography>
                    <Typography variant="h5" gutterBottom component="div">
                        Total Cancelado: Bs. {`${totales.total.toFixed(3)}`}
                    </Typography>
                    <Typography variant="h5" >
                        Abono: {`Bs. ${totales.abono.toFixed(3)}`}
                    </Typography>
                
                    
                </Stack>
            </div>
        </Box>

        let Titulo = 
                <Stack
                    direction={ 'row' }
                    spacing={1}
                    justifyContent="center" alignItems="center"
                >
                    Recibo: {recibo}
                    <IconButton size="large" color="inherit" title={'Mostra recibo'} onClick={()=>Abrir_recibo(valores)}>
                        <Icon >text_snippet</Icon>
                    </IconButton>
                </Stack>
        
        setDialogo({
            ...dialogo, 
            open: !dialogo.open,
            Titulo,
            Cuerpo: Cuerpo,
            Cerrar: ()=>setDialogo({...dialogo,open:false}),
        })
    }
    
    const Ver_data = async(inicio= new Date(), fin= new Date(), formulario=null)=>{
        cambiarState({esperar:true});
        // inicio.setHours(0,0,0,1);
        // fin.setHours(23,59,59,999);
        // inicio=moment(inicio).format('YYYY-MM-DD');
        // fin=moment(fin).format('YYYY-MM-DD');
        let respuesta= await conexiones.Recibo({inicio,fin});
        // Leer_C(['uecla_Recibo'], 
        //     {
        //         'uecla_Recibo':Ver_Valores().tipo==='Electron' ? {} : {$or: [{'fecha':{$gte: inicio, $lte: fin}}]} //{createdAt: {$gte: inicio, $lte: fin}},
        //     }
    
        // );

        if (respuesta.Respuesta==='Ok'){
            
            let datos =respuesta.recibos
                // .filter(f=> moment(f.valores.sistema_viejo ? f.valores.fecha : f.createdAt).format('YYYY-MM-DD')>=moment(inicio).format('YYYY-MM-DD') && moment(f.valores.sistema_viejo ? f.valores.fecha : f.createdAt).format('YYYY-MM-DD')<=moment(fin).format('YYYY-MM-DD'))
                .map(val=>{
                    if (val.valores.sistema_viejo){
                        return {...val, createdAt: val.valores.fecha}
                    }else{
                        return val
                    }
                })
                // .sort((a,b) => Number(a.recibo)> Number(b.recibo) ?  1 : -1);
            if ([4,'4'].indexOf(User.categoria)!==-1){
                datos= datos.filter(f=> String(f.valores.representante._id).toLowerCase()===String(User.valores._id).toLowerCase() || f.valores.representante.cedula===User.valores.cedula)
            }
            let totales = {total:0, pagomovil:0, transferencia:0, efectivo:0, dolar:0, debito:0, zelle:0};
            datos.map(val=>{
                totales.total+=val.valores.totales.total;
                val.valores.Formas_pago.map(pa=>{
                    if (pa.value==='transferencia'){
                        totales.transferencia+=Number(pa.monto)
                    }else if (pa.value==='debito'){
                        totales.debito+=Number(pa.monto)
                    }else if (pa.value==='pagomovil'){
                        totales.pagomovil+=Number(pa.monto)
                    }else if (pa.value==='efectivobolivar'){
                        totales.efectivo+=Number(pa.monto)
                    }else if (pa.value==='efectivodolar'){
                        totales.dolar+=Number(pa.monto)
                    }
                    else if (pa.value==='zelle'){
                        totales.zelle+=Number(pa.monto)
                    }
                    return pa
                })
                return val
            })
            if (formulario!==null){
                cambiarState({datos, esperar:false, formulario, totales})
                Formularios= formulario
            }else{
                cambiarState({datos, esperar:false, totales})
            }
        }else{
            cambiarState({esperar:false});
            confirmAlert({
              title: respuesta.mensaje,
              buttons: [
                {label: 'Continuar'},
                {label: 'Reintentar', onClick: ()=>Ver_Valores(inicio, fin, formulario)}
              ]
            });
        }


    }
    const Cambio_fecha = async (valores)=>{
        const {inicio, fin}=valores.resultados;
        let formulario = state.formulario ? state.formulario : Formularios;
        if (inicio<=fin){
            FFin= fin;
            FInicio = inicio;
            formulario.titulos[0].value.inicio.onChange= Cambio_fecha;
            formulario.titulos[0].value.fin.onChange= Cambio_fecha;
            formulario.titulos[0].value.inicio.value= inicio;
            formulario.titulos[0].value.fin.value= fin;
            Ver_data(inicio, fin, formulario)
            
        }else{
            cambiarState({formulario})
        }
        
        
    }
    const Inicio = async() =>{
        FInicio= new Date();
        FFin = new Date();
        let formulario = await genera_formulario({valores:{inicio: FInicio, fin: FFin}, campos: Form_todos('Form_fecha_recibo') })
        formulario.titulos[0].value.inicio.onChange= Cambio_fecha;
        formulario.titulos[0].value.fin.onChange= Cambio_fecha;
        // FInicio.setHours(0,0,0,1);
        // FFin.setHours(23,59,59,999)
        cambiarState({formulario})
        
        Ver_data(FInicio, FFin, formulario)
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
        ?   window.innerHeight * 0.65
        :   window.innerHeight * 0.68
    return state.esperar ? <Cargando open={state.esperar} Config={Config}/> 
        :!state.titulos? null: (
        <div >
            <Tabla  Titulo={"Recibos"}
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
                    acciones={
                        <Stack direction="row" spacing={1}>
                            <IconButton color={'primary'} title={'Refrescar valores de Recibos'} onClick={Refrescar}>
                                <AutorenewIcon style={color}/>
                            </IconButton>
                            {state.formulario 
                                ?   <Box sx={{width:window.innerWidth * 0.5}}>
                                        <Scrollbars sx={{ flexGrow: 1, width:window.innerWidth * 0.4, overflow:'auto' ,display: { xs: 'flex', md: 'flex' } }}>
                                            <Formulario {...state.formulario} 
                                                        config={{...Ver_Valores().config,
                                                            Estilos:{
                                                                Input_label:{color:'#fff'}
                                                            }
                                                        }}
                                            /> 
                                        </Scrollbars>
                                    </Box>
                                : null}
                        </Stack>
                    }
                    acciones1={
                        [4,'4'].indexOf(User.categoria)===-1 
                        ?   <Scrollbars sx={{ justifyContent:window.innerWidth > 750 ? "flex-end" : "", flexGrow: 1, width:window.innerWidth > 750 ? window.innerWidth * 0.97: '100%', overflow:'auto' ,display: { xs: 'flex', md: 'flex' } }}>
                            <Stack
                                direction="row"
                                divider={<Divider orientation="vertical" flexItem />}
                                spacing={1}
                                justifyContent="flex-end"
                                alignItems="center"
                            >
                                <Item title={`Total obtenido por efectivo en dolar en fecha indicada`}>Dolar: $ {state.totales ? Moneda(state.totales.dolar,'$',false) : 0 }</Item>
                                <Item title={`Total obtenido por efectivo en dolar en fecha indicada`}>zelle: $ {state.totales ? Moneda(state.totales.zelle,'$',false) : 0 }</Item>
                                <Item title={`Total obtenido por efectivo en Bolivares en fecha indicada`}>Efectivo: Bs. {state.totales ? Moneda(state.totales.efectivo,'Bs', false) : 0 }</Item>
                                <Item title={`Total obtenido por debito en fecha indicada`}>Debito: Bs. {state.totales ? Moneda(state.totales.debito,'Bs',false) : 0 } </Item>
                                <Item title={`Total obtenido por transferencia en fecha indicada`}>Transferencia: Bs. {state.totales ? Moneda(state.totales.transferencia,'Bs',false) : 0 }</Item>
                                <Item title={`Total obtenido por pago movil en fecha indicada`}>Pago Movil: Bs. {state.totales ? Moneda(state.totales.pagomovil,'Bs',false) : 0 }</Item>
                                <Item title={`Total facturado en fecha indicada`}>Facturado: Bs. {state.totales ? Moneda(state.totales.total,'Bs',false) : 0 }</Item>
                            </Stack>
                            </Scrollbars>
                        : null
                    }
            />
            <Dialogo  {...dialogo} config={Ver_Valores().config}/>
            <Esperar open={state.esperar}/>
        
        </div>
    )
}

export default Recibo;