import React,{useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Formulario from '../../../componentes/herramientas/formulario';
import { conexiones, genera_formulario, Form_todos } from '../../../constantes';
import Cargando from '../../../componentes/esperar/cargar';

export default function Producto(props) {
    const [formulario, setFormulario] = useState();
    const [state, setState] = useState({});
    const [cargando, setCargando] = useState(true);
    let Mensualidades={}
    let Rmensualidades=[]
    let Formularios
    let Cambio
    let Periodo
    const Cambio_valor =(valores)=>{
        const {name, resultados} = valores
        Cambio= resultados[name]
        setState({[name]: resultados[name] })
    }

    const Select_Productos = async(valores)=>{
        const {name}= valores;
        const value= valores.resultados;
        Mensualidades[name]=value;
        Rmensualidades=[];
        let { Subtotalvalor} = props;
        let {abono, abonod}= Subtotalvalor;
        let cont=0
        let total=0
        let totald=0
        Object.keys(Mensualidades).map(valor=>{
            // const data=Mensualidades[valor];
            Mensualidades[valor][valor].map(val=>{
                let monto = Number(val.precio) *  Cambio;
                let montod = Number(val.precio);
                total+=monto;
                totald+=montod;
                Rmensualidades=[...Rmensualidades,
                    {
                        id:cont, 
                        _id:val._id,
                        nombre:val.nombre,
                        descripcion:`${val.nombre} > ${val.descripcion}`,
                        montod, monto
                    }
                ]
                cont++;
                return val
            })
            return valor
        })
        if ((abono && Number(abono)>0) || (abonod && Number(abonod)>0)){
            totald-=Number(abonod) ===0 ? Number(abono)/Cambio :Number(abonod);
            total-=Number(abono)===0 ? Number(abonod) * Cambio : Number(abono);
            // console.log(Periodo)
            // let pos = Periodo.findIndex(f=> f.valores.estatus)
            // if (pos===-1){
            //     pos= Periodo.length-1;
            // }
            Rmensualidades=[...Rmensualidades,
                {
                    id:Rmensualidades.length+1,
                    // periodo:Periodo[pos].valores.periodo, 
                    value:'abono_anterior', 
                    _id:`Abono-${Rmensualidades.length}`, cedula:'Abono_anterior',
                    nombres:'Abono', apellidos:'Anterior',
                    descripcion:`Abono anterior`,
                    montod: Number(abonod) ===0 ? -Number(abono)/Cambio :-Number(abonod), 
                    monto: Number(abono)===0 ? -Number(abonod) * Cambio : -Number(abono)
                }
            ]
        }
        Subtotalvalor={...Subtotalvalor , totald, total}
        //los datos de la mensualidades cuando sea pago previo
        let Fmensualidad = await genera_formulario({valores:{meses:Rmensualidades}, campos: Form_todos('Form_Mensualidades', Config) })
        Fmensualidad.titulos.meses.noeliminar=true;
        Fmensualidad.titulos.meses.nopaginar=true;
        Fmensualidad.titulos.meses.Subtotalvalor= Subtotalvalor;
        Fmensualidad.titulos.meses.style={height:380};
        Formularios={...Formularios, Mensualidad:Fmensualidad}
        setFormulario(Formularios)
        
        props.Cambio({Mensualidades:{meses:Rmensualidades}, Meses: Mensualidades, valorCambio:Cambio, Subtotalvalor})
    }
    
    const Cambios = (valores)=>{
        let { Subtotalvalor} = props;
        let {abono, abonod}= Subtotalvalor;
        // let cont=0
        let total=0
        let totald=0
        Rmensualidades=valores.resultados.meses.map(val=>{
            total+= Number(val.cantidad) * Number(val.monto);
            totald+= Number(val.cantidad) * Number(val.montod);
            return {...val, total:Number(val.cantidad) * Number(val.monto), totald:Number(val.cantidad) * Number(val.montod)}
        })
        if ((abono && Number(abono)>0) || (abonod && Number(abonod)>0)){
            totald-=Number(abonod) ===0 ? Number(abono)/Cambio :Number(abonod);
            total-=Number(abono)===0 ? Number(abonod) * Cambio : Number(abono);
            
            // let pos = Periodo.findIndex(f=> f.valores.estatus)
            // if (pos===-1){
            //     pos= Periodo.length-1;
            // }
            let pos = Rmensualidades.findIndex(f=>f.cedula==='Abono_anterior')
            if (pos===-1){
                Rmensualidades=[...Rmensualidades,
                    {
                        id:Rmensualidades.length+1,
                        // periodo:Periodo[pos].valores.periodo, 
                        value:'abono_anterior', 
                        _id:`Abono-${Rmensualidades.length}`, cedula:'Abono_anterior',
                        nombres:'Abono', apellidos:'Anterior',
                        descripcion:`Abono anterior`,
                        montod: Number(abonod) ===0 ? -Number(abono)/Cambio :-Number(abonod), 
                        monto: Number(abono)===0 ? -Number(abonod) * Cambio : -Number(abono)
                    }
                ]
            }else{
                Rmensualidades[pos].cantidad = 1;
                // console.log(Rmensualidades[pos]);
            }    
        }
        
        Subtotalvalor={...Subtotalvalor, total, totald}
        props.Cambio({Mensualidades:{meses:Rmensualidades}, Subtotalvalor})
    }
    const Inicio = async() =>{
        setCargando(true)
        let {valores} = props.datos;
        let cambio = props.valorCambio ? props.valorCambio : await conexiones.ValorCambio()
        if(cambio.Respuesta==='Ok'){
            cambio=cambio.valor ? Number(cambio.valor.USD) : 0.00
        }
        let Fcambio = await genera_formulario({valores:{cambio}, campos: Form_todos('Form_Cambio', Config) })
        Fcambio.titulos.cambio.onChange=Cambio_valor;
    
        // let Fmeses = await Meses()
        //los datos de la mensualidades cuando sea pago previo
        let mensualidades=props.Mensualidades ? props.Mensualidades : {meses:[]}
        
        mensualidades.meses= mensualidades.meses.sort((a,b)=> a.id>b.id ? 1 : -1)
        let Fmensualidad = await genera_formulario({valores:mensualidades, campos: Form_todos('Form_Productos', Config) });
        Fmensualidad.titulos.meses.noeliminar=true;
        Fmensualidad.titulos.meses.nopaginar=true;
        Fmensualidad.titulos.meses.style={height:310};
        Fmensualidad.titulos.meses.Subtotalvalor= props.Subtotalvalor;
        
        
        Fmensualidad.titulos.meses.onChange = Cambios; 
        // nuevos.titulos.representados.noeliminar=true;
        // nuevos.titulos.representados.style={height:250, width:775};
        let valor = props.Meses && props.Meses[`Meses-${valores.nombres}-${valores.apellidos}`] 
                ? props.Meses[`Meses-${valores.nombres}-${valores.apellidos}`][`Meses-${valores.nombres}-${valores.apellidos}`] : [];
        let Formu = {...Form_todos('Form_Mensualidad2', Config)};
        Formu.value[0].name=`Meses-${valores.nombres}-${valores.apellidos}`;
        Formu.value[0].nombre=`Meses-${valores.nombres}-${valores.apellidos}`;
        Formu.value[0].key=`Meses-${valores.nombres}-${valores.apellidos}`;
        let Fmeses = await genera_formulario({valores:mensualidades, campos: Formu });
        
        Fmeses.titulos[`Meses-${valores.nombres}-${valores.apellidos}`].value = valor;
        Fmeses.titulos[`Meses-${valores.nombres}-${valores.apellidos}`].onChange = Select_Productos;
        // Fmeses.titulos[`Meses-${valores.nombres}-${valores.apellidos}`].multiple = false;

        Mensualidades= props.Meses ? props.Meses : {}
        Formularios={Cambio:Fcambio, Meses:Fmeses, Mensualidad:Fmensualidad};
        setFormulario(Formularios)
        Cambio=cambio
        setState({cambio, mensualidades})
        setCargando(false)
    }
    useEffect(()=>{
        Inicio();
    },[props])
    
    const {Config}=props;
    return (
        <div style={{width:'100%', height:'100%',position: "relative"}}>
            <Box sx={{ textAlign:'left' }}>
                <Grid container spacing={0.5}>
                    <Grid item xs={3}> 
                    {formulario
                            ? <Formulario {...formulario.Cambio} config={Config}/>
                            : null
                        } 
                    </Grid>
                    <Grid item xs={9}/>
                    {formulario && formulario.Meses
                        ?   
                                <Grid item container justifyContent="center" alignItems="center">
                                    
                                    <Grid item xs={10} style={{height:75}}> 
                                        <div style={{marginTop:-10}}/>
                                        <Formulario {...formulario.Meses} config={Config}/>
                                    </Grid>
                                </Grid>    
                        :   null
                    }
                    <Grid item xs={12}>
                        <div style={{marginTop:-30}}/>
                    {formulario && formulario.Mensualidad
                            ? <Formulario {...formulario.Mensualidad} config={Config}/>
                            : null
                        } 
                    </Grid>
                </Grid>
                
            </Box>
            <Cargando open={cargando} Config={Config}/>
        </div>
    );
}
