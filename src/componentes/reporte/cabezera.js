import * as React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import Stack from '@mui/material/Stack';
import logo from '../../imagenes/logo.png';
import logom from '../../imagenes/logomisterio.png';

export function CabezeraCHS(props) {
    
    const {datos, Titulo, color_letra}= props;
    const valores = datos ? datos.valores : undefined;
    const Tletra = props.sizeLetra ? props.sizeLetra.Tletra : 11;
    const Tletrad = props.sizeLetra ? props.sizeLetra.Tletrad : 9;
    const color = color_letra ? color_letra : '#000000';
    const titulo = Titulo ? `${Titulo}` : undefined;
    return (
        
        <Grid container spacing={0.3} sx={{mt:-1}}>
            <Grid xs={3}>
                <Box component={'div'}>
                    <img alt='logo' src={logo} height={58}/>
                </Box>
            </Grid>
            <Grid xs={8.2}>
                <Box >
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold'}}           
                    >
                        Unidad Educativa Colegio
                        “Libertadores de América”
                    </Typography>
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold'}}           
                    >
                       J-08534771-2
                    </Typography>
                    <Typography color={color} 
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold'}}           
                    >
                        Calle Negron Silva, Entre Calle Garces y Av. Independencia
                    </Typography>
                    <Typography color={color} 
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold'}}           
                    >
                        Falcón. Telf 0426-3676002
                    </Typography>
                    <Typography color={color} 
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold'}}           
                    >
                        https://ue-libertadores-de-america.onrender.com
                    </Typography>
                </Box>
            </Grid>
            <Grid xs={12}>
            {titulo
                ?   <Typography color={color}  
                                    fontSize={Tletra}
                                    sx={{ fontWeight:'bold'}}                
                    >
                        {titulo}
                    </Typography>
                :null
            }
            </Grid>
            <Grid xs={3}>
                <Box>
                    <Typography color={color} 
                                fontSize={Tletrad}
                                fontFamily={'Aharoni'}
                                sx={{ fontWeight:'bold'}}           
                    >
                        {`RECIBO: ${valores && valores.recibo ? valores.recibo : ''}`}
                    </Typography>
                </Box>
            </Grid>
            <Grid xs={9}>
                <Box>
                    <Typography color={color} 
                                align={'left'}
                                fontSize={Tletrad}
                                sx={{ fontWeight:'bold', width:200}}           
                    >
                        {`Fecha: ${valores.fecha ? moment(valores.fecha).format('DD/MM/YYYY') : ''}`}
                    </Typography>
                </Box>
            </Grid>
            <Grid xs={12}>
                <Box sx={{height:1.5, bgcolor:color}}/>
            </Grid>
            
        </Grid>
    );
}

export function CabezeraConstancia(props) {
    
    const {datos, Titulo, color_letra}= props;
    const valores = datos ? datos.valores : undefined;
    const Tletra = props.sizeLetra ? props.sizeLetra.Tletra : 11;
    const Tletrad = props.sizeLetra ? props.sizeLetra.Tletrad : 9;
    const color = color_letra ? color_letra : '#000000';
    const titulo = Titulo ? `${Titulo}` : undefined;
    const Input = ({titulo, height, linea})=>{
        return(
            <Box component={'div'} sx={{width:'100%', height:height ? height : linea ? linea* 15 : 20, borderStyle:'solid', borderWidth:1, pl:1, pt:0.3}}>
                <Typography color={color}  
                            fontSize={Tletrad}
                            fontFamily={'Calibri (Cuerpo)'}
                            sx={{ }}           
                >
                    {titulo}
                </Typography>
            </Box>
        )
    }
    const Titulos = ({titulo})=>{

        return(
            <Box component={'div'} sx={{width:'100%', height:18, borderStyle:'solid', borderWidth:1, textAlign:'center', pt:0.3}}>
                <Typography color={color}  
                            fontSize={Tletrad}
                            fontFamily={'Calibri (Cuerpo)'}
                            sx={{ fontWeight:'bold'}}           
                >
                    {titulo}
                </Typography>
            </Box>
        )
    }

    return (
        
        <Grid container spacing={0.1}>
            <Grid xs={1}>
                <Box component={'div'} style={{width:window.innerWidth * 0.083}}/>
            </Grid>
            <Grid xs={2}>
                <Box component={'div'} style={{width:window.innerWidth * 0.166}}>
                    <img alt='logo' src={logom} height={35}/>
                </Box>
            </Grid>
            <Grid xs={2}>
                <Box component={'div'} style={{width:window.innerWidth * 0.166}}/>
            </Grid>
            <Grid xs={2}>
                <Box component={'div'} style={{width:window.innerWidth * 0.1}}>
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold'}}           
                    >
                        Unidad Educativa Colegio
                        “Libertadores de América”
                    </Typography>
                </Box>
            </Grid>
            <Grid xs={3}>
                <Box component={'div'} style={{width:window.innerWidth * 0.25}}/>
            </Grid>
            <Grid xs={2}>
                <Box component={'div'} style={{width:window.innerWidth * 0.166}}>
                    <img alt='logo' src={logo} height={35}/>
                </Box>
            </Grid>   
            <Grid xs={12}><Box sx={{height:5}}></Box></Grid> 
            <Grid xs={5}>
                <Box component={'div'} sx={{width:'100%', height:40, borderStyle:'solid', borderWidth:1}}>
                    <Stack direction="row" spacing={0}>
                        <Box component={'div'} sx={{width:'100%', height:20, borderStyle:'solid', borderWidth:1}}>
                            <Typography color={color}  
                                    fontSize={Tletrad}
                                    fontFamily={'Calibri (Cuerpo)'}
                                        sx={{ fontWeight:'bold', textAlign:'center'}}           
                            >
                                Fecha de Inscripción
                            </Typography>
                        </Box>
                        <Box component={'div'} sx={{width:'100%', height:20, borderStyle:'solid', borderWidth:1}}>
                            <Typography color={color}  
                                    fontSize={Tletrad}
                                    fontFamily={'Calibri (Cuerpo)'}
                                        sx={{ fontWeight:'bold', textAlign:'center'}}           
                            >
                                Recibo N°
                            </Typography>
                        </Box>
                    </Stack>
                    <Stack direction="row" spacing={0}>
                        <Box component={'div'} sx={{width:'100%', height:20, borderStyle:'solid', borderWidth:1}}>
                            <Typography color={color}  
                                    fontSize={Tletrad}
                                    fontFamily={'Calibri (Cuerpo)'}
                                    sx={{ fontWeight:'bold', textAlign:'center'}}           
                            >
                                {datos && datos.fechainscripcion ? datos.fechainscripcion : ''}
                            </Typography>
                        </Box>
                        <Box component={'div'} sx={{width:'100%', height:20, borderStyle:'solid', borderWidth:1}}>
                            <Typography color={color}  
                                    fontSize={Tletrad}
                                    fontFamily={'Calibri (Cuerpo)'}
                                    sx={{ fontWeight:'bold', textAlign:'center'}}           
                            >
                                {datos && datos.recibo ? datos.recibo : ''}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>
            </Grid>    
            <Grid xs={3}>
                <Box component={'div'} style={{}}>
                   
                </Box>
            </Grid>    
            <Grid xs={2}>
                <Box component={'div'} sx={{width:'100%', height:80, borderStyle:'solid', borderWidth:1, verticalAlign:'center',alignContent:'center', textAlign:'center'}}>
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold'}}           
                    >
                        Alumno
                    </Typography>
                </Box>
            </Grid>  
            <Grid xs={2}>
                <Box component={'div'} sx={{width:'100%', height:80, borderStyle:'solid', borderWidth:1, textAlign:'center'}}>
                    <Typography color={color}  
                                fontSize={Tletrad}
                                fontFamily={'Calibri (Cuerpo)'}
                                sx={{ fontWeight:'bold'}}           
                    >
                        Representante
                    </Typography>
                </Box>
            </Grid>
            <Grid xs={12}><Box sx={{height:5}}></Box></Grid>
            <Grid xs={12}>
                <Titulos titulo={`DATOS DEL ESTUDIANTE`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Cedula de Identidad: ${datos && datos.cedula ? datos.cedula : ''}`} />
            </Grid>  
            <Grid xs={6}>
                <Input titulo={`Cedula Escolar: ${datos && datos.cedula_estudiantil ? datos.cedula_estudiantil : ''}`} />
            </Grid>

            <Grid xs={4}>
                <Input titulo={`Apellidos: ${datos && datos.apellidos ? datos.apellidos : ''}`} />
            </Grid> 
            <Grid xs={4}>
                <Input titulo={`Nombres: ${datos && datos.nombres ? datos.nombres : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input titulo={`Sexo: ${datos && datos.sexo ? datos.sexo.titulo ? datos.sexo.titulo : datos.sexo : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input linea={2} titulo={`Lugar de Nacimiento: ${datos && datos.lugar_nacimiento ? datos.lugar_nacimiento : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input linea={2} titulo={`Fecha de Nacimiento: ${datos && datos.fecha_nacimiento ? moment(datos.fecha_nacimiento).format('DD/MM/YYYY') : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input linea={2} titulo={`Año a Cursar: ${datos && datos.grado? datos.grado.titulo ? datos.grado.titulo : datos.grado : ''}`} />
            </Grid>
            <Grid xs={3}>
                <Input titulo={`Tipo de Estudiante:`} />
            </Grid>
            <Grid xs={9}>
                <Input titulo={``} />
            </Grid>
            <Grid xs={12}>
                <Titulos titulo={`REGISTRO MEDICO`} />
            </Grid>
            <Grid xs={4}>
                <Input titulo={`Tipo de Sangre: ${datos && datos.tipo_sangre ? datos.tipo_sangre : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input titulo={`Estatura: ${datos && datos.estatura ? datos.estatura : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input titulo={`Peso: ${datos && datos.peso ? datos.peso : ''}`} />
            </Grid>
            <Grid xs={12}>
                <Input titulo={`Alergias o enfermedades: ${datos && datos.alergias ? datos.alergias : ''}`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Impedimento: ${datos && datos.impedimentos ? datos.impedimentos : ''}`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Médico Tratante: ${datos && datos.medico ? datos.medico : ''}`} />
            </Grid>
            <Grid xs={12}>
                <Titulos titulo={`DATOS COMPLEMENTARIOS`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Actividades Extracurriculares: ${datos && datos.actividad_extra ? datos.actividad_extra : ''}`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Constancia: ${datos && datos.constancia ? datos.constancia : ''}`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Forma de Traslado del Estudiante: ${datos && datos.traslado ? datos.traslado : ''}`} height={30}/>
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Persona Autorizada a retirar (casos especiales): ${datos && datos.persona_autorizada ? datos.persona_autorizada : ''}`} height={30}/>
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Cedula: ${datos && datos.cedula_persona_autorizada ? datos.cedula_persona_autorizada : ''}`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Afinidad: ${datos && datos.afinidad_persona_autorizada ? datos.afinidad_persona_autorizada : ''}`} />
            </Grid>
            <Grid xs={12}>
                <Titulos titulo={`DATOS DEL REPRESENTANTE`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Cedula de Identidad: ${datos && datos.representante && datos.representante.cedula ? datos.representante.cedula : ''}`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Afinidad: ${datos && datos.representante && datos.representante.parentesco ? datos.representante.parentesco._id!==undefined ? datos.representante.parentesco.titulo : datos.representante.parentesco : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input titulo={`Apellidos: ${datos && datos.representante && datos.representante.apellidos ? datos.representante.apellidos : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input titulo={`Nombres: ${datos && datos.representante && datos.representante.nombres ? datos.representante.nombres : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input titulo={`Fecha de Nacimiento: ${datos && datos.representante && datos.representante.fecha_nacimiento ? moment(datos.representante.fecha_nacimiento).format('DD/MM/YYYY') : ''}`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Lugar de Nacimiento: ${datos && datos.representante && datos.representante.lugar_nacimiento ? datos.representante.lugar_nacimiento : ''}`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Correo Electrónico: ${datos && datos.representante && datos.representante.correo ? datos.representante.correo : ''}`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Teléfono Fijo: ${datos && datos.representante && datos.representante.telefono_fijo ? datos.representante.telefono_fijo : ''}`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Teléfono móvil: ${datos && datos.representante && datos.representante.telefono_movil ? datos.representante.telefono_movil : ''}`} />
            </Grid>
            <Grid xs={12}>
                <Input linea={2} titulo={`Dirección de Habitación: ${datos && datos.representante && datos.representante.direccion ? datos.representante.direccion : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input linea={2} titulo={`Municipio: ${datos && datos.representante && datos.representante.municipio ? datos.representante.municipio : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input linea={2} titulo={`Parroquia: ${datos && datos.representante && datos.representante.parroquia ? datos.representante.parroquia : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input linea={2} titulo={`Sector: ${datos && datos.representante && datos.representante.sector ? datos.representante.sector : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input linea={2} titulo={`Profesión: ${datos && datos.representante && datos.representante.profesion ? datos.representante.profesion : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input linea={2} titulo={`Lugar de Trabajo: ${datos && datos.representante && datos.representante.lugar_trabajo ? datos.representante.lugar_trabajo : ''}`} />
            </Grid>
            <Grid xs={4}>
                <Input linea={2} titulo={`Teléfono: ${datos && datos.representante && datos.representante.telefono_trabajo ? datos.representante.telefono_trabajo : ''}`} />
            </Grid>
            <Grid xs={12}>
                <Input linea={2} titulo={`Dirección de Trabajo: ${datos && datos.representante && datos.representante.direccion_trabajo ? datos.representante.direccion_trabajo : ''}`} />
            </Grid>
            <Grid xs={12}>
                <Input titulo={`En caso de que el Representante no sea padre o madre, explique los motivos:`} />
            </Grid>
            <Grid xs={12}>
                <Input titulo={``} linea={2}/>
            </Grid>
            <Grid xs={12}>
                <Input titulo={`¿Tiene Autorización?`} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Firma del Representante`} height={40} />
            </Grid>
            <Grid xs={6}>
                <Input titulo={`Firma Autorizada y sello de la Institución`} height={40}/>
            </Grid>
        </Grid>
    );
}

