import React, {Component} from 'react';
// import MailIcon from '@material-ui/icons/Mail';
// import NotificationsIcon from '@material-ui/icons/Notifications';
import Page from './page';
import { Ver_Valores, conexiones, Form_excel_cols, genera_formulario, Form_todos, Excell, nuevo_Valores } from '../../constantes';

export default class DataExcel extends Component {
  constructor(props) {
      super(props);

      this.state = {
        props: this.props,
        cargando:false,
        data:null,

        cambio:this.cambio,
        Modificar:this.Modificar

      }
  }

  componentDidMount(){

  }
  cambio = async(archivo)=>{
    this.setState({cargando:true});
    const nuevo = await Excell(archivo)
    const seleccion = nuevo.datos.paginas[0];
    let nuevos = await genera_formulario({valores:{}, campos: Form_todos('Form_Lista') });
    nuevos.titulos[0].value.lista.lista=nuevo.datos.paginas;
    nuevos.titulos[0].value.lista.value=seleccion;
    let nuevadata ={...nuevo.datos, seleccion, formulario:nuevos};
    nuevos.titulos[0].value.lista.onChange= (valores)=> this.NuevaSeleccion(valores, nuevadata);

    this.setState({data:nuevadata, filename: nuevo.filename, cargando:false, iniciar:7});
  }
  NuevaSeleccion = (valores,nuevadata) =>{
    const nuevaseleccion = valores.resultados[valores.name];
    nuevadata.seleccion= nuevaseleccion;
    nuevadata.formulario.titulos[0].value.lista.onChange= (valores)=> this.NuevaSeleccion(valores, nuevadata);
    this.setState({data:nuevadata});
  }
  Modificar = (data) =>{
    let {name, value} = data.target;
    console.log(name,value);
    return data
  }
  static getDerivedStateFromProps(props, state) {

    if (props !== state.props) {
      return {
        props,
      };
    }
    // No state update necessary
    return null;
  }

  render(){
    return (
      <Page  {...this.state}/>
    )
  }
}
