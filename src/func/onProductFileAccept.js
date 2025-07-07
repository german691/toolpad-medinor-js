import Papa from "papaparse";
import * as XLSX from "xlsx";

const normalizeHeaderKey = (header) => {
  return header.replace(/\s+/g, "").replace(/\./g, "").toUpperCase();
};

export const validateAndCleanProductData = (json) => {
  if (!json || json.length === 0) {
    throw new Error(
      "El archivo de productos está vacío o no contiene filas con datos."
    );
  }

  const firstRowHeaders = Object.keys(json[0] || {});

  const headerMap = {
    CODIGO: ["Codigo"],
    NOTASARTICULO: ["Notas ArtÃ­culo", "Notas Artículo"],
    LABORATORIO: ["Laboratorio"],
    DESCRIPCION: ["DescripciÃ³n", "Descripción"],
    DESCRIPCIONADICIONAL: ["DescripciÃ³n Adicional", "Descripción Adicional"],
    CATEGORIA: ["CategorÃ­a", "Categoría"],
    CODIVA: ["Cod. IVA"],
    PRMEDINOR: ["Pr. Medinor"],
    PRPUBLICO: ["Pr. PÃºblico", "Pr. Público"],
    PRCOSTO: ["Pr. Costo"],
  };

  const foundHeaders = {};
  const missingHeaders = [];

  for (const expectedNormalizedHeader in headerMap) {
    const possibleCsvNames = headerMap[expectedNormalizedHeader];
    let found = false;
    for (const csvName of possibleCsvNames) {
      if (firstRowHeaders.includes(csvName)) {
        foundHeaders[expectedNormalizedHeader] = csvName;
        found = true;
        break;
      }
    }
    if (!found) {
      const foundHeaderKey = firstRowHeaders.find(
        (h) => normalizeHeaderKey(h) === expectedNormalizedHeader
      );
      if (foundHeaderKey) {
        foundHeaders[expectedNormalizedHeader] = foundHeaderKey;
        found = true;
      }
    }
    if (!found) {
      missingHeaders.push(expectedNormalizedHeader);
    }
  }

  if (missingHeaders.length > 0) {
    throw new Error(
      `El archivo de productos es inválido. Faltan las columnas requeridas: ${missingHeaders.join(", ")}. Por favor, verifique el archivo.`
    );
  }

  const seenProductCodes = new Set();
  const cleanedData = [];

  for (const row of json) {
    const code = String(row[foundHeaders["CODIGO"]] || "").trim();
    const lab = String(row[foundHeaders["LABORATORIO"]] || "").trim();
    const desc = String(row[foundHeaders["DESCRIPCION"]] || "").trim();
    // Corrected variable name from 'cateogry' to 'category' for consistency
    const category = String(row[foundHeaders["CATEGORIA"]] || "").trim();

    if (!code || code === "" || !lab || lab === "" || !desc || desc === "") {
      console.warn(
        `Saltando fila incompleta: Codigo='${code}', Lab='${lab}', Desc='${desc}'`,
        row
      );
      continue;
    }

    if (seenProductCodes.has(code)) {
      console.warn(`Saltando producto duplicado por código: ${code}`);
      continue;
    }
    seenProductCodes.add(code);

    const ivaValue = String(row[foundHeaders["CODIVA"]] || "").trim();
    const hasIVA = ivaValue === "2";

    const medinorPrice =
      parseFloat(
        String(row[foundHeaders["PRMEDINOR"]] || "0").replace(",", ".")
      ) || 0;
    const publicPrice =
      parseFloat(
        String(row[foundHeaders["PRPUBLICO"]] || "0").replace(",", ".")
      ) || 0;
    const costPrice =
      parseFloat(
        String(row[foundHeaders["PRCOSTO"]] || "0").replace(",", ".")
      ) || 0;

    cleanedData.push({
      code: code,
      notes: String(row[foundHeaders["NOTASARTICULO"]] || "") || null,
      category: category, // Using the corrected 'category' variable
      lab: lab,
      desc: desc,
      extra_desc:
        String(row[foundHeaders["DESCRIPCIONADICIONAL"]] || "") || null,
      iva: hasIVA,
      medinor_price: medinorPrice,
      public_price: publicPrice,
      price: costPrice,
      imageUrl: null,
    });
  }

  if (cleanedData.length === 0) {
    throw new Error(
      "El archivo de productos no contiene ningún registro válido según los criterios de limpieza (ej. código, lab, o descripción vacíos, o todos duplicados)."
    );
  }

  return cleanedData;
};

export const processProductFile = (file) => {
  return new Promise((resolve, reject) => {
    const fileName = file.name.toLowerCase();
    const isCsv = fileName.endsWith(".csv");
    const isExcel = fileName.endsWith(".xls") || fileName.endsWith(".xlsx");

    const processJson = (json) => {
      try {
        const cleaned = validateAndCleanProductData(json);
        resolve(cleaned);
      } catch (e) {
        reject(e);
      }
    };

    if (isCsv) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvString = event.target?.result;
        Papa.parse(csvString, {
          header: true,
          skipEmptyLines: true,
          encoding: "UTF-8",
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn(
                "Advertencias/Errores de Papaparse:",
                results.errors
              );
            }
            processJson(results.data);
          },
          error: (err) =>
            reject(
              new Error("Error al parsear el archivo CSV: " + err.message)
            ),
        });
      };
      reader.onerror = () =>
        reject(new Error("No se pudo leer el archivo CSV."));
      reader.readAsText(file, "UTF-8");
    } else if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target || !e.target.result) {
          return reject(
            new Error("No se pudo leer el contenido del archivo Excel.")
          );
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
              "Error al leer el archivo Excel. Asegúrese de que no esté corrupto o que el formato sea correcto: " +
                err.message
            )
          );
        }
      };
      reader.onerror = () =>
        reject(new Error("No se pudo leer el archivo Excel."));
      reader.readAsArrayBuffer(file);
    } else {
      reject(
        new Error("Formato de archivo no soportado. Solo CSV, XLS o XLSX.")
      );
    }
  });
};
