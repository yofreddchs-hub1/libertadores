import React,{useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Formulario from '../../../componentes/herramientas/formulario';
import { conexiones, genera_formulario, Form_todos, Ver_Valores } from '../../../constantes';
import Cargando from '../../../componentes/esperar/cargar';

export default function Mensualidad(props) {
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

    const Select_meses = async(valores)=>{
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
            const data=Mensualidades[valor];
            Mensualidades[valor][valor].map(val=>{
                cont++;
                let monto = Number(val.monto) *  Cambio;
                let montod = Number(val.monto);
                let mensaje_beca= '';
                if (data.beca && Number(data.beca)!==0){
                    mensaje_beca=`, "Becado por ${data.beca} %"`
                    let beca = Number(data.beca) * monto / 100;
                    monto = monto - beca;
                    beca = Number(data.beca) * montod / 100;
                    montod = montod - beca
                }
                total+=monto;
                totald+=montod;
                Rmensualidades=[...Rmensualidades,
                    {
                        id:cont,
                        periodo:val.periodo, value:val.value, 
                        _id:data._id, cedula:data.cedula,
                        nombres:data.nombres, apellidos:data.apellidos,
                        descripcion:`${val.title} (${val.periodo}) de ${data.nombres} ${data.apellidos} ${typeof data.grado ==='object' ? data.grado.titulo : ''} ${typeof data.seccion ==='object' ? data.seccion.titulo : ''} ${mensaje_beca}`,
                        montod, monto
                    }
                ]
                return val
            })
            return valor
        })
        
        if ((abono && Number(abono)>0) || (abonod && Number(abonod)>0)){
            totald-=Number(abonod) ===0 ? Number(abono)/Cambio :Number(abonod);
            total-=Number(abono)===0 ? Number(abonod) * Cambio : Number(abono);
            
            let pos = Periodo.findIndex(f=> f.valores.estatus)
            if (pos===-1){
                pos= Periodo.length-1;
            }
            Rmensualidades=[...Rmensualidades,
                {
                    id:Rmensualidades.length+1,
                    periodo:Periodo[pos].valores.periodo, value:'abono_anterior', 
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

    const Meses = async() =>{
        let {datos} = props
        let resultados=[];
        let periodo = await conexiones.Leer_C(['uecla_Inscripcion', 'uecla_Arancel'], {uecla_Inscripcion:{}, uecla_Arancel:{}});
        let lista_meses= [];
        let aranceles= []
        if (periodo.Respuesta==='Ok'){
            aranceles= periodo.datos.uecla_Arancel.map(val=>{

                return {
                    periodo: val.valores.periodo.periodo, mes_inicio: val.valores.mes_inicio.value, mes_final: val.valores.mes_final.value,
                    monto: Number(val.valores.monto)
                }
            });
            periodo= periodo.datos.uecla_Inscripcion.sort((a,b)=>a.valores.periodo>b.valores.periodo ? 1 : -1)//.filter(f=>f.valores.estatus)
            Periodo=periodo;
            const lista= Config.Listas.lista_Meses;//Ver_Valores().config.Listas.lista_Meses;
            periodo.map(val=>{
                let lista_aranceles= aranceles.filter(f=> f.periodo===val.valores.periodo);
                if (lista_aranceles.length===0) lista_aranceles= aranceles;
                lista_aranceles= lista_aranceles.map(f=>{
                    const posi = lista.findIndex( p=> p.value===f.mes_inicio)
                    const posf = lista.findIndex( p=> p.value===f.mes_final)
                    return {...f, posi, posf}
                })
                let nuevo = lista.map(lis=>{
                    let monto = lista_aranceles.findIndex(f=> f.posi<=lis._id && lis._id<=f.posf)
                    if (monto!==-1){
                        monto= lista_aranceles[monto].monto
                    }else{
                        monto= lista_aranceles[lista_aranceles.length-1].monto
                    }
                    return {...lis, titulo:`${val.valores.periodo} ${lis.titulo}`, periodo:val.valores.periodo, title:lis.titulo, monto}
                })
                lista_meses= [...lista_meses, ...nuevo]
                return val
            })
        }
        
        let mens= await conexiones.Mensualidades({Representados:datos.valores.representados});
        
        if(mens.Respuesta==='Ok'){
            mens= mens.mensualidades
        }else{
            mens=[]
        }
        
        // let resultados=datos.valores.representados.map( async(val)=>{
        for (var i=0; i<datos.valores.representados.length; i++){
            let val= datos.valores.representados[i];
            const estado = ['Graduado','Retirado'].indexOf(val.grado)!==-1 || (val.estatus && [2,3].indexOf(val.estatus._id)!==-1);
            if (!estado){

                let Formu = {...Form_todos('Form_Mensualidad1', Config)}
                Formu.value[0].name=`Meses-${val.nombres}-${val.apellidos}`;
                Formu.value[0].nombre=`Meses-${val.nombres}-${val.apellidos}`;
                Formu.value[0].multiple=true;
                let meses = await genera_formulario({valores:val, campos: Formu })
                let valor = props.Meses && props.Meses[`Meses-${val.nombres}-${val.apellidos}`] 
                    ? props.Meses[`Meses-${val.nombres}-${val.apellidos}`][`Meses-${val.nombres}-${val.apellidos}`] : [];
                    
                const mes =  mens.filter(f=> f.valores._id_estudiante===val._id);
                let lista = estado ? [] : lista_meses.filter(f=>{
                    const pos = mes.findIndex(p=> p.valores.periodo===f.periodo);
                    const posa = periodo.findIndex(p=> p.valores.periodo===f.periodo);
                    const activo = periodo[posa] ? periodo[posa].valores.estatus : false;
                    let estud={}
                    if (pos!==-1){
                        estud=mes[pos].valores
                    }
                    if (!activo && pos===-1){
                        return false    
                    }
                    return !estud[f.value]

                });
                if (valor.length===0){
                    props.Mensualidades.meses.map(me=>{
                        if((val._id === me._id || val.cedula===me.cedula)){
                            const pos = lista.findIndex(f=> f.periodo ===me.periodo && f.value===me.value);
                            if (pos!==-1){
                                valor=[...valor, lista[pos]];
                            }
                        }
                        return 
                    })
                }
                if (lista.length===0){
                    let activos=mes.sort((a,b)=>a.valores.periodo>b.valores.periodo ? -1 : 1).map(v=>{return v.valores.periodo});
                    let actual = activos.length!==0 ? activos[0] : '';//String(activos);
                    lista=[{
                        _id:13,
                        titulo:`Solvente hasta el periodo (${actual}) ${!estado ? '': val.estatus && val.estatus.titulo ? val.estatus.titulo : val.grado }`,
                        value:'nada',
                        monto:0
                    }]
                    meses.titulos[`Meses-${val.nombres}-${val.apellidos}`].lista=lista.filter(f=> valor.findIndex(p=> p._id===f._id)===-1).map((val,i)=>{
                        return {...val, disabled: i!==0}
                    });
                }else{
                    meses.titulos[`Meses-${val.nombres}-${val.apellidos}`].onChange=Select_meses
                    meses.titulos[`Meses-${val.nombres}-${val.apellidos}`].lista=lista.filter(f=> valor.findIndex(p=> p._id===f._id)===-1).map((val,i)=>{
                        return {...val, disabled: i!==0}
                    });    
                }
                
                meses.titulos[`Meses-${val.nombres}-${val.apellidos}`].value= valor
                const posl= meses.titulos[`Meses-${val.nombres}-${val.apellidos}`].lista.findIndex(f=> f.value==='inscripcion' && props.inscripcion);
                // if (!props.inscripcion || (props.inscripcion && posl!==-1) ){
                    resultados=[...resultados, {...val, label: `${val.nombres} ${val.apellidos}`, meses}]
                // }
            }
        }
        return resultados
    }

    const Inicio = async() =>{
        setCargando(true)
        let cambio = props.valorCambio ? props.valorCambio : await conexiones.ValorCambio()
        if(cambio.Respuesta==='Ok'){
            cambio=cambio.valor ? Number(cambio.valor.USD) : 0.00
        }
        let Fcambio = await genera_formulario({valores:{cambio}, campos: Form_todos('Form_Cambio', Config) })
        Fcambio.titulos.cambio.onChange=Cambio_valor;
        Fcambio.titulos.cambio.disabled = [4,'4'].indexOf(Ver_Valores().User.categoria)!==-1
        let Fmeses = await Meses()
        // console.log(Fmeses);
        //los datos de la mensualidades cuando sea pago previo
        let mensualidades=props.Mensualidades ? props.Mensualidades : {meses:[]}
        let Fmensualidad = {... await genera_formulario({valores:mensualidades, campos: Form_todos('Form_Mensualidades', Config) })}
        Fmensualidad.titulos.meses.noeliminar=true;
        Fmensualidad.titulos.meses.nopaginar=true;
        Fmensualidad.titulos.meses.style={height:window.innerWidth > 750 ? window.innerHeight * 0.40 : window.innerHeight * 0.4};//height:280};
        Fmensualidad.titulos.meses.Subtotalvalor= props.Subtotalvalor;
        Fmensualidad.titulos.meses.Subtotal[0][1].default= props.Subtotalvalor.abonod ? props.Subtotalvalor.abonod : 0;
        Fmensualidad.titulos.meses.Subtotal[0][2].default= props.Subtotalvalor.abono ? props.Subtotalvalor.abono : 0;
        // console.log(Fmensualidad.titulos)
        // nuevos.titulos.representados.noeliminar=true;
        // nuevos.titulos.representados.style={height:250, width:775};
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
    const height = cargando ? window.innerHeight * 0.7 :'100%';
    return (
        <div style={{width:'100%', height,position: "relative"}}>
            <Box sx={{ textAlign:'left', pb:9}}>
                <Grid container spacing={0.5}>
                    <Grid item xs={window.innerWidth > 750 ? 3: 12}> 
                    {formulario
                            ? <Formulario {...formulario.Cambio} config={Config}/>
                            : null
                        } 
                    </Grid>
                    <Grid item xs={9}/>
                    {formulario && formulario.Meses
                        ?   formulario.Meses.map(val=>
                                <Grid item container key={val._id} justifyContent="center" alignItems="center" style={{marginTop:-15}}>
                                    <Grid item xs={window.innerWidth > 750 ? 4 : 12}> 
                                        <Typography variant="subtitle1" component="div" sx={{...Config ? {color:Config.Estilos.Input_label.color} :{}}}>
                                            {val.label}
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={window.innerWidth > 750 ? 8 : 12} > 
                                        <div style={{marginTop:-10}}/>
                                        <Formulario {...val.meses} config={Config}/>
                                    </Grid>
                                </Grid>    
                            )
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
