import Home from './home';
import Registros from './sistema/registros';
import Asignados from './sistema/asignados';
import Inscripcion from './sistema/inscripcion';
import Pagar from './sistema/pagar';
import Productos from './sistema/productos';
import { colegio_administrativo_pantallas } from './sistema/administrativo/pantallas';
import { colegio_configuracion_pantallas } from './sistema/configuracion/pantallas';
import MisDatos from './sistema/representante';
import RecibosR from './sistema/representante/recibos';
import Censo from './sistema/Censo';
import Pruebas from './pruebas';
export const pantallas={
    Home,
    Inicio:Home,
    Inscripcion,
    Pagar,
    Asignados,
    Productos,
    Administrativo:{...colegio_administrativo_pantallas},
    Registros,
    Configuracion:{...colegio_configuracion_pantallas},
    MisDatos,
    RecibosR,
    Censo,
    Pruebas
}