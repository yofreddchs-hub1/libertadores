import React from 'react';

import logo from '../../../../imagenes/logo1.png';
import {numeroALetras} from '../../../../constantes';
import moment from "moment";
import jsPDF from 'jspdf'

const Recibopdf = (props) =>{

    const {valores, createdAt} = props;
    const {subtotalvalor, representante, Formas_pago, mensualidades, recibo} = valores;
    const marginLeft=20;
    const linea1=20;
    // tamano de logo
    const alto= 90;
    const ancho = 90;

    const lineadireccion= linea1+ alto + 10;
    const letradireccion = 9;
    const direccion='Av. Ramon Antonio Medina, Urb. Monche Soto, Casa #2';
    const linearif= linea1+ alto + 45;
    const letrarif=11;
    const rif='J-12345678-9';

    const lineacentro = ((linearif - lineadireccion) / 2) + alto;
    const letracentro = 15;

    const letrainformacion = 14;
    const primeralinea = linearif + 30;
    const totalL = numeroALetras(subtotalvalor.total,{
        plural: "BOLIVARES",
        singular: "BOLIVAR",
        centPlural: "CENTAVOS",
        centSingular: "CENTAVO"
    });
    const meses = mensualidades ? mensualidades.meses : [];

    var doc = new jsPDF('p', 'pt','letter');
    const pageWidth = doc.internal.pageSize.getWidth();
    const centroancho = pageWidth /2;
    // const pageHeight = doc.internal.pageSize.getHeight();
    
    // Cabezera del recibo
    // Derecha
    doc.addImage(logo, "PNG", marginLeft+5, linea1, alto, ancho);
    doc.setFontSize(letradireccion);
    doc.text(direccion, marginLeft, lineadireccion, {
        maxWidth: 95,
        align: 'justify'
    });
    doc.setFontSize(letrarif);
    doc.setFont("helvetica", "bold");
    doc.text('RIF. '+rif, marginLeft, linearif, {
        maxWidth: 95,
        align: 'justify'
    });
    //Centro
    doc.setFontSize(letracentro);
    doc.setFont("helvetica", "bold");
    doc.text(`Por Bs. ${subtotalvalor ? subtotalvalor.total : '0.00'}`, centroancho, lineacentro, null, null, "center");
    doc.text(`Santa Ana de Coro ${moment(createdAt).format('DD/MM/YYYY')}`, centroancho, lineacentro + 20, null, null, "center");

    //Derecha
    doc.setTextColor("blue");
    doc.text("RECIBO", pageWidth - marginLeft, lineacentro, null, null, "right");
    doc.text(`No. ${recibo ? recibo : '0000'}`, pageWidth - marginLeft, lineacentro+20, null, null, "right");

    //comienzo de informacion
    doc.setFont("helvetica", "normal");
    doc.setFontSize(letrainformacion);
    doc.setTextColor("#000");
    doc.text(`Hemos recibido del Sr. (a): ${representante ? representante.nombres + ' ' + representante.apellidos : ''}`, marginLeft, primeralinea);
    doc.text(`La cantidad de: ${subtotalvalor ? totalL : '0.00'}`, marginLeft, primeralinea + 20,{
        maxWidth: pageWidth - (2 * marginLeft),
        align: 'justify'
    })
    doc.setFont("helvetica", "bold");
    doc.text(`Por concepto de:`, marginLeft, primeralinea + 60);
    doc.setFont("helvetica", "normal");
    let lineas = 0;
    {meses.map((val, i)=>{
        doc.text(` > ${val.descripcion} Bs. ${val.monto}`, marginLeft, primeralinea + (80 + (i * 20)),{
            maxWidth: pageWidth - (2 * marginLeft),
            align: 'justify'
        })
        lineas = i + 1;
        return val
    })}

    const lineaforma = primeralinea + (80 + (lineas * 20));
    doc.setFont("helvetica", "bold");    
    doc.text(`Forma de pago:`, marginLeft, lineaforma);
    doc.setFont("helvetica", "normal");
    let siguiente = 0;
    {Formas_pago.map((val, i)=>{
        console.log(val)
        const mensaje = ` > ${val.titulo} ${val.bancoorigen ? 'Banco Origen: ' + val.bancoorigen + ',' : ''} ${val.bancodestino ? 'Banco Destino: ' + val.bancodestino + ',' : ''} ${val.referencia ? 'Referencia: ' + val.referencia + ',' : '' } ${val.formapago=== 'efectivodolar' ? '$': 'Bs.'} ${val.monto}`;
        let proxima=1 + siguiente;
        if (mensaje.length> 83){
            siguiente +=1; 
        }
        doc.text(
            mensaje, 
            marginLeft, lineaforma +  ((i + proxima) * 20),{
            maxWidth: pageWidth - (2 * marginLeft),
            align: 'justify'
        })
        return val;
    })}

    return doc.output('bloburl')
}
export default Recibopdf;