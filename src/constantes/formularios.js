import { Ver_Valores, conexiones } from ".";
import funcionesespeciales from './fespeciales';
export const Form_todos = (key, config=null, quitar=null, disabled=null)=>{
    //quitar es para los campos que no se desean mostrar
    let Form= config===null ? Ver_Valores().config.Formularios[key.trim()] : config.Formularios[key.trim()];
    if (Form && quitar!==null){
        let nuevo = []
        if (typeof quitar==='string'){
            quitar =[quitar];
        }
        Form.value.map(valor=>{
            if (disabled && disabled.indexOf(valor.nombre)!==-1){
                valor.disabled=true;
            }
            if (quitar.indexOf(valor.nombre)===-1){
                nuevo=[...nuevo,valor]
            }
            return valor
        })
        Form.value= nuevo
    }
    return Form
            ? Form
            : {columna:1,
                value:[ 
                    {"key":"xnonex", "name":"xnonex", placeholder:"Sin formulario asignado" },
                ]
              }
};

export const Titulos_todos = async(key, config=null)=>{
    let Form= config===null ? [...Ver_Valores().config.Titulos[key.trim()]] : [...config.Titulos[key.trim()]];
    Form= Form
            ? Form
            : [ 
                {title:'_id',field:'_id'},
                {title:'Creado',field:'createdAt'},
             ]
    for (let i=0; i<Form.length; i++ ){
        let valor = {...Form[i]};
        if (valor.type && valor.type==='singleSelect'){
            if (typeof valor.valueOptions==='string'){
                if (valor.valueOptions.indexOf('lista_')!==-1){
                    const lista = Ver_Valores().config.Listas[valor.valueOptions];
                    valor.valueOptions= lista!== undefined ? lista.map(val=>val.titulo): [];
                }else{
                    if (valor.valueOptions.indexOf('lista_')===-1){
                        let lista =await conexiones.Leer_C([valor.valueOptions],{[valor.valueOptions]:{}})
                        if (lista.Respuesta==='Ok'){
                            lista= lista.datos[valor.valueOptions]
                        }else{
                            lista=[]
                        }
                        valor.valueOptions= lista!== undefined ? lista.map(val=>val.valores.banco.titulo): [];
                    }
                }
            }
            Form[i]=valor;
        }
    }
    return Dar_formato(Form)
};

const Dar_formato =(Form)=>{
    let nuevo= Form.map(v=>{
        let valor={...v}
        if (Object.keys(v).indexOf('formato')!==-1){
            
            if (typeof v.formato ==='string'){
                valor['formato']=Funciones_Especiales(v.formato)//eval(v.formato)    
            }else{
                valor['formato']=v.formato
            }
        }
        if (valor.tipo){ 
            if(valor.tipo.indexOf('lista_')!==-1){
                const lista= Ver_Valores().config.Listas[valor.tipo];
                valor.formato= (dato)=> {
                    // console.log(dato.valores, valor.tipo, lista, typeof dato.valores[valor.field])
                    if (dato.createdAt && !dato.valores){
                        return 'sin valores'
                    }
                    if (dato.valores && typeof dato.valores[valor.field]==='string')
                    return `${lista[dato.valores[valor.field]].titulo}`
                    if (dato.valores && typeof dato.valores[valor.field]==='object')
                    return `${dato.valores[valor.field].titulo}`
                    return `${lista[dato[valor.field]].titulo}`
                }
            }
        }
        // if (valor.type && valor.type==='singleSelect'){
        //     if (typeof valor.valueOptions==='string'){
        //         if (valor.valueOptions.indexOf('lista_')){
        //             const lista = Ver_Valores().config.Listas[valor.valueOptions];
        //             valor.valueOptions= lista!== undefined ? lista.map(val=>val.titulo): [];
        //         }
        //     }
        //     // console.log(valor.type, valor)
        // }
        return valor
    })
    return nuevo
}

export const Funciones_Especiales = (funcion) =>{
    // console.log(funcion)
    let formato;
    try{
        formato = eval(funcion);
    }catch(e){
        // console.log(e)
        // console.log('No es funcion')
    }
    
    if (typeof formato ==='function'){
        return formato;
    }else{
        formato = funcionesespeciales[funcion];
        if (formato===undefined){
            formato= funcion
        }
    }
    
    return formato

}

export const Form_excel_cols =(key, config=null)=>{
    const Form= config===null ? Ver_Valores().config.Formularios[key ? key.trim() : ''] : config.Formularios[key ? key.trim() : ''];
    return Form
            ? [{name:'Item', key:0},...Form.value.map((val, i)=>{return {name:val.name, key:i+1, campo:val.campo, pos: val.pos ? val.pos : i}})]
            :   [ 
                    {"name":"I", "key":0},
                    {"name":"name", "key":1} 
                ]
                
};
