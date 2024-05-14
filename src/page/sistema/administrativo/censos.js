import React, {useState, useEffect, Component} from 'react';
import { Box } from '@mui/material';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import Tabla from '../../../componentes/herramientas/tabla';
import Formulario from '../../../componentes/herramientas/formulario';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
import { Ver_Valores, genera_formulario, conexiones, AExcell} from '../../../constantes';
import { Form_todos, Titulos_todos,} from '../../../constantes/formularios';
import Cuerpo from '../../../componentes/herramientas/cuerpo'
import Cargando from '../../../componentes/esperar/cargar';
import Dialogo from '../../../componentes/herramientas/dialogo';
import Estadistica from '../../../componentes/herramientas/estadistica';

function RCensos (props) {
    
    const [state, setState]= useState({esperar:false});
    
    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }
    
    const Inicio = async() =>{
        const titulos = await Titulos_todos(`Titulos_Censo`, Config)
        cambiarState({esperar:false, titulos})
    }
    const ordenar = (dato)=>{
        const nuevo = dato.filter(f=> f.valores).sort((a,b)=> a.valores.periodo>b.valores.periodo ? -1 :1)
        return nuevo
    }
    useEffect(()=>{
        Inicio()
    }, [props])
    const {Config}= props;
    return state.esperar ? <Cargando open={state.esperar} Config={Config}/> :(
        
            <TablaMultiple
                alto={Ver_Valores().tipo==='Web' ? '78%':'82%'}
                altoCuerpo={Ver_Valores().tipo==='Web' ? window.innerHeight * 0.78 :window.innerHeight * 0.81}
                ordenar ={ordenar}
                Config={Config ? Config : Ver_Valores().config}
                multiples_valores={true}
                Agregar_mas={false}
                Columnas={2} 
                Form_origen = {Form_todos(`Form_Censo`, Config)}
                Titulo_tabla={'Registro Censos'}
                Table = {'uecla_Censo'}
                
                Eliminar= {'titulo'}
                Titulo_dialogo ={(dato)=> dato._id ? `Registro `: `Nuevo Censo `}
                Titulos_tabla = {state.titulos}
                cargaporparte = {true}
                sinpaginacion = {true}
                
            />
        
      
    )
}

export function Censados (props) {
    
    const {Config, mostrar} = props;
    // const estilos= Config && Config.Estilos.Usuarios ? Config.Estilos.Usuarios :Ver_Valores().config.Estilos.Usuarios ? Ver_Valores().config.Estilos.Usuarios : {} //props.config.Estilos.Usuarios ? props.config.Estilos.Usurios : {}
    // const classes= Estilos(estilos);
    const [state, setState]= useState({esperar:false});
    const [dialogo, setDialogo]= useState({
        open:false,  
    });
    const [dialogo1, setDialogo1]= useState({
      open:false,  
    });
    let Formularios;
    const Refrescar = ()=>{
        let formulario = state.formulario ? state.formulario : Formularios;
        let periodo= formulario.titulos[0].value.periodo.value;
        Ver_data(periodo,formulario)
    }
    
    const cambiarState = (nuevostate)=>{
        setState({...state, ...nuevostate, cambio:true})
    }
    const Actualizar_data = (valores)=>{
        cambiarState({cantidad:valores.cantidad, datos:valores.nuevodatos})
    }
    
    const Guardar = async(valores, campos)=>{
        
        const nuevos= await conexiones.Guardar({_id:valores._id, valores, multiples_valores:true},'uecla_Censado');
        if (nuevos.Respuesta==='Ok'){
          Refrescar();
          setDialogo({...dialogo, open:false});
        }
        return nuevos
    }
    
    const Resumen = async(dato)=>{
      // console.log(dato)
      const Cuerpo= <Estadistica representante={dato}/>
      setDialogo1({
        ...dialogo1,  
        open: !dialogo1.open,
        tam:'xl',
        Titulo: `Resumen: ${dato.nombres} ${dato.apellidos}`,
        Cuerpo: Cuerpo,
        Cerrar: ()=>setDialogo1({...dialogo1,open:false}),  
      })
    }
    const Abrir = async(valores) =>{
      // console.log(valores.valores.existe)
      const nuevos =  await genera_formulario({valores:{...valores.valores, _id:valores._id}, campos: Form_todos('Form_Censado') });
      // console.log(nuevos)
      const formulario ={
          ...nuevos,
          botones:[
              {
                name:'guardar', label:'Guardar', title:'Guardar ',
                variant:"contained", color:"success", icono:<CheckIcon/>,
                onClick: Guardar, validar:'true', 
                sx:{...Ver_Valores().config.Estilos.Botones.Aceptar },
              },
              {
                name:'estadistica', label:'Resumen de Representante', title:'Resumen de pago del Representante',
                variant:"contained",  icono:<Icon>incomplete_circle</Icon>,
                sx:{...Ver_Valores().config.Estilos.Botones.Aceptar},
                disabled: !(valores.valores.existe && valores.valores.existe.value==='si'), 
                onClick: ()=>Resumen({...valores.valores, _id:valores._id})
              },
              {
                name:'cancelar', label:'Cancelar', title:'Cancelar',
                variant:"contained",  icono:<CancelIcon/>,
                sx:{...Ver_Valores().config.Estilos.Botones.Cancelar},
                onClick: ()=>setDialogo({...dialogo,open:false})
              },
          ]
      }
      setDialogo({
          ...dialogo, 
          open: !dialogo.open,
          tam:'xl',
          Titulo:`Censado: ${valores.valores.nombres_estu} ${valores.valores.apellidos_estu} ${valores.valores.grado_estu ? valores.valores.grado_estu.titulo : ''}`,
          Cuerpo: <Formulario  {...formulario} Agregar={false} config={Ver_Valores().config}/> ,
          Cerrar: ()=>setDialogo({...dialogo,open:false}),
      })
    }
    
    const Ver_data = async(periodo, formulario=null)=>{
        cambiarState({esperar:true});
        var y = new Date().getFullYear();
        var y1= Number(y)-1;
        let actual = `${y1}-${y}`;
        periodo=periodo ? periodo.periodo : actual;
        
        const resultado = await conexiones.Leer_C(['uecla_Censado'],{uecla_Censado:{'valores.periodo':periodo}});
        let datos = mostrar ? resultado.datos.uecla_Censado.filter(f=> f.valores.admitido && f.valores.admitido.value==='si') : resultado.datos.uecla_Censado;

        Formularios= formulario!==null ? formulario : Formularios;
        let titulos = await Titulos_todos(mostrar ? `Titulos_CensadosA` :`Titulos_Censados`, Config);
        if (resultado.Respuesta==='Ok'){
            cambiarState({datos, formulario, esperar:false, titulos})
        }else{
            cambiarState({esperar:false, titulos});
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
        let formulario = await genera_formulario({valores:{}, campos: Form_todos('Form_filtro_censos') })
        const periodos =formulario.titulos[0].value.periodo.lista.sort((a,b) => a.periodo> b.periodo ? -1 : 1)
        formulario.titulos[0].value.periodo.value= periodos[0];
        formulario.titulos[0].value.periodo.lista= periodos;
        formulario.titulos[0].value.periodo.onChange= Cambio_dato;
        formulario.titulos[0].value.periodo.disabled=mostrar;
        
        
        cambiarState({formulario})
        Formularios= formulario;
        Ver_data(periodos[0], formulario)
        // Ver_data()
    }

    // const Exportar = ()=>{
        
    //     const texto='CANCELADO';
    //     const nuevo = state.datos.map((val1,i)=>{
    //         let val={};
    //         Object.keys(val1).map(key=>{
    //             val[key] = val1[key]==='No Cancelado' ? '' : val1[key];
    //             return
    //         })
    //         return {
    //             ID:i+1,
    //             NOMBRES:val.nombres,
    //             APELLIDOS:val.apellidos,
    //             PERIODO:val.periodo,
    //             INSCRIPCIÓN:val.inscripcion ? val['mensaje-inscripcion'] ? val['mensaje-inscripcion'].toUpperCase():  texto : '',
    //             SEPTIEMBRE:val.septiembre ? val['mensaje-septiembre'] ? val['mensaje-septiembre'].toUpperCase(): texto : '',
    //             OCTUBRE:val.octubre ? val['mensaje-octubre'] ? val['mensaje-octubre'].toUpperCase():  texto : '',
    //             NOVIEMBRE:val.noviembre ? val['mensaje-noviembre'] ? val['mensaje-noviembre'].toUpperCase():  texto : '',
    //             DICIEMBRE:val.diciembre ? val['mensaje-diciembre'] ? val['mensaje-diciembre'].toUpperCase(): texto : '',
    //             ENERO:val.enero ? val['mensaje-enero'] ? val['mensaje-enero'].toUpperCase(): texto : '',
    //             FEBRERO:val.febrero ? val['mensaje-febrero'] ? val['mensaje-febrero'].toUpperCase(): texto : '',
    //             MARZO:val.marzo ? val['mensaje-marzo'] ? val['mensaje-marzo'].toUpperCase(): texto : '',
    //             ABRIL:val.abril ? val['mensaje-abril'] ? val['mensaje-abril'].toUpperCase(): texto : '',
    //             MAYO:val.mayo ? val['mensaje-mayo'] ? val['mensaje-mayo'].toUpperCase(): texto : '',
    //             JUNIO:val.junio ? val['mensaje-junio'] ? val['mensaje-junio'].toUpperCase(): texto : '',
    //             JULIO:val.julio ? val['mensaje-julio'] ? val['mensaje-julio'].toUpperCase(): texto : '',
    //             AGOSTO:val.agosto ? val['mensaje-agosto'] ? val['mensaje-agosto'].toUpperCase(): texto : '',
    //         }
    //     })
        
    //     // AExcell(nuevo,`${state.grado ? state.grado : 'seccion'} ${state.seccion ? state.seccion : ''}`, `${state.grado ? state.grado : 'uecla'} ${state.seccion ? state.seccion : ''}.xlsx`);
    // }

    const ReporteM = () =>{
      const datos = state.datos.map(val=>{
        const data = val.valores;
        return {
          CEDULA:data.cedula_estu,
          'CEDULA ESCOLAR':data.cedula_estudiantil,
          NOMBRES:data.nombres_estu,
          APELLIDOS:data.apellidos_estu,
          PROCEDENCIA:data.procedencia,
          'GRADO CURSAR':data.grado_estu && data.grado_estu.titulo ? data.grado_estu.titulo : '',
          //Representante
          'CEDULA REPRESENTANTE': data.cedula,
          'NOMBRES REPRESENTANTE': data.nombres,
          'APELLIDOS REPRESENTANTE': data.apellidos,
          TELEFONO: data.telefono_movil,
          'REPRESENTANTE ANTIGUO': data.existe && data.existe.titulo ? data.existe.titulo : 'No',
          
          CANCELO: data.cancelo && data.cancelo.titulo ? data.cancelo.titulo : 'No'
        }
      })
      console.log(state.datos[0].valores.periodo)
      const nombre = state.datos.length!==0 ? `Censados-${state.datos[0].valores.periodo}.xlsx` : `Censados.xlsx`
      AExcell(datos,'Censados', nombre)
    }

    useEffect(()=>{
        
        Inicio();
        return ()=>{}
    }, [])

    
    const color =  Ver_Valores().config.Estilos.Input_icono_t ? Ver_Valores().config.Estilos.Input_icono_t : {};
    
    return !state.titulos || !state.datos ? <div style={{height:Ver_Valores().tipo==='Web' ? window.innerHeight * 0.80 : window.innerHeight * 0.80}}><Cargando open={true} Config={Ver_Valores().config}/></div> : (
        <div>
            {/* <div style={{width:'100%', overflowX:'auto', backgroundColor:'#0f0',   }}> */}
                <Tabla  Titulo={"Censados"}
                        alto={Ver_Valores().tipo==='Web' ? window.innerHeight * 0.64 : window.innerHeight * 0.63}
                        Config={Config ? Config : Ver_Valores().config}
                        titulos={state.titulos}
                        table={'uecla_Censado'}
                        cantidad={state.cantidad ? state.cantidad : null}
                        cargacompleta={Actualizar_data}
                        datos={state.datos}
                        Accion={mostrar ? null : Abrir}
                        cargaporparte={false }
                        Noactualizar
                        sinpaginacion={true}
                        acciones={
                            state.formulario ?
                            <Stack direction="row" spacing={0.5}>
                              {mostrar 
                                ? null
                                : <Stack direction="row" spacing={1}>
                                    <IconButton color={'primary'} title={'Refrescar valores de Solvencias'} onClick={Refrescar}>
                                      <AutorenewIcon style={color}/>
                                    </IconButton>
                                    <IconButton color={'primary'} title={'Reporte'} onClick={ReporteM}>
                                      <Icon style={color}>assignment</Icon>
                                    </IconButton>
                                  </Stack>
                              }
                                {/* <IconButton color={'primary'} title={'Exportar a excell'} onClick={Exportar}>
                                    <Icon style={color}>assignment</Icon>
                                </IconButton> */}
                                <div style={{width:window.innerWidth * 0.35}}>
                                    {state.formulario   ?   <Formulario {...state.formulario} 
                                                                    config={{
                                                                            Estilos:{
                                                                                Input_label:{color:'#fff'},
                                                                                Input_fondo:'#fff',
                                                                                Input_input:{color:'#fff'}
                                                                            }
                                                                    }}
                                                            /> 
                                                        : null
                                    }
                                </div>
                            </Stack>
                            : null
                        }
                        
                />
                <Dialogo  {...dialogo} config={Ver_Valores().config}/>
                <Dialogo  {...dialogo1} config={Ver_Valores().config}/>
                <Cargando open={state.esperar} config={Ver_Valores().config}/>
                
            {/* </div> */}
        </div>
    )
}

export default class Selecciones extends Component {
    constructor(props) {
        super(props);
  
        this.state = {
            cargando:true,
            props: this.props,
            Config:this.props.Config,
        }
    }
  
    Condiciones = async(campo, datos) =>{
      let {valores}= datos;
      const sistema = Ver_Valores().valores.app;
      switch (campo) {
        case 'User_api':{
          if (datos.password!==''){
            // datos.password =await encriptado.Hash_password(datos.npassword)
            datos.newpassword=datos.password;
            
          }
          // else{
            delete datos.password
          // }
          datos.categoria = typeof datos.categoria === 'object' ? datos.categoria._id : datos.categoria 
          return datos
        }
        case `${sistema}_Mensualidad`:{
          const meses = Ver_Valores().config.Listas.lista_Meses;
          meses.map(val=>{
            valores[val.value]=valores[`mensaje-${val.value}`].value;
            valores[`mensaje-${val.value}`]= valores[`mensaje-${val.value}`]._id===0 ? '' : valores[`mensaje-${val.value}`].titulo
            return val
          })
          return valores
        }
        default:
          return valores;
      }
  
    }
    
    async componentDidMount(){
      
      // let database= await conexiones.DataBase();
      let Bloques1={
        CENSO:<RCensos/>,
        CENSADOS:<Censados />,
      };
      
      let Bloques={
       
        ...Bloques1
      }
      // console.log(Bloques)
      this.setState({Bloques, BloquesT:Bloques, cargando:false})
    }
  
    static getDerivedStateFromProps(props, state) {
  
      if (props !== state.props) {
        return {
          props,
          Config:props.Config,
        };
      }
      // No state update necessary
      return null;
    }
  
    render(){
      const {Bloques, cargando}=this.state;
      return (
        <div style={{width:'100%', position: "relative"}}>
          <Cuerpo Bloques={Bloques} Config={this.state.Config}/>
          <Cargando open={cargando}/>
        </div>
      )
    }
}
