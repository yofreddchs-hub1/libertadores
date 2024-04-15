import * as React from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@mui/material/CssBaseline';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Fade from '@mui/material/Fade';
import Menu from './menu';
import Enconstruccion from '../herramientas/pantallas/enconstruccion';
import Scrollbars from '../herramientas/scrolbars';
import { Ver_Valores } from '../../constantes';


function ScrollTop(props) {
  const { children, window } = props;
  // console.log(window)
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-anchor',
    );

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
      });
    }
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        {children}
      </Box>
    </Fade>
  );
}

ScrollTop.propTypes = {
  children: PropTypes.element.isRequired,
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default function BackToTop(props) {
  const [state,setState] = React.useState(()=>{
    const Inicio= props.pantallas ? props.pantallas.Inicio : undefined
    return {
      Pantalla: props.Pantalla ? props.Pantalla : Inicio ? <Inicio {...props}/> : undefined ,
      Seleccion: props.Seleccion ? props.Seleccion : props.pantallas ? 'Inicio' : undefined
    }
  });
  
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const Buscar_pantalla = async (listas, seleccion) =>{
    let Pantallas={}
    // Object.keys(listas).map(async v=>{
    for (var i=0 ; i<Object.keys(listas).length; i++ ){ 
      let v=Object.keys(listas)[i];
      if (typeof listas[v]==='object'){
        let nuevo= await Buscar_pantalla(listas[v], seleccion)
        Pantallas={...Pantallas, ...nuevo}
      }else if(v===seleccion){
        const P = listas[v]
        Pantallas[v]=<P {...props}/>
      }  
      // return v
    }//)
    
    return Pantallas
  }
  const Seleccion_pantalla = async(value, padre)=>{
    // let {Config}= props;
    // this.Sacar(Config.Menu)
    // console.log(value)
    let seleccion= value.pantalla ? value.pantalla : value.value;
    let pantalla= value.primary;
    
    let Pantallas= await Buscar_pantalla(props.pantallas, seleccion)
    
    seleccion = Pantallas[seleccion] ? Pantallas[seleccion] :  <Enconstruccion />
    
    setState({...state, Pantalla:seleccion, Seleccion:pantalla})

  }
  React.useEffect(()=>{
    if(props.Seleccion!==undefined && state.Seleccion!==props.Seleccion){
      const menus = Ver_Valores().config.Menu;
      const pos = menus.findIndex(f=> f.value===props.Seleccion);
      if (pos!==-1){
        console.log(state.Seleccion, props.Seleccion, props)
        Seleccion_pantalla(menus[pos]);
        props.Cambiar(undefined)
      }
      
      // Seleccion_pantalla({pantalla:props.Seleccion, })
    }
  },[props])
  return (
    <React.Fragment>
      <CssBaseline />
      <Menu {...props} {...state} Seleccion_pantalla= {Seleccion_pantalla}/>
      {/* <Toolbar id="back-to-top-anchor" /> */}
      <Scrollbars component="div" sx={{padding:1, height:window.innerHeight * 0.93, width: window.innerWidth, ...props.Config.Estilos.Fondo_pantalla}}
         onScroll={(props)=>{
            var y = window.scrollY;
            
            // console.log(y, window.pageYOffset)
            // console.log(props)
         }}   
      >
        {/* <Box sx={{ }}> */}
          {state.Pantalla }
        {/* </Box> */}
        {/* <Box style={{
                      position:'absolute',
                      bottom:2,
                      right:5,
                      
                    }}
        >
          <Typography variant="caption" display="block" sx={{marginTop:-1}}aria-owns={open ? 'mouse-over-popover' : undefined}
            aria-haspopup="true"
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={handlePopoverClose}
          >
            <img
            src={Logo}
            alt={'CHS'}
            loading="lazy"
            style={{height:40, opacity:0.5}}
          />
          </Typography>
          <Popover
            id="mouse-over-popover"
            sx={{
              pointerEvents: 'none',
            }}
            open={open}
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
            onClose={handlePopoverClose}
            disableRestoreFocus
          >
            <Typography variant="caption" display="block" sx={{ pl:1, pr:1, pt:0.5  }}>Ing. Yofredd Chirino</Typography>
            <Typography variant="caption" display="block" sx={{ pl:1, pr:1, pb:0.5 }}>Telf.: 04127517660</Typography>
          </Popover>
        </Box> */}
      </Scrollbars>
      <ScrollTop {...props}>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUpIcon />
        </Fab>
      </ScrollTop>
    </React.Fragment>
  );
}
