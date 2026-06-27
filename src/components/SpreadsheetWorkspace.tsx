import React, { useState, useEffect, useRef } from "react";
import { 
  FileSpreadsheet, 
  Download, 
  Upload, 
  Bold, 
  Italic, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2, 
  TrendingUp, 
  RefreshCw, 
  HelpCircle,
  FileText,
  Maximize2,
  Minimize2
} from "lucide-react";
import { evaluate } from "mathjs";

// Helper range generator
const COLS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const ROWS_COUNT = 24;
const ROWS = Array.from({ length: ROWS_COUNT }, (_, i) => i + 1);

interface CellStyle {
  bold?: boolean;
  italic?: boolean;
  color?: string;
  bg?: string;
  align?: "left" | "center" | "right";
}

interface CellData {
  value: string; // The literal raw string typed by the user (e.g. "=SUM(A1:A5)" or "42")
  style?: CellStyle;
}

type GridData = { [key: string]: CellData };

export default function SpreadsheetWorkspace() {
  const [cells, setCells] = useState<GridData>({});
  const [activeCell, setActiveCell] = useState<string>("A1");
  const [editingValue, setEditingValue] = useState<string>("");
  const [chartColumn, setChartColumn] = useState<string>("A");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [csvPasteOpen, setCsvPasteOpen] = useState(false);
  const [csvInput, setCsvInput] = useState("");
  const [errorLog, setErrorLog] = useState<string>("");

  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when active cell changes
  useEffect(() => {
    const rawVal = cells[activeCell]?.value || "";
    setEditingValue(rawVal);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 10);
  }, [activeCell]);

  // Pre-configured templates
  const loadTemplate = (type: "budget" | "grades" | "science") => {
    const newCells: GridData = {};

    if (type === "budget") {
      const budgetData: { [key: string]: string } = {
        A1: "Monthly Budget Plan",
        A2: "Category", B2: "Budget ($)", C2: "Actual ($)", D2: "Variance ($)",
        A3: "Rent/Housing", B3: "1200", C3: "1200", D3: "=B3-C3",
        A4: "Groceries", B4: "400", C4: "460", D4: "=B4-C4",
        A5: "Utilities", B5: "250", C5: "230", D5: "=B5-C5",
        A6: "Transportation", B6: "150", C6: "140", D6: "=B6-C6",
        A7: "Entertainment", B7: "200", C7: "280", D7: "=B7-C7",
        A8: "Insurance", B8: "100", C8: "100", D8: "=B8-C8",
        A9: "Total Sum", B9: "=SUM(B3:B8)", C9: "=SUM(C3:C8)", D9: "=SUM(D3:D8)",
        A11: "Analysis",
        A12: "Max Spend", B12: "=MAX(C3:C8)",
        A13: "Min Spend", B13: "=MIN(C3:C8)",
        A14: "Average", B14: "=AVERAGE(C3:C8)"
      };

      // Set raw values
      Object.entries(budgetData).forEach(([k, v]) => {
        newCells[k] = { value: v };
      });

      // Apply gorgeous high-fidelity styles to headers and labels
      const headers = ["A2", "B2", "C2", "D2"];
      headers.forEach(h => {
        newCells[h] = {
          ...newCells[h],
          style: { bold: true, bg: "rgba(59, 130, 246, 0.1)", color: "#1e3a8a", align: "center" }
        };
      });

      newCells["A1"] = { value: budgetData.A1, style: { bold: true, color: "#1d4ed8", align: "left" } };
      newCells["A9"] = { value: budgetData.A9, style: { bold: true } };
      newCells["B9"] = { value: budgetData.B9, style: { bold: true, bg: "rgba(16, 185, 129, 0.05)" } };
      newCells["C9"] = { value: budgetData.C9, style: { bold: true, bg: "rgba(16, 185, 129, 0.05)" } };
      newCells["D9"] = { value: budgetData.D9, style: { bold: true, bg: "rgba(244, 63, 94, 0.05)" } };
      newCells["A11"] = { value: budgetData.A11, style: { bold: true, color: "#4f46e5" } };

      setCells(newCells);
      setChartColumn("C");
    } else if (type === "grades") {
      const gradesData: { [key: string]: string } = {
        A1: "Class Grades Ledger",
        A2: "Student", B2: "Math", C2: "Science", D2: "English", E2: "Average",
        A3: "Alex", B3: "88", C3: "92", D3: "85", E3: "=AVERAGE(B3:D3)",
        A4: "Jordan", B4: "95", C4: "89", D4: "94", E4: "=AVERAGE(B4:D4)",
        A5: "Taylor", B5: "72", C5: "81", D5: "79", E5: "=AVERAGE(B5:D5)",
        A6: "Morgan", B6: "90", C6: "95", D6: "91", E6: "=AVERAGE(B6:D6)",
        A7: "Casey", B7: "82", C7: "78", D7: "84", E7: "=AVERAGE(B7:D7)",
        A9: "Class Mean", B9: "=AVERAGE(B3:B7)", C9: "=AVERAGE(C3:C7)", D9: "=AVERAGE(D3:D7)", E9: "=AVERAGE(E3:E7)",
        A10: "Highest Score", B10: "=MAX(B3:B7)", C10: "=MAX(C3:C7)", D10: "=MAX(D3:D7)",
        A11: "Lowest Score", B11: "=MIN(B3:B7)", C11: "=MIN(C3:C7)", D11: "=MIN(D3:D7)"
      };

      Object.entries(gradesData).forEach(([k, v]) => {
        newCells[k] = { value: v };
      });

      const headers = ["A2", "B2", "C2", "D2", "E2"];
      headers.forEach(h => {
        newCells[h] = {
          ...newCells[h],
          style: { bold: true, bg: "rgba(139, 92, 246, 0.1)", color: "#4c1d95", align: "center" }
        };
      });

      newCells["A1"] = { value: gradesData.A1, style: { bold: true, color: "#6d28d9" } };
      newCells["A9"] = { value: gradesData.A9, style: { bold: true } };
      newCells["E9"] = { value: gradesData.E9, style: { bold: true, bg: "rgba(16, 185, 129, 0.1)" } };

      setCells(newCells);
      setChartColumn("E");
    } else if (type === "science") {
      const sciData: { [key: string]: string } = {
        A1: "Scientific Experimentation Board",
        A2: "Interval (s)", B2: "Velocity (m/s)", C2: "Kinetic Energy (J)", D2: "Notes",
        A3: "1", B3: "2.4", C3: "=0.5 * 10 * B3^2", D3: "Normal acceleration",
        A4: "2", B4: "4.8", C4: "=0.5 * 10 * B4^2", D4: "Normal acceleration",
        A5: "3", B5: "7.2", C5: "=0.5 * 10 * B5^2", D5: "Steady momentum",
        A6: "4", B6: "9.6", C6: "=0.5 * 10 * B6^2", D6: "High drag peak",
        A7: "5", B7: "12.0", C7: "=0.5 * 10 * B7^2", D7: "Target reached",
        A9: "Total Energy Sum", C9: "=SUM(C3:C7)",
        A10: "Mean Kinetic E", C10: "=AVERAGE(C3:C7)"
      };

      Object.entries(sciData).forEach(([k, v]) => {
        newCells[k] = { value: v };
      });

      const headers = ["A2", "B2", "C2", "D2"];
      headers.forEach(h => {
        newCells[h] = {
          ...newCells[h],
          style: { bold: true, bg: "rgba(16, 185, 129, 0.1)", color: "#065f46", align: "center" }
        };
      });

      newCells["A1"] = { value: sciData.A1, style: { bold: true, color: "#047857" } };
      newCells["C9"] = { value: sciData.C9, style: { bold: true, color: "#10b981" } };

      setCells(newCells);
      setChartColumn("C");
    }
  };

  // Safe Excel-like cell values evaluator
  const getEvaluatedCell = (cellId: string, visited: Set<string> = new Set()): string => {
    if (visited.has(cellId)) {
      return "#REF (Circular)";
    }

    const data = cells[cellId];
    if (!data || !data.value) return "";

    const rawVal = data.value.trim();
    if (!rawVal.startsWith("=")) {
      return rawVal; // Return constant number or string directly
    }

    try {
      visited.add(cellId);
      let formula = rawVal.substring(1); // strip '='

      // 1. Resolve Range Aggregate formulas: SUM, AVERAGE, MIN, MAX, COUNT, PRODUCT
      const rangeRegex = /(SUM|AVERAGE|MIN|MAX|COUNT|PRODUCT)\(([A-J])([0-9]+):([A-J])([0-9]+)\)/i;
      let match = formula.match(rangeRegex);

      while (match) {
        const fullMatch = match[0];
        const func = match[1].toUpperCase();
        const startCol = match[2];
        const startRow = parseInt(match[3]);
        const endCol = match[4];
        const endRow = parseInt(match[5]);

        // Gather all values in coordinates range
        const values: number[] = [];
        const colStartIdx = COLS.indexOf(startCol);
        const colEndIdx = COLS.indexOf(endCol);

        const colMin = Math.min(colStartIdx, colEndIdx);
        const colMax = Math.max(colStartIdx, colEndIdx);
        const rowMin = Math.min(startRow, endRow);
        const rowMax = Math.max(startRow, endRow);

        for (let colIdx = colMin; colIdx <= colMax; colIdx++) {
          for (let rowNum = rowMin; rowNum <= rowMax; rowNum++) {
            const currentId = `${COLS[colIdx]}${rowNum}`;
            const evalValStr = getEvaluatedCell(currentId, new Set(visited));
            const parsed = parseFloat(evalValStr);
            if (!isNaN(parsed)) {
              values.push(parsed);
            }
          }
        }

        let aggregateResult = 0;
        if (func === "SUM") {
          aggregateResult = values.reduce((sum, v) => sum + v, 0);
        } else if (func === "AVERAGE") {
          aggregateResult = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
        } else if (func === "MIN") {
          aggregateResult = values.length > 0 ? Math.min(...values) : 0;
        } else if (func === "MAX") {
          aggregateResult = values.length > 0 ? Math.max(...values) : 0;
        } else if (func === "COUNT") {
          aggregateResult = values.length;
        } else if (func === "PRODUCT") {
          aggregateResult = values.length > 0 ? values.reduce((prod, v) => prod * v, 1) : 0;
        }

        formula = formula.replace(fullMatch, aggregateResult.toString());
        match = formula.match(rangeRegex);
      }

      // 2. Resolve single string modifiers: UPPER, LOWER
      const stringRegex = /(UPPER|LOWER)\(([A-J])([0-9]+)\)/i;
      let strMatch = formula.match(stringRegex);
      while (strMatch) {
        const fullMatch = strMatch[0];
        const func = strMatch[1].toUpperCase();
        const refCellId = `${strMatch[2]}${strMatch[3]}`;
        const refVal = getEvaluatedCell(refCellId, new Set(visited));

        const resultStr = func === "UPPER" ? refVal.toUpperCase() : refVal.toLowerCase();
        formula = formula.replace(fullMatch, `"${resultStr}"`);
        strMatch = formula.match(stringRegex);
      }

      // 3. Resolve remaining cell reference tokens (e.g. A1, B3)
      const cellRefRegex = /\b([A-J])([1-9][0-9]*)\b/i;
      let refMatch = formula.match(cellRefRegex);
      while (refMatch) {
        const fullMatch = refMatch[0];
        const refCellId = fullMatch.toUpperCase();
        const evalVal = getEvaluatedCell(refCellId, new Set(visited));
        
        // If the cell contains a float/number, represent directly. Otherwise quotes for strings.
        const numericVal = parseFloat(evalVal);
        if (!isNaN(numericVal) && numericVal.toString() === evalVal.trim()) {
          formula = formula.replace(new RegExp(`\\b${fullMatch}\\b`, 'g'), numericVal.toString());
        } else {
          formula = formula.replace(new RegExp(`\\b${fullMatch}\\b`, 'g'), `"${evalVal}"`);
        }
        
        refMatch = formula.match(cellRefRegex);
      }

      // 4. Safe evaluation using mathjs
      const evaluated = evaluate(formula);
      if (typeof evaluated === "number") {
        return evaluated.toFixed(Number.isInteger(evaluated) ? 0 : 2);
      }
      return String(evaluated ?? "");
    } catch (err: any) {
      return "#VALUE!";
    }
  };

  const handleCellChange = (cellId: string, val: string) => {
    setCells(prev => ({
      ...prev,
      [cellId]: {
        ...prev[cellId],
        value: val
      }
    }));
  };

  const updateCellStyle = (property: keyof CellStyle, val: any) => {
    setCells(prev => {
      const cell = prev[activeCell] || { value: "" };
      const style = cell.style || {};
      return {
        ...prev,
        [activeCell]: {
          ...cell,
          style: {
            ...style,
            [property]: style[property] === val ? undefined : val // toggle
          }
        }
      };
    });
  };

  const clearSheet = () => {
    if (window.confirm("Are you sure you want to clear all spreadsheet cells and formatting?")) {
      setCells({});
      setActiveCell("A1");
      setEditingValue("");
      setErrorLog("");
    }
  };

  // CSV Exporter
  const handleExportCSV = () => {
    let csvContent = "";
    for (let r = 1; r <= ROWS_COUNT; r++) {
      const rowArr: string[] = [];
      for (let c = 0; c < COLS.length; c++) {
        const cellId = `${COLS[c]}${r}`;
        const val = getEvaluatedCell(cellId);
        // Handle comma styling
        if (val.includes(",") || val.includes("\n") || val.includes('"')) {
          rowArr.push(`"${val.replace(/"/g, '""')}"`);
        } else {
          rowArr.push(val || "");
        }
      }
      csvContent += rowArr.join(",") + "\r\n";
    }

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Axiom_Workbook.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Importer
  const handleImportCSV = () => {
    if (!csvInput.trim()) {
      setErrorLog("Please paste some valid CSV rows to load.");
      return;
    }

    try {
      const parsedCells: GridData = {};
      const lines = csvInput.split(/\r?\n/);
      
      lines.forEach((line, rIdx) => {
        if (rIdx >= ROWS_COUNT) return;
        // Simple comma parser splits values
        const rowValues = line.split(",");
        rowValues.forEach((val, cIdx) => {
          if (cIdx >= COLS.length) return;
          const colId = COLS[cIdx];
          const rowId = rIdx + 1;
          parsedCells[`${colId}${rowId}`] = { value: val.trim() };
        });
      });

      setCells(parsedCells);
      setCsvPasteOpen(false);
      setCsvInput("");
      setErrorLog("");
    } catch (err: any) {
      setErrorLog("CSV parsing failed. Ensure format is comma-separated.");
    }
  };

  // Calculate values for dynamic SVG charting of active column
  const getChartData = () => {
    const dataPoints: { label: string; val: number }[] = [];
    for (let r = 1; r <= ROWS_COUNT; r++) {
      const cellId = `${chartColumn}${r}`;
      const cellValStr = getEvaluatedCell(cellId);
      const parsedNum = parseFloat(cellValStr);
      if (!isNaN(parsedNum)) {
        // Label defaults to the Category column (A) or standard row coordinate
        const categoryLabelId = `A${r}`;
        const label = cells[categoryLabelId]?.value || `${chartColumn}${r}`;
        dataPoints.push({ label, val: parsedNum });
      }
    }
    return dataPoints;
  };

  const chartData = getChartData();
  const maxChartVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.val), 1) : 1;

  return (
    <div className="bg-white border border-slate-200 shadow-md rounded-3xl overflow-hidden p-4 md:p-6 text-left">
      {/* Workbook Title Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Axiom Spreadsheet Workspace</h3>
            <p className="text-[10px] text-slate-400">Perform real-time multi-cell algebraic formulas, statistics, and live data charts</p>
          </div>
        </div>

        {/* Template Quick Loader */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mr-1">Load templates:</span>
          <button
            onClick={() => loadTemplate("budget")}
            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] rounded-lg border border-blue-200 transition-all cursor-pointer"
          >
            Monthly Budget
          </button>
          <button
            onClick={() => loadTemplate("grades")}
            className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] rounded-lg border border-purple-200 transition-all cursor-pointer"
          >
            Grades Ledger
          </button>
          <button
            onClick={() => loadTemplate("science")}
            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-lg border border-emerald-200 transition-all cursor-pointer"
          >
            Physics Exp
          </button>
          <button
            onClick={clearSheet}
            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg border border-rose-200 transition-all cursor-pointer"
            title="Clear worksheet"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Grid Toolbar Controls */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 mb-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        {/* Style formatting */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => updateCellStyle("bold", true)}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              cells[activeCell]?.style?.bold
                ? "bg-slate-200/80 text-slate-900 border-slate-400 font-black"
                : "bg-white border-slate-200/60 hover:bg-slate-100 text-slate-600"
            }`}
            title="Bold text"
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => updateCellStyle("italic", true)}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              cells[activeCell]?.style?.italic
                ? "bg-slate-200/80 text-slate-900 border-slate-400"
                : "bg-white border-slate-200/60 hover:bg-slate-100 text-slate-600"
            }`}
            title="Italic text"
          >
            <Italic size={14} />
          </button>
          
          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Alignment */}
          <button
            onClick={() => updateCellStyle("align", "left")}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              cells[activeCell]?.style?.align === "left"
                ? "bg-slate-200/80 text-slate-900 border-slate-400"
                : "bg-white border-slate-200/60 hover:bg-slate-100 text-slate-600"
            }`}
            title="Align Left"
          >
            <AlignLeft size={14} />
          </button>
          <button
            onClick={() => updateCellStyle("align", "center")}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              cells[activeCell]?.style?.align === "center"
                ? "bg-slate-200/80 text-slate-900 border-slate-400"
                : "bg-white border-slate-200/60 hover:bg-slate-100 text-slate-600"
            }`}
            title="Align Center"
          >
            <AlignCenter size={14} />
          </button>
          <button
            onClick={() => updateCellStyle("align", "right")}
            className={`p-2 rounded-lg border transition-all cursor-pointer ${
              cells[activeCell]?.style?.align === "right"
                ? "bg-slate-200/80 text-slate-900 border-slate-400"
                : "bg-white border-slate-200/60 hover:bg-slate-100 text-slate-600"
            }`}
            title="Align Right"
          >
            <AlignRight size={14} />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          {/* Quick Color Fill options */}
          <span className="text-[9px] font-bold text-slate-400 uppercase hidden sm:inline">Fill:</span>
          <div className="flex items-center gap-1">
            {[
              { label: "Transparent", value: "" },
              { label: "Yellow Tint", value: "rgba(254, 240, 138, 0.4)" },
              { label: "Emerald Tint", value: "rgba(167, 243, 208, 0.4)" },
              { label: "Blue Tint", value: "rgba(191, 219, 254, 0.4)" },
              { label: "Rose Tint", value: "rgba(254, 205, 211, 0.4)" }
            ].map(col => (
              <button
                key={col.label}
                onClick={() => updateCellStyle("bg", col.value)}
                style={{ backgroundColor: col.value || "#fff" }}
                className={`w-5 h-5 rounded-md border border-slate-300 shadow-2xs hover:scale-105 transition-all cursor-pointer`}
                title={col.label}
              />
            ))}
          </div>
        </div>

        {/* Porting CSV Tools */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Download size={13} className="text-emerald-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setCsvPasteOpen(!csvPasteOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
          >
            <Upload size={13} className="text-blue-500" />
            <span>Import CSV</span>
          </button>
        </div>
      </div>

      {/* CSV importer overlay text */}
      {csvPasteOpen && (
        <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl mb-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wide">Import Commas Delimited CSV rows</span>
            <button onClick={() => setCsvPasteOpen(false)} className="text-slate-400 hover:text-slate-600 font-extrabold text-xs">Close ✕</button>
          </div>
          <textarea
            placeholder="Alex,88,92,85&#10;Jordan,95,89,94&#10;Taylor,72,81,79"
            rows={4}
            value={csvInput}
            onChange={(e) => setCsvInput(e.target.value)}
            className="w-full bg-white border border-blue-200 rounded-xl p-3 font-mono text-xs text-slate-800 outline-none focus:border-blue-400"
          />
          {errorLog && <div className="text-[10px] text-rose-600 font-bold">{errorLog}</div>}
          <button
            onClick={handleImportCSV}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-wider rounded-lg transition-all shadow-xs cursor-pointer"
          >
            Load into Active Cells
          </button>
        </div>
      )}

      {/* Live Excel Formula Bar */}
      <div className="border border-slate-200/80 bg-slate-50/50 rounded-2xl p-2.5 mb-4 grid grid-cols-12 gap-2 items-center">
        <div className="col-span-2 md:col-span-1 text-center bg-blue-600 text-white text-xs font-black py-1 px-2 rounded-lg font-mono">
          {activeCell}
        </div>
        <div className="col-span-1 text-center text-slate-400 font-bold text-sm font-mono select-none">
          =
        </div>
        <div className="col-span-9 md:col-span-10 relative flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={editingValue}
            onChange={(e) => {
              setEditingValue(e.target.value);
              handleCellChange(activeCell, e.target.value);
            }}
            placeholder="Type values or formulas starting with '=' (e.g. =SUM(A1:B3) or =A1+B1)"
            className="w-full bg-white border border-slate-200/80 rounded-xl py-2 px-3.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-mono"
          />
        </div>
      </div>

      {/* High Fidelity Scrollable Grid System */}
      <div className="overflow-x-auto border border-slate-200/80 rounded-2xl shadow-inner bg-slate-50">
        <table className="min-w-full border-collapse bg-white table-fixed">
          <thead>
            <tr className="bg-slate-100 select-none">
              {/* Row indexes column */}
              <th className="w-10 border-b border-r border-slate-200/80 bg-slate-100/80 text-[10px] font-black text-slate-500 text-center sticky left-0 z-10 py-1" />
              {COLS.map(col => (
                <th key={col} className="w-28 border-b border-r border-slate-200/80 text-[11px] font-black text-slate-600 text-center py-2 font-mono">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(row => (
              <tr key={row} className="hover:bg-slate-50/40">
                {/* Side Header (Row coordinates) */}
                <td className="border-b border-r border-slate-200/80 bg-slate-100/80 text-[10px] font-black text-slate-500 text-center sticky left-0 z-10 font-mono select-none py-1.5">
                  {row}
                </td>
                {COLS.map(col => {
                  const cellId = `${col}${row}`;
                  const isActive = activeCell === cellId;
                  const data = cells[cellId] || { value: "" };
                  const evalVal = getEvaluatedCell(cellId);

                  // Formatting setup
                  const boldClass = data.style?.bold ? "font-bold" : "";
                  const italicClass = data.style?.italic ? "italic" : "";
                  const alignmentClass = data.style?.align === "center" 
                    ? "text-center" 
                    : data.style?.align === "right" 
                      ? "text-right" 
                      : "text-left";

                  const customStyle: React.CSSProperties = {
                    backgroundColor: data.style?.bg || undefined,
                    color: data.style?.color || undefined,
                  };

                  return (
                    <td
                      key={col}
                      onClick={() => setActiveCell(cellId)}
                      style={customStyle}
                      className={`h-9 border-b border-r border-slate-200/60 p-1 text-[11px] font-medium outline-none cursor-pointer transition-all ${
                        isActive 
                          ? "ring-2 ring-blue-500 ring-inset bg-blue-50/20 z-10" 
                          : "hover:bg-blue-50/10"
                      } ${boldClass} ${italicClass} ${alignmentClass} font-mono overflow-hidden text-ellipsis whitespace-nowrap select-none`}
                    >
                      {/* Show evaluated value in cell, raw is stored in state */}
                      {evalVal}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Formula helper shelf */}
      <div className="mt-4 bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-2 flex items-center gap-1">
          <HelpCircle size={13} className="text-slate-400" /> Supported Algebraic & Formula Syntaxes
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-[10.5px] font-medium text-slate-500">
          <div>
            <strong className="text-slate-700 block font-bold">Standard Operations:</strong>
            Type <code className="font-mono bg-white px-1 border rounded text-blue-600 font-bold">=A1+B1</code> or <code className="font-mono bg-white px-1 border rounded text-blue-600 font-bold">=A3*2-B5</code>
          </div>
          <div>
            <strong className="text-slate-700 block font-bold">Sum & Products:</strong>
            Use <code className="font-mono bg-white px-1 border rounded text-blue-600 font-bold">=SUM(A3:A8)</code> or <code className="font-mono bg-white px-1 border rounded text-blue-600 font-bold">=PRODUCT(B1:C3)</code>
          </div>
          <div>
            <strong className="text-slate-700 block font-bold">Statistical Metrics:</strong>
            Use <code className="font-mono bg-white px-1 border rounded text-blue-600 font-bold">=AVERAGE(C3:C7)</code>, <code className="font-mono bg-white px-1 border rounded text-blue-600 font-bold">=MAX(D1:D10)</code>, or <code className="font-mono bg-white px-1 border rounded text-blue-600 font-bold">=MIN(A1:J24)</code>
          </div>
          <div>
            <strong className="text-slate-700 block font-bold">Text Case Modification:</strong>
            Use <code className="font-mono bg-white px-1 border rounded text-blue-600 font-bold">=UPPER(A3)</code> or <code className="font-mono bg-white px-1 border rounded text-blue-600 font-bold">=LOWER(B4)</code>
          </div>
        </div>
      </div>

      {/* Dynamic Visual Charting Panel (Synchronized Live) */}
      <div className="mt-6 border-t border-slate-200/80 pt-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" />
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Axiom Sheet Intelligence Chart</h4>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase">Target Column:</span>
            <select
              value={chartColumn}
              onChange={(e) => setChartColumn(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-700 outline-none"
            >
              {COLS.map(c => (
                <option key={c} value={c}>Column {c}</option>
              ))}
            </select>

            <span className="text-[10px] font-extrabold text-slate-400 uppercase ml-2">Chart View:</span>
            <div className="flex gap-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
              <button
                onClick={() => setChartType("bar")}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                  chartType === "bar" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${
                  chartType === "line" ? "bg-white text-blue-600 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Line
              </button>
            </div>
          </div>
        </div>

        {/* Live SVG Graph Renderer */}
        {chartData.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-10 text-center text-xs text-slate-400 font-medium">
            No numeric values found in Column {chartColumn} to display visual graph analytics. Insert some integers or load a sample template to start.
          </div>
        ) : (
          <div className="bg-slate-50/50 border border-slate-200/60 rounded-3xl p-4 flex flex-col md:flex-row gap-6 items-center">
            {/* Real SVG chart */}
            <div className="w-full md:w-3/4 bg-white border border-slate-100 p-4 rounded-2xl flex justify-center shadow-xs">
              <svg width="100%" height="240" viewBox="0 0 500 240" preserveAspectRatio="none" className="overflow-visible">
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => (
                  <line
                    key={idx}
                    x1="40"
                    y1={20 + p * 180}
                    x2="480"
                    y2={20 + p * 180}
                    stroke="#f1f5f9"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                ))}

                {/* Left Y Axis values */}
                {[1, 0.75, 0.5, 0.25, 0].map((p, idx) => (
                  <text
                    key={idx}
                    x="30"
                    y={24 + p * 180}
                    textAnchor="end"
                    className="text-[9px] font-mono font-bold fill-slate-400"
                  >
                    {Math.round((1 - p) * maxChartVal)}
                  </text>
                ))}

                {/* Render Bars or Lines */}
                {chartType === "bar" ? (
                  chartData.map((d, idx) => {
                    const count = chartData.length;
                    const spacing = 440 / count;
                    const x = 50 + idx * spacing;
                    const barHeight = (d.val / maxChartVal) * 180;
                    const y = 200 - barHeight;
                    const barWidth = Math.max(spacing - 10, 8);

                    return (
                      <g key={idx} className="group">
                        <rect
                          x={x}
                          y={y}
                          width={barWidth}
                          height={barHeight}
                          fill="url(#gradient-blue)"
                          rx="4"
                          className="transition-all duration-300 hover:fill-blue-600 hover:opacity-90"
                        />
                        {/* Tooltip text */}
                        <text
                          x={x + barWidth / 2}
                          y={Math.max(y - 6, 15)}
                          textAnchor="middle"
                          className="text-[9px] font-mono font-extrabold fill-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        >
                          {d.val}
                        </text>
                        {/* X Labels */}
                        <text
                          x={x + barWidth / 2}
                          y="220"
                          textAnchor="middle"
                          className="text-[8px] font-mono font-bold fill-slate-500 select-none"
                          transform={`rotate(15, ${x + barWidth / 2}, 220)`}
                        >
                          {d.label.length > 8 ? d.label.substring(0, 8) + ".." : d.label}
                        </text>
                      </g>
                    );
                  })
                ) : (
                  <>
                    {/* Line Path */}
                    <path
                      d={chartData.reduce((acc, d, idx) => {
                        const count = chartData.length;
                        const spacing = 440 / count;
                        const x = 50 + idx * spacing + spacing / 2;
                        const barHeight = (d.val / maxChartVal) * 180;
                        const y = 200 - barHeight;
                        return acc + `${idx === 0 ? "M" : "L"} ${x} ${y}`;
                      }, "")}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Line Points */}
                    {chartData.map((d, idx) => {
                      const count = chartData.length;
                      const spacing = 440 / count;
                      const x = 50 + idx * spacing + spacing / 2;
                      const barHeight = (d.val / maxChartVal) * 180;
                      const y = 200 - barHeight;

                      return (
                        <g key={idx} className="group">
                          <circle
                            cx={x}
                            cy={y}
                            r="5"
                            fill="#3b82f6"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                            className="transition-transform duration-200 hover:scale-125 hover:fill-emerald-500 cursor-pointer"
                          />
                          <text
                            x={x}
                            y={y - 8}
                            textAnchor="middle"
                            className="text-[9px] font-mono font-extrabold fill-slate-800 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                          >
                            {d.val}
                          </text>
                          <text
                            x={x}
                            y="220"
                            textAnchor="middle"
                            className="text-[8px] font-mono font-bold fill-slate-500 select-none"
                            transform={`rotate(15, ${x}, 220)`}
                          >
                            {d.label.length > 8 ? d.label.substring(0, 8) + ".." : d.label}
                          </text>
                        </g>
                      );
                    })}
                  </>
                )}

                {/* SVG Definitions */}
                <defs>
                  <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            {/* Sidebar metadata summary stats */}
            <div className="w-full md:w-1/4 space-y-4">
              <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
                <span className="text-[9px] font-extrabold text-slate-400 block tracking-widest uppercase">Chart Column Summary</span>
                <div className="mt-3 space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Record Count</span>
                    <span className="font-mono font-bold text-slate-900">{chartData.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Sum Value</span>
                    <span className="font-mono font-black text-emerald-600">
                      {chartData.reduce((sum, d) => sum + d.val, 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Average Mean</span>
                    <span className="font-mono font-bold text-blue-600">
                      {chartData.length > 0 ? (chartData.reduce((sum, d) => sum + d.val, 0) / chartData.length).toFixed(1) : 0}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-emerald-50/40 border border-emerald-100 p-3 rounded-2xl text-[10.5px] leading-relaxed text-emerald-800">
                <strong className="text-emerald-900">Pro-tip:</strong> Any coordinate reference that calculates to a numeric value in Column <strong className="font-mono">{chartColumn}</strong> automatically reflects on the live analytics board. Adjust any input value on the sheet to see the graph animate in real-time.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
