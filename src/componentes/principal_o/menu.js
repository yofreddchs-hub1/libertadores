import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ListItemIcon from '@mui/material/ListItemIcon';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Icon from '@mui/material/Icon';
import CircularProgress from '@mui/material/CircularProgress';
import { Iniciar_data, Ver_Valores, Permiso } from '../../constantes';
import logo from '../../imagenes/logo512.png';
import Logo from '../../imagenes/logor.png'
import Popover from '@mui/material/Popover';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import MensajeTool from '../herramientas/mensaje';
import Scrollbars from '../herramientas/scrolbars';
import Alert from '@mui/material/Alert';

const letra= 14;
const ResponsiveAppBar = (props) => {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [selectedIndex, setSelectedIndex] = React.useState();
  const [listado,setListado] = React.useState();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [open, setOpen] = React.useState({});
  const {Config, User, conectado, conectadoserver, sincronizando, Actualizando} = props; 

  React.useEffect(()=>{
    const Inicio_listado =async()=>{
      if (Config.Menu.length===1 ){
          setListado(Config.Menu)
      }else{
          let nuevo=[];
          for (var i=0; i<Config.Menu.length;i++){
              let f=Config.Menu[i];
              const permiso=props.Api ? await Permiso(f.value, props.Api) : await Permiso(f.value);
              f.libre = f.libre===true || f.libre ==='true' ? 'true' : 'false';
              f.app_chs = f.app_chs===true || f.app_chs ==='true' ? 'true' : 'false';
              
              if (f.libre ==='true' || permiso){
                  nuevo=[...nuevo,f];   
              }
              
          }
          
          setListado(nuevo) 
          if (selectedIndex===undefined) setSelectedIndex(nuevo[0].value)
      } 
    }
    Inicio_listado()
  },[User])

  const [anchorEl1, setAnchorEl1] = React.useState(null);
  const open1 = Boolean(anchorEl1);
  const handlePopoverOpen = (event) => {
    setAnchorEl1(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl1(null);
  };

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = (index,padre) => {
    setAnchorElNav(null);
    if (index)
      setSelectedIndex(index.value)
    if (props.Seleccion_pantalla){
      
      props.Seleccion_pantalla(index, padre)
  }
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };
  
  const handleClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setOpen({...open, [item.value]:Boolean(event.currentTarget)})
  };
  const handleClose = (item) => {
    setAnchorEl(null);
    setOpen({...open, [item.value]:false})
  };

  if (selectedIndex===undefined && Config.Menu) setSelectedIndex(Config.Menu[0].value)

  const Menus = (menus, reducido)=>{
    const {tipo, User, categoria_usuario} = Ver_Valores();
    // User && User!==null && 
    let categoria = !User ? undefined:User.categoria._id ? categoria_usuario[User.categoria._id] : categoria_usuario[User.categoria];
    if (User && User.permisos){
      // categoria.permisos=[...categoria.permisos, ...User.permisos.split(',')];
      User.permisos.split(',').map(valor=>{
        if (categoria.permisos.indexOf(valor)===-1){
          categoria.permisos= [...categoria.permisos, valor];
        }
        return valor
      })
    }
    return !User ? null : menus.map((page,i) => {
      let mostrar = false;
      
      if( //Libres
          page.libre==='true'
          // Representante
          || (page.libre==='false' && ([4,'4'].indexOf(User.categoria)!==-1 && page.representante))
          //Configuracion solo web
          || (page.libre==='false' && [0,'0'].indexOf(User.categoria)!==-1 && (tipo==='Web' && page.web))
          //Administracion 
          || (page.libre==='false' && ([0,'0', 1, '1'].indexOf(User.categoria)!==-1 && !page.representante && !page.web))
          //Los demas
          || (page.libre==='false' && (categoria.permisos.indexOf('*')!==-1 && !page.representante && !page.web))
          || (page.libre==='false' && (categoria.permisos.indexOf(page.value)!==-1 && !page.representante && !page.web))
        ){
        mostrar = true;
      }//else if (page.libre==='false' &&(tipo==='Web' && page.web)){//Adminstrativo
          //Representante
        //mostrar = true;
          
      //}//else if(!page.libre &&(tipo==='Electron' && page.web)){//Adminstrativo
          
      //   mostrar=falstrue
      // }
      return mostrar ? (
      <div key={page.value+i}>
        <Button
          id={page.value}
          aria-controls={open[page.value] ? 'basic-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open[page.value] ? 'true' : 'false'}
          onClick={page.childen ? (event)=>handleClick(event, page) : ()=>handleCloseNavMenu(page)}
          endIcon={page.childen ? <KeyboardArrowDownIcon /> : null}
          startIcon={
            <Icon  sx={{...Config.Estilos 
                          ? {color:Config.Estilos.Barra_menu.color} : {}, 
                          ...reducido 
                          ? {width:'90%', color:'#000', textAlign:'left'} 
                          : {}}
            }>
              {page.icon}
            </Icon>
          }
          sx={{...Config.Estilos ? {color:Config.Estilos.Barra_menu.color} : {}, marginRight:0.5, //opacity: selectedIndex===page.value ? 0.5 : 1, 
              borderColor: Config.Estilos.Barra_menu.color, borderWidth:2,
              fontSize: tipo==='Electron' ? letra : letra-2,
              ... reducido ? {width:'100%', color:'#000', boderColor:'#000', borderWidth:2, textAlign:'left'} : {}
          }}
          variant={selectedIndex===page.value ? "outlined" : ""}
        >
          {page.primary}
        </Button>
        {page.childen ? 
          <Menu
            id={`Basic-${page.value}`}
            anchorEl={anchorEl}
            open={open[page.value] ? true : false}
            onClose={()=>handleClose(page)}
            MenuListProps={{
              'aria-labelledby': 'basic-button',
            }}
          >
            {page.childen.map(val=>
              categoria &&
              (
                categoria.permisos.indexOf('*')!==-1
                ||
                categoria.permisos.indexOf(val.value)!==-1
              )
              ?
              <MenuItem key={val.value} 
                onClick={()=>{
                  handleCloseNavMenu(val,page);
                  handleClose(page);
                }} 
                sx={{ marginRight:1, opacity: selectedIndex===val.value ? 0.5 : 1}}
              >
                <ListItemIcon>
                    <Icon >{val.icon}</Icon>
                </ListItemIcon>
                <Typography textAlign={reducido ? "left" : "center"} >{val.primary}</Typography>
              </MenuItem>
              : null
            )}
          </Menu>
          : null
        }
        {/* <MenuItem key={page.value} onClick={()=>handleCloseNavMenu(page)} sx={{ marginRight:1, opacity: selectedIndex===page.value ? 0.5 : 1}}>
          <ListItemIcon>
              <Icon  sx={{...Config.Estilos ? Config.Estilos.Input_label : {}}}>{page.icon}</Icon>
          </ListItemIcon>
          <Typography textAlign="center" sx={{...Config.Estilos ? Config.Estilos.Input_label : {}}}>{page.primary}</Typography>
        </MenuItem> */}
      </div>
    ): null})
  }
  let persona=''
  if (props){
    if (props.User){
      persona=`${ props.User && props.User.username ? props.User.username.toUpperCase() : ''} `;  
    }

  }
  const http  = Ver_Valores() && Ver_Valores().valores ? Ver_Valores().valores.http : 'no encontrado';
  
  const tasa = Ver_Valores().tasa ? Ver_Valores().tasa : {};
  let porcentaje =0;
  if (Actualizando && Object.keys(Actualizando).length!==0){
    let cantidad = Actualizando[Object.keys(Actualizando)[0]].cantidad;
    cantidad = cantidad ==='?' || cantidad ===0 ? 100 : cantidad
    porcentaje = Number(Actualizando[Object.keys(Actualizando)[0]].pag) 
                  * Actualizando[Object.keys(Actualizando)[0]].datos.length 
                  * 100 / Number(cantidad);

  }
  return (
    <AppBar position="static" sx={{...Config.Estilos ? Config.Estilos.Barra_menu : {}}}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} /> */}
          <img  src={logo}  className={'logo'} 
                         style={{ height:40, width:40, ...Config.Estilos.Logo ? Config.Estilos.Logo : {} }} 
                         alt="logo" 
          /> 
          <Typography
            variant={window.innerWidth > 750 ? "h6" : "subtitle1"}
            noWrap
            component="a"
            href="/"
            sx={{
              ml:2,
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              ...Config.Estilos ? {color:Config.Estilos.Barra_menu.color} : {}
            }}
            title={`Servidor : ${http}`}
          >
            {Config && Config.Titulo ? Config.Titulo : 'CHS+'}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' },  }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
              sx={{...Config.Estilos ? {color:Config.Estilos.Barra_menu.color} : {}}}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{display: { xs: 'block', md: 'none' }}}
            >
              <Box >
              {Config && Config.Menu && listado 
                ? Menus(listado, true)
                // ? listado.map((page) => (
                //     <MenuItem key={page.value} onClick={()=>handleCloseNavMenu(page)}>
                //       <ListItemIcon>
                //           <Icon >{page.icon}</Icon>
                //       </ListItemIcon>
                //       <Typography textAlign="center" >{page.primary}</Typography>
                //     </MenuItem>
                //   ))
                : null}
              </Box>
            </Menu>
          </Box>
          {/* <AdbIcon sx={{ display: { xs: 'flex', md: 'none' }, mr: 1 }} /> */}
          <Typography
            variant={window.innerWidth > 750 ? "h6" : "subtitle1"}
            noWrap
            component="a"
            href=""
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontFamily: 'monospace',
              fontWeight: 700,
              letterSpacing: '.3rem',
              color: 'inherit',
              textDecoration: 'none',
              ...Config.Estilos ? {color:Config.Estilos.Barra_menu.color} : {}
            }}
          >
            {Config && Config.Titulo ? Config.Titulo : 'CHS+'}
          </Typography>
          
          <Scrollbars sx={{ flexGrow: 1, width:window.innerWidth * 0.4, overflow:'auto' ,display: { xs: 'none', md: 'flex' } }}>
            {Config && Config.Menu && listado
              ? Menus(listado) 
              : null
            }
          </Scrollbars>
          
          <Box sx={{  alignItems:'center' }}>
            <IconButton  color="inherit" 
                onClick={async()=>{
                  window.open('https://www.bcv.org.ve/');
                }}
            >
                <Typography
                    variant="subtitle"
                    noWrap
                    component="div"
                    sx={{ display: { xs: 'none', md: 'flex' }, marginRight:1, fontSize:16 }}
                    href={'https://www.bcv.org.ve/'}
                    
                >
                  {tasa.USD ? `USD  ${String(Number(tasa.USD).toFixed(4)).replace('.',',')}` : `USD 0.0000`}
                </Typography>
                <Typography
                    variant="subtitle"
                    noWrap
                    component="div"
                    sx={{ display: { xs: 'flex', md: 'none' }, marginRight:1, fontSize: letra }}
                    href={'https://www.bcv.org.ve/'}
                    
                >
                  {tasa.USD ? `USD  ${String(Number(tasa.USD).toFixed(4)).replace('.',',')}` : `USD 0.0000`}
                </Typography>
            </IconButton>
            <IconButton size="large" color="inherit" 
              onClick={async()=>{
                if (Ver_Valores().tipo==='Electron'){
                  confirmAlert({
                    title: 'Eliminar?',
                    message:'Desea eliminar datos locales?',
                    buttons: [
                      {label: 'SI', onClick: async()=>{
                        await Iniciar_data();
                        await Ver_Valores().Sincronizar();
                      }},
                      {label:'NO'}
                    ]
                  });
                }  
              }}
            >
              {conectadoserver && sincronizando && Ver_Valores().tipo ==='Electron'
                ? <MensajeTool title={
                      <div>
                        Sincronizando:
                        {Actualizando 
                          ? Object.keys(Actualizando).map(val=>
                            <div key={val}>{`${val.split('_')[1]} (${(Number(Actualizando[val].pag))*Actualizando[val].datos.length} / ${Actualizando[val].cantidad})`}</div>
                          ) : null
                        }
                      </div>
                    }
                  >
                    {/* {Actualizando === undefined 
                      ?  */}
                      <CircularProgress size={20} sx={{color:'#fff'}} title={Ver_Valores().mensaje_sincronizando}/> 
                      {/* : <CargaCircular  size={30} title={Ver_Valores().mensaje_sincronizando} 
                            value={ porcentaje }
                        />
                    }  */}
                  </MensajeTool>
                : conectadoserver 
                  ? <Icon title={'Conectado servidor'}>cloud_queue</Icon> 
                  : <Icon title={'Desconectado del servidor'}>cloud_off</Icon>
              }
            </IconButton>
            {conectado ?<Icon title={'Conectado a internet'}>wifi</Icon> :<Icon title={'Desconectado del internet'}>wifi_off</Icon>}
            
            <Tooltip title={ persona ? persona : "Cuenta"}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0, ml:1}}>
                <AccountCircle sx={{...Config.Estilos ? {color:Config.Estilos.Barra_menu.color} : {}}}/>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px'}}
              id="menu-appbar"
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {props.User && props.User.username ? <MenuItem 
                              onClick={()=>{
                                props.Login()
                                handleCloseUserMenu()
                              }}
                            >Salir</MenuItem>
                :<div>
                  <MenuItem onClick={()=>{
                                if (props.Login) props.Login()
                                handleCloseUserMenu()
                              }}
                  >Iniciar</MenuItem>
                  
                </div>
              }
            </Menu>
            <Box sx={{ml:1}}>
              <Typography variant="caption" display="block" sx={{marginTop:-1}}aria-owns={open ? 'mouse-over-popover' : undefined}
                aria-haspopup="true"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
              >
                <img
                  src={Logo}
                  alt={'CHS'}
                  loading="lazy"
                  style={{height:20, opacity:0.5}}
                />
              </Typography>
              <Popover
                id="mouse-over-popover"
                sx={{
                  pointerEvents: 'none',
                }}
                open={open1}
                anchorEl={anchorEl1}
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
            </Box>
          </Box>
        </Toolbar>
        {[4,'4'].indexOf(User.categoria)!==-1 && !User.valores.password
          ? <Box sx={{p:1}}> 
              <Alert severity="error">
                  {`El Representante ${User.valores.nombres} ${User.valores.apellidos}, no a creado contraseña`}
              </Alert>
            </Box>
          : null
        }
        
      </Container>
      
    </AppBar>
  );
};
export default ResponsiveAppBar;
