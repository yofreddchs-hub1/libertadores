import moment from "moment";
import React, { useCallback, useEffect, useState } from "react";
import { read, utils, writeFileXLSX, writeFile } from 'xlsx';

export default function SheetJSReactAoO(props) {
  /* the component state is an array of presidents */
  const [pres, setPres] = useState([]);

  /* Fetch and update the state once */
  useEffect(() => { (async() => {
    console.log(props);
    const {Datos, Inicio, Fin}= props;

    
    let datos =[
        {
            No:'', fecha:'', representante:'', cedular:'', recibo:'', total:'',
            mensualidad:'', anterior:'', abono:'', diferido:'',tmensualidad:'',otro:'',
            cedula:'', nombres: ``,
            inscripcion:'', septiembre:'',octubre:'',noviembre:'',
            diciembre:'',enero:'',febrero:'',marzo:'', abril:'',
            mayo:'',junio:'', julio:'',agosto:'', tasa:'',
        },
        
    ]
    const agregar = datos[0];
    for (var i=0;i<4;i++){
        datos=[...datos, agregar];
    }
    Datos.map((dato,i)=>{
        const fecha = moment(dato.valores.fecha).format('DD/MM/YYYY');
        const recibo = dato.valores.recibo;
        const cedular = dato.valores.representante.cedula;
        const representante = `${dato.valores.representante.nombres} ${dato.valores.representante.apellidos}`;
        const total = Number(dato.valores.totales.total).toFixed(2);
        const tasa = dato.valores.valorcambio;
        const tmensualidad = Number(dato.valores.subtotalvalor.total).toFixed(2);
        let meses=[];
        let abono = 0.00;
        let abono_anterior=0.00;
        let mensualidad = 0.00;
        dato.valores.mensualidades.meses.map(mes=>{
            if (mes.value==='abono_anterior'){
                abono_anterior=Number(mes.monto).toFixed(2);
            }
            if(mes.value==='abono'){
                console.log(recibo, mes.value, mes.monto)
                abono=Number(mes.monto).toFixed(2);
            }
            return mes
        })
        dato.valores.mensualidades.meses.map(mes=>{
            let pos = meses.findIndex(f=>f.cedula===mes.cedula);
            if (pos===-1 && mes.value!=='abono_anterior' && mes.value!=='abono'){
                meses=[...meses,{
                    cedula:mes.cedula, nombres: `${mes.nombres} ${mes.apellidos}`,
                    inscripcion:'', septiembre:'',octubre:'',noviembre:'',
                    diciembre:'',enero:'',febrero:'',marzo:'', abril:'',
                    mayo:'',junio:'', julio:'',agosto:'',
                }];
                
                meses[meses.length-1][mes.value]=mes.monto;
                mensualidad+=mes.monto;
            }else if (pos!==-1){
                meses[pos][mes.value]= Number(mes.monto).toFixed(2);
                mensualidad+=mes.monto;
            }
        })
        meses.map(val=>{
            datos=[...datos,{
                No:datos[datos.length -1].No === '' ? 1 : datos[datos.length -1].No+1 , fecha, representante, cedular, recibo, total,
                mensualidad:mensualidad.toFixed(2),anterior:abono_anterior, abono:abono, diferido:'??',tmensualidad,otro:'??',
                ...val, tasa
            }]
            return
        })
        
        return 
    })
    console.log(datos)
    // const f = await (await fetch("https://sheetjs.com/pres.xlsx")).arrayBuffer();
    // const wb = read(f); // parse the array buffer
    // const ws = wb.Sheets[wb.SheetNames[0]]; // get the first worksheet
    // const data = utils.sheet_to_json(ws); // generate objects
    // console.log(data)
    setPres(datos); // update state
  })(); }, []);

  /* get state data and export to XLSX */
  const exportFile = useCallback(async() => {
    const {Inicio, Fin}= props;
    const ws = utils.json_to_sheet(pres);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    utils.sheet_add_aoa(ws, [
        ["","Fecha:", "U.E. COLEGIO LIBERTADORES DE AMERICA","","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
        ["",moment().format("DD/MM/YYYY"),"REPORTE"],
        ["","",`DESDE: ${moment(Inicio).format('DD/MM/YYYY')} HASTA: ${moment(Fin).format('DD/MM/YYYY')}`],
        ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
        ["","","","Cédula ó","No.","Monto Bs.","","Mensualidad","Mensualidad","","Total por","","Cédula","","","","","","","","","","","","","","","Factor","Total en",""],
        ["No.","Fecha","Representante","R.I.F.","Recibo","Factura","Mensualidad","Abono Aterior","Abono","Diferido","Mensualidad","","Estudiante","Nombres y Apellidos","Inscip.","Sep","Oct","Nov","Dic","Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Bs/$","Divisa",""],
    ], { origin: "A1" });
    let tamano = Object.keys(pres[0]).map((key,i)=>{
        
        const max_width1 = pres.reduce((w, r) => Math.max(w, String(r[key]).length), 5);
        return {wch: max_width1}
    })
    console.log(tamano);
    // const max_width1 = pres.reduce((w, r) => Math.max(w, r.Name.length), 10);
    
    ws["!cols"] = tamano;
    writeFileXLSX(wb, "SheetJSReactAoO.xlsx");
    //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    // const url = "https://sheetjs.com/data/executive.json";
    // const raw_data = await (await fetch(url)).json();
    // /* filter for the Presidents */
    // const prez = raw_data.filter(row => row.terms.some(term => term.type === "prez"));
    // /* sort by first presidential term */
    // prez.forEach(row => row.start = row.terms.find(term => term.type === "prez").start);
    // prez.sort((l,r) => l.start.localeCompare(r.start));
    // /* flatten objects */
    // const rows = prez.map(row => ({
    //     name: row.name.first + " " + row.name.last,
    //     birthday: row.bio.birthday
    // }));
    // /* generate worksheet and workbook */
    // const worksheet = utils.json_to_sheet(rows);
    // const workbook = utils.book_new();
    // utils.book_append_sheet(workbook, worksheet, "Dates");
    // /* fix headers */
    // utils.sheet_add_aoa(worksheet, [["Name", "Birthday"]], { origin: "A1" });

    // /* calculate column width */
    // const max_width = rows.reduce((w, r) => Math.max(w, r.name.length), 10);
    // worksheet["!cols"] = [ { wch: max_width } ];

    // /* create an XLSX file and try to save to Presidents.xlsx */
    // writeFile(workbook, "Presidents.xlsx", { compression: true });


  }, [pres]);
  
  return (  <table>
                <thead>
                    <tr>
                        {pres && pres.length!==0
                            ? Object.keys(pres[0]).map(val=>
                                <th key={val}>{val}</th>
                            ) 
                            : null
                        }
                        
                    </tr>
                </thead>
                <tbody>
                    { /* generate row for each president */
                        pres && pres.length!==0
                            ? pres.map(pr => 
                                <tr>
                                {Object.keys(pr).map(camp=> 
                                        
                                            <td>{pr[camp]}</td>
                                        
                                )}
                                </tr>
                            ) 
                            :null
                    }
                </tbody>
                <tfoot>
                    <td colSpan={2}>
                        <button onClick={exportFile}>Export XLSX</button>
                    </td>
                </tfoot>
            </table>);
}