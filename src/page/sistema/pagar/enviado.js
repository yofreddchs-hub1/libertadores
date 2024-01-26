import React,{useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import Reporte from '../../../componentes/reporte';
import Recibopdf from './pdf/recibonuevo';
import { Ver_Valores } from '../../../constantes';


export default function Enviado(props) {
    const [documento, setDocumento] = useState('');
   
    useEffect(()=>{
        const Inicio = async() =>{
           const resultado = Recibopdf(props.Recibo)
           setDocumento(resultado)
        }
        // Inicio();
        return ()=>{}
    },[props])
    
    const Recibo = props.Recibo ? props.Recibo : Ver_Valores().datosActuales.Recibo;
    
    return (
        <Box sx={{ textAlign:'left' }}>
            <Typography variant="h5" gutterBottom component="div">
                {Recibo
                    ? `Pago realizado con exito, Numero de Recibo: ${Recibo ? Recibo.valores.recibo: '0000' }`
                    :   `Pago enviado`
                }
            </Typography>
            {/* <embed src={`${documento}#view=Fit&toolbar=1&navpanes=1&scrollbar=1`} type="application/pdf" width="100%" height={window.innerHeight * 0.65} /> */}
            {Recibo 
                ?   <Reporte  datos={Recibo} reporte={Recibopdf} sizePagina= {{width:612, height:396}} />
                :   null
            }
        </Box>
    );
}
