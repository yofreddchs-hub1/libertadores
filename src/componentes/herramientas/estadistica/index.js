import React, {useState, useEffect} from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { conexiones, Generar_id, Ver_Valores } from '../../../constantes';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import Cargando from '../../esperar/cargar';
import moment from 'moment';
import Fade from '@mui/material/Fade';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  flexGrow: 1,
}));

let promedio = (datos) => {
    let result = {};
    datos.forEach((value) => {
        result[value] = (result[value] || 0) + 1;
    });
    let promedio = 0;
    let cantidad = 0;
    // console.log(result)
    Object.keys(result).forEach((value)=>{
        if(result[value]>cantidad){
            promedio=value;
        }
    })
    //promedio numerico
    let Maxima = Math.max(...datos);
    let Minima = Math.min(...datos);
    // let promedio = (Maxima + Minima) / 2;
    return promedio

}
export default function Estadistica(props) {
    const [state,setState] = useState({cargando:true})
    const cambiarState = (nuevo)=>{
        setState({...state,...nuevo});
    }
    const Inicio = async()=>{
        const {representante} = props;
        const dias=5;
        
        const meses = Ver_Valores().config.Listas.lista_Meses;
        let dato = {
            ...representante.representados[0], 
            representante:{
                _id: representante._id,
                cedula: representante.cedula,
                nombres:representante.nombres,
                apellidos:representante.apellidos,
            }
        }
        let respuesta= await conexiones.Resumen(dato);
        let recibos = []
        let orden_pago = {};
        let promedio_dia = [];
        if(respuesta.Respuesta==='Ok'){
            recibos = respuesta.recibos.map(val=>{
                val.valores.mensualidades.meses.map(mes=>{
                    let pos = meses.findIndex(f=> f.value===mes.value);
                    const pos1 = pos;
                    pos = pos!==-1 ? meses[pos].mes : pos;
                    if(!orden_pago[mes.periodo]){
                        orden_pago[mes.periodo]={
                            estadistica:{
                                puntual_mes:0, impuntual_mes:0, puntual_dia:0, impuntual_dia:0,
                                fechas:{}
                            }
                        }
                        promedio_dia = [];
                    }
                    
                    if (mes.value.indexOf('abono')===-1){

                        if(!orden_pago[mes.periodo][`${mes.nombres} ${mes.apellidos}`]){
                            orden_pago[mes.periodo][`${mes.nombres} ${mes.apellidos}`]={
                                data:[
                                    {mes:0, m:'inc'},
                                    {mes:0, m:'sep'},
                                    {mes:0, m:'oct'},
                                    {mes:0, m:'nov'},
                                    {mes:0, m:'dic'},
                                    {mes:0, m:'ene'},
                                    {mes:0, m:'feb'},
                                    {mes:0, m:'mar'},
                                    {mes:0, m:'abr'},
                                    {mes:0, m:'may'},
                                    {mes:0, m:'jun'},
                                    {mes:0, m:'jul'},
                                    {mes:0, m:'ago'}
                                ],
                                estadistica:{
                                    puntual_mes: 0, 
                                    impuntual_mes:0,
                                    puntual_dia: 0, 
                                    impuntual_dia:0,
                                }
                            }
                               
                        }
                        let fecham;
                        let fechaM;
                        const pago = new Date(val.valores.fecha);
                        let data =[...orden_pago[mes.periodo][`${mes.nombres} ${mes.apellidos}`].data];
                        if (pos!==-1){
                            const peri = mes.periodo.split('-');
                            let ano = pos>8 || pos===0 ? peri[0] : peri[1];
                            fecham= new Date(`${ano}/${pos}/01`);
                            fechaM= new Date(`${ano}/${pos}/${dias}`);
                            var diferencia = pago-fecham
                            data[pos1].mes=Math.trunc(diferencia/(1000*60*60*24)+1)
                        }
                        
                        //SUMA DE PUNTUALIDAD
                        const sumapm= fecham ? pago.getMonth()<=fecham.getMonth() ? 1 : 0 : 0;
                        const sumaim= fecham ? pago.getMonth()<=fecham.getMonth() ? 0 : 1 : 0;
                        const sumapd= fechaM ? pago<fechaM.setDate(fechaM.getDate() + 1) ? 1 : 0 : 0;
                        const sumaid= fechaM ? pago<fechaM.setDate(fechaM.getDate() + 1) ? 0 : 1 : 0;

                        // promedio_dia = [...promedio_dia, Number(moment(pago).format('DD'))];
                        // promedio(promedio_dia);
                        orden_pago[mes.periodo].estadistica={
                            puntual_mes: orden_pago[mes.periodo].estadistica.puntual_mes + sumapm, 
                            impuntual_mes:orden_pago[mes.periodo].estadistica.impuntual_mes +sumaim,
                            puntual_dia: orden_pago[mes.periodo].estadistica.puntual_dia + sumapd, 
                            impuntual_dia:orden_pago[mes.periodo].estadistica.impuntual_dia +sumaid,
                            // dia_promedio:promedio(promedio_dia),
                            // promedio_dia
                            fechas:{
                                ...orden_pago[mes.periodo].estadistica.fechas, 
                                [moment(pago).format('DD/MM/YYYY')]:[
                                    ...orden_pago[mes.periodo].estadistica.fechas[moment(pago).format('DD/MM/YYYY')]
                                    ?   orden_pago[mes.periodo].estadistica.fechas[moment(pago).format('DD/MM/YYYY')]
                                    :   [],
                                    mes.descripcion
                                ]
                            }
                        }
                        orden_pago[mes.periodo][`${mes.nombres} ${mes.apellidos}`]={
                            ...orden_pago[mes.periodo][`${mes.nombres} ${mes.apellidos}`],
                            
                            [mes.value]:{
                                //fecha en que cancelo
                                fecha:pago,
                                //fecha en que deberia cancelar
                                pagar_en: pos,
                                fecham, fechaM,
                                //
                                condicion_dias: fechaM ? pago<fechaM.setDate(fechaM.getDate() + 1) ? 'Puntual' : 'Impuntual' : '',
                                condicion_mes : fecham ? pago.getMonth()<=fecham.getMonth() ? 'Puntual' : 'Impuntual' : ''

                            },
                            estadistica:{
                                puntual_mes: orden_pago[mes.periodo][`${mes.nombres} ${mes.apellidos}`].estadistica.puntual_mes + sumapm, 
                                impuntual_mes:orden_pago[mes.periodo][`${mes.nombres} ${mes.apellidos}`].estadistica.impuntual_mes +sumaim,
                                puntual_dia: orden_pago[mes.periodo][`${mes.nombres} ${mes.apellidos}`].estadistica.puntual_dia + sumapd, 
                                impuntual_dia:orden_pago[mes.periodo][`${mes.nombres} ${mes.apellidos}`].estadistica.impuntual_dia +sumaid,
                            }
                            
                        }
                    }   
                    return mes
                })
                return {
                    recibo: val.valores.recibo, 
                    fecha: val.valores.fecha, 
                    mensualidades: val.valores.mensualidades.meses, 
                    sistema_viejo: val.valores.sistema_viejo, 
                }
            });

            console.log(orden_pago);
            cambiarState({cargando:false, representante, orden_pago})
        }
    }
    const Torta = (props)=>{
        const {Titulo, impuntual, puntual} = props;
        return(
            <Box flexGrow={1}>
                <Typography>{Titulo}</Typography>
                <PieChart
                    colors={['red','green']}
                    series={[
                        {
                            data: [
                                { id: 0, value: impuntual, label:'IMPUNTUAL' },
                                { id: 1, value: puntual, label:'PUNTUAL'  },
                                
                            ],
                            highlightScope: { faded: 'global', highlighted: 'item' },
                            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                        },
                    ]}
                    width={280}
                    height={100}
                />
            </Box>
        )
    }
    useEffect(()=>{
        Inicio();
    },[])
    const valueFormatter = (value) => `${value>=0 ? value : -1 * value} ${[0,1,-1].indexOf(value)!==-1 ? 'dia' : 'dias'} ${value<0 ? 'Antes' : 'Despues'}`;
    return state.cargando ? <Box sx={{height:window.innerHeight * 0.7}}><Cargando open={true} Config={Ver_Valores().config} /> </Box>: (
        <Box sx={{p:0.5}}>
            <Item>
                <Stack>
                    <Typography variant="h6" gutterBottom>
                        {state.representante ? `${state.representante.nombres} ${state.representante.apellidos}`:''}
                    </Typography>
                    <Stack spacing={1}>
                        {state && state.orden_pago 
                            ?   Object.keys(state.orden_pago).map(val=>
                                val!==''
                                    ?   <Stack spacing={0.5} direction="row" key={val} alignItems={'center'}>
                                            <Typography variant="h6" gutterBottom>{val}</Typography>
                                            <Item>
                                                <Stack spacing={0.5}>
                                                { Object.keys(state.orden_pago[val]).map(dat=>{
                                                    let detalles={};
                                                    let datas = [];
                                                    if(state.orden_pago[val][dat].fechas)
                                                        Object.keys(state.orden_pago[val][dat].fechas).map(fec=>{
                                                            detalles[fec]=state.orden_pago[val][dat].fechas[fec].map(di=>
                                                                di
                                                            )
                                                            datas=[...datas,{dia:fec, valor: state.orden_pago[val][dat].fechas[fec].length}]
                                                            return {dia:fec, valor: state.orden_pago[val][dat].fechas[fec].length}
                                                        })
                                                    
                                                    return dat==='estadistica'
                                                        ?   <Stack spacing={{ xs: 0.5, sm: 1 }} direction="row" useFlexGap flexWrap="wrap" key={dat} alignItems={'center'}>
                                                                <Typography variant="subtitle2" sx={{width:150}}>ESTADISTICA DEL AÑO</Typography>
                                                                <Item>
                                                                    <Stack direction={'row'}>
                                                                        <Torta Titulo={'EN LOS PRIMEROS DIAS'} 
                                                                            impuntual={Object.keys(state.orden_pago[val]).length>2 ? state.orden_pago[val][dat].impuntual_dia/2 : state.orden_pago[val][dat].impuntual_dia} 
                                                                            puntual={Object.keys(state.orden_pago[val]).length>2 ? state.orden_pago[val][dat].puntual_dia/2 : state.orden_pago[val][dat].puntual_dia}
                                                                        />
                                                                        <Torta Titulo={'EN EL MES'} 
                                                                            impuntual={Object.keys(state.orden_pago[val]).length>2 ? state.orden_pago[val][dat].impuntual_mes/2 :state.orden_pago[val][dat].impuntual_mes} 
                                                                            puntual={Object.keys(state.orden_pago[val]).length>2 ? state.orden_pago[val][dat].puntual_mes/2 : state.orden_pago[val][dat].puntual_mes}
                                                                        />
                                                                        
                                                                    </Stack>
                                                                    <Box >
                                                                        <Typography variant="subtitle1" >  PAGOS REALIZADOS</Typography>
                                                                        <Stack
                                                                            direction={{ xs: 'column', md: 'row' }}
                                                                            spacing={{ xs: 0, md: 4 }}
                                                                            sx={{ width: '100%' }}
                                                                        >
                                                                            <Box sx={{ flexGrow: 1, width:'35vw' }}>
                                                                                <BarChart
                                                                                    dataset={datas}
                                                                                    series={[
                                                                                        { dataKey: 'valor',  valueFormatter: (value)=>{
                                                                                            return `Mes(es) cancelado(s): ${value}`
                                                                                        } },
                                                                                    ]}
                                                                                    height={270}
                                                                                    
                                                                                    margin={{ top: 10, bottom: 60, left: 100, right: 10 }}
                                                                                    yAxis={[{ scaleType: 'band', dataKey: 'dia' }]}
                                                                                    xAxis= {[
                                                                                        {
                                                                                        label: 'Meses Cancelado',
                                                                                        }
                                                                                    ]}
                                                                                    layout="horizontal"
                                                                                    
                                                                                    onAxisClick={(event, d) => {                                                                                
                                                                                        console.log(val,detalles)
                                                                                        cambiarState({detalles:{...state.detalles , [val]:detalles[d.axisValue]}})
                                                                                    }}
                                                                                />                                                                            
                                                                            </Box>
                                                                            <Box
                                                                                    sx={{
                                                                                        display: 'flex',
                                                                                        justifyContent: 'space-between',
                                                                                        
                                                                                        width:'25vw',
                                                                                        
                                                                                    }}
                                                                            >
                                                                                <Stack >
                                                                                    <Typography variant="h6">MES(ES) CANSELADOS</Typography>
                                                                                    <br/>
                                                                                    <Stack spacing={1}>
                                                                                    {state.detalles && state.detalles[val]
                                                                                        ?   state.detalles[val].map(det=>
                                                                                                <Item><Typography variant="subtitle2" sx={{textAlign:'left'}}>{det}</Typography></Item>
                                                                                            )   
                                                                                        :   null
                                                                                    }
                                                                                    </Stack>
                                                                                </Stack>
                                                                            </Box>
                                                                        </Stack>
                                                                        
                                                                    </Box>
                                                                </Item>
                                                                
                                                            </Stack>
                                                        :   <Stack spacing={{ xs: 0.5, sm: 1 }} direction="row"  key={dat} alignItems={'center'}>
                                                                <Typography variant="subtitle2" sx={{width:150}}>{dat}</Typography>
                                                                <Item>
                                                                    <Stack direction={'row'}>   
                                                                        <BarChart
                                                                            dataset={state.orden_pago[val][dat].data}
                                                                            series={[
                                                                                { dataKey: 'mes',  valueFormatter },
                                                                            ]}
                                                                            height={210}
                                                                            xAxis={[{ data: ['INS', 'SEP', 'OCT', 'NOV','DIC','ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO'], scaleType: 'band' }]}
                                                                            margin={{ top: 10, bottom: 30, left: 40, right: 10 }}
                                                                            yAxis={ [
                                                                                {
                                                                                label: 'Dia del mes',
                                                                                },
                                                                            ]}
                                                                        />
                                                                        <Stack >
                                                                        <Torta 
                                                                            Titulo={'EN LOS PRIMEROS DIAS'} 
                                                                            impuntual={state.orden_pago[val][dat].estadistica.impuntual_dia} 
                                                                            puntual={state.orden_pago[val][dat].estadistica.puntual_dia}
                                                                        />
                                                                        <Torta 
                                                                            Titulo={'EN EL MES'} 
                                                                            impuntual={state.orden_pago[val][dat].estadistica.impuntual_mes} 
                                                                            puntual={state.orden_pago[val][dat].estadistica.puntual_mes}
                                                                        />
                                                                        </Stack>
                                                                    </Stack>
                                                                    
                                                                </Item>
                                                                
                                                            </Stack>
                                                })}
                                                </Stack>
                                            </Item>
                                            
                                        </Stack>
                                    :null
                                )
                            :   null
                        }
                    </Stack>
                    
                </Stack>
            </Item>
            
        </Box>
        
    );
}