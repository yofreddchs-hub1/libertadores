import moment from "moment";
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
        let totalb = Number(resultado.cancelarb); 
        let cancel= Number(resultado.total ? resultado.total : 0); 
        let cancelb= Number(resultado.totalb ? resultado.totalb : 0);
        let resul = Number((total-cancel).toFixed(2)); 
        let resulb = Number((totalb-cancelb).toFixed(2)); 
        resul-=Number((cancelb/Tasa).toFixed(2)); 
        resulb-= Number((cancel*Tasa).toFixed(2)); 
        return resul
    },
    Subtotal_formapago_restanb:(dato,resultado, tasa, externos)=> {
        let Tasa = externos.totales && externos.totales.Tasa ? externos.totales.Tasa : tasa;
        let total = Number(resultado.cancelar); 
        let totalb = Number(resultado.cancelarb); 
        let cancel= Number(resultado.total ? resultado.total : 0);
        let cancelb= Number(resultado.totalb ? resultado.totalb : 0);
        let resul = Number((total-cancel).toFixed(2)); 
        let resulb = Number((totalb-cancelb).toFixed(2)); 
        resul-=Number((cancelb/Tasa).toFixed(2)); 
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
    }
}