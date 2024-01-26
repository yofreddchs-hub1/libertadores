import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Scrollbars from '../../../componentes/herramientas/scrolbars';
import Checkbox from '@mui/material/Checkbox';
import PropTypes from 'prop-types';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { Ver_Valores, conexiones } from '../../../constantes';

function CircularProgressWithLabel(props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="caption" component="div" color="text.secondary">
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

CircularProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate variant.
   * Value between 0 and 100.
   * @default 0
   */
  value: PropTypes.number.isRequired,
};

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function Sincronizar() {
  
  const [lista, setLista] = React.useState(()=>{
    let listado = Ver_Valores().valores.lista_sincronizar.map(val=>{
      let valor = {...val};
      if (valor.campos){
        // console.log(Ver_Valores().config.Listas);
        valor.campos = valor.campos.map(campo=>{
          let camp={...campo}
          if (camp.lista){
            camp.lista = Ver_Valores().config.Listas[camp.lista];
          }
          return {...camp}
        })
      }

      return {...valor}
    });
    return listado
  });
  
  const [listac, setListac] = React.useState([]);
  const [checked, setChecked] = React.useState([]);
  const handleToggle = (value) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };
  const SeleccionarT = () =>{
      if (lista.length===checked.length){
          setChecked([]);
      }else{
          setChecked([...lista])
      }
      
  }
  const SincronizarAN =async()=>{
    const resp = await conexiones.Sincronizar_uecla({destino:'Nuevo', seleccion:checked});
  }
  const SincronizarNA = async()=>{
    const resp = await conexiones.Sincronizar_uecla({destino:'Anterior', seleccion:checked});
  }
  const Verificar_inscripcion = async()=>{
    console.log('verificar');
    conexiones.VerInscripcion_uecla();
  }
  const Actualizar = async()=>{
    
    Ver_Valores().socket.on('Sincronizando_uecla',(datos)=>{
      const pos = listac.findIndex(f=>f.titulo===datos.tabla);
      setListac(datos.sincronizado);
      // if (pos!==-1){
      //   let nuevo = [...listac];
      //   nuevo[pos].progreso = Number(datos.guardado)*100 / Number(datos.guardar);
      //   setListac(nuevo);
      // }else{
      //   let nuevo = [...listac,{_id:listac.length, titulo:datos.tabla, progreso:Number(datos.guardado)*100 / Number(datos.guardar)}];
      //   setListac(nuevo);
      // }
    })
  }
  React.useEffect(()=>{
    Actualizar();
  },[])
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid xs={12}>
            <Item sx={{bgcolor:'#000', color:'#fff'}}>SINCRONIZAR DATOS</Item>
        </Grid>
        <Grid xs={4}>
              <Item>
                  <IconButton color="primary"  title={'Sincronizar desde sistema anterior a nuevo'} size="large" onClick={SincronizarAN}>
                      <Icon>swipe_right</Icon>
                  </IconButton>
                  <IconButton color="primary"  title={'Sincronizar desde sistema nuevo a anterior'} size="large" onClick={SincronizarNA}>
                      <Icon >swipe_left</Icon>
                  </IconButton>
                  <IconButton color="primary"  title={'Verificar Inscripción'} size="large" onClick={Verificar_inscripcion}>
                      <Icon >check_circle</Icon>
                  </IconButton>
              </Item>
        </Grid>
        <Grid xs={4}>
            <Item>
                <ListItem>
                    <ListItemButton role={undefined}  dense >
                        <ListItemText primary={`Lista a Sincronizar`} />
                    </ListItemButton>
                </ListItem>
                <Scrollbars sx={{height:window.innerHeight * 0.65}}>
                    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                        {lista.map((value) => {
                            return (
                                <ListItem
                                    key={value._id}
                                    
                                    disablePadding
                                >
                                    <ListItemButton role={undefined} onClick={handleToggle(value)} dense>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge="start"
                                            checked={checked.indexOf(value) !== -1}
                                            tabIndex={-1}
                                            disableRipple
                                            inputProps={{ 'aria-labelledby': value._id }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText id={value._id} primary={value.titulo} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Scrollbars>
            </Item>
        </Grid>
        <Grid xs={4}>
            <Item>
                <ListItem>
                    <ListItemButton role={undefined}  dense >
                        <ListItemText primary={`Lista Sincronizada`} />
                    </ListItemButton>
                </ListItem>
                <Scrollbars sx={{height:window.innerHeight * 0.65}}>
                    <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                        {listac.map((value) => {
                            return (
                                <ListItem
                                    key={value._id}
                                    
                                    disablePadding
                                >
                                    <ListItemButton role={undefined} dense>
                                    <ListItemIcon>
                                      <CircularProgressWithLabel value={value.progreso ? value.progreso : 0} />
                                    </ListItemIcon>
                                    <ListItemText id={value._id} primary={`${value.titulo} : ${value.guardado ? value.guardado : 0}/${value.guardar ? value.guardar : 0}`} />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                </Scrollbars>
            </Item>
        </Grid>
        
      </Grid>
    </Box>
  );
}
