import { Formula } from "./types";

export const PRELOADED_FORMULAS: Formula[] = [
  {
    name: "Quadratic Formula",
    expr: "x = (-b ± √(b² - 4ac)) / 2a",
    desc: "Finds the roots/solutions of any quadratic polynomial equation ax² + bx + c = 0.",
    category: "Algebra",
    youtubeQuery: "quadratic formula step by step"
  },
  {
    name: "Pythagorean Theorem",
    expr: "a² + b² = c²",
    desc: "States that in a right-angled triangle, the square of the hypotenuse is equal to the sum of the squares of the other two sides.",
    category: "Geometry",
    youtubeQuery: "pythagorean theorem geometry"
  },
  {
    name: "Euler's Identity",
    expr: "e^(iπ) + 1 = 0",
    desc: "Connects five of the most fundamental constants of mathematics: e, i, pi, 1, and 0 in an incredibly elegant equation.",
    category: "General",
    youtubeQuery: "euler's identity explained visually"
  },
  {
    name: "Derivative Power Rule",
    expr: "d/dx [xⁿ] = n·xⁿ⁻¹",
    desc: "A quick and powerful calculus rule to find the derivative of any basic exponential function.",
    category: "Calculus",
    youtubeQuery: "calculus derivative power rule"
  },
  {
    name: "Integral of xⁿ (Anti-Derivative)",
    expr: "∫ xⁿ dx = (xⁿ⁺¹) / (n + 1) + C  (for n ≠ -1)",
    desc: "The fundamental rule for finding the indefinite integral of polynomial variables.",
    category: "Calculus",
    youtubeQuery: "calculus integration rules polynomial"
  },
  {
    name: "Euler's Formula for Polyhedra",
    expr: "V - E + F = 2",
    desc: "Relates the number of vertices (V), edges (E), and faces (F) of any convex 3D polyhedron.",
    category: "Geometry",
    youtubeQuery: "euler polyhedral formula geometry"
  },
  {
    name: "Area of a Circle",
    expr: "A = πr²",
    desc: "Calculates the total surface space enclosed by a circle with radius r.",
    category: "Geometry",
    youtubeQuery: "area of a circle proof and examples"
  },
  {
    name: "Sine Rule (Law of Sines)",
    expr: "a / sin(A) = b / sin(B) = c / sin(C)",
    desc: "Relates the lengths of the sides of any triangle to the sines of its angles.",
    category: "Trigonometry",
    youtubeQuery: "law of sines geometry trigonometry"
  },
  {
    name: "Cosine Rule (Law of Cosines)",
    expr: "c² = a² + b² - 2ab·cos(C)",
    desc: "Generalizes the Pythagorean theorem for any triangle with angle C.",
    category: "Trigonometry",
    youtubeQuery: "law of cosines tutorial"
  },
  {
    name: "Standard Deviation",
    expr: "σ = √[ ∑(x - μ)² / N ]",
    desc: "Measures the amount of variation, dispersion, or spread of a set of data values from their mean.",
    category: "Statistics",
    youtubeQuery: "standard deviation statistics tutorial"
  },
  {
    name: "Mass-Energy Equivalence",
    expr: "E = mc²",
    desc: "Einstein's famous formula stating that mass and energy are directly proportional and interchangeable.",
    category: "Physics",
    youtubeQuery: "mass energy equivalence e=mc2 explained"
  },
  {
    name: "Newton's Second Law",
    expr: "F = ma",
    desc: "The acceleration of an object is directly proportional to the net force and inversely proportional to its mass.",
    category: "Physics",
    youtubeQuery: "newton's second law of motion physics"
  },
  {
    name: "Euler-Lagrange Equation",
    expr: "d/dt(∂L/∂q̇) - ∂L/∂q = 0",
    desc: "Formulates classical mechanics and field theory via variational principles.",
    category: "Calculus",
    youtubeQuery: "euler lagrange equation classical mechanics"
  },
  {
    name: "Probability of Event A",
    expr: "P(A) = n(A) / n(S)",
    desc: "Calculates likelihood by dividing favorable outcomes n(A) by total sample space outcomes n(S).",
    category: "Statistics",
    youtubeQuery: "probability basics math tutorials"
  },
  {
    name: "Limit Definition of Derivative",
    expr: "f'(x) = lim(h→0) [ f(x+h) - f(x) ] / h",
    desc: "The foundational limit definition calculating instantaneous rate of change of a function.",
    category: "Calculus",
    youtubeQuery: "calculus limit definition of derivative"
  }
];
