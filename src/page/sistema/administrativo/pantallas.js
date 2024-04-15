import Inicio from './';
import Representante from './representante';
import Estudiante from './estudiante';
import Docente from './docente';
import Recibo from './recibo';
import Solvencia from './solvencias';
import RInscripcion from './inscripcion';
import RAranceles from './arancel';
import Referencia from './referencia';
import Horarios from './horarios';
import RCensos from './censos';
export const colegio_administrativo_pantallas={
    Administrativo: Inicio,
    Inscripciones: RInscripcion,
    Aranceles: RAranceles,
    Representantes:Representante,
    Estudiantes:Estudiante,
    Docentes:Docente,
    Recibos:Recibo,
    Solvencias:Solvencia,
    Referencias: Referencia,
    Horario:Horarios,
    Censos:RCensos
}