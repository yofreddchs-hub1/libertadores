import * as React from 'react'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import { CabezeraConstancia } from '../../../componentes/reporte/cabezera';

import TablaReporte from '../../../componentes/reporte/tabla_reporte';
import { Ver_Valores } from '../../../constantes';


export default function RConstancia(props) {
    const [formulario] = React.useState();
    const {datos}= props;
    const Condicion = Ver_Valores().datos_reporte;
    const valores = datos ? datos.valores : undefined;
    const mensualidades = valores && valores.mensualidades && valores.mensualidades.meses ? valores.mensualidades.meses: [];
    React.useEffect(()=>{
        // const Iniciar = async()=>{
        //     let nuevos = await genera_formulario({valores:{}, campos: Form_todos('Form_Mensualidades') });
        //     nuevos.titulos.meses.noeliminar=true;
        //     nuevos.titulos.meses.nopaginar=true;
        //     nuevos.titulos.meses.label='';
        //     nuevos.titulos.meses.style={
        //         height:'auto',
        //         borderColor:'#000',
        //         border:3,
        //     }
        //     setFormulario(nuevos);
        // }
        // Iniciar();
    },[props])
    // const color = '#000000';
    // const subtotal ='0,00';
    // const iva = valores 
    //             ? Number(Number(subtotal * 16/100)).toFixed(2)
    //             :'0,00';
    // const total = (Number(subtotal) + Number(iva)).toFixed(2) ;
    return (
        <Box sx={{ flexGrow: 1, bgcolor:'#fff', padding:2, 
                    ...props.sizePagina ? props.sizePagina : {width:612, height:700}
                }}
        >
            <Grid container spacing={0.5}>
                <CabezeraConstancia {...props} />
                {/* <InformacionCHS {...props}/>*/}
                <Grid xs={12}>
                    {formulario 
                        ? <TablaReporte datos={mensualidades ? mensualidades : []}  {...formulario && formulario.titulos ? formulario.titulos.meses : {}} Condicion={Condicion}/>     
                        : null
                    }
                </Grid> 
                
                
            </Grid>
        </Box>
    );
}
