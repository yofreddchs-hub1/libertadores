import * as React from 'react'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { CabezeraCHS } from '../../../../componentes/reporte/cabezera';
import { InformacionCHS } from '../../../../componentes/reporte/informacion';
import TablaReporte from '../../../../componentes/reporte/tabla_reporte';
import { genera_formulario, Form_todos, Ver_Valores, Titulos_todos, Generar_id, Moneda } from '../../../../constantes';

const Itemd = styled(Box)(({ theme }) => ({
    color:'#000', padding:1, //border: '1px solid grey'
}));
export default function Recibo(props) {
    const Tletra = 7;
    const [formulario,setFormulario] = React.useState();
    // const [formulario1,setFormulario1] = React.useState();
    const[cabezera,setCabezera]= React.useState();
    const {datos}= props;
    const {totales} = datos.valores;
    const Condicion = Ver_Valores().datos_reporte;
    const valores = datos ? datos.valores : undefined;
    const mensualidades = valores && valores.mensualidades && valores.mensualidades.meses 
        ? valores.mensualidades.meses.map(val=>{return {...val, valorcambio:valores.valorcambio}})
        : [];
    const formapago = valores && valores.Formas_pago ? valores.Formas_pago : [];
    React.useEffect(()=>{
        const Iniciar = async()=>{
            let nuevos = await genera_formulario({valores:{}, campos: Form_todos('Form_Mensualidades') });
            nuevos.titulos.meses.noeliminar=true;
            nuevos.titulos.meses.nopaginar=true;
            nuevos.titulos.meses.label='';
            nuevos.titulos.meses.style={
                height:'auto',
                borderColor:'#000',
                border:1,
            }
            nuevos.titulos.meses.titulos='Titulos_Mensualidad3';
            setFormulario(nuevos);

            let titulos = await Titulos_todos(nuevos.titulos.meses.titulos);
            
            titulos[2].field='total';
            
            setCabezera(titulos);
            // let nuevos1 = await genera_formulario({valores:{}, campos: Form_todos('Form_FormasPago') });
            // nuevos1.titulos.formapago.noeliminar=true;
            // nuevos1.titulos.formapago.nopaginar=true;
            // nuevos1.titulos.formapago.label='';
            // nuevos1.titulos.formapago.style={
            //     height:'auto',
            //     borderColor:'#000',
            //     border:3,
            // }
            // setFormulario1(nuevos1);
        }
        Iniciar();
    },[props])
    
    const color = '#000000';
    // const subtotal ='0,00';
    // const iva = valores 
    //             ? Number(Number(subtotal * 16/100)).toFixed(2)
    //             :'0,00';
    // const total = (Number(subtotal) + Number(iva)).toFixed(2) ;
    return (
        <Box sx={{ flexGrow: 1, bgcolor:'#fff', padding:2, 
                    ...props.sizePagina ? props.sizePagina : {width:612, height:700} 
                }}>
        <Grid container spacing={0.5}>
            <CabezeraCHS {...props} />
            <InformacionCHS {...props}/>
            <Grid xs={12}>
                {formulario 
                    ? <TablaReporte datos={mensualidades ? mensualidades : []}  {...formulario && formulario.titulos ? formulario.titulos.meses : {}} Condicion={Condicion}/>     
                    : null
                }
            </Grid>
            {cabezera
                ?   cabezera.map((val, i)=>{
                        // console.log('>>>>>>>>>>>>>>',val.field, totales[val.field])
                        
                        let valor = totales[val.field]
                            ?   Condicion 
                                && Condicion.moneda 
                                && Condicion.moneda._id===1 
                                ? Moneda(Number(totales[val.field]),'$',false)
                                : Moneda(Number(totales[val.field] ),'Bs', false)
                            :''
                        return(
                            <Grid key={Generar_id()} xs={val.flex ? val.flex : 12/cabezera.length}>
                                <Itemd component="div" >
                                    <Typography color={color} 
                                            align={val.type && val.type==='number' ? 'right':'left'}
                                            fontSize={Tletra-1} noWrap          
                                    >
                                        {valor}
                                    </Typography>
                                </Itemd>
                                
                            </Grid>
                        )    
                    })
                :   null
            
            }
            <Grid xs={12}>
                <Box sx={{height:1.2, bgcolor:color}}/>
            </Grid>
            <Grid xs={12}>
                <Grid xs={12} item >
                    <Typography color={color} 
                            align={'left'}
                            fontSize={Tletra-1} noWrap          
                    >
                        Forma(s) de Pago(s) 
                    </Typography>
                </Grid>
                {formapago
                    ?   formapago.map(val=>
                            <Grid key={Generar_id()} xs={12} item>
                                <Typography color={color} 
                                        align={'left'}
                                        fontSize={Tletra-1} noWrap          
                                >
                                    {`- ${val.titulo}, ${val.referencia ? 'Referencia: ' + val.referencia +', ' : ''}${val.moneda} ${val.monto}`} 
                                </Typography>
                            </Grid>

                            
                        )
                    :   null
                }
                {/* {formulario1 
                    ? <TablaReporte datos={formapago ? formapago : []}  {...formulario1 && formulario1.titulos ? formulario1.titulos.formapago : {}} Condicion={Condicion}/>     
                    : null
                } */}
            </Grid>
        </Grid>
        </Box>
    );
}
