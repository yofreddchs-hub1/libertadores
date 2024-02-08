import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
// import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import { Titulos_todos, Moneda, Generar_id } from '../../constantes';
const Item = styled(Box)(({ theme }) => ({
    color:'#000', padding:2, border: '0.5px solid black'
}));
const Itemd = styled(Box)(({ theme }) => ({
    color:'#000', padding:1, //border: '1px solid grey'
}));

export default function TablaReporte(props) {
    const[cabezera,setCabezera]= React.useState();
    const[data,setData]= React.useState();
    // console.log(props);
    const {Condicion} = props;
    const color = '#000000';
    const Tletra = 7;
    
    const Cabezera = ()=>{

        return(
            <Grid container xs={12} spacing={0}>
                {cabezera.map(val=>
                    <Grid key={val.field} xs={val.flex ? val.flex : 12/cabezera.length}>
                        <Item component="div" >
                            <Typography color={color} 
                                    align={'center'}
                                    fontSize={Tletra}
                                    sx={{ fontWeight:'bold' }}
                                    noWrap          
                            >
                                {['total'].indexOf(val.field)!==-1
                                    ?  `${val.title} ${Condicion && Condicion.moneda._id===1 ? '$' : 'Bs.' }`
                                    :  val.title
                                }
                            </Typography>
                        </Item>
                        
                    </Grid>    
                )}
            </Grid>
        )
    }
    const Datos = ()=>{

        return data.map(dat=>

            <Grid key={Generar_id()} container xs={12} spacing={0}>
                {cabezera.map(val=>{
                    let valor = val.type && val.type==='number' ? Number(dat[val.field]).toFixed(2) : dat[val.field];
                    if (['precio','total','monto'].indexOf(val.field)!==-1){
                        valor = Condicion 
                                && Condicion.moneda 
                                && Condicion.moneda._id===1 
                                ? Moneda(Number(dat[val.field]),'$',false)
                                : Moneda(Number(dat[val.field]),'Bs', false)
                    }
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
                    )}    
                )}
            </Grid>
        )
    }
    
    React.useEffect(()=>{
        const Iniciar = async()=>{
            const titulos = await Titulos_todos(props.titulos);
            setCabezera(titulos);
            const datos =  props && props.datos ? props.datos : [];
            setData(datos)
        }
        Iniciar();
    },[props])
    return (
        <Box sx={{ flexGrow: 1, ...props.style ? props.style : {} }}>
            
            <Grid container spacing={0}>
                {cabezera && !props.nomostrar 
                    ?   <Cabezera />
                    :   
                        <Grid container xs={12} spacing={0}>
                            <div style={{height:20}}/>
                        </Grid>
                        
                }
                {data 
                    ?   <Datos />
                    :   <Grid container xs={12} spacing={0}>
                            <Grid xs>
                            <Item>xs</Item>
                            </Grid>
                            <Grid xs>
                            <Item>xs</Item>
                            </Grid>
                            <Grid xs>
                            <Item>xs</Item>
                            </Grid>
                        </Grid>

                }
                
                
            </Grid>
        </Box>
    );
}
