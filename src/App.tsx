import React, { useState, useRef, useEffect } from "react";
import { evaluate } from "mathjs";
import { 
  Calculator, 
  Camera, 
  BookOpen, 
  Search, 
  Youtube, 
  Trash2, 
  RefreshCw, 
  Upload, 
  FileText, 
  CheckCircle, 
  HelpCircle, 
  Compass, 
  Sparkles, 
  ChevronRight, 
  X, 
  Cpu, 
  CornerDownRight,
  TrendingUp,
  Info,
  Mail,
  BookMarked,
  Layers,
  ArrowRight,
  Award,
  CheckSquare,
  Scale,
  Binary,
  RotateCcw,
  ChevronDown,
  FileSpreadsheet
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PRELOADED_FORMULAS } from "./formulasData";
import { Formula, SolveResult, DeepFormulaExplanation } from "./types";
import SpreadsheetWorkspace from "./components/SpreadsheetWorkspace";

// Scientific and physics constants with descriptions for the quick-inject shelf
interface ScienceConstant {
  symbol: string;
  value: string;
  label: string;
  unit: string;
}

const SCI_CONSTANTS: ScienceConstant[] = [
  { symbol: "π", value: "pi", label: "Pi Ratio", unit: "3.14159..." },
  { symbol: "e", value: "2.7182818", label: "Euler's Number", unit: "2.71828..." },
  { symbol: "φ", value: "1.6180339", label: "Golden Ratio", unit: "1.61803..." },
  { symbol: "c", value: "299792458", label: "Speed of Light", unit: "m/s" },
  { symbol: "G", value: "6.6743e-11", label: "Gravity Constant", unit: "N·m²/kg²" },
  { symbol: "h", value: "6.62607015e-34", label: "Planck's Constant", unit: "J·s" },
  { symbol: "R", value: "8.3144626", label: "Ideal Gas Constant", unit: "J/(mol·K)" },
  { symbol: "Nₐ", value: "6.02214076e23", label: "Avogadro Number", unit: "mol⁻¹" }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<"engine" | "scan" | "formulas" | "practice" | "sheets">("engine");
  const [menuOpen, setMenuOpen] = useState(false);

  // ==========================================
  // ADVANCED CALCULATOR SUB-TABS STATE
  // ==========================================
  const [calcSubTab, setCalcSubTab] = useState<"standard" | "equations" | "converter">("standard");

  // Equation Solver States
  const [quadA, setQuadA] = useState("1");
  const [quadB, setQuadB] = useState("-5");
  const [quadC, setQuadC] = useState("6");
  const [quadResult, setQuadResult] = useState<{ x1: string; x2: string; vertex: string; details: string } | null>(null);

  const [sysA1, setSysA1] = useState("2");
  const [sysB1, setSysB1] = useState("3");
  const [sysC1, setSysC1] = useState("12");
  const [sysA2, setSysA2] = useState("1");
  const [sysB2, setSysB2] = useState("-1");
  const [sysC2, setSysC2] = useState("1");
  const [sysResult, setSysResult] = useState<{ x: string; y: string; details: string } | string | null>(null);

  // Unit Converter & Base-N States
  const [baseInput, setBaseInput] = useState("42");
  const [fromBase, setFromBase] = useState<"10" | "16" | "2" | "8">("10");
  const [baseResultDec, setBaseResultDec] = useState("42");
  const [baseResultHex, setBaseResultHex] = useState("2A");
  const [baseResultBin, setBaseResultBin] = useState("101010");
  const [baseResultOct, setBaseResultOct] = useState("52");

  const [unitValue, setUnitValue] = useState("1");
  const [unitType, setUnitType] = useState<"length" | "mass" | "temp" | "speed">("length");
  const [unitFrom, setUnitFrom] = useState("m");
  const [unitTo, setUnitTo] = useState("ft");
  const [unitResultValue, setUnitResultValue] = useState("3.28084");

  // ==========================================
  // TAB 4: PRACTICE HUB STATE
  // ==========================================
  const [quizTopic, setQuizTopic] = useState("");
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<any | null>(null);
  const [quizError, setQuizError] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: number]: string }>({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Solver helper calculators
  const solveQuadratic = () => {
    const a = parseFloat(quadA);
    const b = parseFloat(quadB);
    const c = parseFloat(quadC);

    if (isNaN(a) || isNaN(b) || isNaN(c)) {
      setQuadResult({ x1: "N/A", x2: "N/A", vertex: "N/A", details: "Please enter valid numerical coefficients." });
      return;
    }

    if (a === 0) {
      setQuadResult({
        x1: String(-c / b),
        x2: "Linear Equation",
        vertex: "N/A",
        details: "Since a = 0, this is a linear equation: bx + c = 0."
      });
      return;
    }

    const d = b * b - 4 * a * c;
    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    const vertexStr = `(${vertexX.toFixed(3)}, ${vertexY.toFixed(3)})`;

    if (d > 0) {
      const x1 = (-b + Math.sqrt(d)) / (2 * a);
      const x2 = (-b - Math.sqrt(d)) / (2 * a);
      setQuadResult({
        x1: x1.toFixed(4),
        x2: x2.toFixed(4),
        vertex: vertexStr,
        details: `Two distinct real roots. Discriminant (D) = ${d.toFixed(2)} > 0.`
      });
    } else if (d === 0) {
      const x = -b / (2 * a);
      setQuadResult({
        x1: x.toFixed(4),
        x2: x.toFixed(4),
        vertex: vertexStr,
        details: `One repeated real root. Discriminant (D) = 0.`
      });
    } else {
      const real = -b / (2 * a);
      const imag = Math.sqrt(-d) / (2 * a);
      setQuadResult({
        x1: `${real.toFixed(4)} + ${imag.toFixed(4)}i`,
        x2: `${real.toFixed(4)} - ${imag.toFixed(4)}i`,
        vertex: vertexStr,
        details: `Two complex conjugate roots. Discriminant (D) = ${d.toFixed(2)} < 0.`
      });
    }
  };

  const solveSystem = () => {
    const a1 = parseFloat(sysA1);
    const b1 = parseFloat(sysB1);
    const c1 = parseFloat(sysC1);
    const a2 = parseFloat(sysA2);
    const b2 = parseFloat(sysB2);
    const c2 = parseFloat(sysC2);

    if (isNaN(a1) || isNaN(b1) || isNaN(c1) || isNaN(a2) || isNaN(b2) || isNaN(c2)) {
      setSysResult("Invalid numerical values in coefficients.");
      return;
    }

    const det = a1 * b2 - a2 * b1;
    if (det === 0) {
      const detX = c1 * b2 - c2 * b1;
      const detY = a1 * c2 - a2 * c1;
      if (detX === 0 && detY === 0) {
        setSysResult({ x: "Infinite", y: "Infinite", details: "System has infinitely many solutions (dependent lines)." });
      } else {
        setSysResult("No unique solution exists (parallel lines).");
      }
    } else {
      const x = (c1 * b2 - c2 * b1) / det;
      const y = (a1 * c2 - a2 * c1) / det;
      setSysResult({
        x: x.toFixed(4),
        y: y.toFixed(4),
        details: `Determinant (D) = ${det}. Unique solution found using Cramer's rule.`
      });
    }
  };

  // Base-N Converter calculation hook
  useEffect(() => {
    if (!baseInput.trim()) return;
    try {
      let decVal = NaN;
      if (fromBase === "10") decVal = parseInt(baseInput, 10);
      else if (fromBase === "16") decVal = parseInt(baseInput, 16);
      else if (fromBase === "2") decVal = parseInt(baseInput, 2);
      else if (fromBase === "8") decVal = parseInt(baseInput, 8);

      if (!isNaN(decVal)) {
        setBaseResultDec(decVal.toString(10));
        setBaseResultHex(decVal.toString(16).toUpperCase());
        setBaseResultBin(decVal.toString(2));
        setBaseResultOct(decVal.toString(8));
      } else {
        setBaseResultDec("Error");
        setBaseResultHex("Error");
        setBaseResultBin("Error");
        setBaseResultOct("Error");
      }
    } catch {
      setBaseResultDec("Error");
      setBaseResultHex("Error");
      setBaseResultBin("Error");
      setBaseResultOct("Error");
    }
  }, [baseInput, fromBase]);

  // Unit Converter calculation hook
  useEffect(() => {
    const val = parseFloat(unitValue);
    if (isNaN(val)) {
      setUnitResultValue("N/A");
      return;
    }

    // Convert length
    if (unitType === "length") {
      const mConversions: { [unit: string]: number } = { m: 1, km: 1000, mile: 1609.34, yard: 0.9144, ft: 0.3048, in: 0.0254 };
      const meters = val * (mConversions[unitFrom] || 1);
      const targetValue = meters / (mConversions[unitTo] || 1);
      setUnitResultValue(targetValue.toFixed(5));
    }
    // Convert mass
    else if (unitType === "mass") {
      const gConversions: { [unit: string]: number } = { g: 1, kg: 1000, lb: 453.592, oz: 28.3495 };
      const grams = val * (gConversions[unitFrom] || 1);
      const targetValue = grams / (gConversions[unitTo] || 1);
      setUnitResultValue(targetValue.toFixed(5));
    }
    // Convert speed
    else if (unitType === "speed") {
      const msConversions: { [unit: string]: number } = { "m/s": 1, "km/h": 1 / 3.6, mph: 0.44704 };
      const ms = val * (msConversions[unitFrom] || 1);
      const targetValue = ms / (msConversions[unitTo] || 1);
      setUnitResultValue(targetValue.toFixed(5));
    }
    // Convert temperature
    else if (unitType === "temp") {
      let celsius = val;
      if (unitFrom === "F") celsius = (val - 32) * 5/9;
      if (unitFrom === "K") celsius = val - 273.15;

      let result = celsius;
      if (unitTo === "F") result = celsius * 9/5 + 32;
      if (unitTo === "K") result = celsius + 273.15;
      setUnitResultValue(result.toFixed(3));
    }
  }, [unitValue, unitType, unitFrom, unitTo]);

  // Handle changing unit types to reset standard selections
  useEffect(() => {
    if (unitType === "length") {
      setUnitFrom("m");
      setUnitTo("ft");
    } else if (unitType === "mass") {
      setUnitFrom("kg");
      setUnitTo("lb");
    } else if (unitType === "speed") {
      setUnitFrom("km/h");
      setUnitTo("mph");
    } else if (unitType === "temp") {
      setUnitFrom("C");
      setUnitTo("F");
    }
  }, [unitType]);

  // Trigger solve equations at load
  useEffect(() => {
    solveQuadratic();
  }, [quadA, quadB, quadC]);

  useEffect(() => {
    solveSystem();
  }, [sysA1, sysB1, sysC1, sysA2, sysB2, sysC2]);

  // AI Quiz Practice Generator action
  const handleGenerateQuiz = async (customTopic?: string, referenceProblem?: string) => {
    const topicToUse = customTopic || quizTopic || "General Algebra";
    setGeneratingQuiz(true);
    setQuizError("");
    setCurrentQuiz(null);
    setSelectedAnswers({});
    setSubmittedQuiz(false);
    setQuizScore(0);
    setActiveTab("practice");

    try {
      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicToUse,
          contextProblem: referenceProblem || undefined
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to generate interactive practice quiz");
      }

      const data = await response.json();
      setCurrentQuiz(data);
    } catch (err: any) {
      console.error(err);
      setQuizError(err.message || "Could not generate practice questions. Check your connection.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // ==========================================
  // TAB 1: CALCULATOR ENGINE STATE
  // ==========================================
  const [expression, setExpression] = useState("");
  const [liveResult, setLiveResult] = useState("");
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem("axiom_history");
    return saved ? JSON.parse(saved) : [];
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem("axiom_history", JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [expression]);

  // Live expression evaluator
  useEffect(() => {
    if (!expression.trim()) {
      setLiveResult("");
      return;
    }
    try {
      // Sanitize standard human-readable characters to computer math syntax
      let processed = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "pi")
        .replace(/e/g, "2.718281828459")
        .trim();

      // Ensure open brackets match before live parsing to avoid typing jitter
      const openCount = (processed.match(/\(/g) || []).length;
      const closeCount = (processed.match(/\)/g) || []).length;
      if (openCount > closeCount) {
        processed += ")".repeat(openCount - closeCount);
      }

      const evalResult = evaluate(processed);
      if (evalResult !== undefined && evalResult !== null && typeof evalResult !== "function") {
        setLiveResult(`= ${evalResult}`);
      }
    } catch {
      // Quietly ignore during typing mid-expression
    }
  }, [expression]);

  const handleCalcInput = (value: string) => {
    setExpression((prev) => prev + value);
  };

  const handleClear = () => {
    setExpression("");
    setLiveResult("");
  };

  const handleBackspace = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleEvaluate = () => {
    if (!expression.trim()) return;
    try {
      let processed = expression
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/π/g, "pi")
        .replace(/e/g, "2.718281828459")
        .trim();

      const finalVal = evaluate(processed);
      if (finalVal !== undefined && finalVal !== null) {
        const fullEquation = `${expression} = ${finalVal}`;
        if (!history.includes(fullEquation)) {
          setHistory((prev) => [fullEquation, ...prev.slice(0, 49)]);
        }
        setExpression(String(finalVal));
        setLiveResult("");
      }
    } catch {
      setLiveResult("Syntax / Domain Error");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("axiom_history");
  };

  // ==========================================
  // EXTRA ENGAGING FEATURE: REAL-TIME FUNCTION PLOTTER
  // ==========================================
  const [graphEquation, setGraphEquation] = useState("x^2 - 4");
  const [graphError, setGraphError] = useState("");
  const canvasRefPlot = useRef<HTMLCanvasElement>(null);

  const drawGraph = () => {
    const canvas = canvasRefPlot.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Grid properties
    const xMin = -10;
    const xMax = 10;
    const yMin = -10;
    const yMax = 10;

    // Helper functions to map mathematical coordinates to canvas coordinates
    const toCanvasX = (x: number) => ((x - xMin) / (xMax - xMin)) * width;
    const toCanvasY = (y: number) => height - ((y - yMin) / (yMax - yMin)) * height;

    // Draw axes
    ctx.strokeStyle = "#cbd5e1"; // slate-300
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let x = xMin; x <= xMax; x += 1) {
      ctx.beginPath();
      ctx.moveTo(toCanvasX(x), 0);
      ctx.lineTo(toCanvasX(x), height);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = yMin; y <= yMax; y += 1) {
      ctx.beginPath();
      ctx.moveTo(0, toCanvasY(y));
      ctx.lineTo(width, toCanvasY(y));
      ctx.stroke();
    }

    // Bold Axis lines
    ctx.strokeStyle = "#64748b"; // slate-500
    ctx.lineWidth = 2;

    // X-Axis
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.stroke();

    // Y-Axis
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), height);
    ctx.stroke();

    // Axis numbers labels
    ctx.fillStyle = "#475569"; // slate-600
    ctx.font = "10px monospace";
    ctx.fillText("x", width - 15, toCanvasY(0) - 5);
    ctx.fillText("y", toCanvasX(0) + 5, 12);

    // Plot mathematical formula
    ctx.beginPath();
    ctx.strokeStyle = "#3b82f6"; // blue-500
    ctx.lineWidth = 3;

    let firstPoint = true;
    setGraphError("");

    for (let px = 0; px < width; px++) {
      // Map pixel X back to math X
      const mathX = xMin + (px / width) * (xMax - xMin);

      try {
        const scope = { x: mathX, xMin, xMax, pi: Math.PI, e: Math.E };
        // Compile and evaluate equation via math.js
        const mathY = evaluate(graphEquation, scope);

        if (typeof mathY === "number" && !isNaN(mathY) && isFinite(mathY)) {
          const cy = toCanvasY(mathY);
          if (cy >= 0 && cy <= height) {
            if (firstPoint) {
              ctx.moveTo(px, cy);
              firstPoint = false;
            } else {
              ctx.lineTo(px, cy);
            }
          } else {
            firstPoint = true; // Break connection if outside visible range
          }
        } else {
          firstPoint = true;
        }
      } catch (err) {
        setGraphError("Invalid mathematical expression for variable x");
        break;
      }
    }
    ctx.stroke();
  };

  // Re-draw graph whenever the equation changes
  useEffect(() => {
    drawGraph();
  }, [graphEquation]);

  // ==========================================
  // TAB 2: VISION PIPELINE / SOLVER STATE
  // ==========================================
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: string; base64: string } | null>(null);
  
  // Solver process states
  const [solverStatus, setSolverStatus] = useState<"idle" | "capturing" | "uploading" | "solving" | "done" | "error">("idle");
  const [solveResult, setSolveResult] = useState<SolveResult | null>(null);
  const [solverErrorMessage, setSolverErrorMessage] = useState("");
  const [manualProblemText, setManualProblemText] = useState("");

  const startCamera = async () => {
    setSolverErrorMessage("");
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
    } catch (err: any) {
      console.error("Camera access failed", err);
      setSolverErrorMessage("Camera access blocked or unsupported in this frame. Please upload a picture/screenshot or type your question below!");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === "scan") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setSolverErrorMessage("Invalid file type. Please upload an image (PNG/JPEG) or a math PDF file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const matches = dataUrl.match(/^data:(.*);base64,(.*)$/);
      if (matches) {
        setUploadedFile({
          name: file.name,
          type: matches[1],
          base64: matches[2]
        });
        setSolverErrorMessage("");
      }
    };
    reader.readAsDataURL(file);
  };

  // Capture snapshot from local video stream
  const captureAndSolve = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setSolverStatus("capturing");

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        const matches = dataUrl.match(/^data:(.*);base64,(.*)$/);
        if (matches) {
          sendToSolverAPI(matches[2], matches[1], "Camera Snapshot");
        }
      }
    } catch (err) {
      console.error(err);
      setSolverStatus("error");
      setSolverErrorMessage("Failed to capture image from video stream.");
    }
  };

  const submitUploadedFile = () => {
    if (!uploadedFile) return;
    sendToSolverAPI(uploadedFile.base64, uploadedFile.type, uploadedFile.name);
  };

  const submitManualProblem = () => {
    if (!manualProblemText.trim()) return;
    sendToSolverAPI("", "", "Manual Text Query", manualProblemText);
  };

  const sendToSolverAPI = async (base64Data: string, mimeType: string, sourceName: string, textQuery?: string) => {
    setSolverStatus("solving");
    setSolveResult(null);
    setSolverErrorMessage("");

    try {
      const response = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileBase64: base64Data || undefined,
          mimeType: mimeType || undefined,
          textPrompt: textQuery || `This problem is sourced from: ${sourceName}. Please solve the math equation or answer the math conceptual question.`
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to solve the problem");
      }

      const data: SolveResult = await response.json();
      setSolveResult(data);
      setSolverStatus("done");
    } catch (err: any) {
      console.error(err);
      setSolverStatus("error");
      setSolverErrorMessage(err.message || "An error occurred while communicating with the AI solver engine.");
    }
  };

  // ==========================================
  // TAB 3: FORMULA DIRECTORY STATE
  // ==========================================
  const [formulaSearch, setFormulaSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [deepExplanation, setDeepExplanation] = useState<any | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [explanationError, setExplanationError] = useState("");

  const filteredFormulas = PRELOADED_FORMULAS.filter((f) => {
    const matchesSearch = f.name.toLowerCase().includes(formulaSearch.toLowerCase()) ||
                          f.desc.toLowerCase().includes(formulaSearch.toLowerCase()) ||
                          f.expr.toLowerCase().includes(formulaSearch.toLowerCase());
    const matchesCategory = selectedCategory === "All" || f.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeconstructFormula = async (formulaName: string) => {
    setDeepExplanation(null);
    setLoadingExplanation(true);
    setExplanationError("");

    try {
      const response = await fetch("/api/formula-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: formulaName })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to retrieve deep explanation");
      }

      const data = await response.json();
      setDeepExplanation(data);
    } catch (err: any) {
      console.error(err);
      setExplanationError(err.message || "Failed to load formula breakdown. Check your connection or API key.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans flex flex-col selection:bg-blue-600 selection:text-white">
      {/* HEADER SECTION */}
      <header className="border-b border-slate-200/80 bg-white/95 px-4 py-3 sticky top-0 z-40 backdrop-blur-md shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 flex items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <span className="font-extrabold text-lg select-none">▲</span>
              <span className="absolute bottom-0.5 right-2 text-[10px] font-bold text-emerald-300 select-none">=</span>
            </div>
            <div className="text-left">
              <h1 className="text-lg md:text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5 leading-none">
                AXIOM
                <span className="text-[9px] bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded text-blue-600 font-bold tracking-normal uppercase">
                  v3.5
                </span>
              </h1>
              <p className="hidden md:block text-[11px] text-slate-500 font-medium mt-0.5">Empowering calculations, vision recognition, and interactive study</p>
              <p className="block md:hidden text-[10px] text-slate-500 font-medium leading-none mt-0.5">Active Workspace</p>
            </div>
          </div>

          {/* Elegant Floating Tab Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-3.5 py-2 md:px-4 md:py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-black rounded-xl transition-all border border-slate-200/60 shadow-xs cursor-pointer"
            >
              {activeTab === "engine" && <Calculator size={15} className="text-blue-600" />}
              {activeTab === "scan" && <Camera size={15} className="text-purple-600" />}
              {activeTab === "formulas" && <BookOpen size={15} className="text-emerald-600" />}
              {activeTab === "practice" && <Award size={15} className="text-amber-500" />}
              {activeTab === "sheets" && <FileSpreadsheet size={15} className="text-emerald-500" />}
              <span className="text-[11px] md:text-xs uppercase tracking-wider font-extrabold select-none">
                {activeTab === "engine" && "Calculators"}
                {activeTab === "scan" && "Snapshot Scanner"}
                {activeTab === "formulas" && "Formulas Codex"}
                {activeTab === "practice" && "Practice Hub"}
                {activeTab === "sheets" && "Spreadsheets"}
              </span>
              <ChevronDown size={14} className={`text-slate-500 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {menuOpen && (
                <>
                  {/* Invisible background click interceptor */}
                  <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setMenuOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 z-50 flex flex-col gap-1 text-left"
                  >
                    <div className="px-3 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100/80 mb-1 select-none">
                      Axiom Workspaces
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("engine");
                        setMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all w-full text-left cursor-pointer ${
                        activeTab === "engine"
                          ? "bg-blue-50 text-blue-600"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === "engine" ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                        <Calculator size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold">Calculators</span>
                        <span className="text-[9px] font-medium text-slate-400">Scientific, Equations & Base-N</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("scan");
                        setMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all w-full text-left cursor-pointer ${
                        activeTab === "scan"
                          ? "bg-purple-50 text-purple-600"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === "scan" ? "bg-purple-100 text-purple-600" : "bg-slate-100 text-slate-500"}`}>
                        <Camera size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold">AI Snapshot Scanner</span>
                        <span className="text-[9px] font-medium text-slate-400">Scan & solve mathematical queries</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("formulas");
                        setMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all w-full text-left cursor-pointer ${
                        activeTab === "formulas"
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === "formulas" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                        <BookOpen size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold">Formulas Codex</span>
                        <span className="text-[9px] font-medium text-slate-400">Deep study of preloaded theorems</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("practice");
                        setMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all w-full text-left cursor-pointer ${
                        activeTab === "practice"
                          ? "bg-amber-50 text-amber-600"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === "practice" ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500"}`}>
                        <Award size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold">Practice Hub</span>
                        <span className="text-[9px] font-medium text-slate-400">Infinite active learning tests</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab("sheets");
                        setMenuOpen(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 text-xs font-bold rounded-xl transition-all w-full text-left cursor-pointer ${
                        activeTab === "sheets"
                          ? "bg-emerald-50 text-emerald-600"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg shrink-0 ${activeTab === "sheets" ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
                        <FileSpreadsheet size={15} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-extrabold">Spreadsheets</span>
                        <span className="text-[9px] font-medium text-slate-400">Interactive formula & CSV grids</span>
                      </div>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-6 md:py-10">
        <AnimatePresence mode="wait">
          {/* TAB 1: CALCULATOR ENGINE */}
          {activeTab === "engine" && (
            <motion.div
              key="engine"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Sub-tab Navigation for Advanced Solvers and Converters */}
              <div className="col-span-full flex flex-wrap items-center justify-start gap-2 border-b border-slate-200/80 pb-4">
                <button
                  onClick={() => setCalcSubTab("standard")}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${
                    calcSubTab === "standard"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Calculator size={14} className={calcSubTab === "standard" ? "text-white" : "text-blue-500"} />
                  <span>Standard & Scientific Pad</span>
                </button>
                <button
                  onClick={() => setCalcSubTab("equations")}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${
                    calcSubTab === "equations"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Compass size={14} className={calcSubTab === "equations" ? "text-white" : "text-purple-500"} />
                  <span>Equation Solver Kit</span>
                </button>
                <button
                  onClick={() => setCalcSubTab("converter")}
                  className={`px-4 py-2.5 text-xs font-black rounded-xl transition-all flex items-center gap-2 ${
                    calcSubTab === "converter"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                      : "bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Scale size={14} className={calcSubTab === "converter" ? "text-white" : "text-emerald-500"} />
                  <span>Unit & Base-N Converter</span>
                </button>
              </div>

              {/* Display & Numeric Pad (Left Columns) */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {calcSubTab === "standard" && (
                  <>
                    {/* Mathematical Screen and State view */}
                    <div className="sticky top-[68px] sm:relative sm:top-auto z-20 bg-white border border-slate-200 shadow-lg shadow-slate-100 rounded-2xl p-4 md:p-6 relative overflow-hidden flex flex-col justify-end min-h-[130px] sm:min-h-[160px] group transition-all hover:border-slate-300">
                      <div className="absolute top-3 left-4 flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                        SECURE OFFLINE SYSTEM
                      </div>

                      {/* Typing Input */}
                      <textarea
                        ref={textareaRef}
                        value={expression}
                        onChange={(e) => setExpression(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleEvaluate();
                          }
                        }}
                        placeholder="0"
                        rows={2}
                        className="w-full bg-transparent border-none text-right text-2xl md:text-4xl font-mono text-slate-950 placeholder-slate-300 outline-none resize-none select-all tracking-tight leading-normal"
                        autoFocus
                      />

                      {/* Evaluated Live Output */}
                      <div className="text-right text-emerald-600 font-mono text-lg md:text-xl min-h-[30px] mt-2 font-bold">
                        {liveResult}
                      </div>
                    </div>

                    {/* Quick Science Constants Shelf */}
                    <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm">
                      <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-2">
                        Quick Inject Physics & Math Constants
                      </span>
                      <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                        {SCI_CONSTANTS.map((c, i) => (
                          <button
                            key={i}
                            onClick={() => handleCalcInput(c.value)}
                            className="py-1.5 px-1 rounded-md border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 hover:text-blue-600 text-xs font-bold transition-all flex flex-col items-center justify-center"
                            title={`${c.label}: ${c.unit}`}
                          >
                            <span className="font-mono text-sm">{c.symbol}</span>
                            <span className="text-[8px] text-slate-400 font-normal tracking-tighter truncate w-full text-center">
                              {c.label.split(" ")[0]}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Keyboard Grid */}
                    <div className="grid grid-cols-5 gap-2.5">
                      {/* Scientific operators row 1 */}
                      <button onClick={() => handleCalcInput("sin(")} className="btn-sci">sin</button>
                      <button onClick={() => handleCalcInput("cos(")} className="btn-sci">cos</button>
                      <button onClick={() => handleCalcInput("tan(")} className="btn-sci">tan</button>
                      <button onClick={() => handleCalcInput("^")} className="btn-sci">xʸ</button>
                      <button onClick={() => handleCalcInput("sqrt(")} className="btn-sci">√</button>

                      {/* Scientific operators row 2 */}
                      <button onClick={() => handleCalcInput("log(")} className="btn-sci">log</button>
                      <button onClick={() => handleCalcInput("ln(")} className="btn-sci">ln</button>
                      <button onClick={() => handleCalcInput("pi")} className="btn-sci">π</button>
                      <button onClick={() => handleCalcInput("e")} className="btn-sci">e</button>
                      <button onClick={() => handleCalcInput("(")} className="btn-sci">(</button>

                      {/* Action Row */}
                      <button onClick={handleClear} className="btn-danger">C</button>
                      <button onClick={handleBackspace} className="btn-danger flex items-center justify-center font-mono">⌫</button>
                      <button onClick={() => handleCalcInput(")")} className="btn-sci">)</button>
                      <button onClick={() => handleCalcInput("%")} className="btn-sci">%</button>
                      <button onClick={() => handleCalcInput("/")} className="btn-operator">÷</button>

                      {/* Numbers & standard operators */}
                      <button onClick={() => handleCalcInput("7")} className="btn-num">7</button>
                      <button onClick={() => handleCalcInput("8")} className="btn-num">8</button>
                      <button onClick={() => handleCalcInput("9")} className="btn-num">9</button>
                      <button onClick={() => handleCalcInput("*")} className="btn-operator">×</button>
                      <button onClick={() => handleCalcInput(" ")} className="btn-sci invisible md:visible" style={{ visibility: "hidden" }}></button>

                      <button onClick={() => handleCalcInput("4")} className="btn-num">4</button>
                      <button onClick={() => handleCalcInput("5")} className="btn-num">5</button>
                      <button onClick={() => handleCalcInput("6")} className="btn-num">6</button>
                      <button onClick={() => handleCalcInput("-")} className="btn-operator">-</button>
                      <button onClick={() => handleCalcInput(" ")} className="btn-sci invisible md:visible" style={{ visibility: "hidden" }}></button>

                      <button onClick={() => handleCalcInput("1")} className="btn-num">1</button>
                      <button onClick={() => handleCalcInput("2")} className="btn-num">2</button>
                      <button onClick={() => handleCalcInput("3")} className="btn-num">3</button>
                      <button onClick={() => handleCalcInput("+")} className="btn-operator">+</button>
                      <button onClick={() => handleCalcInput(" ")} className="btn-sci invisible md:visible" style={{ visibility: "hidden" }}></button>

                      {/* Bottom Row */}
                      <button onClick={() => handleCalcInput("0")} className="btn-num col-span-2">0</button>
                      <button onClick={() => handleCalcInput(".")} className="btn-num">.</button>
                      <button onClick={handleEvaluate} className="btn-evaluate col-span-2">=</button>
                    </div>

                    {/* DYNAMIC CLIENT-SIDE GRAPHING BOARD */}
                    <div className="bg-white border border-slate-200 shadow-md rounded-2xl p-5 md:p-6 mt-2">
                      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 pb-3 border-b border-slate-100 mb-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp size={18} className="text-blue-500" />
                          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dynamic Function Plotter</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono text-slate-500">y = </span>
                          <input
                            type="text"
                            value={graphEquation}
                            onChange={(e) => setGraphEquation(e.target.value)}
                            placeholder="e.g. x^2 - 4"
                            className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs font-mono text-blue-600 outline-none w-36 focus:border-blue-400 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-8 flex justify-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <canvas
                            ref={canvasRefPlot}
                            width={380}
                            height={240}
                            className="rounded-lg border border-slate-200 bg-white max-w-full"
                          />
                        </div>
                        <div className="md:col-span-4 text-xs text-slate-500 space-y-2.5">
                          <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100/50 text-slate-600">
                            <span className="font-bold text-blue-700 block mb-1">Grapher Info:</span>
                            Interactive Cartesian plotter evaluates your function from <span className="font-mono text-slate-800">x = -10</span> to <span className="font-mono text-slate-800">+10</span>. Type values in terms of variable <span className="font-bold text-slate-800">x</span>.
                          </div>
                          {graphError ? (
                            <div className="p-2.5 bg-rose-50 text-rose-600 border border-rose-100 rounded text-[11px] font-medium animate-pulse">
                              {graphError}
                            </div>
                          ) : (
                            <div className="p-2.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded text-[11px] font-medium">
                              ✓ Graph active. Try entering <code className="font-mono bg-emerald-100 px-1 rounded font-bold">sin(x) * 3</code> or <code className="font-mono bg-emerald-100 px-1 rounded font-bold">x^3 - 3*x</code>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {calcSubTab === "equations" && (
                  <div className="space-y-6">
                    {/* Quadratic Equation Solver */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                        <Compass className="text-purple-600" size={18} />
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Quadratic Equation Solver</h3>
                          <p className="text-[10px] text-slate-400">Solves the standard quadratic form: ax² + bx + c = 0</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Coefficient a</label>
                          <input
                            type="number"
                            value={quadA}
                            onChange={(e) => setQuadA(e.target.value)}
                            placeholder="1"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Coefficient b</label>
                          <input
                            type="number"
                            value={quadB}
                            onChange={(e) => setQuadB(e.target.value)}
                            placeholder="-5"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Coefficient c</label>
                          <input
                            type="number"
                            value={quadC}
                            onChange={(e) => setQuadC(e.target.value)}
                            placeholder="6"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
                          />
                        </div>
                      </div>

                      {quadResult && (
                        <div className="bg-purple-50/50 border border-purple-100 rounded-2xl p-5 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white border border-purple-100 p-3 rounded-xl shadow-xs">
                              <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider block">Root x₁</span>
                              <span className="text-sm font-mono font-black text-slate-900 block mt-1">{quadResult.x1}</span>
                            </div>
                            <div className="bg-white border border-purple-100 p-3 rounded-xl shadow-xs">
                              <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider block">Root x₂</span>
                              <span className="text-sm font-mono font-black text-slate-900 block mt-1">{quadResult.x2}</span>
                            </div>
                            <div className="bg-white border border-purple-100 p-3 rounded-xl shadow-xs md:col-span-2">
                              <span className="text-[9px] font-bold text-purple-600 uppercase tracking-wider block">Parabola Vertex (h, k)</span>
                              <span className="text-sm font-mono font-black text-slate-900 block mt-1">{quadResult.vertex}</span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-600 font-medium bg-white/70 border border-purple-100/40 p-3 rounded-xl leading-relaxed">
                            <strong className="text-purple-700">Analysis:</strong> {quadResult.details}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2x2 System of Equations Solver */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                        <Compass className="text-blue-600" size={18} />
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">2x2 Linear System Solver</h3>
                          <p className="text-[10px] text-slate-400">Solves standard system: a₁x + b₁y = c₁  AND  a₂x + b₂y = c₂</p>
                        </div>
                      </div>

                      <div className="space-y-4 mb-6">
                        {/* Equation 1 */}
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Equation 1: a₁</label>
                            <input
                              type="number"
                              value={sysA1}
                              onChange={(e) => setSysA1(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">b₁</label>
                            <input
                              type="number"
                              value={sysB1}
                              onChange={(e) => setSysB1(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">c₁ (Constant)</label>
                            <input
                              type="number"
                              value={sysC1}
                              onChange={(e) => setSysC1(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                            />
                          </div>
                        </div>

                        {/* Equation 2 */}
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Equation 2: a₂</label>
                            <input
                              type="number"
                              value={sysA2}
                              onChange={(e) => setSysA2(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">b₂</label>
                            <input
                              type="number"
                              value={sysB2}
                              onChange={(e) => setSysB2(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">c₂ (Constant)</label>
                            <input
                              type="number"
                              value={sysC2}
                              onChange={(e) => setSysC2(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-blue-500 focus:bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {sysResult && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-4">
                          {typeof sysResult === "string" ? (
                            <div className="text-xs text-rose-600 font-bold bg-white border border-rose-100 p-3.5 rounded-xl text-center">
                              {sysResult}
                            </div>
                          ) : (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white border border-blue-100 p-3 rounded-xl shadow-xs">
                                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">Solution Variable x</span>
                                  <span className="text-sm font-mono font-black text-slate-900 block mt-1">{sysResult.x}</span>
                                </div>
                                <div className="bg-white border border-blue-100 p-3 rounded-xl shadow-xs">
                                  <span className="text-[9px] font-bold text-blue-600 uppercase tracking-wider block">Solution Variable y</span>
                                  <span className="text-sm font-mono font-black text-slate-900 block mt-1">{sysResult.y}</span>
                                </div>
                              </div>
                              <div className="text-xs text-slate-600 font-medium bg-white/70 border border-blue-100/40 p-3 rounded-xl leading-relaxed">
                                <strong className="text-blue-700">Analysis:</strong> {sysResult.details}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {calcSubTab === "converter" && (
                  <div className="space-y-6">
                    {/* Base-N Programmer Converter */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                        <Binary className="text-emerald-600" size={18} />
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Base-N Programmer Toolkit</h3>
                          <p className="text-[10px] text-slate-400">Instantly convert values between different mathematical bases</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Input Value</label>
                          <input
                            type="text"
                            value={baseInput}
                            onChange={(e) => setBaseInput(e.target.value)}
                            placeholder="42"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From Base</label>
                          <select
                            value={fromBase}
                            onChange={(e) => setFromBase(e.target.value as any)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-emerald-500"
                          >
                            <option value="10">Decimal (Base 10)</option>
                            <option value="16">Hexadecimal (Base 16)</option>
                            <option value="2">Binary (Base 2)</option>
                            <option value="8">Octal (Base 8)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">DECIMAL</span>
                          <span className="text-sm font-mono font-black text-slate-800 block mt-1 select-all">{baseResultDec}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">HEXADECIMAL</span>
                          <span className="text-sm font-mono font-black text-slate-800 block mt-1 select-all">{baseResultHex}</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl md:col-span-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">BINARY REPRESENTATION</span>
                          <span className="text-xs font-mono font-black text-emerald-600 block mt-1 tracking-wider select-all overflow-x-auto whitespace-nowrap py-1">
                            {baseResultBin}
                          </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl md:col-span-2">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block">OCTAL</span>
                          <span className="text-sm font-mono font-black text-slate-800 block mt-1 select-all">{baseResultOct}</span>
                        </div>
                      </div>
                    </div>

                    {/* Scientific Unit Converter */}
                    <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
                        <Scale className="text-blue-600" size={18} />
                        <div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Physical Unit Converter</h3>
                          <p className="text-[10px] text-slate-400">Convert measurements across physical, thermal, and mechanical dimension groups</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Measurement Category</label>
                        <div className="grid grid-cols-4 gap-2">
                          {(["length", "mass", "temp", "speed"] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setUnitType(t)}
                              className={`py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all ${
                                unitType === t
                                  ? "bg-blue-50 border border-blue-200 text-blue-600 shadow-xs"
                                  : "bg-slate-50 border border-slate-100 text-slate-500 hover:text-slate-800"
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Value</label>
                          <input
                            type="number"
                            value={unitValue}
                            onChange={(e) => setUnitValue(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800 outline-none focus:border-blue-500"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">From Unit</label>
                          <select
                            value={unitFrom}
                            onChange={(e) => setUnitFrom(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none"
                          >
                            {unitType === "length" && (
                              <>
                                <option value="m">Meters (m)</option>
                                <option value="km">Kilometers (km)</option>
                                <option value="mile">Miles (mi)</option>
                                <option value="yard">Yards (yd)</option>
                                <option value="ft">Feet (ft)</option>
                                <option value="in">Inches (in)</option>
                              </>
                            )}
                            {unitType === "mass" && (
                              <>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="g">Grams (g)</option>
                                <option value="lb">Pounds (lb)</option>
                                <option value="oz">Ounces (oz)</option>
                              </>
                            )}
                            {unitType === "speed" && (
                              <>
                                <option value="m/s">Meters/sec (m/s)</option>
                                <option value="km/h">Kilometers/hour (km/h)</option>
                                <option value="mph">Miles/hour (mph)</option>
                              </>
                            )}
                            {unitType === "temp" && (
                              <>
                                <option value="C">Celsius (°C)</option>
                                <option value="F">Float Fahrenheit (°F)</option>
                                <option value="K">Kelvin (K)</option>
                              </>
                            )}
                          </select>
                        </div>

                        <div className="md:col-span-1 text-center text-slate-400 font-bold text-xs mt-4">
                          ➜
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">To Unit</label>
                          <select
                            value={unitTo}
                            onChange={(e) => setUnitTo(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs font-semibold text-slate-700 outline-none"
                          >
                            {unitType === "length" && (
                              <>
                                <option value="m">Meters (m)</option>
                                <option value="km">Kilometers (km)</option>
                                <option value="mile">Miles (mi)</option>
                                <option value="yard">Yards (yd)</option>
                                <option value="ft">Feet (ft)</option>
                                <option value="in">Inches (in)</option>
                              </>
                            )}
                            {unitType === "mass" && (
                              <>
                                <option value="kg">Kilograms (kg)</option>
                                <option value="g">Grams (g)</option>
                                <option value="lb">Pounds (lb)</option>
                                <option value="oz">Ounces (oz)</option>
                              </>
                            )}
                            {unitType === "speed" && (
                              <>
                                <option value="m/s">Meters/sec (m/s)</option>
                                <option value="km/h">Kilometers/hour (km/h)</option>
                                <option value="mph">Miles/hour (mph)</option>
                              </>
                            )}
                            {unitType === "temp" && (
                              <>
                                <option value="C">Celsius (°C)</option>
                                <option value="F">Float Fahrenheit (°F)</option>
                                <option value="K">Kelvin (K)</option>
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mt-5 flex justify-between items-center">
                        <span className="text-xs font-bold text-blue-700">Converted Value Result:</span>
                        <span className="text-lg font-mono font-black text-slate-900 select-all">
                          {unitResultValue} <span className="text-xs font-bold text-slate-500 uppercase">{unitTo}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Calculation History & Quick Guide Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* calculation Log */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col min-h-[220px]">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
                    <h2 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase">Equation Ledger</h2>
                    {history.length > 0 && (
                      <button
                        onClick={clearHistory}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Clear all log history"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>

                  {history.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center text-slate-400 gap-2 py-8">
                      <Calculator size={28} className="stroke-[1.5] text-slate-300" />
                      <p className="text-xs text-center font-medium">Offline storage ledger is empty</p>
                    </div>
                  ) : (
                    <div className="flex-grow overflow-y-auto max-h-[180px] space-y-2">
                      {history.map((eq, idx) => {
                        const parts = eq.split(" = ");
                        return (
                          <div
                            key={idx}
                            onClick={() => setExpression(parts[0])}
                            className="p-2 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all cursor-pointer group flex flex-col items-end"
                          >
                            <span className="text-slate-500 font-mono text-[11px] group-hover:text-blue-600 transition-colors truncate w-full text-right">
                              {parts[0]}
                            </span>
                            <span className="text-slate-800 font-mono text-sm font-bold mt-0.5">
                              = {parts[1]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Engaging interactive math help cards */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-blue-600 animate-bounce" />
                    <h3 className="text-xs font-extrabold text-blue-900 tracking-wider uppercase">Did You Know?</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Axiom is built to address the constraints of standard calculators. While normal calculators break down on complex theoretical proofs, Axiom uses Gemini's multi-modal intelligence to parse images, explain historical contexts, and detail formulas.
                  </p>
                  <div className="mt-4 pt-3 border-t border-blue-200/50 flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setActiveTab("scan");
                        setManualProblemText("Explain the Riemann Hypothesis and why mathematicians struggle with it");
                      }}
                      className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1 text-left"
                    >
                      <ArrowRight size={10} /> Analyze Riemann Hypothesis Proof
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("formulas");
                        setFormulaSearch("Euler");
                      }}
                      className="text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1 text-left"
                    >
                      <ArrowRight size={10} /> Explore Euler's Equation Elements
                    </button>
                  </div>
                </div>

                {/* Educational links */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm text-xs space-y-3">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Info size={14} className="text-blue-500" />
                    <span>Quick Interactive Help</span>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    To solve algebraic fractions or polynomials, navigate to the <span className="font-bold text-slate-700">AI Snapshot Scanner</span> tab and drop any school textbook problem or typed question!
                  </p>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: AI SCANNER SOLVER */}
          {activeTab === "scan" && (
            <motion.div
              key="scan"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Media Feed & Input Area */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                
                {/* 1. Camera Live Viewport */}
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md flex flex-col relative">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-700 tracking-wider uppercase flex items-center gap-1.5">
                      <Camera size={14} className="text-blue-600" /> CAMERA SCANNING LENS
                    </span>
                    {cameraActive && (
                      <span className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        LIVE FEED
                      </span>
                    )}
                  </div>

                  <div className="relative aspect-video w-full bg-slate-900 flex items-center justify-center overflow-hidden min-h-[220px]">
                    {cameraActive ? (
                      <>
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                        <canvas ref={canvasRef} style={{ display: "none" }} />
                        
                        {/* Scanning laser effect */}
                        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_12px_#3b82f6] laser-line"></div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-3">
                        <Camera size={40} className="stroke-[1.2] text-slate-500" />
                        <div className="text-xs max-w-[240px] text-slate-400">
                          Camera feed is currently disabled. Enable to capture immediate handwritten equations or diagrams.
                        </div>
                        <button
                          onClick={startCamera}
                          className="mt-2 text-xs font-bold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md shadow-blue-500/10 transition-colors"
                        >
                          Enable Lens Input
                        </button>
                      </div>
                    )}
                  </div>

                  {cameraActive && (
                    <div className="p-3 bg-slate-50 flex gap-2 border-t border-slate-200">
                      <button
                        onClick={captureAndSolve}
                        disabled={solverStatus === "solving" || solverStatus === "capturing"}
                        className="flex-grow py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shadow-md shadow-blue-500/10"
                      >
                        <Sparkles size={14} className="animate-pulse" /> Snap & Compute Math
                      </button>
                      <button
                        onClick={stopCamera}
                        className="px-3.5 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs transition-colors"
                      >
                        Disable
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Drag & Drop File Upload Panel */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 transition-all relative ${
                    dragActive 
                      ? "border-blue-500 bg-blue-50 shadow-inner" 
                      : uploadedFile 
                        ? "border-emerald-500 bg-emerald-50/20" 
                        : "border-slate-300 hover:border-slate-400 bg-white"
                  }`}
                >
                  <input
                    type="file"
                    id="scanner-file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {uploadedFile ? (
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className="h-10 w-10 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div className="text-xs">
                        <p className="font-bold text-slate-800 truncate max-w-[250px]">
                          {uploadedFile.name}
                        </p>
                        <p className="text-slate-500 mt-0.5 uppercase tracking-wider text-[10px]">
                          {uploadedFile.type} Loaded
                        </p>
                      </div>

                      <div className="flex gap-2 w-full mt-2">
                        <button
                          onClick={submitUploadedFile}
                          disabled={solverStatus === "solving"}
                          className="flex-grow py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-md shadow-emerald-500/10"
                        >
                          <CheckCircle size={13} />
                          Analyze & Solve Document
                        </button>
                        <button
                          onClick={() => setUploadedFile(null)}
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-lg text-xs transition-colors"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="scanner-file" className="flex flex-col items-center justify-center cursor-pointer text-center gap-2">
                      <Upload className="h-10 w-10 text-slate-400 stroke-[1.2]" />
                      <div className="text-xs font-bold text-slate-700">
                        Upload Image, Diagram, or Math PDF
                      </div>
                      <div className="text-[10px] text-slate-500 max-w-[240px]">
                        Drag and drop file here, or click to browse standard local assets
                      </div>
                    </label>
                  )}
                </div>

                {/* 3. Manual Typing Prompt Panel */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                  <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block mb-2">
                    Or Type Formula / Question Directly
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Integrate x*cos(x) dx or solve 3x + 5 = 14"
                      value={manualProblemText}
                      onChange={(e) => setManualProblemText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitManualProblem()}
                      className="flex-grow bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                    />
                    <button
                      onClick={submitManualProblem}
                      disabled={!manualProblemText.trim() || solverStatus === "solving"}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all"
                    >
                      Solve
                    </button>
                  </div>
                </div>

              </div>

              {/* Solution Output Panel (Right Columns) */}
              <div className="lg:col-span-7 flex flex-col h-full min-h-[400px]">
                <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col h-full">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-blue-500"></div>
                      <h3 className="text-xs font-extrabold tracking-wider text-slate-500 uppercase">Axiom Analysis Engine Output</h3>
                    </div>
                    {solverStatus === "solving" && (
                      <span className="text-xs font-mono text-blue-600 font-semibold animate-pulse flex items-center gap-1.5">
                        <RefreshCw size={12} className="animate-spin" />
                        AI evaluating...
                      </span>
                    )}
                  </div>

                  {/* Dynamic Status / Resolution view */}
                  <div className="flex-grow flex flex-col justify-start mt-4">
                    {solverStatus === "idle" && (
                      <div className="flex-grow flex flex-col items-center justify-center text-center text-slate-500 py-12 px-6 gap-3">
                        <Cpu size={40} className="stroke-[1.2] text-slate-300 animate-pulse" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">Solver Engine Awaiting Input</p>
                          <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            Capture snapshot images, drop standard school assignment PDFs, or insert manual equations on the left hand side to trigger full logical step derivation.
                          </p>
                        </div>
                      </div>
                    )}

                    {solverStatus === "capturing" && (
                      <div className="flex-grow flex flex-col items-center justify-center py-12 gap-3 text-slate-500">
                        <RefreshCw size={32} className="animate-spin text-blue-500" />
                        <p className="text-xs font-bold tracking-wider">Acquiring snapshot frame...</p>
                      </div>
                    )}

                    {solverStatus === "solving" && (
                      <div className="flex-grow flex flex-col items-center justify-center py-12 gap-4 text-center">
                        <div className="relative flex items-center justify-center">
                          <div className="h-16 w-16 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin"></div>
                          <Sparkles size={20} className="absolute text-blue-500 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold tracking-wider text-slate-700">Axiom parsing math operators...</p>
                          <p className="text-[11px] text-slate-400 mt-1 max-w-[280px] mx-auto">
                            Recognizing text/handwriting, mapping formulas, and computing detailed conceptual steps.
                          </p>
                        </div>
                      </div>
                    )}

                    {solverStatus === "error" && (
                      <div className="flex-grow flex flex-col items-center justify-center text-center p-6 bg-rose-50 border border-rose-100 rounded-xl gap-3">
                        <HelpCircle size={36} className="text-rose-500" />
                        <div>
                          <p className="text-sm font-bold text-rose-800">Solver Process Interruption</p>
                          <p className="text-xs text-rose-600 mt-1 max-w-md">{solverErrorMessage}</p>
                        </div>
                        <button
                          onClick={() => setSolverStatus("idle")}
                          className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition-colors mt-1"
                        >
                          Reset Board
                        </button>
                      </div>
                    )}

                    {solverStatus === "done" && solveResult && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                      >
                        {/* 1. Problem parsed */}
                        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                          <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase block">Parsed Math Problem:</span>
                          <p className="font-mono text-sm font-bold text-blue-600 mt-1 select-all break-words">{solveResult.problem}</p>
                        </div>

                        {/* 2. Steps list */}
                        <div className="space-y-3">
                          <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase block">Logical Derivation Steps:</span>
                          <div className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
                            {solveResult.steps.map((step, idx) => (
                              <div key={idx} className="flex gap-3 text-xs leading-relaxed text-slate-700 bg-slate-50/50 p-3.5 rounded-xl border border-slate-100">
                                <span className="font-mono font-black text-blue-600 flex-shrink-0">{idx + 1}.</span>
                                <p className="select-all font-medium">{step}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* 3. Final Answer card */}
                        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex justify-between items-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 h-16 w-16 bg-emerald-500/5 rounded-full blur-xl"></div>
                          <div>
                            <span className="text-[9px] font-extrabold text-emerald-600 tracking-widest uppercase block">Computed Answer Outcome:</span>
                            <p className="font-mono text-xl font-extrabold text-emerald-600 mt-1 select-all break-words">
                              {solveResult.finalAnswer}
                            </p>
                          </div>
                          <div className="h-10 w-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-200">
                            <CheckCircle size={20} />
                          </div>
                        </div>

                        {/* 4. Concepts explained */}
                        {solveResult.conceptsExplained && solveResult.conceptsExplained.length > 0 && (
                          <div className="space-y-3 pt-4 border-t border-slate-100">
                            <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase block">Conceptual Foundations:</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {solveResult.conceptsExplained.map((concept, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                                  <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                                    <Compass size={13} className="text-blue-500" /> {concept.concept}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 leading-normal font-medium">{concept.explanation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 5. Youtube references */}
                        {solveResult.youtubeQueries && solveResult.youtubeQueries.length > 0 && (
                          <div className="space-y-2.5 pt-4 border-t border-slate-100">
                            <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase block">Search YouTube Lessons on Concept:</span>
                            <div className="flex flex-wrap gap-2">
                              {solveResult.youtubeQueries.map((query, idx) => (
                                <a
                                  key={idx}
                                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`}
                                  target="_blank"
                                  referrerPolicy="no-referrer"
                                  className="inline-flex items-center gap-2 text-[11px] bg-rose-50 hover:bg-rose-100/80 border border-rose-200 text-rose-600 font-bold px-3 py-1.5 rounded-full transition-all shadow-xs"
                                >
                                  <Youtube size={12} className="text-rose-500 fill-rose-500" />
                                  <span>Study: {query}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* 6. Practice Hub Generator Shortcut */}
                        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-transparent p-4 rounded-2xl border border-amber-500/10 mt-4">
                          <div className="space-y-1 text-left">
                            <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              <Sparkles size={14} className="text-amber-500 animate-pulse" /> Interactive Training Set Ready!
                            </h4>
                            <p className="text-[10.5px] text-slate-500 font-medium">Want to test your mastery? Axiom can generate custom practice questions styled after this problem with immediate correction and step-by-step explanations.</p>
                          </div>
                          <button
                            onClick={() => handleGenerateQuiz(solveResult.problem + " Quiz Practice", solveResult.problem)}
                            className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-[11px] uppercase tracking-wider rounded-xl transition-all shadow-md shadow-amber-500/10 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
                          >
                            <Award size={14} />
                            <span>Practice Now</span>
                          </button>
                        </div>

                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: FORMULAS CODEX */}
          {activeTab === "formulas" && (
            <motion.div
              key="formulas"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Filter controls */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                {/* Search bar */}
                <div className="relative flex-grow max-w-lg">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search standard global formulas, constants, or equations..."
                    value={formulaSearch}
                    onChange={(e) => setFormulaSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-colors"
                  />
                  {formulaSearch && (
                    <button
                      onClick={() => setFormulaSearch("")}
                      className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-800"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Categories */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                  {["All", "Algebra", "Geometry", "Trigonometry", "Calculus", "Statistics", "Physics"].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`text-xs px-3.5 py-2 rounded-lg font-bold transition-all shrink-0 ${
                        selectedCategory === cat
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Layout of preloaded Formulas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFormulas.map((f, idx) => (
                  <motion.div
                    key={idx}
                    layoutId={`formula-card-${idx}`}
                    className="bg-white border border-slate-200 hover:border-blue-400/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2.5">
                        <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                          {f.name}
                        </h4>
                        <span className="text-[9px] font-bold tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full uppercase">
                          {f.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed mb-4 font-medium">{f.desc}</p>
                    </div>

                    <div className="space-y-4">
                      {/* Highlighted formula equation bar */}
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 font-mono text-xs text-center text-blue-600 font-bold select-all">
                        {f.expr}
                      </div>

                      {/* Controls */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeconstructFormula(f.name)}
                          className="flex-grow py-2.5 px-3 rounded-lg bg-blue-50 hover:bg-blue-600 border border-blue-200 hover:border-blue-600 text-blue-600 hover:text-white font-bold text-[11px] transition-all flex items-center justify-center gap-1.5"
                        >
                          <Sparkles size={11} /> AI Deconstruction
                        </button>
                        <a
                          href={`https://www.youtube.com/results?search_query=${encodeURIComponent(f.youtubeQuery)}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          className="px-3 py-2.5 rounded-lg bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-100 hover:border-rose-500 transition-all flex items-center justify-center"
                          title="Search study lessons on YouTube"
                        >
                          <Youtube size={14} className="fill-current" />
                        </a>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {filteredFormulas.length === 0 && (
                  <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-sm">
                    <BookMarked className="h-10 w-10 text-slate-300 mx-auto mb-3 stroke-[1.2]" />
                    <p className="text-sm font-bold text-slate-700">Formula not found locally</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Search is fully dynamic. If there is a math formula or concept you need, you can type it above to trigger a detailed AI breakdown.
                    </p>
                    <div className="mt-4 inline-flex gap-2">
                      <button
                        onClick={() => {
                          setFormulaSearch("");
                          setSelectedCategory("All");
                        }}
                        className="text-xs font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200"
                      >
                        Reset Filters
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("scan");
                          setManualProblemText(`Derive and explain the formula for: ${formulaSearch}`);
                        }}
                        className="text-xs font-bold px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                      >
                        Ask Gemini to find "{formulaSearch}"
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Advanced Interactive AI Explanation Drawer/Panel */}
              <AnimatePresence>
                {(loadingExplanation || deepExplanation || explanationError) && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                    className="bg-white border border-slate-200 rounded-2xl p-5 md:p-8 mt-10 shadow-lg relative"
                  >
                    {/* Header bar */}
                    <div className="flex justify-between items-center pb-4 border-b border-slate-100 mb-6">
                      <div className="flex items-center gap-2">
                        <Sparkles size={16} className="text-blue-500 animate-pulse" />
                        <h3 className="text-sm font-extrabold tracking-wider text-slate-800 uppercase">
                          AI Theory & Concept Deconstruction
                        </h3>
                      </div>
                      <button
                        onClick={() => {
                          setDeepExplanation(null);
                          setExplanationError("");
                        }}
                        className="text-slate-400 hover:text-slate-800 transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    {/* Loading State */}
                    {loadingExplanation && (
                      <div className="py-12 flex flex-col items-center justify-center text-center gap-4">
                        <div className="relative">
                          <div className="h-14 w-14 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
                          <Cpu size={18} className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-700 tracking-wider uppercase">Deconstructing Equation coordinates...</p>
                          <p className="text-[11px] text-slate-500 mt-1 max-w-[280px]">
                            Structuring derivation trees, historical math contexts, and generating interactive worked examples.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error State */}
                    {explanationError && (
                      <div className="p-5 rounded-xl bg-rose-50 border border-rose-100 text-center text-xs">
                        <HelpCircle className="mx-auto text-rose-500 mb-2" size={24} />
                        <p className="font-bold text-rose-800">Concept Deconstruction Offline</p>
                        <p className="text-rose-600 mt-1">{explanationError}</p>
                      </div>
                    )}

                    {/* Loaded Deconstruction Content */}
                    {deepExplanation && (
                      <div className="space-y-6">
                        
                        {/* Title and Math box */}
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-100 rounded-xl">
                          <div>
                            <h4 className="text-xl font-black text-slate-900">{deepExplanation.formulaName}</h4>
                            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-medium">
                              {deepExplanation.description}
                            </p>
                          </div>
                          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 font-mono text-sm text-center text-emerald-600 font-extrabold tracking-wider shrink-0 select-all min-w-[220px]">
                            {deepExplanation.expression}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Left Details block */}
                          <div className="space-y-5">
                            {/* History context */}
                            <div>
                              <h5 className="text-xs font-extrabold tracking-wider text-blue-600 uppercase mb-2 flex items-center gap-1.5">
                                <CornerDownRight size={13} /> Intellectual Origin & Context
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium">
                                {deepExplanation.historyAndContext}
                              </p>
                            </div>

                            {/* Derivation proof */}
                            <div>
                              <h5 className="text-xs font-extrabold tracking-wider text-blue-600 uppercase mb-2 flex items-center gap-1.5">
                                <CornerDownRight size={13} /> Mathematical Derivation & Proof
                              </h5>
                              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 font-medium select-all">
                                {deepExplanation.proofOrDerivation}
                              </p>
                            </div>
                          </div>

                          {/* Right Details block */}
                          <div className="space-y-5">
                            {/* Real world applications */}
                            <div>
                              <h5 className="text-xs font-extrabold tracking-wider text-blue-600 uppercase mb-2 flex items-center gap-1.5">
                                <CornerDownRight size={13} /> Real-World Scientific Applications
                              </h5>
                              <ul className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 list-inside list-disc font-medium">
                                {deepExplanation.realWorldApplications.map((app: string, idx: number) => (
                                  <li key={idx} className="select-all">{app}</li>
                                ))}
                              </ul>
                            </div>

                            {/* Interactive Worked Example */}
                            <div>
                              <h5 className="text-xs font-extrabold tracking-wider text-blue-600 uppercase mb-2 flex items-center gap-1.5">
                                <CornerDownRight size={13} /> Worked Problem Example
                              </h5>
                              <div className="bg-blue-50/35 border border-blue-100 p-5 rounded-2xl space-y-3">
                                <div>
                                  <span className="text-[9px] font-extrabold text-blue-600 tracking-widest uppercase block">Realistic test question:</span>
                                  <p className="text-xs text-slate-800 font-bold mt-1 select-all">{deepExplanation.workedExample.problem}</p>
                                </div>
                                
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase block">Resolution calculation path:</span>
                                  {deepExplanation.workedExample.solutionSteps.map((s: string, i: number) => (
                                    <div key={i} className="text-xs text-slate-600 leading-normal pl-2 border-l-2 border-blue-200 font-medium">
                                      {s}
                                    </div>
                                  ))}
                                </div>

                                <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-mono font-bold flex justify-between items-center select-all">
                                  <span>Final computed result:</span>
                                  <span>{deepExplanation.workedExample.answer}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Youtube links */}
                        <div className="space-y-2.5 pt-4 border-t border-slate-100">
                          <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase block">YouTube Tutorial Study Links:</span>
                          <div className="flex flex-wrap gap-2">
                            {deepExplanation.youtubeQueries.map((q: string, idx: number) => (
                              <a
                                key={idx}
                                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`}
                                target="_blank"
                                referrerPolicy="no-referrer"
                                className="inline-flex items-center gap-2 text-[11px] bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold px-4 py-2 rounded-full transition-all"
                              >
                                <Youtube size={12} className="text-rose-500 fill-rose-500" />
                                <span>Study Video: {q}</span>
                              </a>
                            ))}
                          </div>
                        </div>

                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}

          {/* TAB 4: PRACTICE HUB */}
          {activeTab === "practice" && (
            <motion.div
              key="practice"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Introduction header */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-3xl p-6 shadow-md shadow-amber-500/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1.5 text-left">
                  <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                    <Award className="text-white" size={22} />
                    <span>Axiom Active Training Hub</span>
                  </h2>
                  <p className="text-xs text-white/90 max-w-xl leading-relaxed">
                    Improve your mathematical intuition with infinite, custom, high-fidelity practice sets. Choose a topic, request a quiz, and let Axiom's AI generate structured multiple-choice training questions with detailed step-by-step solutions.
                  </p>
                </div>
                <div className="bg-white/10 px-4 py-2.5 rounded-2xl border border-white/20 backdrop-blur-md self-stretch md:self-auto flex items-center justify-between md:justify-start gap-4">
                  <div className="text-left">
                    <span className="text-[9px] font-extrabold text-amber-200 tracking-wider uppercase block">AI INTEGRATION</span>
                    <span className="text-xs font-mono font-bold">active & secure</span>
                  </div>
                  <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                </div>
              </div>

              {/* Topic Request Form */}
              <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm">
                <span className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase block mb-3 text-left">
                  Configure Your Educational Target Topic
                </span>

                <div className="flex flex-col md:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input
                      type="text"
                      placeholder="e.g. Factorization, Linear Systems, Integration by Parts, Vector Dot Products..."
                      value={quizTopic}
                      onChange={(e) => setQuizTopic(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGenerateQuiz()}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:bg-white transition-all font-mono"
                    />
                  </div>
                  <button
                    onClick={() => handleGenerateQuiz()}
                    disabled={generatingQuiz}
                    className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10 hover:shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {generatingQuiz ? "Formulating Set..." : "Generate Practice Set"}
                  </button>
                </div>

                {/* Pre-crafted Suggestions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-3">
                  <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide shrink-0">Popular Syllabus Snippets:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Algebra Basics", val: "Simple Algebra Factoring & Division" },
                      { label: "Quadratic Equations", val: "Quadratic Formula and Root Factoring" },
                      { label: "Systems of Equations", val: "Linear Systems with Two Variables" },
                      { label: "Derivative Rules", val: "Basic derivatives of power and trigonometric functions" },
                      { label: "Trig Identities", val: "Simplifying expressions using trigonometry formulas" }
                    ].map((pill, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setQuizTopic(pill.val);
                          handleGenerateQuiz(pill.val);
                        }}
                        className="text-[10px] bg-slate-100 text-slate-600 hover:text-blue-700 hover:bg-blue-50 hover:border-blue-200 border border-transparent font-bold px-3 py-1.5 rounded-full transition-all"
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loader Panel */}
              {generatingQuiz && (
                <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] gap-4">
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full border-4 border-amber-100 border-t-amber-500 animate-spin"></div>
                    <Award size={20} className="absolute inset-0 m-auto text-amber-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 tracking-wide uppercase">Formulating Practice Training Set</h3>
                    <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto">
                      Axiom is synthesizing mathematical problems, compiling premium multiple choice configurations, and detailing full solution keys...
                    </p>
                  </div>
                </div>
              )}

              {/* Error Display */}
              {quizError && (
                <div className="bg-rose-50 border border-rose-100 text-rose-800 rounded-3xl p-6 text-center space-y-3">
                  <HelpCircle size={36} className="text-rose-500 mx-auto" />
                  <div>
                    <h3 className="text-sm font-bold text-rose-800">Training Set Problem</h3>
                    <p className="text-xs text-rose-600 mt-1 max-w-md mx-auto">{quizError}</p>
                  </div>
                  <button
                    onClick={() => handleGenerateQuiz()}
                    className="px-5 py-2 bg-white hover:bg-slate-50 border border-rose-200 text-slate-800 text-xs font-bold rounded-xl transition-all"
                  >
                    Retry Generation
                  </button>
                </div>
              )}

              {/* Practice Hub State Idle */}
              {!currentQuiz && !generatingQuiz && !quizError && (
                <div className="bg-slate-100/50 border border-dashed border-slate-300 rounded-3xl p-12 text-center flex flex-col items-center justify-center min-h-[300px] gap-3">
                  <Award size={48} className="stroke-[1.2] text-amber-500/50" />
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">Ready for Training</h3>
                  <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                    Select one of the standard syllabus snippets above or type a personalized topic into the input field to generate interactive math questions with instant diagnostic feedback.
                  </p>
                </div>
              )}

              {/* Active Quiz Card Display */}
              {currentQuiz && !generatingQuiz && (
                <div className="space-y-6">
                  {/* Results Dashboard Header (Only shown after submission) */}
                  {submittedQuiz && (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`rounded-3xl p-6 border text-white flex flex-col md:flex-row justify-between items-center gap-6 ${
                        quizScore >= currentQuiz.questions.length - 1
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 border-emerald-500/20"
                          : quizScore >= currentQuiz.questions.length / 2
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 border-blue-500/20"
                            : "bg-gradient-to-r from-amber-500 to-rose-500 border-amber-500/20"
                      }`}
                    >
                      <div className="space-y-2 text-left">
                        <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                          <CheckCircle size={22} className="text-white" />
                          <span>Training Set Evaluation Completed!</span>
                        </h3>
                        <p className="text-xs text-white/95 max-w-xl leading-relaxed">
                          {quizScore === currentQuiz.questions.length
                            ? "Absolute perfection! You solved every single question correctly. Your analytical intuition is extremely sharp!"
                            : quizScore >= currentQuiz.questions.length / 2
                              ? "Excellent progress! You have successfully mastered most concepts in this syllabus. Review the step breakdowns below to achieve 100%."
                              : "A great opportunity to learn! Mathematics comes through focused review of misconceptions. Analyze the detailed solutions below."}
                        </p>
                      </div>

                      <div className="bg-white/15 px-6 py-4 rounded-2xl border border-white/20 flex flex-col items-center justify-center shrink-0 min-w-[140px]">
                        <span className="text-[9px] font-extrabold text-white/80 tracking-widest uppercase block mb-1">YOUR SCORE</span>
                        <span className="text-3xl font-black font-mono leading-none">{quizScore} / {currentQuiz.questions.length}</span>
                        <span className="text-[10px] font-bold text-white/90 mt-1.5 bg-white/10 px-2 py-0.5 rounded-full">
                          {Math.round((quizScore / currentQuiz.questions.length) * 100)}% Accuracy
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* General Quiz Information */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm text-left">
                    <span className="text-[9px] font-extrabold text-blue-600 tracking-wider uppercase bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md">
                      Interactive Practice Material
                    </span>
                    <h3 className="text-base font-black text-slate-800 mt-2.5">Topic: {currentQuiz.topic}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">Please select the correct answer for each question below.</p>
                  </div>

                  {/* Question Cards List */}
                  <div className="space-y-6">
                    {currentQuiz.questions.map((question: any, qIdx: number) => {
                      const isCorrectAnswer = selectedAnswers[question.id] === question.answer;
                      return (
                        <div
                          key={question.id}
                          className={`bg-white border rounded-3xl p-5 md:p-6 shadow-sm text-left transition-all relative overflow-hidden ${
                            submittedQuiz
                              ? isCorrectAnswer
                                ? "border-emerald-300 shadow-emerald-500/5 bg-gradient-to-b from-white to-emerald-500/5"
                                : "border-rose-300 shadow-rose-500/5 bg-gradient-to-b from-white to-rose-500/5"
                              : "border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          {/* Top badge */}
                          <div className="flex justify-between items-center gap-3 mb-4">
                            <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase font-mono">
                              Question {qIdx + 1} of {currentQuiz.questions.length}
                            </span>
                            {submittedQuiz && (
                              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg ${
                                isCorrectAnswer 
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}>
                                {isCorrectAnswer ? "✓ Correct" : "✗ Incorrect"}
                              </span>
                            )}
                          </div>

                          {/* Problem description */}
                          <h4 className="text-sm font-black text-slate-900 leading-relaxed font-mono select-all break-words mb-4">
                            {question.question}
                          </h4>

                          {/* Options grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {question.options.map((option: string) => {
                              const isSelected = selectedAnswers[question.id] === option;
                              const isThisCorrect = option === question.answer;

                              let optionStyle = "border-slate-200 hover:bg-slate-50 text-slate-700";
                              if (isSelected) {
                                optionStyle = "border-blue-500 bg-blue-50/50 text-blue-800 font-bold shadow-xs";
                              }

                              if (submittedQuiz) {
                                if (isThisCorrect) {
                                  optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold shadow-xs";
                                } else if (isSelected && !isCorrectAnswer) {
                                  optionStyle = "border-rose-500 bg-rose-50 text-rose-800 font-bold shadow-xs";
                                } else {
                                  optionStyle = "border-slate-200 opacity-60 text-slate-400 cursor-not-allowed";
                                }
                              }

                              return (
                                <button
                                  key={option}
                                  onClick={() => {
                                    if (submittedQuiz) return;
                                    setSelectedAnswers({ ...selectedAnswers, [question.id]: option });
                                  }}
                                  disabled={submittedQuiz}
                                  className={`p-3.5 rounded-2xl border text-xs text-left transition-all flex items-center justify-between gap-3 font-medium select-all ${optionStyle}`}
                                >
                                  <span>{option}</span>
                                  {!submittedQuiz && isSelected && (
                                    <div className="h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[9px] font-bold">
                                      ✓
                                    </div>
                                  )}
                                  {submittedQuiz && isThisCorrect && (
                                    <div className="h-4.5 w-4.5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">
                                      ✓
                                    </div>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {/* Post-submission Detailed explanation */}
                          {submittedQuiz && question.explanation && (
                            <div className="mt-5 pt-4 border-t border-slate-100 bg-slate-50 p-4 rounded-2xl border border-slate-200/50">
                              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                                <Compass size={12} className="text-blue-500" /> Explanation Breakdown
                              </h5>
                              <p className="text-[11.5px] text-slate-600 leading-relaxed font-medium mt-1.5 select-all">
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Submission Action Bar */}
                  <div className="p-4 bg-white border border-slate-200 rounded-3xl shadow-md flex flex-col sm:flex-row justify-between items-center gap-4 text-left">
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-slate-800">
                        {submittedQuiz ? "Practice Completed Successfully" : "Verify Your Homework Submission"}
                      </h4>
                      <p className="text-[10.5px] text-slate-500 font-medium">
                        {submittedQuiz 
                          ? "Review each question to digest step-by-step methodologies." 
                          : `${Object.keys(selectedAnswers).length} of ${currentQuiz.questions.length} questions completed. Submit for marking.`}
                      </p>
                    </div>

                    <div className="flex gap-2.5 w-full sm:w-auto">
                      {!submittedQuiz ? (
                        <button
                          onClick={() => {
                            // Grade answers
                            let correctCount = 0;
                            currentQuiz.questions.forEach((q: any) => {
                              if (selectedAnswers[q.id] === q.answer) {
                                correctCount++;
                              }
                            });
                            setQuizScore(correctCount);
                            setSubmittedQuiz(true);
                          }}
                          disabled={Object.keys(selectedAnswers).length < currentQuiz.questions.length}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-blue-500/10 hover:shadow-lg disabled:opacity-50 cursor-pointer"
                        >
                          <CheckSquare size={14} />
                          <span>Submit Answers</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            // Reset state and generate another set
                            handleGenerateQuiz(currentQuiz.topic);
                          }}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-amber-500/10 hover:shadow-lg cursor-pointer"
                        >
                          <RotateCcw size={14} />
                          <span>Generate New Set</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: SPREADSHEETS WORKSPACE */}
          {activeTab === "sheets" && (
            <motion.div
              key="sheets"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <SpreadsheetWorkspace />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER & CREDITS */}
      <footer className="border-t border-slate-200 bg-white py-8 px-4 text-center mt-12 shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-left">
            <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>▲ Axiom Advanced Math Solver Engine</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Bridging the gap between static calculation limitations and active educational resources.
            </p>
          </div>
          <div className="text-xs text-slate-500 flex flex-col md:flex-row items-center gap-1.5 md:gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-1 text-slate-600 font-medium">
              <span>Designed and Engineered by</span>
              <span className="font-extrabold text-blue-600">Emmanuel Aryee</span>
            </div>
            <span className="hidden md:inline text-slate-300">|</span>
            <a 
              href="mailto:emmanuelaryee667@gmail.com" 
              className="text-blue-600 hover:text-blue-800 transition-colors font-bold flex items-center gap-1 hover:underline"
              title="Connect with Emmanuel"
            >
              <Mail size={13} />
              <span>emmanuelaryee667@gmail.com</span>
            </a>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-6 pt-4 border-t border-slate-100 max-w-6xl mx-auto">
          © 2026 Axiom. Engineered for students, researchers, and engineers globally. Powered by server-side Gemini 3.5 AI.
        </p>
      </footer>
    </div>
  );
}
