import React, {useState, useEffect} from 'react';
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';
import Dialogo from '../../../componentes/herramientas/dialogo';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Alert from '@mui/material/Alert';
// import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
import Tabla from '../../../componentes/herramientas/tabla';

// import {Condicion_Estudiante, Condicion_Representante} from '../funciones';
import { Ver_Valores, conexiones, Form_todos, Titulos_todos, Moneda } from '../../../constantes';
import Reporte from '../../../componentes/reporte';
import Constanciapdf from '../../reportes/constancia';
import Cargando from '../../../componentes/esperar/cargar';
import Recibopdf from '../pagar/pdf/recibonuevo';
import { genera_formulario } from '../../../constantes';
import Formulario from '../../../componentes/herramientas/formulario';
import Typography from '@mui/material/Typography';
import moment from 'moment';

function RecibosR (props) {
    const {User} = Ver_Valores();
    const [state, setState]= useState({esperar:true, Dialogo:{open:false}});
    const [dialogo, setDialogo]= useState({
        open:false,  
    });

    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }

    const Constancia =async(dato, tipo)=>{
        let resultado = await conexiones.Resumen(dato);
        let {mensualidad} = resultado;
        resultado = await conexiones.Leer_C(['uecla_Inscripcion'],{uecla_Inscripcion:{}});
        let periodos = resultado.datos.uecla_Inscripcion.map(val=>{return {...val.valores}}).sort((a, b) => (a.periodo > b.periodo ? -1 : a.periodo < b.periodo ? 1 : 0));
        const periodo = periodos.length!==0 ? periodos[0].periodo : '';
        const pos = mensualidad.findIndex(f=> f.periodo===periodo);
        const inscrito= pos!==-1 ? mensualidad[pos].inscripcion : false;
        cambiarState({
            Dialogo:{
                open: !state.Dialogo.open,
            Titulo: `Constancia Estudio: ${dato.nombres} ${dato.apellidos}`,
            tam:'xl',
            Cuerpo: inscrito 
                        ?   <Reporte datos={{...dato, periodo, inscrito}} reporte={Constanciapdf} sizeLetra={{Tletra:14, Tletrad:12}} tipo={tipo}/>
                        :   <Alert severity="error">{`Estudiante no se encuentra inscrito en periodo ${periodo}`}</Alert>
            ,
            Cerrar: ()=>cambiarState({Dialogo: {open:false}}),
            }
        })

    }
    const Resumen = async(dato)=>{
        const resultado = await conexiones.Resumen(dato);
        let {recibos, mensualidad} = resultado;
        const TituloS= await Titulos_todos(`Titulos_Solvencias`);
        const TituloR =await Titulos_todos(`Titulos_Recibo`)
        const Cuerpo= 
            <div>
                <Tabla  Titulo={"Solvencias"}
                    Config={Ver_Valores().config}
                    titulos={TituloS}
                    table={'uecla_Mensualidad'}
                    cantidad={mensualidad ? mensualidad.length : 0}
                    datos={mensualidad ? mensualidad : []}
                    cargaporparte={true }
                    sinpaginacion
                    alto={window.innerHeight * 0.25}
                        
                />
                <Tabla  Titulo={"Recibos"}
                    Config={Ver_Valores().config}
                    titulos={TituloR}
                    table={'uecla_Recibo'}
                    cantidad={recibos ? recibos.length : 0}
                    datos={recibos ? recibos : []}
                    // Accion={Abrir}
                    cargaporparte={false}
                    sinpaginacion
                    alto={window.innerHeight * 0.40}         
                />
            </div>
        cambiarState({
            Dialogo:{
                open: !state.Dialogo.open,
                tam:'xl',
                Titulo: `Resumen: ${dato.nombres} ${dato.apellidos}`,
                Cuerpo: Cuerpo,
                Cerrar: ()=>cambiarState({Dialogo: {open:false}}),
            }
        })
    }
   
    const Inicio = async() =>{
        let respu= await conexiones.Leer_C(['uecla_Representante'],{
            uecla_Representante:{_id:User._id}
        })
        const repres= respu.datos.uecla_Representante[0];
        let dato = {
            ...repres.valores.representados[0], 
            representante:{
                _id: repres.valores._id,
                cedula: repres.valores.cedula,
                nombres:repres.valores.nombres,
                apellidos:repres.valores.apellidos,
            }
        }
        
        let respuesta= await conexiones.Resumen(dato);
        let recibos = []
        if(respuesta.Respuesta==='Ok'){
            recibos = respuesta.recibos
        }
        const TituloS= await Titulos_todos(`Titulos_Solvencias`);
        const TituloR =await Titulos_todos(`Titulos_Recibo`)
        cambiarState({esperar:false, TituloR, TituloS, recibos})
    }
    const Abrir_recibo = async(valores)=>{
        const {recibo}=valores.valores
        // console.log(recibo, valores)
        // const resultado = Recibopdf(valores);
        // let Cuerpo= <embed src={`${resultado}#view=Fit&toolbar=1&navpanes=1&scrollbar=1`} type="application/pdf" width="100%" height={window.innerHeight * 0.75} />
        setDialogo({
            ...dialogo, 
            open: !dialogo.open,
            tam:'xl',
            Titulo: `Recibo: ${recibo}`,
            Cuerpo: <Reporte  datos={valores} reporte={Recibopdf} sizePagina= {{width:612, height:396}} />,
            Cerrar: ()=>setDialogo({...dialogo,open:false}),
        })

    }
    const Abrir = async(valores) =>{
        const {mensualidades, Formas_pago, recibo, subtotalvalor, totales}=valores.valores
        let Fmensualidad = await genera_formulario({valores:mensualidades, campos: Form_todos('Form_Mensualidades') })
        Fmensualidad.titulos.meses.noeliminar=true;
        Fmensualidad.titulos.meses.nopaginar=true;
        Fmensualidad.titulos.meses.label='Pagos a Realizados';
        Fmensualidad.titulos.meses.style={height:320};
        let nuevos = Formas_pago.map((val, i)=>{
            return {...val,
                id:i+1, 
                formapago: val.titulo, bancoorigen: val.bancoorigen ? val.bancoorigen : '', 
                bancodestino: val.bancodestino ? val.bancodestino : '',
                fecha: val.fecha===null ? '' : typeof val.fecha==='string' ? val.fecha : moment(val.fecha).format('DD/MM/YYYY')
            }
        })

        let Formapago = await genera_formulario({valores:{formapago:nuevos}, campos: Form_todos('Form_FormasPago') })
        Formapago.titulos.formapago.noeliminar=true;
        Formapago.titulos.formapago.nopaginar=true;
        Formapago.titulos.formapago.Form=undefined;
        Formapago.titulos.formapago.Subtotal=undefined;
        Formapago.titulos.formapago.editables='no';
        Formapago.titulos.formapago.style={height:250}; 

        let Cuerpo =
        <Box sx={{ textAlign:'left' }}>
            <div style={{marginTop:-30}}/>
            
            <Formulario {...Fmensualidad}/>
            <div style={{marginTop:-30}}/>
            
            <Formulario {...Formapago}/>
                
            <div style={{ paddingRight:10}}>
                <Stack
                    direction={ 'column' }
                    spacing={1}
                    justifyContent="center"
                    alignItems="flex-end"
                >
                    <Typography variant="h5" gutterBottom component="div">
                        Total : {`${Moneda(subtotalvalor.total) }`}
                    </Typography>
                    <Typography variant="h5" gutterBottom component="div">
                        Total Cancelado: {`${Moneda(totales.total)}`}
                    </Typography>
                    <Typography variant="h5" >
                        Abono: {`${Moneda(totales.abono)}`}
                    </Typography>
                
                    
                </Stack>
            </div>
        </Box>

        let Titulo = 
                <Stack
                    direction={ 'row' }
                    spacing={1}
                    justifyContent="center" alignItems="center"
                >
                    Recibo: {recibo}
                    <IconButton size="large" color="inherit" title={'Mostra recibo'} onClick={()=>Abrir_recibo(valores)}>
                        <Icon >text_snippet</Icon>
                    </IconButton>
                </Stack>
        
        setDialogo({
            ...dialogo, 
            open: !dialogo.open,
            Titulo,
            Cuerpo: Cuerpo,
            Cerrar: ()=>setDialogo({...dialogo,open:false}),
        })
    }
    useEffect(()=>{
        Inicio()
        return ()=>{}
    }, [props])

    const {Config}= props;
    return state.esperar ? <Cargando open={state.esperar} Config={Config}/> : (
        <Box>
            <Tabla  Titulo={"Recibos"}
                    Config={Ver_Valores().config}
                    titulos={state.TituloR}
                    table={'uecla_Recibo'}
                    cantidad={state.recibos ? state.recibos.length : 0}
                    datos={ state.recibos ? state.recibos : []}
                    Accion={Abrir}
                    cargaporparte={false}
                    sinpaginacion
                    alto={window.innerHeight * 0.780}         
            />
            <Dialogo {...dialogo} config={Config}/>
        </Box>
    )
}

export default RecibosR;