import React,{ useEffect, useState} from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { read, readFile, utils, writeFile} from 'xlsx';

export default function SimplePrueba() {
    const Probando =async() =>{
        console.log('Por aiqiqiqi')
        let file = await (await fetch("utilidad/formato.xlsm")).arrayBuffer();
        const blob = read(file, {bookVBA: true}).vbaraw;
        // const wb = read(file,{cellStyles:true});
        // const ws = wb.Sheets[wb.SheetNames[0]];
        /* generate HTML */
        // const html = utils.sheet_to_html(ws);//utils.sheet_to_formulae(ws)//
        let res= utils.sheet_to_formulae(ws);
        res=[...res, "A10='aqui"]
        console.log(res)
        var ws = utils.aoa_to_sheet([
            ["A", "B", "C"],
            [{t:"n", v:1}, 2, { t: "n", f: "SUM(A2:B2)" }],
            [3, 4, { t: "n", f: "A3+B3" },{t:"n",f:"SUM(A2:A3*B2:B3)"}]
        ]);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, 'otro');
        // writeFile(wb, "Probando.xlsm",{cellStyles:true});
        wb.vbaraw = blob;
        writeFile(wb, "Probando.xlsm",{cellStyles:true, bookVBA:true});
        // var ws = utils.aoa_to_sheet([
        //     ["A", "B", "C"],
        //     [{t:"n", v:1}, 2, { t: "n", f: "SUM(A2:B2)" }],
        //     [3, 4, { t: "n", f: "A3+B3" },{t:"n",f:"SUM(A2:A3*B2:B3)"}]
        // ]);
        // ws["D3"] = { t: "n", f: "SUM(A2:A3*B2:B3)", F: "C4:C4" };
        // const wb = utils.book_new();
        // utils.book_append_sheet(wb, ws, "Sheet2");
        // writeFile(wb, "SheetJSFormulae.xlsx");
        // var tbl = document.getElementById('tabla1');
        // var wb = utils.table_to_book(tbl);
        // writeFile(wb, "SheetJSTable.xlsx");
    }
    useEffect(()=>{
        (async() => {
            // const workbook1 = readFile("utilidad/formato.xlsm");
            // console.log(workbook1)

        })();
    },[])
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        '& > :not(style)': {
          m: 1,
          width: 128,
          height: 128,
        },
      }}
    >
      <div id={'ejemplo'}>
        <table id='tabla1'>
            <tr><th style={{backgroundColor:'#f0f'}}>Cell</th><th>data-t</th><th>data-v</th><th>data-z</th></tr>
            <tr><td>2012-12-03</td><td/><td/><td/></tr>
            <tr><td data-t="s">2012-12-03</td><td>s</td><td/><td/></tr>
            <tr><td data-t="n" data-v="41246">2012-12-03</td><td>n</td><td>41246</td><td/></tr>
            <tr><td data-t="n" data-v="41246" data-z="yyyy-mm-dd">2012-12-03</td><td>n</td><td>41246</td><td>yyyy-mm-dd</td></tr>
        </table>

      </div>
      <Paper elevation={3} onClick={Probando}/>
    </Box>
  );
}