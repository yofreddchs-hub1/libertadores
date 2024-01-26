import React,{useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Reporte from '../../../componentes/reporte';
import Recibopdf from '../pagar/pdf/recibonuevo';


export default function Enviado(props) {
    const [documento, setDocumento] = useState('');
    const Inicio = async() =>{
       const resultado = Recibopdf(props.Recibo)
       setDocumento(resultado)
    }
   
    useEffect(()=>{
        Inicio();
    },[props])
    
    return (
        <Box sx={{ textAlign:'left' }}>
            <Typography variant="h5" gutterBottom component="div">
                Pago realizado con exito, Numero de Recibo: {`${props.Recibo ? props.Recibo.valores.recibo: '0000' }`}
            </Typography>
            {/* <embed src={`${documento}#view=Fit&toolbar=1&navpanes=1&scrollbar=1`} type="application/pdf" width="100%" height={window.innerHeight * 0.65} /> */}
            <Reporte  datos={props.Recibo} reporte={Recibopdf} sizePagina= {{width:612, height:396}} />,
        </Box>
    );
}
