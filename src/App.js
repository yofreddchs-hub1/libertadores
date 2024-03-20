import React, {Component,  useState} from 'react';
import './App.css';
// import socketIOClient from "socket.io-client";
import { Manager } from "socket.io-client";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SnackbarProvider, useSnackbar } from 'notistack';
// import Snackbar from '@mui/material/Snackbar';
// import moment from 'moment';
import { IconButton } from '@mui/material';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import CloseIcon from '@mui/icons-material/Close';
import Noexiste from './componentes/herramientas/pantallas/noexiste';
import Home from './page/home';
import Esperar from './componentes/esperar';
import Principal  from './componentes/principal';
import Principal1 from './componentes/principal_o';
import Dialogo from './componentes/herramientas/dialogo';
import Formulario from './componentes/herramientas/formulario';
import { pantallas } from './page/pantallas';
import { Inicio, Usuario,nuevo_Valores,genera_formulario, 
          Form_todos, const_procesos, conexiones, Estadolinea, Ver_Valores,
          Sincronizar, 
          Ultima_fecha,
          ActualizarDatos,
          Tasa_cambio
        } from './constantes';

import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css';

class InicioPrincipal extends Component {
  constructor(props) {
      super(props);
      this.state = {
        props: this.props,
        esperar:true,
        Login: this.Login,
        dialogo:{open:false},
        publicidad:false,
        portadas:[],
        conectado:false,
        conectadoserver:false,
        Sincronizar:this.Sincronizar,
        sincronizando:false
      }

  }
  Sincronizar = async() =>{
    let respuesta='Se llamo a sincronizar cuando esta sincronizando';
    // return
    this.setState({sincronizando:true});
    const {sincronizando} = Ver_Valores();
    if (Ver_Valores().tipo==='Electron' && !sincronizando){
      respuesta = await Sincronizar();
    }
    this.setState({sincronizando:false})
    // console.log(respuesta);
    return respuesta;
  }
  Iniciar= async(datos) =>{
    const respuesta= await conexiones.Login(datos);
    if (respuesta.Respuesta==='OK'){
      await Usuario({status:'Guardar', dato:respuesta.user})
      this.setState({
        dialogo:{open:false}
      })
      // this.Refrescar();
      // Sincronizar();
      // window.location.pathname='';
      window.location.reload();
    }
    return respuesta
  }
  
  Salir= async()=>{

    await localStorage.setItem(const_procesos.dir_user,null);
    this.setState({User:null,  dialogo:{open:false}})
    try {
      // window.location.pathname='';
      window.location.reload();
    }catch(error) {

    }
    this.Refrescar()
  }
  
  Login = async()=>{
    const {Config}= this.state;
    const User = await Usuario();
    let nuevos= await genera_formulario({valores:{}, campos: Form_todos('Form_login') },1)
    if(User!==null){
        nuevos.titulos= {username:{...nuevos.titulos['username'], value:User.username, disabled:true}}
    }else {
      nuevos.titulos.password.onKeyPress=this.Iniciar
      nuevos.titulos.password.pos=0;
      nuevos.titulos.password.validar='true';
    }
    const formulario ={
      ...nuevos,
      botones:[
          {
            name:'iniciar', label: User===null ? 'Iniciar' : 'Salir', title:'Iniciar',
            variant:"contained", color: "success", icono: User===null ? 'check' : 'cancel',
            onClick: User===null ? this.Iniciar : this.Salir, validar:'true', 
            sx:{...Config.Estilos.Botones ? User===null ? Config.Estilos.Botones.Aceptar : Config.Estilos.Botones.Eliminar : {}},
          },
      ]
    }
    const {dialogo}=this.state;
    this.setState({
      dialogo:{
        ...dialogo, 
        open:true,
        tam:'xs',
        Titulo:'Inicio',
        Cuerpo:<Formulario {...formulario} Agregar={false}/>,
        Cerrar: ()=>this.setState({dialogo:{open:false}}),
    }
    })
  }
  
  Inicio_Socket =async()=>{
    const {tipo, valores}=Ver_Valores();
    const socketa = Ver_Valores().socket;
    const User = await Usuario();
    if (User===null || User===undefined){
      return
    }
    if (socketa){
      this.setState({socket:socketa});
      return

    }
    const {http}= valores;
    const manager = new Manager(http,{
      reconnectionDelayMax: 10000,
      autoConnect: false
    });

    const socket=manager.socket("/");
    console.log('>>>>', User, valores)
    socket.auth={_id:User._id, username:User.username, tipo, api:valores.app, 
                  categoria: User.categoria, 
                  ...User.categoria==='4' || User.categoria===4 
                    ? {
                        nombres:`${User.valores.nombres} ${User.valores.apellidos}`, 
                        representados:User.valores.representados
                      } 
                    :{}
                }
    socket.on("conectado", async data => {
      const {api}= Ver_Valores();
      console.log('>>>>>>>>>>>>>>>>>>>>>Conectado',data, api);
      this.setState({conectadoserver:true, User:{...User,userID:data.id }});
      nuevo_Valores({conectadoserver:true, User:{...User,userID:data.id }, tasa:data.tasa});
      if (!api || api._id===undefined){
        console.log('Refrescar>>>>>>>>>>>>>')
        this.Refrescar()
        return
      }
      // socket.emit('conectar',{...User, id_socket:data.id})
      // this.Sincronizar();
    })
    socket.on("Usuario_presentes", datos =>{
      // console.log('Usuarios presentes',datos)
    })
    //informacion recibida cada vez que un usuario se conecta a socket
    socket.on("users", async (datos) =>{
      console.log('Usuarios presentes', datos)
      const {User}= Ver_Valores();
      const {users, userID}=datos
      let cantidad=0;
      users.map(val=>{
        if (val._id===User._id) cantidad+=1;
        return val
      })
      //Para mantener una sola conexion por usuario

      // if (cantidad>1 && User.userID!==userID){
      //   // const esp= await this.Sincronizar();
      //   const resp = await conexiones.Leer_C([`${valores.app}_User_api`],{[`${valores.app}_User_api`]:{_id:User._id}})
      //   if (resp.Respuesta==='Ok'){
      //     if(resp.datos[`${valores.app}_User_api`].length!==0 && resp.datos[`${valores.app}_User_api`][0].valores.token!==User.token){
      //       console.log('>>>>>>>', 'Cerrar sesion')
      //       this.Salir();
      //     }
      //   }
      // }
    })
    socket.on("Actualizar_tasa", datos =>{
      //  console.log('Actualizar tasa',datos);
      Tasa_cambio({dato:datos, status:'Guardar'})
      nuevo_Valores(datos);
    })
    socket.on("Sincronizado", datos =>{
      // console.log('Sincronizado',datos);
      
    })
    socket.on("Sincronizando", async(datos) =>{
      // console.log('..........',datos)
      let Actualizando = Ver_Valores().Actualizando ? Ver_Valores().Actualizando : {};
      if (Ver_Valores().tipo==='Electron' && datos.Respuesta==='Ok' ){//&& Actualizando[datos.tabla]
        Actualizando[datos.tabla]= datos;
        nuevo_Valores({Actualizando});
        this.setState({Actualizando});
        Actualizando = await ActualizarDatos(datos, Actualizando, this.props.noticia);
        let sincronizando=true;
        if(Object.keys(Actualizando).length===0){
          sincronizando=false ;
        }
        this.setState({Actualizando, sincronizando});
      }
      
    })
    socket.on("Eliminar", datos =>{
      console.log('Eliminar>>>>>>',datos);
      
    })
    socket.on("Actualizar", async (datos)=>{
      if (datos==='uecla_User_api'){
        this.Refrescar();
      }
      if (Ver_Valores().tipo==='Electron'){
        let fechaexterna = new Date(datos);
        let fechalocal =  await Ultima_fecha();
        fechalocal = new Date(fechalocal);
        //Tiempo de diferencia para modificar datos 10 segundo, cambiado a 5
        fechalocal.setSeconds(fechalocal.getSeconds()+10);
        // console.log(fechaexterna.getTime(),fechalocal.getTime(),fechaexterna.getTime()> fechalocal.getTime())
        if (fechaexterna.getTime()> fechalocal.getTime()){
          // console.log('>>>>>>>>>>>>>>>>>>>>>>Actualizar');
          // this.Sincronizar();
        }
        
      }else{

      }
    })
    socket.io.on("error", (error) => {
      console.log('Error con socket');
      this.setState({conectadoserver:false})
      nuevo_Valores({conectadoserver:false});
    });
    socket.connect();
    this.setState({socket})
    nuevo_Valores({socket})
  }
  Conectado = () =>{
    this.setState({conectado:Estadolinea()})
  }

  Refrescar = async()=>{
    let Config = await Inicio();
    let User = await Usuario();
    if (User && User!==null){
      let nuevo = await conexiones.Leer_C(['uecla_user_api'],{
        uecla_user_api:{'valores.username':User.username}
      })
      if(nuevo.Respuesta==='Ok'){
        nuevo = nuevo.datos.uecla_user_api.length!==0 ? nuevo.datos.uecla_user_api[0].valores : null
        if((nuevo && nuevo.categoria.titulo!== User.categoria.titulo) || (nuevo && nuevo.permisos!==User.permisos)){
          User.categoria= nuevo.categoria;
          User.permisos= nuevo.permisos;
          await Usuario({status:'Guardar', dato:User});
          window.location.reload();
        }
        
      }
    }
    this.setState({Config, User:{...User, userID: this.state.User && this.state.User.userID ? this.state.User.userID : null}, esperar:false});
    window.addEventListener('online', this.Conectado);
    window.addEventListener('offline', this.Conectado);
    this.Conectado();
    const {conectadoserver} = Ver_Valores();
    if (conectadoserver) {
      // this.Sincronizar()
    };
  }

  async componentDidMount(){
    nuevo_Valores({Sincronizar:this.Sincronizar});
    await this.Refrescar();
    this.Inicio_Socket();
  }
  
  componentWillUnmount(){
    
  }

  Sacar=(valores)=>{
    let resultado=[];
    valores.map(val=>{
      if (val.childen){
        resultado=[...resultado, ...this.Sacar(val.childen)];
      }else if (val.path){
        
        resultado=[...resultado,{...val}]
      }
      return val
    })
    return resultado
  }

  Buscar_pantalla = async (listas, seleccion) =>{
    let Pantallas={}
    // Object.keys(listas).map(async v=>{
    for (var i=0 ; i<Object.keys(listas).length; i++ ){ 
      let v=Object.keys(listas)[i];
      if (typeof listas[v]==='object'){
        let nuevo= await this.Buscar_pantalla(listas[v], seleccion)
        Pantallas={...Pantallas, ...nuevo}
      }else if(v===seleccion){
        const P = listas[v]
        Pantallas[v]=<P {...this.state}/>
      }  
      // return v
    }//)
    
    return Pantallas
  }

  Seleccion_pantalla = async(value, padre)=>{
    let {Config}= this.state;
    this.Sacar(Config.Menu)
    let seleccion= value.pantalla ? value.pantalla : value.value;
    let pantalla= value.primary;
    
    
    let Pantallas= await this.Buscar_pantalla(pantallas, seleccion)
    // Object.keys(pantallas).map(v=>{
    //   console.log(v)
    //   console.log( typeof pantallas[v])
    //   if(v===seleccion){
    //     const P = pantallas[v]
    //     Pantallas[v]=<P {...this.state}/>
    //   }  
    //   return v
    // })
    // if (padre){
    //   seleccion = Pantallas[padre.value][seleccion] ? Pantallas[padre.value][seleccion] :  <Noexiste />
    // }else{
      seleccion = Pantallas[seleccion] ? Pantallas[seleccion] :  <Noexiste />
    // }
    this.setState({seleccion, pantalla})

  }
  
  Buscar_link=(link)=>{
    const {Config_Apis}=this.state;
    let resultado = undefined;
    if (Config_Apis!==undefined){
      Object.keys(Config_Apis).map(val=>{
        if (Config_Apis[val].link===link){
          resultado= Config_Apis[val];
        }
        return val;
      })
    }
    return resultado;
  }
  
  render(){
    const {esperar, seleccion, pantalla, Config}=this.state;
    const Pantalla = seleccion ? seleccion : <Home {...this.state} />
    if (['Electron', null].indexOf(Ver_Valores().tipo)===-1 && !esperar){
      console.log('es web')
      // let dir = window.location.pathname.split('/');
      // if (dir[1]!=='') {
      //   const {tipo} = Ver_Valores();
      //   confirmAlert({
      //     title: 'Error-' + tipo,
      //     message: String(dir),
      //     buttons: [{label: 'OK'}]
      //     });
      //     window.location.pathname='';
      // }
    }
    return esperar || Config===undefined ? <Esperar/> : (
      <div> 
        {Config && Config.TipoMenu==='1'
          ?
            <Principal1 
              {...this.state}
              Pantalla={Pantalla}
              Seleccion_pantalla= {this.Seleccion_pantalla}
              Seleccion={pantalla}
              pantallas={pantallas}
            />
          :
            <Principal 
              {...this.state}
              Pantalla={Pantalla}
              Seleccion_pantalla= {this.Seleccion_pantalla}
              Seleccion={pantalla}
              pantallas={pantallas}
            />
        }
        
        <Dialogo {...this.state.dialogo} config={this.state.Config}/>
      </div>
    )
    
      
    
  }
}

function MyApp() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [datos, setDatos]= useState({});
  const [open, setOpen]= useState(false);
  const handleClickVariant = (mensaje, variant) => {
    // variant could be success, error, warning, info, or default
    enqueueSnackbar(mensaje, {variant});
  };
  const handleDismiss = (key) =>{
    closeSnackbar(key)
  }
  const Ver_reporte = (datos) =>{
    setDatos(datos)
    setOpen(true)
  }
  const action = (key, datos) => (
    <div>
      <IconButton onClick={()=> Ver_reporte(datos)}>
          <ManageSearchIcon />
      </IconButton>
      <IconButton onClick={()=>handleDismiss(key)}>
          <CloseIcon />
      </IconButton>
    </div>
  );
  
  const darkTheme = createTheme({
    palette: {
      // mode: 'dark',
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <React.Fragment>
        <InicioPrincipal noticia={handleClickVariant} action={action}/>
      </React.Fragment>
    </ThemeProvider>
  );
}

function App() {
  return (
    <SnackbarProvider maxSnack={2} dense>
        <div className="App">
          <MyApp />
        </div>
    </SnackbarProvider>
  );
}


export default App;

