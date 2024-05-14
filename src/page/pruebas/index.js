import React, {useState} from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { conexiones, Ver_Valores } from '../../constantes';

const options = [
  'None',
  'Atria',
  'Callisto',
  'Dione',
  'Ganymede',
  'Hangouts Call',
  'Luna',
  'Oberon',
  'Phobos',
  'Pyxis',
  'Sedna',
  'Titania',
  'Triton',
  'Umbriel',
];

const ITEM_HEIGHT = 48;

export default function LongMenu() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [datos,setDatos] = useState();
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  React.useEffect(()=>{
    const Inicio = async() =>{
      const resp= await conexiones.Leer_C(['uecla_Whatsapp_Capture'],{uecla_Whatsapp_Capture:{}});
      if (resp.Respuesta==='Ok'){
       let nuevo = resp.datos.uecla_Whatsapp_Capture.map(val=>{
        // var buffer = Buffer.from(val.valores.media.data, 'base64');
        // var buffer = btoa(val.valores.media.data);
        return {...val.valores, img:val.valores.media.data}
       })
       console.log(nuevo);
       setDatos(nuevo);
      }
      

    }
    Inicio()
  },[])
  
  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: '20ch',
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} selected={option === 'Pyxis'} onClick={handleClose}>
            {option}
          </MenuItem>
        ))}
      </Menu>
      {/* {datos 
        ? datos.map(val=>
            <img
              src={`data:image;base64,${val.img}`}
              
            />
          )
        : null
      } */}
    </div>
  );
}