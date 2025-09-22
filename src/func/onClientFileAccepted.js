import Papa from "papaparse";
import * as XLSX from "xlsx";

export const validateAndCleanData = (json) => {
  if (!json || json.length === 0) {
    throw new Error("El archivo está vacío o no contiene filas con datos.");
  }

  const headers = Object.keys(json[0]);

  const findHeader = (headerName) =>
    headers.find(
      (h) => h?.toString().toUpperCase() === headerName.toUpperCase()
    );

  const codClientHeader = findHeader("COD_CLIENT");
  const razonSociHeader = findHeader("RAZON_SOCI");
  const identiftriHeader = findHeader("IDENTIFTRI");
  const levelHeader = findHeader("LEVEL");

  if (!codClientHeader || !razonSociHeader || !identiftriHeader) {
    const missing = [];
    if (!codClientHeader) missing.push("COD_CLIENT");
    if (!razonSociHeader) missing.push("RAZON_SOCI");
    if (!identiftriHeader) missing.push("IDENTIFTRI");
    throw new Error(
      `El archivo es inválido. Faltan las columnas requeridas: ${missing.join(", ")}.`
    );
  }

  const isNilOrEmpty = (v) =>
    v === undefined || v === null || (typeof v === "string" && v.trim() === "");

  const parseLevelIfNumeric = (raw) => {
    if (isNilOrEmpty(raw)) return undefined;

    if (typeof raw === "number" && Number.isFinite(raw)) {
      return Math.trunc(raw);
    }
    if (typeof raw === "string") {
      const s = raw.trim();
      if (/^\d+$/.test(s)) return Math.trunc(Number(s));
    }
    return undefined;
  };

  const seenCodClients = new Set();
  const cleanedData = [];

  for (const row of json) {
    const codClient = row[codClientHeader];
    const identiftri = row[identiftriHeader];
    const razonSoci = row[razonSociHeader];
    const levelRaw = levelHeader ? row[levelHeader] : undefined;

    if (!codClient || !identiftri) continue;

    const codClientStr = String(codClient).trim();
    if (seenCodClients.has(codClientStr)) continue;
    seenCodClients.add(codClientStr);

    const out = {
      COD_CLIENT: codClientStr,
      RAZON_SOCI: String(razonSoci ?? "")
        .trim()
        .toUpperCase(),
      IDENTIFTRI: String(identiftri).trim(),
    };

    const parsedLevel = parseLevelIfNumeric(levelRaw);
    if (parsedLevel !== undefined) {
      out.LEVEL = parsedLevel;
    }

    cleanedData.push(out);
  }

  if (cleanedData.length === 0) {
    throw new Error(
      "El archivo no contiene ningún registro válido según los criterios."
    );
  }

  return cleanedData;
};

export const processClientFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();
    const isCsv = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xls") || fileName.endsWith(".xlsx");

    const processJson = (json) => {
      try {
        const cleaned = validateAndCleanData(json);
        resolve(cleaned);
      } catch (e) {
        reject(e);
      }
    };

    if (isCsv) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processJson(results.data),
        error: (err) =>
          reject(new Error("Error al parsear el archivo CSV: " + err.message)),
      });
    } else if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target || !e.target.result) {
          return reject(new Error("No se pudo leer el contenido del archivo."));
        }
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(sheet, {
            defval: "",
          });
          processJson(json);
        } catch (err) {
          reject(
            new Error(
              "Error al leer el archivo Excel. Asegúrese de que no esté corrupto."
            )
          );
        }
      };
      reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error("Formato no soportado. Solo CSV, XLS o XLSX."));
    }
  });
};
