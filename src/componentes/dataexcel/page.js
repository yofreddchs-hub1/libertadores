import React, {useState} from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Typography } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import {OutTable} from 'react-excel-renderer';
import Scrollbars from '../herramientas/scrolbars';
import Formulario from '../herramientas/formulario';
import Cargando from '../esperar/cargar';
import Modificaciones from './modificaciones';
import './style.css';
import { Ver_Valores, conexiones, Form_excel_cols, genera_formulario, Form_todos, nuevo_Valores } from '../../constantes';
import Logo from './excel.png';

//Icono
import CheckIcon from '@mui/icons-material/Check';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    minWidth:100
  }));
  

function Page (props) {
    const estilos=Ver_Valores().config.Estilos.Datos ? Ver_Valores().config.Estilos.Datos : {}
    const [data, setData] = useState(null)
    const [cargando, setCargando] = useState(false)
    const [progreso, setProgreso] = useState()
    const [filename, setFilename] = useState(null)
    const [dataO, setDataO] = useState(
        {cols:Form_excel_cols(props.props.ColsExcel),
            rows:[]
        }
    )
    
    React.useEffect(()=>{
        if (props.data && props.data.length!==0){
            let nuevoO = {...dataO};
            let columnas = [...dataO.cols];
            let rows=[];
            //props.data.datos[props.data.seleccion.titulo].rows.map((v, i)=>{
            const inicio = props.data.inciar ? props.data.inciar : 0;
            for (let i=inicio; i<props.data.datos[props.data.seleccion.titulo].rows.length ; i++){
                // console.log(v, i, data.rows[i+1], dataO.cols)
                const valor = props.data.datos[props.data.seleccion.titulo].rows[i] ? props.data.datos[props.data.seleccion.titulo].rows[i] : [];
                let row = [];
                if (i===inicio){
                    console.log(valor);
                    const minuscula = valor.map(val=> String(val).toLowerCase());
                    console.log(minuscula)
                    dataO.cols.map((col,j)=>{
                        const pos = minuscula.indexOf(col.name)
                        columnas[j].pos=pos;
                        return col;
                    })
                }else if (valor.length>0){
                    columnas.map(val=>{
                        if (val.pos !==-1 && valor[val.pos]!==undefined){
                            row=[...row, valor[val.pos]];
                        }else if (val.name!=='Item'){
                            row=[...row, '*NO ENCONTRADO*'];
                        }
                        return val
                    })
                    rows=[...rows, row]    
                }
                
                // return v
            }
            //)
            console.log(columnas)
            nuevoO={cols:columnas, rows}
            setDataO(nuevoO)
            setCargando(false);
        }
    },[props.data])
    
    const Procesar = async()=>{
        setCargando(true);
        setProgreso(0);
        const {Table, CampoUnicoExcel} = props;
        nuevo_Valores({esperaSincronizar : true});
        console.log('Procesar', Table,CampoUnicoExcel, dataO)
        const todo = dataO.rows.length;
        for (let i=0; i<dataO.rows.length; i++){
            if (i=== dataO.rows.length-1){
                nuevo_Valores({esperaSincronizar : false});
            }
            const dato = dataO.rows[i];
            let nuevo ={};
            dataO.cols.map((col,pos)=>{
                if (col.name!=='Item'){
                    nuevo[col.name]=dato[pos-1];
                    
                }
                return col
            });
            if(CampoUnicoExcel){
                const campo = `valores.${CampoUnicoExcel}`;
                let resp = await conexiones.Leer_C([Table], {[Table]:{[campo]:nuevo[CampoUnicoExcel]}})
                if (resp.Respuesta==='Ok'){
                    const valor = resp.datos[Table];
                    if (valor.length===0){
                        await conexiones.Guardar({valores:nuevo, multiple_valores:true},Table)
                    }else{
                        
                        await conexiones.Guardar({...valor[0], valores:{_id:valor[0]._id, ...nuevo}, multiple_valores:true}, Table)
                    }
                }
            }else{
                await conexiones.Guardar({valores:nuevo, multiple_valores:true},Table)
            }
            setProgreso(i*100/todo);
        }
        if (props.Cerrar) props.Cerrar()
        setCargando(false);
    }
    const alto= window.innerHeight * 0.35
    let formulario={
        datos:{},
       
        botones:[
            {
              name:'guardar', label:'Procesar', title:'Procesar información',
              variant:"contained", color:"primary",
              icono:<CheckIcon />, style:{...estilos.boton},
              onClick:Procesar,
            },
        ]
    };
    
    return(
        <div>
        <Paper elevation={3} 
            sx={{  width: '100%', padding:2}}>
            {/* <Map {...this.state}  config={config}/> */}
            {/* Modulo para probar las cosas por ahora */}
            <Grid container spacing={0.2}>
                <Grid xs={4}>
                    <IconButton color="primary" aria-label="upload picture" component="label" title={'Abrir Archivo'}>
                        <input hidden required type={'file'} name={'file'} id={'file'} accept='.xlsx, .xls' onChange={props.cambio}/>
                        <label >Abrir</label>
                        <img alt={'archivo'} src={Logo} height={60}/>
                        <label >{props.filename}</label>
                    </IconButton>
                    
                </Grid>
                <Grid xs={4}>
                    {dataO && data
                        ? <Formulario {...formulario} config={props.config}/>
                        : null
                    }
                </Grid>
            </Grid>
            <div style={{marginBottom:-10}}/>
            <Typography variant="h6" gutterBottom component="div">
                Datos Originales
            </Typography>
            {props.data && props.data.formulario
                ? <Formulario {...props.data.formulario} config={props.config}/>
                : null
            }
            <Scrollbars 
                sx={{overflow:'auto', paddingButtom:10, height:alto,  width: window.innerWidth * 0.93, color:'#000'}}
            >
                {props.data && props.data.seleccion
                    ? <OutTable data={props.data.datos[props.data.seleccion.titulo].rows} columns={props.data.datos[props.data.seleccion.titulo].cols} tableClassName="ExcelTable2007" tableHeaderRowClass="heading" />
                    : null
                }
            </Scrollbars>
            
            <Stack
                direction="row"
                spacing={1}
                sx={{marginY:2}}
            >
                <Typography variant="h6" gutterBottom component="div">
                    Datos Ordenados
                </Typography>
                <Modificaciones {...props}/>
            </Stack>
            
            <Scrollbars 
                sx={{overflow:'auto', paddingButtom:10, height:alto, width: window.innerWidth * 0.93, color:'#000'}}
            >
                {dataO && props.data
                    ? <OutTable data={dataO.rows} columns={dataO.cols} tableClassName="ExcelTable2007" tableHeaderRowClass="heading" />
                    : null
                }
            </Scrollbars>
            
        </Paper>
        <Cargando open={props.cargando} Config={props.config} progreso={progreso}/>
        </div>
    )
}

export default Page;