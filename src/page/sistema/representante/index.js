import React, {useEffect, useState} from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Cuerpo from '../../../componentes/herramientas/cuerpo';
import { genera_formulario, crear_campos, Form_todos, Ver_Valores, conexiones, nuevo_Valores } from '../../../constantes' 
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import Formulario from '../../../componentes/herramientas/formulario';
import Dialogo from '../../../componentes/herramientas/dialogo';
import Cargando from '../../../componentes/esperar/cargar';
import { Condicion_Estudiante, Condicion_Representante } from '../funciones';
import { Titulos_todos } from '../../../constantes';
import Tabla from '../../../componentes/herramientas/tabla';
// import RConstancia from '../pdf/constancia';

import Constanciapdf from '../../reportes/constancia';
import Reporte from '../../../componentes/reporte';
// import moment from 'moment';

//Iconos
// import AddIcon from '@mui/icons-material/AddCircle';
import CheckIcon from '@mui/icons-material/Check';
// import CancelIcon from '@mui/icons-material/Cancel';

import Scrollbars from '../../../componentes/herramientas/scrolbars';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


  
export default function MisDatos(props) {
    const [state,setState] = useState({buscar:'', dialogo:{open:false}, esperar:false})
    const {Config}= props
    const CambioState = (nuevo)=>{
        setState({...state, ...nuevo})
    }
    
    const Condiciones = async(campo, datos) =>{
        let {valores}= datos
        switch (campo) {
            case 'uecla_Estudiante':{
                valores= await Condicion_Estudiante(datos);
                return valores
            }
            case 'uecla_Representante':{
                valores = await Condicion_Representante(datos);
                return valores
            }
            default:
                return valores;
        }
    
    }
    const Guardar=(table, Form_origen) => async(valores, campos)=>{

        CambioState({esperar:true});
        campos = await crear_campos(campos, Form_origen)
        
        valores = await Condiciones(table, {campos, valores})    
        // let nuevos;
        // if (!valores.finalizado_condicion){
            
        //     nuevos= await conexiones.Guardar({campos, valores, multiples_valores:true},table);
        // }else{
        //     nuevos=valores
        // }
        Buscar();
    }

    // const Agregar = async(dato)=>{
    //     let representante = {
    //         _id: dato._id, cedula:dato.cedula, nombres:dato.nombres, apellidos: dato.apellidos, parentesco:dato.parentesco ?  dato.parentesco.titulo : ''
    //     }
    //     let festudiante = await genera_formulario({ valores:{representante}, campos: Form_todos('Form_Estudiante', Config) });
    //     festudiante.titulos[7].value.estatus.disabled=true;
    //     festudiante.titulos[8].value.representante.disabled=true;
    //     festudiante.botones=[
    //         {
    //             name:'guardar', label:'Guardar', title:'Guardar datos de estudiante',
    //             variant:"contained", color:"success", icono:<CheckIcon/>,
    //             onClick: Guardar('uecla_Estudiante', Form_todos('Form_Estudiante', Config)), validar:'true', 
    //             sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
    //         },
    //         {
    //             name:'cancelar', label:'Cancelar', title:'Cancelar',
    //             variant:"contained", color:"success", icono:<CancelIcon/>,
    //             onClick:()=>{
    //                 CambioState({dialogo:{open:false}})
    //                 Buscar()
    //             }, 
    //             sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Cancelar : {}},
    //         }
    //     ]
    //     let dialogo = {
    //         ...state.dialogo, 
    //         open: !state.dialogo.open,
    //         Titulo:'Agregar Estudiante',
    //         Cuerpo: <Formulario {...festudiante} Config={Config}/>,
    //         Cerrar: ()=>{
    //             CambioState({dialogo:{open:false}})
    //             Buscar()
    //         },
    //     }
    //     CambioState({dialogo})
    // }
    const Resumen = async(dato)=>{
        const resultado = await conexiones.Resumen(dato);
        let {recibos, mensualidad} = resultado;
        const TituloS= await Titulos_todos(`Titulos_Solvencias`);
        const TituloR =await Titulos_todos(`Titulos_Recibo`);
        let Bloques={
            Solvencias: <Tabla  Titulo={"Solvencias"}
                            Config={Ver_Valores().config}
                            titulos={TituloS}
                            table={'uecla_Mensualidad'}
                            cantidad={mensualidad ? mensualidad.length : 0}
                            datos={mensualidad ? mensualidad : []}
                            cargaporparte={true }
                            sinpaginacion
                            alto={window.innerHeight * 0.58}
                                
                        />,
            Recibos:    <Tabla  Titulo={"Recibos"}
                            Config={Ver_Valores().config}
                            titulos={TituloR}
                            table={'uecla_Recibo'}
                            cantidad={recibos ? recibos.length : 0}
                            datos={recibos ? recibos : []}
                            // Accion={Abrir}
                            cargaporparte={false}
                            sinpaginacion
                            alto={window.innerHeight * 0.58}         
                        />
        }
        
        CambioState({
            dialogo:{
                open: !state.dialogo.open,
                tam:'xl',
                Titulo: `Resumen: ${dato.nombres} ${dato.apellidos}`,
                Cuerpo: <Cuerpo Bloques={Bloques} Config={Config}/>,
                Cerrar: ()=>{
                    CambioState({dialogo: {open:false}})
                    Buscar()
                },
            }
        })
    }
    // const Constancia = async(valor)=>{
    //     let resultado = await conexiones.Resumen(valor);
    //     let representante = await conexiones.Leer_C(['uecla_Representante'],{uecla_Representante:{_id:valor.representante._id}});
    //     representante = representante.Respuesta==='Ok' && representante.datos.uecla_Representante.length!==0 ? representante.datos.uecla_Representante[0].valores : {}
    //     valor.representante = {...valor.representante, ...representante}
    //     if (resultado.Respuesta==='Ok'){
    //         let recibos = resultado.recibos.map(val=> val);
            
    //         let pos=-1;
    //         recibos.map((val,i)=>{
    //             const p = val.valores.mensualidades.meses.findIndex(f=> f.periodo===state.inscripcion.periodo && f.value==='inscripcion')
    //             if (p!==-1){
    //                 pos=i;
    //             }
    //         })
    //         if (pos!==-1){
    //             valor.recibo = recibos[pos].valores.recibo;
    //             valor.fechainscripcion = moment(recibos[pos].createdAt).format('DD/MM/YYYY');
    //         }
    //     }
    //     let dialogo = {
    //         ...state.dialogo, 
    //         open: !state.dialogo.open,
    //         tam:'xl',
    //         Titulo:'Agregar Estudiante',
    //         Cuerpo: <Reporte datos={valor} reporte={RConstancia}  />,
    //         Cerrar: ()=>{
    //             CambioState({dialogo:{open:false}});
    //             Buscar();
    //         },
    //     }
    //     CambioState({dialogo})
    // }
    const Constancia =async(dato, tipo)=>{
        let resultado = await conexiones.Resumen(dato);
        let {mensualidad} = resultado;
        resultado = await conexiones.Leer_C(['uecla_Inscripcion'],{uecla_Inscripcion:{}});
        let periodos = resultado.datos.uecla_Inscripcion.map(val=>{return {...val.valores}}).sort((a, b) => (a.periodo > b.periodo ? -1 : a.periodo < b.periodo ? 1 : 0));
        const periodo = periodos.length!==0 ? periodos[0].periodo : '';
        const pos = mensualidad.findIndex(f=> f.periodo===periodo);
        const inscrito= pos!==-1 ? mensualidad[pos].inscripcion : false;
        CambioState({
            dialogo:{
                open: !state.dialogo.open,
                Titulo: `Constancia Estudio: ${dato.nombres} ${dato.apellidos}`,
                tam:'xl',
                Cuerpo: inscrito 
                            ?   <Reporte datos={{...dato, periodo, inscrito}} reporte={Constanciapdf} sizeLetra={{Tletra:14, Tletrad:12}} tipo={tipo}/>
                            :   <Alert severity="error">{`Estudiante no se encuentra inscrito en periodo ${periodo}`}</Alert>
                ,
                Cerrar: ()=>{
                    CambioState({dialogo: {open:false}})
                    Buscar()
                },
            }
        })

    }
    const Buscar = async()=>{
        const {User} = Ver_Valores();
        const buscar = User.valores.cedula;

        CambioState({Bloques:null, esperar:true});
        let representante= await conexiones.Leer_C(['uecla_Representante'],{uecla_Representante:{'valores.cedula':buscar}})
        if (representante.Respuesta==='Ok'){
            representante= representante.datos.uecla_Representante.filter(f=>f.valores.cedula===buscar);
            // let Representante = {}
            if (representante.length!==0){
                // Representante ={...representante[0]};
                representante = {...representante[0].valores, _id:representante[0]._id};
            }else{

                representante = {}
            }
            let frepresentante = {...await genera_formulario({ valores:representante, campos: Form_todos('Form_Representante', Config, 'representados') })}
            
            // delete frepresentante.titulos[7]//= frepresentante.titulos.filter((val)=> !val.value.representados)
            
            let Bloques={
                
            }
            if (representante.nombres){
                frepresentante.botones=[
                    {
                      name:'guardar', label:'Guardar', title:'Guardar ',
                      variant:"contained", color:"success", icono:<CheckIcon/>,
                      onClick: Guardar('uecla_Representante', Form_todos('Form_Representante', Config, 'representados')), validar:'true', 
                      sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                    },
                    // {
                    //     name:'agregar', label:'Agregar', title:'Agregar un nuevo estudiante',
                    //     variant:"contained", color:"success", icono:<AddIcon/>,
                    //     onClick:()=> Agregar(representante), validar:'true', 
                    //     sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                    //   },
                ]
                
                Bloques[`${representante.nombres} ${representante.apellidos}`]= 
                    <div>
                        {representante.password ? null 
                                    :   <Alert severity="error">
                                            {`El Representante ${representante.nombres} ${representante.apellidos}, no a creado contraseña`}
                                        </Alert>
                        }
                        <Formulario {...frepresentante} config={Config}/>
                    </div>
                // let mens= await conexiones.Mensualidades({Representados:representante.representados});
                // mens= mens.mensualidades;
                // let pendientes=0;
                for (var i=0; i<representante.representados.length; i++){
                    let val = representante.representados[i];
                    const quitar = ['representante'];
                    const desactivar= ['grado','seccion','beca','estatus'];
                    // const pos = mens.findIndex(f=> f.valores._id_estudiante===val._id && f.valores.periodo===state.inscripcion.periodo && f.valores.inscripcion)
                    // if (pos!==-1){
                    //     pendientes+=1;
                    // }
                    val = await conexiones.Leer_C(['uecla_Estudiante'],{uecla_Estudiante:{_id:val._id}});
                    val= {...val.datos.uecla_Estudiante[0].valores, _id:val.datos.uecla_Estudiante[0]._id};
                    let festudiante = await genera_formulario({ valores:val, campos: Form_todos('Form_Estudiante', Config, quitar,desactivar) });
                    festudiante.titulos[7].value.estatus.disabled=true;
                    festudiante.botones=[
                        {
                          name:'guardar', label:'Guardar', title:'Guardar datos de estudiante',
                          variant:"contained", color:"success", icono:<CheckIcon/>,
                          onClick: Guardar('uecla_Estudiante', Form_todos('Form_Estudiante', Config,quitar, desactivar)), validar:'true', 
                          sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                        }
                    ]
                    Bloques[`${val.nombres} ${val.apellidos}`]= 
                        <div>
                            <Box>
                                <IconButton size="large"  title={'Resumen'} onClick={()=>Resumen(val)}>
                                    <Icon >assignment</Icon>
                                </IconButton>
                                <IconButton size="large"  title={'Constancia de Inscripción'} onClick={()=>Constancia(val, 'inscripcion')}>
                                    <Icon >contact_page</Icon>
                                </IconButton>
                                <IconButton size="large"  title={'Constancia de Estudio'} onClick={()=>Constancia(val,'estudio')}>
                                    <Icon >portrait</Icon>
                                </IconButton>
                            </Box>
                            {/* {pos===-1   ? null 
                                        :   <Alert severity="success">
                                                {`El estudiante ${val.nombres} ${val.apellidos}, esta inscripto en el periodo ${state.inscripcion.periodo}`}
                                                <IconButton onClick={()=>Constancia(val)}>
                                                    <Icon>note</Icon>
                                                </IconButton>
                                            </Alert>
                            } */}

                            <Formulario {...festudiante} config={Config}/>
                        </div>
                        
                }
                nuevo_Valores({datosActuales:undefined})
                // Bloques['INSCRIPCION']= pendientes=== 0 
                //     ?   <Pagar Config={Config} Representante={Representante} Inscripcion={state.inscripcion.periodo} Refrescar={Buscar} 
                //                 Subtotalvalor={{abono:Representante.valores.abono, abonod:Representante.valores.abonod}}
                //                 Formas_pago={undefined} formapago={undefined}
                //         />
                //     :   <div>
                //             <Alert severity="success">{`Sus representados estan inscripto en el periodo ${state.inscripcion.periodo}`}</Alert>
                //         </div>
            }else{
                frepresentante.titulos[0].value.cedula.value=buscar
                frepresentante.datos.cedula= buscar;
                frepresentante.botones=[
                    {
                      name:'guardar', label:'Guardar', title:'Guardar ',
                      variant:"contained", color:"success", icono:<CheckIcon/>,
                      onClick: Guardar('uecla_Representante', Form_todos('Form_Representante', Config,['representados'])), validar:'true', 
                      sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                    },
        
                ]
                Bloques[`Nuevo`]= <Formulario {...frepresentante} config={Config}/>
            }
            CambioState({Bloques, esperar:false})
        }
    }
    useEffect(()=>{
        const Inicio = async()=>{
            Buscar()
        }
        Inicio()
    },[])

    return (
        <Box sx={{ flexGrow: 1, position:'relative' }}>
            <Grid container spacing={0.5}>
                <Grid item xs={12}>
                    <Item sx={{height:'86vh', overflowY:'auto'}}>
                    <Scrollbars sx={{flexGrow: 1, padding:0.5, }}>
                        {state.Bloques
                            ?   <Cuerpo Bloques={state.Bloques ? state.Bloques : {}} Config={Config}/>
                            :  null
                        }
                    </Scrollbars>
                    </Item>
                </Grid>
            </Grid>
            <Dialogo  {...state.dialogo} config={Config}/>
            <Cargando open={state.esperar} Config={Config}/>
        </Box>
    )
}