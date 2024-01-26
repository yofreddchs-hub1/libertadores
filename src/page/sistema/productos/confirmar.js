import React,{useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Formulario from '../../../componentes/herramientas/formulario';
import { genera_formulario, Form_todos } from '../../../constantes';

export default function Confirmar(props) {
    const [formulario, setFormulario] = useState();
    const Inicio = async() =>{
        
        let mensualidades=props.Mensualidades ? props.Mensualidades : {meses:[]}
        // const pos = mensualidades.meses.findIndex(f=> f.cedula==='Abono');
        // console.log(pos)
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
        let Fmensualidad = await genera_formulario({valores:mensualidades, campos: Form_todos('Form_Productos', Config) })
        Fmensualidad.titulos.meses.noeliminar=true;
        Fmensualidad.titulos.meses.nopaginar=true;
        Fmensualidad.titulos.meses.label='Productos';
        Fmensualidad.titulos.meses.editables='no';
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
        Formapago.titulos.formapago.style={height:250};
        setFormulario({Mensualidad: Fmensualidad, Formapago})

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
                <Stack
                    direction={ 'column' }
                    spacing={1}
                    justifyContent="center"
                    alignItems="flex-end"
                >
                    <Typography variant="h5" gutterBottom component="div" sx={{...Config ? {color:Config.Estilos.Input_label}: {}}}>
                        Total : Bs. {`${props.Subtotalvalor ? props.Subtotalvalor.total.toFixed(2): '0.00' }`}
                    </Typography>
                    <Typography variant="h5" gutterBottom component="div" sx={{...Config ? {color:Config.Estilos.Input_label}: {}}}>
                        Total Cancelado: Bs. {`${props.Totales ? props.Totales.total.toFixed(2): '0.00' }`}
                    </Typography>
                    <Typography variant="h5" sx={{...Config ? {color:Config.Estilos.Input_label}: {}}}>
                        Abono: {`Bs. ${props.Totales ? props.Totales.abono>=0 ? props.Totales.abono.toFixed(2) : 0 : '0.00'}`}
                    </Typography>
                
                    
                </Stack>
            </div>
        </Box>
    );
}
