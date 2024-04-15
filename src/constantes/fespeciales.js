import moment from "moment";
import { conexiones } from "./conexiones";

export default{
    Editores_formapago:(params)=>{
        let editable=true;
        if ((['Debito','Credito'].indexOf(params.row.titulo)!==-1 && ['bancod'].indexOf(params.field)!==-1) 
            || ((['Efectivo Bolívar','Efectivo Dolar'].indexOf(params.row.titulo)!==-1) 
                && ['fecha','bancoo','bancod'].indexOf(params.field)!==-1)
            ||  (params.field==='moneda' && params.row.titulo!=='Otro')
            || ((['Zelle'].indexOf(params.row.titulo)!==-1) 
                  && ['bancoo','bancod'].indexOf(params.field)!==-1)
            ){ 
            editable=false;
        } 
        
        return editable; 
    },
    Subtotal_formapago_total:(dato, resultado)=> {
        // console.log(dato.value, dato.moneda, dato.monto, (dato.value==='otro' && dato.moneda==='Bs'))
        let monto = Number(dato.monto ? dato.monto : 0); 
        if (['efectivodolar','zelle','otro'].indexOf(dato.value)===-1 ||(dato.value==='otro' && dato.moneda==='Bs')){
            monto=0;
        }
        // console.log(monto)
        return monto + Number(resultado.total);
    },
    Subtotal_formapago_totalb:(dato, resultado, tasa)=> {
        let monto = Number(dato.monto); 
        if (['efectivodolar','zelle'].indexOf(dato.value)!==-1 ||(dato.value==='otro' && dato.moneda==='$')){
            monto=0;
        }
        return monto + Number(resultado.totalb)
    },
    Subtotal_formapago_restan:(dato,resultado,tasa, externos)=> {
        let Tasa = externos.totales && externos.totales.Tasa ? externos.totales.Tasa : tasa;
        let total = Number(resultado.cancelar); 
        // let totalb = Number(resultado.cancelarb); 
        let cancel= Number(resultado.total ? resultado.total : 0); 
        let cancelb= Number(resultado.totalb ? resultado.totalb : 0);
        let resul = Number((total-cancel).toFixed(2)); 
        // let resulb = Number((totalb-cancelb).toFixed(2)); 
        resul-=Number((cancelb/Tasa).toFixed(2)); 
        // resulb-= Number((cancel*Tasa).toFixed(2)); 
        return resul
    },
    Subtotal_formapago_restanb:(dato,resultado, tasa, externos)=> {
        let Tasa = externos.totales && externos.totales.Tasa ? externos.totales.Tasa : tasa;
        // let total = Number(resultado.cancelar); 
        let totalb = Number(resultado.cancelarb); 
        let cancel= Number(resultado.total ? resultado.total : 0);
        let cancelb= Number(resultado.totalb ? resultado.totalb : 0);
        // let resul = Number((total-cancel).toFixed(2)); 
        let resulb = Number((totalb-cancelb).toFixed(2)); 
        // resul-=Number((cancelb/Tasa).toFixed(2)); 
        resulb-= Number((cancel*Tasa).toFixed(2)); 
        return resulb
    },
    Titulo_fecha:(dato)=> {
        const fecha =moment(dato.valores ? dato.valores.fecha: dato.fecha).format('DD/MM/YYYY');
        return `${fecha}`
    },
    calculo_bolivar:(dato)=>{
        return dato.monto  ? dato.monto : 0
    },
    cantidad:(dato)=>{
        let nuevo = dato.row ? dato.row : dato ;
        return nuevo.cantidad ? nuevo.cantidad : 1;
    },
    total_bolivar_producto:(dato)=>{
        let nuevo = dato.row ? dato.row : dato ;
        let total = Number(nuevo.cantidad) * Number(nuevo.monto);
        return total
    },
    total_bolivar_dolar:(dato)=>{
        let nuevo = dato.row ? dato.row : dato ;
        let totald = Number(nuevo.cantidad) * Number(nuevo.montod);
        return totald
    },
    Monto:(dato)=>{
        // console.log(dato)
        return dato
    },
    Cambio_condicion:(data, form)=>{
        const pos= Buscar_campo('condicion', form);
        
        if (data.value._id===0 && pos!==-1){
            form[pos].value['condicion'].disabled=false
        }else{
            form[pos].value['condicion'].disabled=true;
            form[pos].value['condicione'].disabled=true;
            form[pos].value['condicione'].required=false
            data.resultados.condicion=null;
            data.resultados.condicione=null;
        }
        return {resultados: data.resultados,form}
    },
    Condicion_especial:(data, form)=>{
        
        const pos= Buscar_campo('condicione', form);
        
        if (data.value._id===3 && pos!==-1){
            form[pos].value['condicione'].disabled=false;
            form[pos].value['condicione'].required=true;
        }else{
            form[pos].value['condicione'].disabled=true;
            form[pos].value['condicione'].required=false
            data.resultados.condicione=null;
        }
        
        return {resultados: data.resultados,form}
    },
    Censo_buscar_cedula:async(data, form)=>{
        console.log(data.resultados.periodo)
        let resulta= await conexiones.Leer_C(['uecla_Estudiante','uecla_Censado'],{
            uecla_Estudiante:{'valores.cedula':data.value},
            uecla_Censado:{$and:[{'valores.periodo':data.resultados.periodo}, {'valores.cedula_estu':data.value}]}
        });
        
        if (resulta.Respuesta==='Ok'){
            const estudiante = resulta.datos.uecla_Estudiante;
            const estudiante_censado = resulta.datos.uecla_Censado;
            if (estudiante.length!==0){
                data.resultados['Error-cedula_estu']='Estudiante ya existe en el sistema'
            }else if (estudiante_censado.length!==0){
                data.resultados['Error-cedula_estu']='Estudiante ya se encuentra censado'
            }else{
                data.resultados['Error-cedula_estu']=''
            }
        }  
        return {resultados: data.resultados,form} 
    },
    Censo_buscar_cedula_estudiantil:async(data, form)=>{
        
        let resulta= await conexiones.Leer_C(['uecla_Estudiante','uecla_Censado'],{
            uecla_Estudiante:{'valores.cedula_estudiantil':data.value},
            uecla_Censado:{'valores.cedula_estudiantil':data.value}
        });
        
        if (resulta.Respuesta==='Ok'){
            const estudiante = resulta.datos.uecla_Estudiante;
            const estudiante_censado = resulta.datos.uecla_Censado;
            
            if (estudiante.length!==0){
                data.resultados['Error-cedula_estudiantil']='Estudiante ya existe en el sistema'
            }else if (estudiante_censado.length!==0){
                data.resultados['Error-cedula_estudiantil']='Estudiante ya se encuentra censado'
            }else{
                data.resultados['Error-cedula_estudiantil']=''
            }
        }  
        return {resultados: data.resultados,form} 
    },
    Censo_buscar_cedula_representante:async(data, form)=>{
        
        let resulta= await conexiones.Leer_C(['uecla_Representante'],{
            uecla_Representante:{'valores.cedula':data.value},
            
        });
        
        if (resulta.Respuesta==='Ok'){
            let representante = resulta.datos.uecla_Representante;
            if (representante.length!==0){
                representante = representante[0].valores;
                const {_id,nombres,apellidos,telefono_movil, telefono_fijo, correo, parentesco, profesion, representados}=representante;
                data.resultados={...data.resultados, 
                    _id_representante:_id,
                    nombres,apellidos,telefono_movil, telefono_fijo, correo, parentesco, profesion,
                    representados,
                    existe:{
                        permisos: "",
                        titulo: "SI",
                        value: "si",
                        _id: 0
                    }
                }
            }else{
                data.resultados={...data.resultados, 
                    _id_representante:undefined,
                    nombres:'',
                    apellidos:'',
                    telefono_movil:'',
                    telefono_fijo:'', 
                    correo:'', 
                    parentesco:null, 
                    profesion:'',
                    representados:null,
                    existe:{
                        permisos: "",
                        titulo: "NO",
                        value: "no",
                        _id: 1
                    }
                }
            }
            
        }  
        return {resultados: data.resultados,form} 
    }
}

const Buscar_campo = (name, form) =>{
    let pos =-1;
    Object.keys(form).map((valor,i)=>{
      if(form[valor].value[name]){
        pos=i;
      }
      return valor
    });
    // console.log(resultado);
    return pos;
}