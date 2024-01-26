import React,{useState} from 'react';
import Box from '@mui/material/Box';
import Logo from '../../imagenes/logo512.png';
import { Ver_Valores, conexiones } from '../../constantes';
import Carrusel from '../../componentes/carrusel/nuevo';
export default function InicioUecla(props) {
  const [datos,setDatos] = useState()
  React.useEffect(()=>{
    const Inicio = async() =>{
      const {User} = props;
      if (!User.username){
        props.Login()
      }
      const resp= await conexiones.Leer_C(['uecla_Portada'],{uecla_Portada:{}});
      if (resp.Respuesta==='Ok'){
       let nuevo = resp.datos.uecla_Portada.map(val=>{
        return {...val.valores, label:val.valores.caption, imgPath: val.valores.filename[0]}
       })
       setDatos(nuevo);
      }

    }
    Inicio()
  },[])
  
  return (
    <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center',  height:'100%' }}>
      {datos && datos.length !==0 
        ? <Carrusel datos={datos}/>
        : <img
            src={Logo}
            alt={'CHS'}
            loading="lazy"
            style={{
              maxHeight: Ver_Valores().tipo==='Electron' ? window.innerHeight * 0.6 : window.innerHeight * 0.6,
              maxWidth: Ver_Valores().tipo==='Electron' ? window.innerWidth * 0.6 : window.innerWidth * 0.6,
            }}
          />
      }
    </Box>
  );
}
