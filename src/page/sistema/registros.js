import React, {Component} from 'react';
// import MailIcon from '@material-ui/icons/Mail';
// import NotificationsIcon from '@material-ui/icons/Notifications';

import Cuerpo from '../../componentes/herramientas/cuerpo';
import TablaMultiple from '../../componentes/herramientas/tabla/tabla_multiple';
import { Form_todos, Titulos_todos, MaysPrimera, Ver_Valores } from '../../constantes';

import Cargando from '../../componentes/esperar/cargar';

export default class Registros extends Component {
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

  Editores = async(campo)=>{
    
    let multiples_valores= true;//campo.indexOf('User_api')===-1
    let nuevo_campo = campo.indexOf('User_api')!==-1 ? 'User_api' :campo.split('_')[1];//MaysPrimera(campo.replace('colegio_',''))
    const sistema = Ver_Valores().valores.app;
    let Titulo_dialogo={
      [`${sistema}_User_api`]:(dato)=>dato.username,
      [`${sistema}_Asignatura`]:(dato)=>`Asignatura "${dato.asignatura}"`,
      [`${sistema}_Articulo`]:(dato)=>`Articulo "${dato.nombre}"`,
      [`${sistema}_Cuenta`]:(dato)=>{
        return `Banco ${dato.banco ? dato.banco.titulo : ''} ${dato.numero}`
      },
      [`${sistema}_Reporte`]:(dato)=>`Reporte "${dato.nombre}"`,
      [`${sistema}_Mensualidad`]:(dato)=>`Registro "${dato.periodo} ${dato.nombres} ${dato.apellidos}"`,
      [`${sistema}_Portada`]:(dato)=>`Portada "${dato.caption} "`,
    }
    let Actualizar_valores={
      [`${sistema}_Mensualidad`]:(valores)=>{
        const lista = Ver_Valores().config.Listas.lista_mensaje_meses;
        const meses = Ver_Valores().config.Listas.lista_Meses;
        meses.map(val=>{
          if (valores.valores[val.value]){
            valores.valores['mensaje-'+val.value] = valores.valores['mensaje-'+val.value] ? valores.valores['mensaje-'+val.value] : 'Cancelado'; 
          }else{
            valores.valores['mensaje-'+val.value] = '';
          }
          const pos = lista.findIndex(f=> typeof valores.valores['mensaje-'+val.value]==='string' && f.titulo===valores.valores['mensaje-'+val.value].toUpperCase())
          if (valores.valores['mensaje-'+val.value]===''){
            valores.valores['mensaje-'+val.value]=lista[0];
          }else if (pos!==-1){
            valores.valores['mensaje-'+val.value]=lista[pos];
          }
          return val
        })
        return valores
      },
    }
    let Eliminar={
      User_api: 'username',
      Asignatura : 'asignatura',
      Cuenta:'numero',
      Reporte:'nombre',
      Articulo: 'nombre'
    }
    let Titulo;
    switch(campo){
      case `${sistema}_User_api`:{
        Titulo= 'USUARIOS'
        break;
      }
      case `${sistema}_Articulo`:{
        Titulo= 'ARTICULOS'
        break;
      }
      case `${sistema}_Asignatura`:{
        Titulo= 'ASIGNATURAS'
        break;
      }
      case `${sistema}_Cuenta`:{
        Titulo= 'CUENTAS BANCARIA'
        break;
      }
      case `${sistema}_Reporte`:{
        Titulo= 'REPORTES'
        break;
      }
      case `${sistema}_Mensualidad`:{
        Titulo= 'SOLVENCIAS'
        break;
      }
      case `${sistema}_Portada`:{
        Titulo= 'PORTADAS'
        break;
      }
      default:{
        Titulo=campo;
      }
    }
    const funcion= Titulo_dialogo[campo];
    const FActualizar = Actualizar_valores[campo];
    const Titulos_tabla = await Titulos_todos(`Titulos_${nuevo_campo}`)
    
    return <TablaMultiple
                {...this.state.props}
                alto={Ver_Valores().tipo==='Web' ? '78%':'82%'}
                altoCuerpo={Ver_Valores().tipo==='Web' ? window.innerHeight * 0.78 :window.innerHeight * 0.81}
                multiples_valores={multiples_valores}
                Agregar_mas={false}//multiples_valores}
                Condiciones={this.Condiciones}
                Columnas={2} 
                Form_origen = {Form_todos(`Form_${nuevo_campo}`)}
                Titulo_tabla={Titulo}
                Table = {campo}
                cargaporparte={{condicion:{}}}
                
                Eliminar= {Eliminar[nuevo_campo] ? Eliminar[nuevo_campo] : '_id'}
                Titulo_dialogo ={(dato)=> dato._id ?  Titulo_dialogo[campo] ? funcion(dato) : `Registro ${dato._id}`: `Nuevo registro en ${Titulo}`}
                Actualizar_valores={Actualizar_valores[campo] ? (valores)=>FActualizar(valores) : (valores)=>valores}
                Titulos_tabla = {Titulos_tabla}
            />
  }
  
  async componentDidMount(){
    
    // let database= await conexiones.DataBase();
    let Bloques1={};
    const sistema = Ver_Valores().valores.app;
    let models=[`${sistema}_Portada`, `${sistema}_Articulo`,`${sistema}_Asignatura`,`${sistema}_Cuenta`, `${sistema}_Reporte`,
                `${sistema}_Mensualidad`,`${sistema}_User_api`, `${sistema}_Recibo`
              ]
    // models.map(async(val,i)=>{
    for (var i = 0; i < models.length; i++){
      
      const val =  models[i];
      
      if ((val.indexOf(sistema)!==-1 )  && ['Api'].indexOf(val)===-1 ){
        let nuevo = MaysPrimera(val)
        switch(val){
          case `${sistema}_User_api`:{
            nuevo= 'USUARIOS'
            break;
          }
          case `${sistema}_Articulo`:{
            nuevo= 'ARTICULOS'
            break;
          }
          case `${sistema}_Asignatura`:{
            nuevo= 'ASIGNATURAS'
            break;
          }
          case `${sistema}_Cuenta`:{
            nuevo= 'CUENTAS BANCARIA'
            break;
          }
          case `${sistema}_Reporte`:{
            nuevo= 'REPORTES'
            break;
          }
          case `${sistema}_Mensualidad`:{
            nuevo= 'SOLVENCIAS'
            break;
          }
          case `${sistema}_Portada`:{
            nuevo= 'PORTADAS'
            break;
          }
          default:{

          }
        }
          
        Bloques1[nuevo]=await this.Editores(val);
      }
      // return {_id:i, titulo:val, value:val}
    }//)
   
    let Bloques={
     
      ...Bloques1
    }
    console.log(Bloques)
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
