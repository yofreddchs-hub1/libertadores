import * as React from 'react';
import { styled } from '@mui/material/styles';
import { Paper, Typography } from '@mui/material';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';

import Stack from '@mui/material/Stack';

import Scrollbars from '../herramientas/scrolbars';

import './style.css';
import { Ver_Valores,  } from '../../constantes';


//Icono
import CheckIcon from '@mui/icons-material/Check';

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    minWidth:120
  }));
  

function Modificaciones (props) {
    const estilos=Ver_Valores().config.Estilos.Datos ? Ver_Valores().config.Estilos.Datos : {}
    console.log(props)
    return(
        
        <Scrollbars 
            sx={{overflow:'auto', width: window.innerWidth * 0.78}}
        >
            <Stack
                direction="row"
                spacing={1}
                divider={<Divider orientation="vertical" flexItem />}
            >
                <Item>
                    <TextField
                        variant="outlined"
                        label="Fila Inicial"
                        defaultValue={props.iniciar }
                        value={props.iniciar }
                        name= {'iniciar'}
                        type={'number'}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        size="small"
                        onChange={
                            props.Modificar
                          }
                    />
                </Item>
                <Item>Item 2</Item>
                
            </Stack>
        </Scrollbars>
           
    )
}

export default Modificaciones;