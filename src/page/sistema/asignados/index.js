import React, {Component} from 'react';
// import MailIcon from '@material-ui/icons/Mail';
// import NotificationsIcon from '@material-ui/icons/Notifications';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';

import {Titulos_todos ,conexiones, genera_formulario, Form_todos, Ver_Valores} from '../../../constantes';
// import Tabla from '../../../componentes/herramientas/tabla';
import TablaMultiple from '../../../componentes/herramientas/tabla/tabla_multiple';
// import Tabla from '../../../../componentes/herramientas/tablamostrar';
import Dialogo from '../../../componentes/herramientas/dialogo';



const Item = styled(Paper)(({ theme }) => ({
    
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

export default class Asignados extends Component {
  constructor(props) {
      super(props);

      this.state = {
          cargando:true,
          props: this.props,
          Config:this.props.Config,
          datos:[],
          dialogo:{open:false},
          dialogo1:{open:false},
      }
  }

  
  Inicio = async()=>{
    this.setState({cargando:true});
   
    
    this.setState({cargando:false})
  }


  async componentDidMount(){
    this.Inicio();
    
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
  Refrescar = ()=>{
    console.log('Refrescar')
  }
  Agregar = async()=>{
    let nuevos = await genera_formulario({valores:{}, campos: Form_todos('Form_Asignados') });
    this.setState({dialogo:{
        open:true,
        tam:'xl',
        Titulo: 'AGREGAR ASIGNACION',
        Cuerpo:
          <div style={{margin:5, height:window.innerHeight * 0.885}}>
            
          </div>,
        Cerrar: this.Cerrar
      }})
  }
  Abrir = async(data)=>{
    console.log(data);
  }
  Cerrar = ()=>{
    this.setState({dialogo:{open:false}})
  }
  Condiciones = async(campo, datos) =>{
    let {valores}= datos
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
      
      default:
        return valores;
    }

  }
  render(){
    const {cargando, datos, Config, titulos, dialogo, pendiente, facturado, cancelado}=this.state;
    const color =  Config.Estilos.Input_icono ? Config.Estilos.Input_icono : {};
    return (
      <div style={{width:'100%',height:'100%', position: "relative"}}>
        <TablaMultiple
                {...this.state.props}
                Alto={window.innerHeight * 0.86}
                multiples_valores={true}
                Agregar_mas={false}//multiples_valores}
                Condiciones={this.Condiciones}
                Columnas={2} 
                Form_origen = {Form_todos(`Form_Asignados`)}
                Titulo_tabla={'Asignados'}
                Table = {'sistemaraq_Asignado'}
                cargaporparte={{condicion:{}}}
                Titulo_dialogo ={(dato)=> {
                    return dato._id ? `Contrato ${dato.contrato}`: `Nuevo contrato`}
                }
                Titulos_tabla = {Titulos_todos(`Titulos_Asignados`)}
                AgregarExcel = {true}
                ColsExcel = {`Form_Asignados`}
                CampoUnicoExcel = {'contrato'}
                Acciones1 ={
                    <Stack sx={{ width: '100%' }} spacing={0.5}>
                        <Stack direction="row" sx={{ width: '100%' }} spacing={1}>
                            <Item sx={{backgroundColor:Ver_Valores().valores.colores.activo, width:window.innerWidth * 0.25}}>
                                ACTIVADO 
                            </Item>
                            <Item sx={{backgroundColor:Ver_Valores().valores.colores.sinactivar, width:window.innerWidth * 0.25}}>
                                TENDIDO SIN ACTIVAR
                            </Item>
                            <Item sx={{backgroundColor:Ver_Valores().valores.colores.adecuacion, width:window.innerWidth * 0.25}}>
                                ADECUACIÓN
                            </Item>
                            <Item sx={{backgroundColor:Ver_Valores().valores.colores.caja, width:window.innerWidth * 0.25}}>
                                CAJA O POSTE 
                            </Item>
                            
                        </Stack>
                        <Stack direction="row" sx={{ width: '100%' }} spacing={1}>
                           
                            <Item sx={{backgroundColor:Ver_Valores().valores.colores.devuelto, width:window.innerWidth * 0.33}}>
                                DEVUELTO O REASIGNADO 
                            </Item>
                            <Item sx={{backgroundColor:Ver_Valores().valores.colores.enruta, width:window.innerWidth * 0.33}}>
                                EN RUTAS PRE PLANIFICADAS
                            </Item>
                            <Item sx={{backgroundColor:Ver_Valores().valores.colores.porotro, width:window.innerWidth * 0.33}}>
                                REALIZADO POR OTRO  
                            </Item>
                        </Stack>
                    </Stack>
                  }
            />
        {/* <Tabla
          alto={window.innerHeight * 0.70}
          Titulo={"Asignados"}
          Config={Config}
          titulos={titulos}
          table={''}
          cantidad={ null}
          datos={datos}
          Accion={this.Abrir}
          acciones={
            <div>
                <IconButton color={'primary'} title={'Refrescar'} onClick={this.Refrescar} >
                    <AutorenewIcon style={color}/>
                </IconButton>
                <IconButton color={'primary'} title={'Agregrar'} onClick={this.Agregar}>
                    <AddIcon style={color}/>
                </IconButton> 
            </div>
            
            }
          acciones1 ={
            <Stack sx={{ width: '100%' }} spacing={0.5}>
                <Stack direction="row" sx={{ width: '100%' }} spacing={1}>
                    <Item sx={{backgroundColor:Ver_Valores().valores.colores.activo, width:window.innerWidth * 0.25}}>
                        ACTIVADO 
                    </Item>
                    <Item sx={{backgroundColor:Ver_Valores().valores.colores.sinactivar, width:window.innerWidth * 0.25}}>
                        TENDIDO SIN ACTIVAR
                    </Item>
                    <Item sx={{backgroundColor:Ver_Valores().valores.colores.adecuacion, width:window.innerWidth * 0.25}}>
                        ADECUACIÓN
                    </Item>
                    <Item sx={{backgroundColor:Ver_Valores().valores.colores.caja, width:window.innerWidth * 0.25}}>
                        CAJA O POSTE 
                    </Item>
                    
                </Stack>
                <Stack direction="row" sx={{ width: '100%' }} spacing={1}>
                   
                    <Item sx={{backgroundColor:Ver_Valores().valores.colores.devuelto, width:window.innerWidth * 0.33}}>
                        DEVUELTO O REASIGNADO 
                    </Item>
                    <Item sx={{backgroundColor:Ver_Valores().valores.colores.enruta, width:window.innerWidth * 0.33}}>
                        EN RUTAS PRE PLANIFICADAS
                    </Item>
                    <Item sx={{backgroundColor:Ver_Valores().valores.colores.porotro, width:window.innerWidth * 0.33}}>
                        REALIZADO POR OTRO  
                    </Item>
                </Stack>
            </Stack>
          }
        /> */}
        {/* <Cargando open={cargando}/> */}
        <Dialogo  {...dialogo} config={Config}/>
       
      </div>
    )
  }
}
