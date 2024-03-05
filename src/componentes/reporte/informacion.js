import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { numeroALetras } from '../../constantes';


export function InformacionCHS(props) {
    // console.log(props)
    const {datos, Titulo, color_letra}= props;
    const valores = datos ? datos.valores : undefined;
    const Tletra = 8;
    const color = color_letra ? color_letra : '#000000';
    const totalL = numeroALetras(valores.totales.total,{ //anteriro =>valores.subtotalvalor.total
        plural: "BOLIVARES",
        singular: "BOLIVAR",
        centPlural: "CENTIMOS",
        centSingular: "CENTIMO"
    });
    return (
        <Grid container spacing={0.3}>
            
            <Grid xs={2.5}>
                <Box>
                    <Typography color={color} fontSize={Tletra} fontWeight={'bold'}>
                        { !props.nomostrar ? `Hemos recibido del Sr. (a): ` : ''}
                    </Typography>
                </Box>
            </Grid>
            <Grid xs={9.5}>
                <Box>
                    <Typography color={color} fontSize={Tletra} >
                        {`${valores && valores.representante ?  valores.representante.nombres + ' ' + valores.representante.apellidos + ', RIF/CI: ' + valores.representante.cedula: ''}`}
                    </Typography>
                </Box>
            </Grid>
            <Grid xs={2.5}>
                <Box>
                    <Typography color={color} fontSize={Tletra} fontWeight={'bold'}>
                        {!props.nomostrar ? `La cantidad de: ` : ''}
                    </Typography>
                </Box>
            </Grid>
            <Grid xs={9.5}>
                <Box>
                    <Typography color={color} fontSize={Tletra}>
                        {`${valores && valores.subtotalvalor ? totalL : ''}`}
                    </Typography>
                </Box>
            </Grid>
            
            
        </Grid>
    );
}

export function InformacionFormatoCHS(props) {
    
    const {datos, Titulo, color_letra, Condicion}= props;
    const valores = datos ? datos.valores : undefined;
    const Tletra = 11;
    const color = color_letra ? color_letra : '#002060';
    let direccion = valores && valores.orden_venta ? valores.orden_venta.cliente.direccion : '';
    let direccion1 ='';
    if (direccion.length>90){
        direccion1 = direccion.substr(91);
        direccion = direccion.substr(0,91);
    }
    const titulo =  Condicion && Condicion.destino ? `${Condicion.destino}` :'';
    return (
        <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={0.6}>
            
            <Grid item xs={1}><Typography color={color} fontSize={Tletra} fontWeight={'bold'}></Typography></Grid>
            <Grid item xs={2}><Typography color={color} fontSize={Tletra} >{moment().format('DD/MM/YYYY')}</Typography></Grid>
            <Grid item xs={2}><Typography color={color} fontSize={Tletra} fontWeight={'bold'}></Typography></Grid>
            <Grid item xs={7}>
                <Typography color={color} fontSize={Tletra} fontWeight={'bold'}>
                    {`${valores && valores.orden_venta ? valores.orden_venta.cliente.nombre : ''}`}
                </Typography>
            </Grid>
            
            <Grid item xs={1.5}><Typography color={color} fontSize={Tletra}></Typography></Grid>
            <Grid item xs={10.5}>
                <Typography color={color} fontSize={Tletra-2}>
                    {`${direccion}`}
                </Typography>
            </Grid>
            
            <Grid item xs={0.5}>
                <Typography color={color} fontSize={Tletra} >
                </Typography>
            </Grid>
            <Grid item xs={7.5}>
                <Typography color={color} fontSize={Tletra-2} noWrap>
                    {direccion1}
                </Typography>
            </Grid>
            
            <Grid item xs={2}>
                <Typography color={color} fontSize={Tletra-2} >
                    {`${valores && valores.orden_venta ? valores.orden_venta.cliente.telefono : ''}`}
                </Typography>
            </Grid>
            <Grid item xs={0.4}><Typography color={color} fontSize={Tletra} fontWeight={'bold'}></Typography></Grid>
            <Grid item xs={1.6}>
                <Typography color={color} fontSize={Tletra-2}>
                    {valores && valores.orden_venta ? valores.orden_venta.cliente.rif : ''}
                </Typography>
            </Grid>
            <Grid item xs={1.6}><Typography color={color} fontSize={Tletra}></Typography></Grid>
            <Grid item xs={10.4}>
                <Typography color={color} fontSize={Tletra-2}>
                    {`${titulo}`}
                </Typography>
            </Grid>
        </Grid>
        </Box>
    );
}
