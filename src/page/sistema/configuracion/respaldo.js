import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Unstable_Grid2';
import IconButton from '@mui/material/IconButton';
import Icon from '@mui/material/Icon';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import moment from 'moment';
import { MaysPrimera, conexiones } from '../../../constantes';
import Scrollbars from '../../../componentes/herramientas/scrolbars';
import fileDownload from 'js-file-download'

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function Respaldo() {
    const [lista, setLista] = React.useState([]);
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
    const Listados = async() =>{
        let database= await conexiones.DataBase();
        console.log(database)
        const models = database.database
        // .filter(f=>['servers','user_apis','uploads.files','apis','uploads.chunks','uecla_eliminados'].indexOf(f)===-1)
        .map((val,i)=>{
            let titulo = val.substring(0, val.length - 1);
            if (titulo.indexOf('uecla')!==-1){
                let nuevo = titulo.split('_');
                titulo = nuevo[0]+'_'+MaysPrimera(nuevo[1]).trim();
                if (nuevo[2]){
                    titulo+= '_'+nuevo[2];
                }
            }else{
                titulo = MaysPrimera(titulo).trim();
            }
            return {_id:i, titulo: titulo};
        })//.filter(f=>f.titulo.indexOf(api.api)!==-1);
        // database.models=models;
        // let progreso=0;
        // const hoy = new Date();
        // const fecha=moment(hoy).format('DD-MM-YYYY HH:mm');
        setLista(models);
        setChecked([]);
        setListac([]);
    }   
    const Respaldar = async()=>{
        // let progreso=0;
        const hoy = new Date();
        const fecha=moment(hoy).format('DD-MM-YYYY HH:mm');
        let nuevachecked = [];
        // checked.map(async (data,i)=>{
        for (var i=0; i<checked.length; i++){
            let data= checked[i];
            let resultados= await conexiones.Leer_C([data.titulo],{[data.titulo]:{}}, 100000); 
            const valor=  resultados.datos[data.titulo].map(val=>{
                return {...val, _id:{"$oid":val._id}}
            });
            fileDownload(JSON.stringify(valor, null, 2),data.titulo+'-'+fecha+".json")   
            // var file = new File(
            //                     [JSON.stringify(valor, null, 2)],
            //                     data.titulo+'-'+fecha+".json",
            //                     {type:"text/plain;charset=utf-8"}
            //                   );
      
            // // obtienes una URL para el fichero que acabas de crear
            // var url  = window.URL.createObjectURL(file);
      
            // // creas un enlace y lo añades al documento
            // var a = document.createElement("a");
            // document.body.appendChild(a);
      
            // // actualizas los parámetros del enlace para descargar el fichero creado
            // a.href = url;
            // a.download = file.name;
            // a.click();
            
            // window.URL.revokeObjectURL(url);
            nuevachecked=[...nuevachecked,data]
            setListac(nuevachecked);
          }//)
    }
    return (
        <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
            <Grid xs={12}>
                <Item sx={{bgcolor:'#000', color:'#fff'}}>RESPALDAR DATOS</Item>
            </Grid>
            <Grid xs={window.innerWidth > 750 ? 4 : 12}>
                <Item>
                    <IconButton color="primary" onClick={Listados} size="large">
                        <Icon>list</Icon>
                    </IconButton>
                    <IconButton color="primary" onClick={Respaldar} size="large">
                        <Icon >download</Icon>
                    </IconButton>
                </Item>
            </Grid>
            <Grid xs={window.innerWidth > 750 ? 4 : 12}>
                <Item>
                    <ListItem
                        secondaryAction={
                            checked.length===lista.length
                            ?   <Icon>delete</Icon>
                            :   <Icon>done_all</Icon>
                        }
                    >
                        <ListItemButton role={undefined}  dense onClick={SeleccionarT} title={checked.length!==lista.length ? 'Seleccionar Todos' : 'Quitar todos'}>
                            <ListItemText primary={`Total de table: ${lista.length}, Seleccionadas: ${checked.length}`} />
                        </ListItemButton>
                    </ListItem>
                    <Scrollbars sx={{height:window.innerWidth > 750 ? window.innerHeight * 0.65 : window.innerHeight * 0.2}}>
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
            <Grid xs={window.innerWidth > 750 ? 4 : 12}>
                <Item>
                    <ListItem>
                        <ListItemButton role={undefined}  dense onClick={SeleccionarT} title={checked.length!==lista.length ? 'Seleccionar Todos' : 'Quitar todos'}>
                            <ListItemText primary={`Tablas copiadas: ${listac.length} de ${checked.length}`} />
                        </ListItemButton>
                    </ListItem>
                    <Scrollbars sx={{height:window.innerWidth > 750 ? window.innerHeight * 0.65 : window.innerHeight * 0.2}}>
                        <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                            {listac.map((value) => {
                                return (
                                    <ListItem
                                        key={value._id}
                                    > 
                                        <ListItemText id={value._id} primary={value.titulo} />   
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
