import React,{useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Icon } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { Alert } from '@mui/material';
import Stack from '@mui/material/Stack';
import Popover from '@mui/material/Popover';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Formulario from '../../../componentes/herramientas/formulario';
import { genera_formulario, Form_todos, Ver_Valores } from '../../../constantes';


export default function Confirmar(props) {
    const [formulario, setFormulario] = useState();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;
    const Inicio = async() =>{
        
        let mensualidades=props.Mensualidades ? props.Mensualidades : {meses:[]}
        // const pos = mensualidades.meses.findIndex(f=> f.cedula==='Abono');
        
        // if (pos!==-1){
            mensualidades.meses= mensualidades.meses.filter(f=> f.cedula!=='Abono')
        // }
        if (props.Totales && (props.Totales.abono>0 || props.Totales.abonod>0)){
            mensualidades.meses= [...mensualidades.meses,
                {
                    id:mensualidades.meses.length+1,
                    periodo:mensualidades.meses[mensualidades.meses.length-1].periodo, value:'abono', 
                    _id:`Abono-${mensualidades.meses.length}`, cedula:'Abono',
                    nombres:'Abono', apellidos:'Queda',
                    descripcion:`Abono`,
                    montod: props.Totales.abonod, 
                    monto: props.Totales.abono
                }
            ]
        }
        let Fmensualidad = await genera_formulario({valores:mensualidades, campos: Form_todos('Form_Mensualidades', Config) })
        Fmensualidad.titulos.meses.noeliminar=true;
        Fmensualidad.titulos.meses.nopaginar=true;
        Fmensualidad.titulos.meses.label='Pagos a Realizar';
        Fmensualidad.titulos.meses.style={height:320};
        let nuevos = props.formapago.map((val, i)=>{
            const fecha = val.fecha//===null ? '' : typeof val.fecha==='string' ? val.fecha : moment(val.fecha).format('DD/MM/YYYY');
            return {...val,
                id:i+1, 
                formapago: val.titulo, bancoorigen: val.bancoorigen ? val.bancoorigen.titulo : '', 
                bancodestino: val.bancodestino ? val.bancodestino.banco.titulo : '',
                fecha: fecha
            }
        })

        let Formapago = await genera_formulario({valores:{formapago:nuevos}, campos: Form_todos('Form_FormasPago', Config) });
        Formapago.titulos.formapago.noeliminar=true;
        delete Formapago.titulos.formapago.Form;
        Formapago.titulos.formapago.Subtotal=undefined;
        Formapago.titulos.formapago.editables='no';
        Formapago.titulos.formapago.nopaginar=true;
        Formapago.titulos.formapago.style={height:230};
        setFormulario({Mensualidad: Fmensualidad, Formapago})

    }
    const Cancelar = async()=>{
        handleClose();
        if (props.Cancelar) props.Cancelar(props.id_pago);
        
    }
    useEffect(()=>{
        Inicio();
    },[props])
    const {Config} = props;
    
    return (
        <Box sx={{ textAlign:'left' }}>
            <div style={{marginTop:-30}}/>
            {formulario && formulario.Mensualidad
                ? <Formulario {...formulario.Mensualidad} config={props.Config}/>
                : null
            }
            <div style={{marginTop:-30}}/>
            {formulario && formulario.Formapago
                ? <Formulario {...formulario.Formapago} config={props.Config}/>
                : null
            }
            <div style={{ paddingRight:10}}>
                <Stack direction={window.innerWidth > 750 ? 'row' : 'column'}>
                    <Stack
                        justifyContent="center"
                        alignItems="center"
                        sx={{ width:window.innerWidth > 750 ? '50%' : '100%'}}
                    >
                        {props.Pendiente 
                            ?   <Box component={'div'} sx={{width:'90%'}}>
                                    <Alert severity={props.Pendiente==='Aprobado' ? "success" : props.Pendiente==='Rechazar' ? "error" : "warning"}>
                                        {props.Pendiente==='Aprobado' ? props.Pendiente : props.Pendiente==='Rechazar' ? 'Rechazado' : 'Pendiente'}
                                    </Alert>
                                </Box> 
                            : ''
                        }
                        {props.Motivo_rechazo && props.Motivo_rechazo!==''
                            ?   <Box component={'div'} sx={{textAlign:'left',p:1, width:'90%'}}>
                                    {props.Motivo_rechazo}
                                </Box>
                            :   null
                        }
                        {[4,'4'].indexOf(Ver_Valores().User.categoria)!==-1 && (props.Pendiente || ['Aprobado', false, undefined].indexOf(props.Pendiente)===-1)
                            ?   <Box component={'div'} sx={{textAlign:'center',p:1}}>
                                    <IconButton title={'Eliminar'} style={{backgroundColor:'red', marginLeft:10}} onClick={handleClick}>
                                        <Icon sx={{color:'#fff'}}>cancel</Icon>
                                    </IconButton>
                                    <Popover
                                        id={id}
                                        open={open}
                                        anchorEl={anchorEl}
                                        onClose={handleClose}
                                        anchorOrigin={{
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                        }}
                                    >
                                        <Typography sx={{ p: 2 }}>¿Desea eliminar Pago {props.Pendiente===true ? 'Pendiente' : props.Pendiente==='Rechazar' ? 'Rechazado' : props.Pendiente}?</Typography>
                                        <ButtonGroup variant="contained" aria-label="outlined primary button group"
                                                    sx={{paddingX:10, paddingBottom:1}}
                                        >
                                            <Button onClick={Cancelar}>Si</Button>
                                            <Button onClick={handleClose} >No</Button>
                                            
                                        </ButtonGroup>
                                    </Popover>
                                </Box>
                            :   null
                        }
                    </Stack>
                    <Stack
                        direction={ 'column' }
                        spacing={1}
                        justifyContent="center"
                        alignItems="flex-end"
                        sx={{width:window.innerWidth > 750 ? '50%' : '100%'}}
                    >
                        <Typography variant={window.innerWidth > 750 ? "h5" : "subtitle1"}  component="div" sx={{...Config ? {color:Config.Estilos.Input_label}: {}}}>
                            Total : Bs. {`${props.Subtotalvalor && props.Subtotalvalor.total ? props.Subtotalvalor.total.toFixed(2): '0.00' }`}
                        </Typography>
                        <Typography variant={window.innerWidth > 750 ? "h5" : "subtitle1"}  component="div" sx={{...Config ? {color:Config.Estilos.Input_label}: {}}}>
                            Total Cancelado: Bs. {`${props.Totales && props.Totales.total ? props.Totales.total.toFixed(2): '0.00' }`}
                        </Typography>
                        <Typography variant={window.innerWidth > 750 ? "h5" : "subtitle1"} component="div" sx={{...Config ? {color:Config.Estilos.Input_label}: {}}}>
                            Abono: {`Bs. ${props.Totales && props.Totales.abono ? props.Totales.abono>=0 ? props.Totales.abono.toFixed(2) : 0 : '0.00'}`}
                        </Typography>
                    
                        
                    </Stack>
                </Stack>
            </div>
        </Box>
    );
}
