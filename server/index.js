const path = require('path');
const express= require('express');
const app = express();
const cors = require('cors');
const http = require('http').Server(app);

require('dotenv').config({path:'./server/variables.env'});

//Importar variable
const host = process.env.HOST || '0.0.0.0';
const port = process.env.PORT || 3500;
// settings
app.set('port', port );
let direccion = __dirname.indexOf('server')===-1 ? __dirname : __dirname.replace(`${path.sep}server`,'');
console.log(direccion,`${path.sep}`);
app.use(express.static(path.join(direccion,`build`)));

app.use(cors());
app.get('*',async(req,res) =>{
    res.sendFile(path.join(__dirname,'build','index.html'));
})
http.listen(port, ()=>{
      console.log('Servidor iniciado nueva version', port, host);
})