import express from "express";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// ... tu código de importación ...

// Añade estas líneas para definir __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static("public"));

// Base de datos en memoria
let participants = [];
let assignments = {};

// --- NUEVA FUNCIÓN: CARGAR CSV AL INICIO ---
const CSV_FILE_PATH = path.join(__dirname, 'participantes.csv'); // Ruta correcta

try {
    const csvContent = fs.readFileSync(CSV_FILE_PATH, 'utf-8');
    
    // Usamos el mismo bloque de parseo que en /api/upload-csv
    const rows = parse(csvContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
    });

    participants = rows.map(p => ({
        nombre: p.Nombre.trim(),
        telefono: p.Telefono?.trim() || "",
        restricciones: p.Restricciones
          ? p.Restricciones.split(";").map(r => r.trim()).filter(r => r)
          : []
    }));

    console.log(`✅ Participantes cargados al iniciar: ${participants.length}`);

} catch (err) {
    console.error(`❌ ERROR al cargar participantes.csv: ${err.message}`);
    // Opcional: Si Render no encuentra el archivo, seguirá usando la lista vacía.
}

// --- FUNCIÓN DE CARGA DE CSV ---
app.post("/api/upload-csv", (req, res) => {
  const { csvContent } = req.body;
  if (!csvContent) return res.json({ error: "CSV vacío" });

  try {
    const rows = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    participants = rows.map(p => ({
      nombre: p.Nombre.trim(),
      telefono: p.Telefono?.trim() || "",
      restricciones: p.Restricciones
        ? p.Restricciones.split(";").map(r => r.trim()).filter(r => r)
        : []
    }));

    return res.json({ ok: true, count: participants.length });
  } catch (err) {
    return res.json({ error: err.message });
  }
});

// --- SORTEO CON RESTRICCIONES ---
function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function esValido(dador, receptor) {
  return !dador.restricciones.includes(receptor.nombre) &&
         dador.nombre !== receptor.nombre;
}

function resolverSorteo(lista) {
  let asignacion = {};
  let usados = new Set();

  function backtrack(i) {
    if (i === lista.length) return true;

    const dador = lista[i];

    for (const receptor of shuffle([...lista])) {
      if (usados.has(receptor.nombre)) continue;
      if (!esValido(dador, receptor)) continue;

      asignacion[dador.nombre] = receptor.nombre;
      usados.add(receptor.nombre);

      if (backtrack(i + 1)) return true;

      usados.delete(receptor.nombre);
      delete asignacion[dador.nombre];
    }
    return false;
  }

  return backtrack(0) ? asignacion : null;
}

app.post("/api/generar", (req, res) => {
  const resultado = resolverSorteo(participants);

  if (!resultado)
    return res.json({ error: "No se pudo generar un sorteo válido" });

  assignments = resultado;
  return res.json({ ok: true, assignments });
});

// --- CONSULTA DE ASIGNACIÓN ---
app.post("/api/check", (req, res) => {
  const { nombre } = req.body;
  if (!nombre) return res.json({ error: "Nombre requerido" });

  const asignado = assignments[nombre];
  if (!asignado) return res.json({ error: "No encontrado o sorteo no creado" });

  return res.json({ ok: true, amigo: asignado });
});

app.listen(3000, () => console.log("Servidor funcionando en http://localhost:3000"));
