import React, {useState, useEffect} from 'react';
import Tabla from '../../../componentes/herramientas/tabla';

import { Ver_Valores, Form_todos, Titulos_todos, conexiones, genera_formulario, AExcell } from '../../../constantes';
import Dialogo from '../../../componentes/herramientas/dialogo';
import IconButton from '@mui/material/IconButton';
import Esperar from '../../../componentes/esperar/cargar';
import Stack from '@mui/material/Stack';

//Iconos
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Icon from '@mui/material/Icon';
import Formulario from '../../../componentes/herramientas/formulario';

function Solvencia (props) {
    const {Config} = props;
    // const estilos= Config && Config.Estilos.Usuarios ? Config.Estilos.Usuarios :Ver_Valores().config.Estilos.Usuarios ? Ver_Valores().config.Estilos.Usuarios : {} //props.config.Estilos.Usuarios ? props.config.Estilos.Usurios : {}
    // const classes= Estilos(estilos);
    const [state, setState]= useState({esperar:false});
    const [dialogo, setDialogo]= useState({
        open:false,  
    });
    
    let Formularios;
    const Refrescar = ()=>{
        let formulario = state.formulario ? state.formulario : Formularios;
        let periodo= formulario.titulos[0].value.periodo.value;
        let grado = formulario.titulos[0].value.grado.value;
        Ver_data(periodo, grado, formulario)
    }
    
    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }
    const Actualizar_data = (valores)=>{
        cambiarState({cantidad:valores.cantidad, datos:valores.nuevodatos})
    }
    
    const Guardar = async(valores, campos)=>{
        const meses = Ver_Valores().config.Listas.lista_Meses;
        meses.map(val=>{
          valores[val.value]=valores[`mensaje-${val.value}`].value;
          valores[`mensaje-${val.value}`]= valores[`mensaje-${val.value}`]._id===0 ? '' : valores[`mensaje-${val.value}`].tituloñ
          return val
        });
        let nuevos= await conexiones.Guardar({_id:valores._id, campos, valores, multiples_valores:true},'uecla_Mensualidad');
        if (nuevos.Respuesta==='Ok'){
            setDialogo({...dialogo,open:false})
            Refrescar();
        }
        return nuevos
    }
    const Abrir = async(valores) =>{
        const lista = Ver_Valores().config.Listas.lista_mensaje_meses;
        const meses = Ver_Valores().config.Listas.lista_Meses;
        let estudiante = await conexiones.Leer_C(['uecla_Estudiante'],{uecla_Estudiante:{_id:valores._id_estudiante}})
        if (estudiante.Respuesta==='Ok'){
            estudiante= estudiante.datos.uecla_Estudiante.length!==0 ? estudiante.datos.uecla_Estudiante[0].valores : {};
        }else{
            estudiante = {};
        }
        valores.grado = `${estudiante.grado ? estudiante.grado.titulo : ''} ${estudiante.seccion ? estudiante.seccion.titulo : '' }`
        meses.map(val=>{
          if (valores[val.value]){
            valores['mensaje-'+val.value] = valores['mensaje-'+val.value] ? valores['mensaje-'+val.value] : 'Cancelado'; 
          }else{
            valores['mensaje-'+val.value] = '';
          }
          const pos = lista.findIndex(f=> typeof valores['mensaje-'+val.value]==='string' && f.titulo===valores['mensaje-'+val.value].toUpperCase())
          if (valores['mensaje-'+val.value]===''){
            valores['mensaje-'+val.value]=lista[0];
          }else if (pos!==-1){
            valores['mensaje-'+val.value]=lista[pos];
          }
          return val
        })
        
        const nuevos =  await genera_formulario({valores, campos: Form_todos('Form_Mensualidad') });
        const formulario ={
            ...nuevos,
            botones:[
                {
                  name:'guardar', label:'Guardar', title:'Guardar ',
                  variant:"contained", color:"success", icono:<CheckIcon/>,
                  onClick: Guardar, validar:'true', 
                  sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Aceptar : {}},
                },
                {
                  name:'cancelar', label:'Cancelar', title:'Cancelar',
                  variant:"contained",  icono:<CancelIcon/>,
                  sx:{...Config.Estilos.Botones ? Config.Estilos.Botones.Cancelar : {}},
                  onClick: ()=>setDialogo({...dialogo,open:false})
                },
            ]
        }
        setDialogo({
            ...dialogo, 
            open: !dialogo.open,
            tam:'xl',
            Titulo:`${valores.nombres} ${valores.apellidos} ${valores.grado}`,
            Cuerpo: <Formulario  {...formulario} Agregar={false} config={Ver_Valores().config}/> ,
            Cerrar: ()=>setDialogo({...dialogo,open:false}),
        })
    }
    
    const Ver_data = async(periodo, grado, formulario=null)=>{
        cambiarState({esperar:true});
        var y = new Date().getFullYear();
        var y1= Number(y)-1;
        let actual = `${y1}-${y}`;
        periodo=periodo ? periodo.periodo : actual;
        const seccion = grado.seccion;
        grado=grado.grado 
        const resultado = await conexiones.Solvencias({periodo,grado,seccion});
        Formularios= formulario!==null ? formulario : Formularios;
        const titulos = await Titulos_todos(`Titulos_Solvencias`, Config)
        if (resultado.Respuesta==='Ok'){
            cambiarState({datos:resultado.mensualidades, formulario, esperar:false, grado, seccion, titulos})
        }else{
            cambiarState({esperar:false, grado, seccion, titulos});
        }

    }
    const Cambio_dato = async (valores)=>{
        const {periodo, grado}=valores.resultados;
        if (periodo===null || grado===null) return
        let formulario = state.formulario ? state.formulario : Formularios;
        formulario.titulos[0].value.grado.value=grado
        formulario.titulos[0].value.periodo.value=periodo
        Formularios= formulario
        Ver_data(periodo, grado, formulario)
        
    }
    const Inicio = async() =>{
        // cambiarState({esperar:true});
        let formulario = await genera_formulario({valores:{}, campos: Form_todos('Form_filtro_solvencias') })
        const periodos =formulario.titulos[0].value.periodo.lista.sort((a,b) => a.periodo> b.periodo ? -1 : 1)
        formulario.titulos[0].value.periodo.value= periodos[0];
        formulario.titulos[0].value.periodo.lista= periodos;
        formulario.titulos[0].value.periodo.onChange= Cambio_dato;
        let grados =  Ver_Valores().config.Listas.lista_colegio_grado;
        let seccion = Ver_Valores().config.Listas.lista_colegio_seccion;
        let ngrados=[{titulo:`Sin grado`, grado:undefined, seccion: undefined}];
        grados.map(val=>{
            let dato= seccion.map(sec=>{
                return {...val, titulo:`${val.titulo} ${sec.titulo}`, grado:val.titulo, seccion: sec.titulo}
            })
            ngrados=[...ngrados, ...dato]
            return dato
        })

        formulario.titulos[0].value.grado.value= ngrados[0];
        formulario.titulos[0].value.grado.lista=ngrados
        formulario.titulos[0].value.grado.onChange= Cambio_dato;
        
        cambiarState({formulario})
        Formularios= formulario;
        Ver_data(periodos[0], ngrados[0], formulario)
        // Ver_data()
    }

    const Exportar = ()=>{
        
        const texto='CANCELADO';
        const nuevo = state.datos.map((val1,i)=>{
            let val={};
            Object.keys(val1).map(key=>{
                val[key] = val1[key]==='No Cancelado' ? '' : val1[key];
                return
            })
            return {
                ID:i+1,
                NOMBRES:val.nombres,
                APELLIDOS:val.apellidos,
                PERIODO:val.periodo,
                INSCRIPCIÓN:val.inscripcion ? val['mensaje-inscripcion'] ? val['mensaje-inscripcion'].toUpperCase():  texto : '',
                SEPTIEMBRE:val.septiembre ? val['mensaje-septiembre'] ? val['mensaje-septiembre'].toUpperCase(): texto : '',
                OCTUBRE:val.octubre ? val['mensaje-octubre'] ? val['mensaje-octubre'].toUpperCase():  texto : '',
                NOVIEMBRE:val.noviembre ? val['mensaje-noviembre'] ? val['mensaje-noviembre'].toUpperCase():  texto : '',
                DICIEMBRE:val.diciembre ? val['mensaje-diciembre'] ? val['mensaje-diciembre'].toUpperCase(): texto : '',
                ENERO:val.enero ? val['mensaje-enero'] ? val['mensaje-enero'].toUpperCase(): texto : '',
                FEBRERO:val.febrero ? val['mensaje-febrero'] ? val['mensaje-febrero'].toUpperCase(): texto : '',
                MARZO:val.marzo ? val['mensaje-marzo'] ? val['mensaje-marzo'].toUpperCase(): texto : '',
                ABRIL:val.abril ? val['mensaje-abril'] ? val['mensaje-abril'].toUpperCase(): texto : '',
                MAYO:val.mayo ? val['mensaje-mayo'] ? val['mensaje-mayo'].toUpperCase(): texto : '',
                JUNIO:val.junio ? val['mensaje-junio'] ? val['mensaje-junio'].toUpperCase(): texto : '',
                JULIO:val.julio ? val['mensaje-julio'] ? val['mensaje-julio'].toUpperCase(): texto : '',
                AGOSTO:val.agosto ? val['mensaje-agosto'] ? val['mensaje-agosto'].toUpperCase(): texto : '',
            }
        })
        
        AExcell(nuevo,`${state.grado ? state.grado : 'seccion'} ${state.seccion ? state.seccion : ''}`, `${state.grado ? state.grado : 'uecla'} ${state.seccion ? state.seccion : ''}.xlsx`);
    }
   
    useEffect(()=>{
        
        Inicio();
        return ()=>{}
    }, [])

    
    const color =  Ver_Valores().config.Estilos.Input_icono_t ? Ver_Valores().config.Estilos.Input_icono_t : {};
    
    return !state.titulos ? <Esperar open={true} Config={Config}/> : (
        <div>
            {/* <div style={{width:'100%', overflowX:'auto', backgroundColor:'#0f0',   }}> */}
                <Tabla  Titulo={"Solvencias"}
                        alto={Ver_Valores().tipo==='Web' ? window.innerHeight * 0.67 : window.innerHeight * 0.73}
                        Config={Config ? Config : Ver_Valores().config}
                        titulos={state.titulos}
                        table={'uecla_Mensualidad'}
                        cantidad={state.cantidad ? state.cantidad : null}
                        cargacompleta={Actualizar_data}
                        datos={state.datos}
                        Accion={Abrir}
                        cargaporparte={false }
                        Noactualizar
                        sinpaginacion={true}
                        acciones={
                            state.formulario ?
                            <Stack direction="row" spacing={0.5}>
                                <IconButton color={'primary'} title={'Refrescar valores de Solvencias'} onClick={Refrescar}>
                                    <AutorenewIcon style={color}/>
                                </IconButton>
                                <IconButton color={'primary'} title={'Exportar a excell'} onClick={Exportar}>
                                    <Icon style={color}>assignment</Icon>
                                </IconButton>
                                <div style={{width:window.innerWidth * 0.35}}>
                                    {state.formulario ? <Formulario {...state.formulario} /> : null}
                                </div>
                            </Stack>
                            : null
                        }
                        
                />
                
                <Dialogo  {...dialogo} config={Ver_Valores().config}/>
                <Esperar open={state.esperar}/>
                
            {/* </div> */}
        </div>
    )
}

export default Solvencia;