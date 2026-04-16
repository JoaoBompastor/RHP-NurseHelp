// --- CONFIGURAÇÕES GLOBAIS DO SISTEMA ---
export const APP_CONFIG = {
  hospitalName: "Real Hospital Português",
  hospitalShort: "RHP",
  appName: "CODE COFFEEWARE",
  currentDate: "16 Abr 2026",
  maxWeeklyHoursCLT: 44,
  alertThresholdHours: 6,
};

// --- PERFIS PARA DEMONSTRAÇÃO (LOGIN) ---
export const DEMO_PROFILES = [
  { id: 1, name: "Marcos Pinto", role: "Enfermeiro", type: "Pool Flexível", readiness: 92, first: "Marcos", last: "Pinto", unit: "Cobertura" },
  { id: 2, name: "Carla Matos", role: "Enfermeira Pleno", type: "Equipe Efetiva", readiness: 15, first: "Carla", last: "Matos", unit: "UTI-A" },
  { id: 3, name: "Diego Silva", role: "Téc. Enfermagem", type: "Equipe Efetiva", readiness: 60, first: "Diego", last: "Silva", unit: "UTI-B" }
];

// --- DADOS DO DASHBOARD (GESTOR) ---
export const MOCK_NURSES = [
  { id: 1, name: "Ana Costa",   role: "Enf. Sênior", unit: "UTI-A", color: "#006035", bg: "#e8f5ee", readiness: 85, hours: 28, shift: "07:00–19:00", status: "active" },
  { id: 2, name: "Bruno Lima",  role: "Téc. Enf.",   unit: "UTI-A", color: "#2563eb", bg: "#dbeafe", readiness: 45, hours: 36, shift: "07:00–19:00", status: "active" },
  { id: 3, name: "Carla Matos", role: "Enf. Pleno",  unit: "UTI-A", color: "#dc2626", bg: "#fee2e2", readiness: 0,  hours: 0,  shift: "07:00–19:00", status: "falta", alert: true },
  { id: 6, name: "Fabiana Melo",role: "Enf. Pleno",  unit: "Pediatria", color: "#059669", bg: "#d1fae5", readiness: 78, hours: 24, shift: "07:00–19:00", status: "active" },
  { id: 7, name: "Gabriel Souza",role: "Téc. Enf.",  unit: "Emergência", color: "#2563eb", bg: "#dbeafe", readiness: 82, hours: 30, shift: "07:00–19:00", status: "active" },
  { id: 8, name: "Helena Paz",  role: "Enf. Sênior", unit: "C. Cirúrgico", color: "#9333ea", bg: "#f3e8ff", readiness: 90, hours: 20, shift: "07:00–13:00", status: "active" },
  { id: 9, name: "Igor Santos", role: "Téc. Enf.",   unit: "UTI-B", color: "#ea580c", bg: "#ffedd5", readiness: 40, hours: 40, shift: "13:00–19:00", status: "active" },
  { id: 10, name:"Joana Dark",  role: "Enf. Pleno",  unit: "Clínica Méd.", color: "#4f46e5", bg: "#e0e7ff", readiness: 65, hours: 32, shift: "07:00–19:00", status: "active" },
];

export const MOCK_POOL = [
  { id: 101, name: "Fernanda Luz",  hoursSem: 32, readiness: 88, color: "#006035", bg: "#e8f5ee" },
  { id: 102, name: "Marcos Pinto",  hoursSem: 28, readiness: 92, color: "#2563eb", bg: "#dbeafe" },
  { id: 103, name: "Juliana Neto",  hoursSem: 34, readiness: 75, color: "#7c3aed", bg: "#ede9fe" },
  { id: 104, name: "Lucas Mendes",  hoursSem: 20, readiness: 95, color: "#059669", bg: "#d1fae5" },
  { id: 105, name: "Mariana Silva", hoursSem: 36, readiness: 60, color: "#ea580c", bg: "#ffedd5" },
];

// --- DADOS DO APP DO ENFERMEIRO ---
export const MOCK_WEEK_DATA = [
  { day: "SEG", h: 8 }, { day: "TER", h: 8 }, { day: "QUA", h: 6 },
  { day: "QUI", h: 0 }, { day: "SEX", h: 8 }, { day: "SAB", h: 0 }, { day: "DOM", h: 0 },
];

export const MOCK_MY_SHIFTS = [
  { id: 1, date: "HOJE, 16 ABR", name: "Plantão Diurno · UTI-A", hours: "07:00 – 19:00", color: "#006035", today: true, icon: "🟢", status: "confirmed", order: 1 },
  { id: 2, date: "SEX, 18 ABR",  name: "Plantão Diurno · UTI-A", hours: "07:00 – 19:00", color: "#2563eb", today: false, icon: "🔵", status: "confirmed", order: 3 },
  { id: 3, date: "SEG, 21 ABR",  name: "Folga Compensatória",    hours: "Dia livre",     color: "#7c3aed", today: false, icon: "🌙", status: "off", order: 4 },
];