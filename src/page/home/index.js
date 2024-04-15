import React,{useState} from 'react';
import Box from '@mui/material/Box';
import Logo from '../../imagenes/logo512.png';
import { Ver_Valores, conexiones } from '../../constantes';
import Carrusel from '../../componentes/carrusel/nuevo';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';

export default function InicioUecla(props) {
  const [datos,setDatos] = useState();
  const [censo,setCenso] = useState();
  React.useEffect(()=>{
    const Inicio = async() =>{
      const {User} = props;
      let censos = [];
      const resp= await conexiones.Leer_C(['uecla_Portada','uecla_Censo'],{uecla_Portada:{},uecla_Censo:{}});
      if (resp.Respuesta==='Ok'){
       let nuevo = resp.datos.uecla_Portada.map(val=>{
        return {...val.valores, label:val.valores.caption, imgPath: val.valores.filename[0]}
       })
       censos= resp.datos.uecla_Censo.sort((a,b) => a.valores.periodo> b.valores.periodo ? -1 : 1).filter(f=> f.valores.estatus || f.valores.publicar);
       if (censos.length!==0){
        setCenso(censos[0].valores);
       }
       setDatos(nuevo);
      }
      if (!User.username && censos.length===0){
        props.Login()
      }

    }
    Inicio()
  },[])
  
  return (
    <Box sx={{ display:'block', alignItems:'center', justifyContent:'center',  height:'100%',  }}>
      
      {censo 
        ? <Alert severity="info" sx={{cursor:'pointer'}} onClick={()=>props.Cambiar('Censo')}>ACTIVO "{censo ? censo.titulo : '...'}"" </Alert>
        : null
      }
      {datos && datos.length !==0 
        ? <Carrusel datos={datos} Cambiar={props.Cambiar}/>
        : <img
            src={Logo}
            alt={'CHS'}
            loading="lazy"
            style={{
              maxHeight: Ver_Valores().tipo==='Electron' ? window.innerHeight * 0.6 : window.innerHeight * 0.8,
              maxWidth: Ver_Valores().tipo==='Electron' ? window.innerWidth * 0.6 : window.innerWidth * 0.8,
            }}
          />
      }
      
    </Box>
  );
}
