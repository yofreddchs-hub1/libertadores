import React, {useState, useEffect} from 'react';
import { styled } from '@mui/material/styles';
import { Table } from 'react-bootstrap';
import Alert from '@mui/material/Alert';
import moment from "moment";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Dialogo from '../herramientas/dialogo';
import Formulario from '../herramientas/formulario';
import { Form_todos, genera_formulario, conexiones } from '../../constantes';

import CheckIcon from '@mui/icons-material/Check';
import CancelIcon from '@mui/icons-material/Cancel';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

let data={
    titulo:['Hora','Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'],
    Hora:{inicio:'07:00', final: '18:00', cantidad:45},
    datos:[]
}
export default function Horarios(props) {
    const [Data, setData]= useState(props.Data ? props.Data : data)
    const [dialogo, setDialogo]= useState({
        open:false,  
    });
    console.log(props)
    const CalcularHora = async()=>{
        let datos=[]
        var fecha = new Date();
        fecha.setHours(Number(Data.Hora.inicio.split(':')[0]));
        fecha.setMinutes(Number(Data.Hora.inicio.split(':')[1]));
        fecha.setSeconds(0);

        var fin = new Date();
        fin.setHours(Number(Data.Hora.final.split(':')[0]));
        fin.setMinutes(Number(Data.Hora.final.split(':')[1]));
        fin.setSeconds(0);
        
        let f=0
        while (fecha<fin){
            let fila=[]
            const inicio=moment(fecha).format('h:mm a')
            fecha.setMinutes(fecha.getMinutes()+Data.Hora.cantidad);
            const fin=moment(fecha).format('h:mm a')
            let hora
            data.titulo.map((v,i)=>{
                const col={mensaje:'', espacio: 1, dia:v,}
                if (v==='Hora') {
                    hora=`${inicio} - ${fin}`
                    fila=[...fila, {...col, valor:`${inicio} - ${fin}`, hora}]
                }else {
                    fila=[...fila, {...col, valor: ``, hora}]
                }
                return v
            })
            f+=1
            datos=[...datos, fila]
            
        }
        // data.datos=datos
        const nuevo = [...datos];
        let _id
        if (props.Datos && props.Table){
            const {Datos, User, Api}=props
            const resulta= await conexiones.LeerHorario({_id_tipo:Datos._id, periodo:Datos.periodo}, User, Api);
            if (resulta.Respuesta==='Ok'){
                if (resulta.horario.length!==0){
                    datos=resulta.horario[0].valores.horario;
                    _id = resulta.horario[0]._id;
                }
            }
        }
        const horas = Calcula_hora_aula_docente(datos);
        setData({...Data, nuevo, datos, _id, horas, formulario:undefined})
    }
    const Calcula_hora_aula_docente= (datos)=>{
        let horas={asignaturas:{}, docentes:{}}
        
        datos.map((fila,f)=>{
            
            fila.map((columna,c)=>{
                if (columna.valor!=='' && c!==0){
                    horas.asignaturas[columna.asignatura.titulo]= horas.asignaturas[columna.asignatura.titulo] ? horas.asignaturas[columna.asignatura.titulo] + columna.espacio : columna.espacio;
                    if (columna.docente){
                        horas.docentes[columna.docente.titulo]= horas.docentes[columna.docente.titulo] ? horas.docentes[columna.docente.titulo] + columna.espacio : columna.espacio;
                    }
                }
                
                return columna
            })
            return fila
        })
        
        return horas
    }
    const BuscarPos=(valor)=>{
        let pos = -1
        Data.datos.map((fila, i)=>{

            const pos1=fila.findIndex(f=> f.hora===valor.hora && f.dia===valor.dia)
            if (pos1!==-1){
                pos= {fila:i, columna:pos1}
            }
        })
        return pos;
    }
    const CalcularDisponible = (valor) =>{
        let lista=[]
        const pos= BuscarPos(valor);   
        if (pos!==-1){
            let horas=0
            let salir= false;
            
            while (salir===false){
                if ( pos.fila<Data.datos.length 
                     && (Data.datos[pos.fila][pos.columna].valor==='' || 
                        (Data.datos[pos.fila][pos.columna].valor===valor.valor))
                   ){
                    horas+=1;
                    pos.fila+=1;
                }else{
                    salir=true
                }
            }
            
            for (var i=0; i<horas; i++){
                const fila={id:i, titulo:i+1}
                lista=[...lista, fila];
            }
            
        }
        return lista
    }

    const Guardar =(item)=>(valores)=>{
        const pos= BuscarPos(item);
        let cantidad= pos.fila + Number(valores.horas.titulo);
        let datos = Data.datos
        let conteo=0
        let aux=datos[pos.fila][pos.columna].valor
        let salir= aux==='' && valores.horas.titulo==='Eliminar' ? true : false
        while(!salir){
            if (valores.horas.titulo==='Eliminar' && datos[pos.fila][pos.columna].valor===aux){
                datos[pos.fila][pos.columna].espacio=0;
                let otro = pos.fila;
                while (datos[otro][pos.columna].espacio===0){
                    datos[otro][pos.columna].espacio=1;
                    datos[otro][pos.columna].valor='';
                    datos[otro][pos.columna].mensaje='';
                    datos[otro][pos.columna].horas=undefined;
                    datos[otro][pos.columna].asignatura=null;
                    datos[otro][pos.columna].docente=null;
                    datos[otro][pos.columna].aula=null;
                    otro ++;
                }
                // datos[pos.fila][pos.columna].horas=valores.horas;
                
                pos.fila+=1;
            }else if ( pos.fila<cantidad && valores.horas.titulo!=='Eliminar'){
                   
                if(conteo===0){ 
                    datos[pos.fila][pos.columna].espacio=Number(valores.horas.titulo);
                    datos[pos.fila][pos.columna].horas=valores.horas;
                    // datos[pos.fila][pos.columna].valor=valores.asignatura.titulo
                    conteo+=1
                }else{
                    datos[pos.fila][pos.columna].espacio=0;
                    // datos[pos.fila][pos.columna].valor='1'
                }
                datos[pos.fila][pos.columna].mensaje='';
                datos[pos.fila][pos.columna].valor=`${valores.asignatura.titulo} \n ${valores.docente ? valores.docente.titulo : ''}`
                datos[pos.fila][pos.columna].asignatura=valores.asignatura;
                datos[pos.fila][pos.columna].docente=valores.docente;
                datos[pos.fila][pos.columna].aula=valores.aula;
                pos.fila+=1;
            }else{
                let otro =pos.fila
                while (datos[otro][pos.columna].espacio===0){
                    datos[otro][pos.columna].espacio=1;
                    datos[otro][pos.columna].valor='';
                    datos[otro][pos.columna].horas=undefined;
                    datos[otro][pos.columna].asignatura=null;
                    datos[otro][pos.columna].docente=null;
                    datos[otro][pos.columna].aula=null;
                    otro ++;
                }
                salir=true
            }
        }
        let formulario={
            titulos:{},
            datos:{},
            botones:[
                {
                  name:'guardar', label:'Guardar', title:'Guardar ',
                  variant:"contained", color:"success", icono:<CheckIcon/>,
                  onClick: ()=>Guardar_horario(Data._id, Data.nuevo, datos), validar:'true', 
                  sx:{...props.Config.Estilos.Botones ? props.Config.Estilos.Botones.Aceptar : {}},
                },
                
                {
                  name:'cancelar', label:'Cancelar', title:'Cancelar',
                  variant:"contained",  icono:<CancelIcon/>,
                  sx:{...props.Config.Estilos.Botones ? props.Config.Estilos.Botones.Cancelar : {}},
                  onClick: Cancelar_horario
                },
            ]
        }
        setData({...Data, datos, formulario})
        setDialogo({...dialogo, open: false,})
    }

    const Guardar_horario = async(_id, nuevo, datos)=>{
        const {Datos, User, Api}=props
        const result= await conexiones.GuardarHorario({_id, nuevo, _id_tipo:Datos._id, tipo:Datos.tipo, periodo:Datos.periodo, titulo:Datos.titulo, horario:datos}, User, Api);
        CalcularHora();
    }
    const Cancelar_horario = () =>{
        CalcularHora();
    }

    const Seleccion = (valores)=>{
        const {name, resultados}=valores
        OpenDia(resultados)
    }
    const OpenDia= async(valores)=>{
        const {Datos,User, Api}=props
        let nuevo = await genera_formulario({valores, campos: Form_todos(`Form_horarios`) },1)
        let lista = CalcularDisponible(valores);
        nuevo.titulos[0].value.horas.lista=valores.asignatura ? [{_id:lista.length, titulo:'Eliminar'}, ...lista] : lista;
        nuevo.titulos[0].value.horas.value=valores.horas ? valores.horas : lista[0];
        nuevo.datos.horas=valores.horas ? valores.horas : lista[0];
        const pos= BuscarPos(valores);
        
        if (Datos===undefined) return
        let result= await conexiones.DisponibilidadHorario({pos, periodo:Datos.periodo, docentes: Datos.docentes, valores}, User, Api);
        
        let aulas=[];
        let docentes= Datos.docentes ? Datos.docentes : []
        if (result.Respuesta==='Ok'){
            aulas= result.aulas;
            docentes= result.docentes
        }
        nuevo.titulos[0].value.asignatura.lista= Datos ? Datos.asignaturas :
        [{_id:0, titulo:'Eliminar'},{_id:1, titulo:'Una'},{_id:2, titulo:'Dos'}, {_id:3, titulo:'Tres'}];
        docentes = valores.asignatura ? docentes.filter(f=>{
            const o = f.asignaturas.filter(f1=>f1.codigo===valores.asignatura.codigo);
            return o.length!==0
        }) :[]
        nuevo.titulos[0].value.docente.lista=docentes;
        nuevo.titulos[0].value.docente.disabled=valores.asignatura ? false : true;
        nuevo.titulos[0].value.aula.lista=aulas;
        nuevo.titulos[0].value.aula.disabled=valores.asignatura ? false : true;
        // nuevo.titulos[0].value.docente.lista=[];

        nuevo.titulos[0].value.horas.onChange= Seleccion;
        nuevo.titulos[0].value.asignatura.onChange= Seleccion;
        
        
        let formulario1={
            ...nuevo,
            botones:[
                {
                  name:'guardar', label:'Agregar', title:'Agregar',
                  variant:"contained", color:"success", icono:<CheckIcon/>,
                  onClick: Guardar(valores), validar:'true', 
                  sx:{...props.Config.Estilos.Botones ? props.Config.Estilos.Botones.Aceptar : {}},
                  disabled: (valores.tipo==='docente' || valores.tipo==='aula') || !(valores.horas && valores.asignatura)
                },
                
                {
                  name:'cancelar', label:'Cancelar', title:'Cancelar',
                  variant:"contained",  icono:<CancelIcon/>,
                  sx:{...props.Config.Estilos.Botones ? props.Config.Estilos.Botones.Cancelar : {}},
                  onClick: ()=>setDialogo({...dialogo,open:false})
                },
            ]
        }
        
        if (valores.dia==='Hora' || valores.tipo==='docente' || valores.tipo==='aula' || ['docente','aula'].indexOf(Datos.tipo)!==-1 )
            return
        setDialogo({ 
            open: !dialogo.open,
            Titulo:`${valores.dia} ${valores.hora}`,
            Cuerpo:<div>
                        {valores.mensaje==='' ? null : <Alert severity="error">{valores.mensaje}</Alert>}
                        <Formulario {...formulario1}/>
                   </div>,
            Cerrar: ()=>setDialogo({...dialogo,open:false}),
        })
    }
    let Datos=[]
    
    useEffect(()=>{
        CalcularHora();
        return ()=>{

        }
    },[props])

    const Mostrar=(valores)=>{
        return(
            <div >
                <Typography variant="caption" display="block" style={{color:'#fff'}}>
                    {valores.asignatura.titulo}
                </Typography> 
                <Typography variant="caption" display="block" style={{color:'#fff'}}>
                    {valores.tipo !== 'docente' && valores.docente ? valores.docente.titulo :''}
                </Typography>
                <Typography variant="caption" display="block" style={{color:'#fff'}}>
                    {(valores.tipo === 'aula' || valores.tipo === 'docente') && valores.seccion ? valores.seccion.titulo :''}
                </Typography>
                <Typography variant="caption" display="block" style={{color:'#fff'}}>
                    {valores.aula ? valores.aula.titulo :''}
                </Typography> 
            </div>
        )
    }
    
    
    return (
        <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="div" gutterBottom style={{color:'#fff'}}>
                {props.Datos && props.Datos.titulo ? props.Datos.titulo : ''}
            </Typography>
            <Grid container spacing={0.5}>
                <Grid item xs={3}>
                    <Item>
                        <Typography variant="h6" gutterBottom component="div" style={{color:'#000'}}>
                            {'Asignaturas'}
                        </Typography>
                        <Divider />
                        <div style={{textAlign:'left'}}>
                            {props.Datos && props.Datos.asignaturas ? props.Datos.asignaturas.map(val=>
                                <Typography key={val._id} variant="caption" display="block" gutterBottom style={{color:'#000'}}
                                    title={`${val.titulo}, horas: ${Data.horas.asignaturas[val.titulo] ? Data.horas.asignaturas[val.titulo] : 0}`}
                                >
                                    {val.titulo}, horas: {Data.horas.asignaturas[val.titulo] ? Data.horas.asignaturas[val.titulo] : 0}
                                </Typography>
                            
                            ): Data && Data.horas && Object.keys(Data.horas.asignaturas).length!==0
                                ? Object.keys(Data.horas.asignaturas).map((val,i)=>
                                    <Typography key={val+i} variant="caption" display="block" gutterBottom style={{color:'#000'}}
                                        title={`${val}, horas: ${Data.horas.asignaturas[val] ? Data.horas.asignaturas[val] : 0}`}
                                    >
                                        {val}, horas: {Data.horas.asignaturas[val] ? Data.horas.asignaturas[val] : 0}
                                    </Typography>
                                
                                ):null}
                        </div>
                        <Typography variant="h6" gutterBottom component="div" style={{color:'#000'}}>
                            {'Docentes'}
                        </Typography>
                        <Divider />
                        <div style={{textAlign:'left'}}>
                            {props.Datos && props.Datos.docentes ? props.Datos.docentes.map(val=>
                                <Typography key={val._id} variant="caption" display="block" gutterBottom style={{color:'#000'}}
                                    title={`${val.titulo}, horas: ${Data.horas.docentes[val.titulo] ? Data.horas.docentes[val.titulo] : 0}`}
                                >
                                    {val.titulo}, horas: {Data.horas.docentes[val.titulo] ? Data.horas.docentes[val.titulo] : 0}
                                </Typography>
                            ): Data && Data.horas && Object.keys(Data.horas.docentes).length!==0
                            ? Object.keys(Data.horas.docentes).map((val,i)=>
                                <Typography key={val+i} variant="caption" display="block" gutterBottom style={{color:'#000'}}
                                    title={`${val}, horas: ${Data.horas.docentes[val] ? Data.horas.docentes[val] : 0}`}
                                >
                                    {val}, horas: {Data.horas.docentes[val] ? Data.horas.docentes[val] : 0}
                                </Typography>
                            
                            ):null}
                        </div>
                    </Item>
                </Grid>
                <Grid item xs={9} >
                    <Item style={{height:'100%'}}>
                        <Table  bordered hover responsive >
                            <thead>
                            <tr>
                                {Data.titulo.map((valor,index)=>(
                                <th key={'th'+index} style={{}}>{valor}</th>
                                ))}

                            </tr>
                            </thead>
                            <tbody>
                            {Data.datos.map((valores, index) => (
                                <tr key={'tr'+index} >
                                    {valores.map((val,col)=>(
                                        val.espacio!==0
                                        ?   <td key={'td'+col} bgcolor={val['valor']==='' || col===0 ? 'black' : val.mensaje==='' ?'blue':'red' }
                                                rowSpan={val.espacio } text-align= 'center'
                                                title={val.mensaje==='' ? null : val.mensaje}
                                                className="align-middle"
                                                onClick={()=>OpenDia(val)}
                                                style={{backgroundColor:  val['valor']==='' || col===0 ? '' : val.mensaje==='' ?'#080BA0':'#A00808'}}
                                            >
                                                
                                                {!val.asignatura ? val['valor']: 
                                                <Mostrar {...val}/>
                                                }
                                               
                                            </td>
                                        :   null
                                    ))}

                                </tr>
                                ))}

                            </tbody>
                        </Table>
                        {Data && Data.formulario ? <Formulario {...Data.formulario} /> : null}
                    </Item>
                </Grid>
            </Grid>
            
            <Dialogo  {...dialogo} config={{...props.Config,  Logo:props.Logo}}/>
        </Box>
    );
}
