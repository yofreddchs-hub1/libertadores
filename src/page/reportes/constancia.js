import * as React from 'react'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import { genera_formulario, Form_todos, Ver_Valores } from '../../constantes';

import logo from '../../imagenes/logo.png';
import ministerio from '../../imagenes/logomisterio.png'
import sello from '../../imagenes/sello.png';
import pie from '../../imagenes/pie.png';
import pie1 from '../../imagenes/pie1.png';

export default function Constancia(props) {
    const [formulario,setFormulario] = React.useState();
    const {datos, tipo}= props;
    
    React.useEffect(()=>{
        const Iniciar = async()=>{
            
        }
        Iniciar();
    },[props])
    const color = '#000000';
    const colorF= '#737373';
    const Tletra = props.sizeLetra ? props.sizeLetra.Tletra : 11;
    const Tletrad = props.sizeLetra ? props.sizeLetra.Tletrad : 9;
    const Mes=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const dia = moment()
    dia.locale('es')
    const director = 'Licenciada GLADYS GARCÍA CH.'
    const titulo = 'Directora';
    const cedula = '4.102.577';
    return (
        <Box sx={{ flexGrow: 1, bgcolor:'#fff', padding:2, 
                    ...props.sizePagina ? props.sizePagina : {width:612, height:792} 
                }}>
            <Box  sx={{height: props.sizePagina && props.sizePagina.height ? props.sizePagina.height * 0.92: 792 * 0.92}}>        
            <Grid container spacing={0.5}>
                {/* ---------------Cabezera------------------- */}
                <Grid xs={3} >
                    <Box component={'div'}>
                        <img alt='logo' src={ministerio} height={55}/>
                    </Box>
                </Grid>
                <Grid xs={6} >
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold', textAlign:'center'}}           
                    >
                        Unidad Educativa Colegio
                    </Typography>
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold', textAlign:'center'}}           
                    >
                        “Libertadores de América”
                    </Typography>
                </Grid>
                <Grid xs={3} sx={{textAlign:'center'}}>
                    <Box component={'div'}>
                        <img alt='logo' src={logo} height={55}/>
                    </Box>
                </Grid>
                {/* ------------Fin Cabezera------------------- */}
                {/* ------------Titulo--------------------- */}
                <Grid xs={12} sx={{textAlign:'center'}}>
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold', textAlign:'center'}}           
                    >
                        {tipo==='inscripcion' ? 'CONSTANCIA DE INSCRIPCIÓN' : 'CONSTANCIA DE ESTUDIO'}
                    </Typography>
                </Grid>
                {/* ------------Fin Titulo--------------------- */}
                <Grid xs={12}>
                    <Box sx={{height:10}}/>
                </Grid>
                {/* ---------------Cuerpo de Constancia------------------ */}
                <Grid xs={0.5} />
                <Grid xs={11} sx={{p:1}}>
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ textAlign:'justify'}}
                                variant="body2"           
                    >
                        {`Quien suscribe, ${director.toUpperCase()}, titular de la Cedula de Identidad
                            Nº, ${cedula}, Directora de la UNIDAD EDUCATIVA COLEGIO “LIBERTADORES
                            DE AMÉRICA”, Código Plantel: PD00151114, Rif J-08534771-2 ubicada en la Calle
                            Negrón Silva entre Av. Independencia y Calle Garcés, Sector Bobare, Municipio
                            Miranda, Parroquia San Gabriel, Estado Falcón. Por medio de la presente hago constar
                            que el estudiante: ${datos ? datos.nombres : ''} ${datos ? datos.apellidos : ''}, titular de la cédula de
                            identidad N° V-${datos ? datos.cedula : ''}, ${tipo==='inscripcion' ? 'esta formalmente inscrito en' : 'cursa'} ${datos && datos.grado ? datos.grado.titulo : ''} de Educación Media General en el año
                            escolar ${datos && datos.periodo ? datos.periodo : ''}
                        `}
                    </Typography>
                    <div style={{height:15}}/>
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ textAlign:'justify'}}
                                variant="body2"           
                    >
                        {`Constancia que se expide de parte interesada en Santa Ana de Coro a los ${dia.format('DD')} días del
                            mes de ${Mes[Number(dia.format('MM'))-1]} de ${dia.format('YYYY')}.
                        `}
                    </Typography>
                </Grid>
                <Grid xs={0.5} />
                {/* ------------Fin Cuerpo de Constancia--------------------- */}
                <Grid xs={12}>
                    <Box sx={{height:15}}/>
                </Grid>
                {/* ------------Sello y firma--------------------- */}
                <Grid xs={1} ></Grid>
                <Grid xs={2} >
                    <Box component={'div'}>
                        {/* <img alt='logo' src={sello} height={85}/> */}
                    </Box>
                </Grid>
                <Grid xs={6} sx={{textAlign:'center'}}>
                    <Box sx={{height:30, borderBottom:2}}/>
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold', textAlign:'center'}}           
                    >
                        {director}
                    </Typography>
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold', textAlign:'center'}}           
                    >
                        {titulo}
                    </Typography>
                </Grid>
                <Grid xs={3} ></Grid>
                {/* ------------Fin Sello y firma--------------------- */}
                <Grid xs={12}>
                    <Box sx={{height:15}}/>
                </Grid>
                <Grid xs={12} sx={{textAlign:'center'}}>
                    <Typography color={colorF}  
                                fontSize={Tletrad-3}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ textAlign:'center'}}           
                    >
                        Se requiere de firma y sello
                    </Typography>
                    
                </Grid>
            </Grid>
            </Box>
            {/* ---------------Pie de pagina--------------------- */}
            <Box sx={{ position:'relative', bottom:10}} >
                <Grid container direction="row" justifyContent="center" alignItems="flex-end">
                    
                    <Grid xs={3.5} >
                        <Box component={'div'}>
                            <img alt='logo' src={pie} height={45}/>
                        </Box>
                    </Grid>
                    <Grid xs={5.5} >
                        <Typography color={color}  
                                    fontSize={Tletrad-4.5}
                                    fontFamily={'Calibri (Cuerpo)'}
                                    sx={{ textAlign:'justify'}}
                                    
                        >
                            DIRECCION: CALLE NEGRON SILVA ENTRE AVENIDA INDEPENDENCIA Y
                            CALLE GARCÉS, TELEFONO: 0268-4614065, CORREO ELECTRONICO: uecolegiolibertadoresdeamerica@gmail.com
                        </Typography>
                        
                    </Grid>
                    <Grid xs={3} sx={{textAlign:'center'}}>
                        <Box component={'div'}>
                            <img alt='logo' src={pie1} height={45}/>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            {/* --------------Fin Pie de pagina--------------------- */}

        </Box>
    );
}
