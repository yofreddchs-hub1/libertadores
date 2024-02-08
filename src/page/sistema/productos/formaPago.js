import React,{useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Formulario from '../../../componentes/herramientas/formulario';

import { genera_formulario, Form_todos, Ver_Valores } from '../../../constantes';

export default function Formapago(props) {
    const [state, setState] = useState();
    let Formas;
    let Formas_pago;
    const Modificar = async(valores)=>{
        props.Cambio({formapago:valores.resultados.formapago});
        return valores
    }
    const Formularios = async(item, props)=>{
        let datosActuales = Ver_Valores().datosActuales;
        let campos = {...Form_todos('Form_FormasPago', Config)};
        let inicio_valores = datosActuales ? {...datosActuales, totales: {Tasa:props.valorCambio,...props.Subtotalvalor}} : {fecha: new Date(), totales: {Tasa:props.valorCambio,...props.Subtotalvalor}};
    
        let nuevos = await genera_formulario({valores:inicio_valores, campos });
        
        nuevos.titulos.formapago.onChange= Modificar;
        return {Forma: nuevos, Forma_dato: inicio_valores}
    }



    // const Cambios = (item,props)=> (valores) =>{
    //     const {name, resultados}=valores;
    //     Formas_pago= props.Formas_pago ? props.Formas_pago : [];
    //     Formas_pago[item]={...Formas_pago[item],[name]:resultados[name]}
    //     props.Cambio({Formas_pago})
    // }

    // const select_formapago= (item,props) => async(valores)=>{    
    //     const {name} = valores
    //     const valor =valores.resultados[name]
    //     Formas= props.Formas ? props.Formas : [];
    //     Formas_pago= props.Formas_pago ? props.Formas_pago : [];
    //     Formas_pago[item] = {...Formas_pago[item], formapago: valor}
    //     let nuevos = await Formularios(item,{Formas, Formas_pago})
    //     Formas[item] = nuevos.Forma;
    //     Formas_pago[item] = nuevos.Forma_dato
        
    //     setState({Formas, Formas_pago})
    //     props.Cambio({Formas, Formas_pago})
    // }
    
    // const Agregar = async() =>{
    //     Formas= props.Formas ? props.Formas : [];
    //     Formas_pago= props.Formas_pago ? props.Formas_pago : [];

    //     let inicio_valores = {fecha: new Date()};
    //     Formas_pago = [...Formas_pago, inicio_valores]
    //     let nuevos = await Formularios(Formas_pago.length-1,{Formas, Formas_pago})
    //     Formas = [...Formas, nuevos.Forma];
    //     Formas_pago[Formas_pago.length-1]=nuevos.Forma_dato
    //     setState({Formas, Formas_pago})
    //     props.Cambio({Formas, Formas_pago})
    // }

    // const Quitar = () =>{
    //     Formas= props.Formas ? props.Formas : [];
    //     Formas = Formas.slice(0, Formas.length-1);
    //     Formas_pago= props.Formas_pago ? props.Formas_pago : [];
    //     Formas_pago = Formas_pago.slice(0, Formas_pago.length-1);
    //     setState({Formas, Formas_pago})
    //     props.Cambio({Formas, Formas_pago})
    // }

    useEffect(()=>{
        const Inicio = async() =>{
        
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
            setState({Formas, Formas_pago})
        }
        Inicio();
        
        return ()=>{}
    },[props]);

    const {Config}=props;
    return (
        <Box sx={{ textAlign:'left' }}>
            <Grid container spacing={0.5} alignItems="center">
                <Grid item xs={window.innerWidth > 750 ? 6 : 12}>
                    <Typography variant={window.innerWidth > 750 ? "h5" : "subtitle1"} gutterBottom component="div" sx={{...Config ? {color:Config.Estilos.Input_label.color} : {} }}>
                        Total a Cancelar: {`$ ${props.Subtotalvalor.totald.toFixed(2)}  Bs. ${props.Subtotalvalor.total.toFixed(2)}`}
                    </Typography>
                </Grid>
                <Grid item xs={window.innerWidth > 750 ? 6 : 12}>
                    <Alert severity={props.Totales && props.Totales.mensaje==='Puede continuar' ? "success" :"error"}>
                        {props.Totales 
                            ? props.Totales.mensaje
                            : 'El monto es menor al monto a cancelar, Debe indicar todos los datos' 
                        }
                    </Alert>
                </Grid>
            </Grid>
            <br/> 
            <Divider />
            
            
            {state && state.Formas
                ? 
                    <div key={'Formulario-'} >
                        <Formulario {...state.Formas} config={Config}/>
                        <Divider />
                    </div>
                
                : null
            }
            {/* <div style={{marginTop:20}}>
                <Stack
                    direction={ 'row' }
                    spacing={3}
                    justifyContent="flex-end"
                    alignItems="center"
                >
                    <Typography variant="h5" >
                        Abono: $ {`${props.Totales ? props.Totales.abonod>=0 ? props.Totales.abonod.toFixed(2) : 0: 0 } Bs. ${props.Totales ? props.Totales.abono>=0 ? props.Totales.abono.toFixed(3) : 0 : 0}`}
                    </Typography>
                    <Typography variant="h5" gutterBottom component="div">
                        Total: $ {`${props.Totales ? props.Totales.dolar.toFixed(2) : 0 } Bs. ${props.Totales ? props.Totales.bolivar.toFixed(3) : 0}`}
                    </Typography>
                    <Typography variant="h5" gutterBottom component="div">
                        Restan: $ {`${props.Totales ? props.Totales.restand< 0 ? (-1 * props.Totales.restand).toFixed(2) : 0: 0 } Bs. ${props.Totales ? props.Totales.restan<0 ? (-1 * props.Totales.restan).toFixed(3) : 0 : 0}`}
                    </Typography>
                    <Typography variant="h5" gutterBottom component="div">
                        Cancelado: Bs. {`${props.Totales ? props.Totales.total.toFixed(3): 0 }`}
                    </Typography>
                </Stack>
            </div> */}
        </Box>
    );
}
