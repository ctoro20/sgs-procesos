
const PROCESS_DETAILS_STORAGE_KEY = "conemi-process-details-v1";
const ITEM_DETAILS_STORAGE_KEY = "conemi-item-details-v1";
const WORKFLOW_CATALOG_STORAGE_KEY = "conemi-workflow-catalog-v1";
const WORKFLOW_LAYOUT_STORAGE_KEY_PREFIX = "conemi-workflow-layout-v1:";
const WORKFLOW_BASE_LAYOUT_STORAGE_KEY_PREFIX = "conemi-workflow-layout-base-v1:";
const WORKFLOW_JSON_LAYOUT_STORAGE_KEY_PREFIX = "conemi-workflow-layout-json-v1:";
const WORKFLOW_JSON_BASE_LAYOUT_STORAGE_KEY_PREFIX = "conemi-workflow-layout-json-base-v1:";
const WORKFLOW_PALETTE_STORAGE_KEY_PREFIX = "conemi-workflow-palette-v1:";
const WORKFLOW_SOURCE_STORAGE_KEY_PREFIX = "conemi-workflow-source-v1:";
const COTIZACIONES_WORKFLOW_TEMPLATE_VERSION = "cotizaciones-html-20260321-roles";
const PLANIFICACION_WORKFLOW_TEMPLATE_VERSION = "planificacion-html-20260323-scaled";
const WORKFLOW_TEMPLATE_REPO_PATHS = {
  "wf-cotizaciones": "data/workflows/wf-cotizaciones.base.json",
  "wf-planificacion": "data/workflows/wf-planificacion.base.json"
};
const workflowTemplateRepoCache = Object.create(null);
const params = new URLSearchParams(window.location.search);
const processId = params.get("process") || "";
const itemId = params.get("item") || "";
const workflowId = params.get("workflow") || "";
const COTIZACIONES_WORKFLOW_URL = "workflow.html?workflow=wf-cotizaciones";
const PLANIFICACION_WORKFLOW_URL = "workflow.html?workflow=wf-planificacion";
const WORKFLOW_TOOL_ICONS = {
  edit: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 11.8 11.9 3a1.4 1.4 0 0 1 2 2L5 13.8 2.5 14.5z"></path><path d="m10.8 4.1 1.1 1.1"></path></svg>',
  delete: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.3 3.3h5.4"></path><path d="M6.2 3.3V2.5h3.6v.8"></path><path d="M4.4 4.6 5 13.2c.1.7.6 1.3 1.4 1.3h3.2c.8 0 1.3-.6 1.4-1.3l.6-8.6"></path><path d="M6.7 6.3v5.1"></path><path d="M9.3 6.3v5.1"></path></svg>',
  convert: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 5.2h7.5"></path><path d="m8.3 2.7 2.5 2.5-2.5 2.5"></path><path d="M13 10.8H5.5"></path><path d="m7.7 8.3-2.5 2.5 2.5 2.5"></path></svg>',
  duplicate: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="7" height="7" rx="1.5"></rect><path d="M3.5 10.5h-.2A1.3 1.3 0 0 1 2 9.2V3.3A1.3 1.3 0 0 1 3.3 2h5.9a1.3 1.3 0 0 1 1.3 1.3v.2"></path></svg>',
  connect: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="4" cy="8" r="1.7"></circle><circle cx="12" cy="4" r="1.7"></circle><circle cx="12" cy="12" r="1.7"></circle><path d="M5.5 7.1 10.4 4.9"></path><path d="M5.5 8.9 10.4 11.1"></path></svg>',
  close: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 5 11 11"></path><path d="M11 5 5 11"></path></svg>'
};
const PROCESS_TREE = [
  { areaId: "A", areaLabel: "Comercial", nodes: [{ id: "P1", label: "Cotizaciones", href: COTIZACIONES_WORKFLOW_URL }] },
  { areaId: "B", areaLabel: "Operaciones", nodes: [{ id: "P2", label: "Planificación", href: PLANIFICACION_WORKFLOW_URL }, { id: "P3", label: "Ejecución Servicios en Terreno" }, { id: "P4", label: "Integración con Laboratorios" }] },
  { areaId: "C", areaLabel: "Área Técnica", nodes: [{ id: "P5", label: "Control y Seguimiento Técnico" }, { id: "P6", label: "Elaboración de Informes" }] }
];

function getProcessTitle(){
  if(!processId){
    return "Workflow sin proceso";
  }
  try{
    const raw = window.localStorage.getItem(PROCESS_DETAILS_STORAGE_KEY);
    if(!raw){
      return processId;
    }
    const parsed = JSON.parse(raw);
    return (parsed[processId] && parsed[processId].title) || processId;
  }catch(error){
    return processId;
  }
}

function getProcessLink(processId){
  if(!processId){
    return "";
  }
  try{
    const raw = window.localStorage.getItem(PROCESS_DETAILS_STORAGE_KEY);
    if(!raw){
      return "";
    }
    const parsed = JSON.parse(raw);
    return (parsed[processId] && parsed[processId].link) || "";
  }catch(error){
    return "";
  }
}

function getItemTitle(){
  if(!itemId){
    return "Workflow sin nodo";
  }
  try{
    const raw = window.localStorage.getItem(ITEM_DETAILS_STORAGE_KEY);
    if(!raw){
      return itemId;
    }
    const parsed = JSON.parse(raw);
    return (parsed[itemId] && parsed[itemId].title) || itemId;
  }catch(error){
    return itemId;
  }
}

function getWorkflowEntry(){
  const builtInEntries = {
    "wf-cotizaciones": { id: "wf-cotizaciones", title: "Workflow Cotizaciones", pageName: "workflow.html?workflow=wf-cotizaciones", url: COTIZACIONES_WORKFLOW_URL },
    "wf-planificacion": { id: "wf-planificacion", title: "Workflow Planificación", pageName: "workflow.html?workflow=wf-planificacion", url: PLANIFICACION_WORKFLOW_URL }
  };
  if(!workflowId){
    return null;
  }
  try{
    const raw = window.localStorage.getItem(WORKFLOW_CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return (Array.isArray(parsed) ? parsed : []).find(function(entry){
      return entry.id === workflowId;
    }) || builtInEntries[workflowId] || null;
  }catch(error){
    return builtInEntries[workflowId] || null;
  }
}

function getLinkedProcessIdFromDetails(){
  if(processId){
    return processId;
  }
  if(!workflowEntry){
    return "";
  }
  try{
    const raw = window.localStorage.getItem(PROCESS_DETAILS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return Object.keys(parsed).find(function(key){
      return parsed[key] && parsed[key].link === workflowEntry.url;
    }) || (workflowId === "wf-cotizaciones" ? "P1" : (workflowId === "wf-planificacion" ? "P2" : ""));
  }catch(error){
    return workflowId === "wf-cotizaciones" ? "P1" : (workflowId === "wf-planificacion" ? "P2" : "");
  }
}

function getLinkedItemIdFromDetails(){
  if(itemId){
    return itemId;
  }
  if(!workflowEntry){
    return "";
  }
  try{
    const raw = window.localStorage.getItem(ITEM_DETAILS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return Object.keys(parsed).find(function(key){
      return parsed[key] && parsed[key].link === workflowEntry.url;
    }) || "";
  }catch(error){
    return "";
  }
}

function renderSidebarTree(){
  const treeEl = document.getElementById("workflowNavTree");
  const linkedProcessId = getLinkedProcessIdFromDetails();
  treeEl.innerHTML = PROCESS_TREE.map(function(group){
    const children = group.nodes.map(function(node){
      const isActive = node.id === linkedProcessId;
      const nodeHref = node.href || getProcessLink(node.id) || "index.html";
      return `<div class="nav-group-children"><a class="nav-link${isActive ? " active" : ""}" href="${nodeHref}"><span class="nav-pill">${node.id}</span>${node.label}</a></div>`;
    }).join("");
    return `<div class="nav-group"><div class="nav-group-label"><span class="nav-pill">${group.areaId}</span>${group.areaLabel}</div>${children}</div>`;
  }).join("");
}

const workflowEntry = getWorkflowEntry();
const workflowTitle = workflowEntry ? workflowEntry.title : (processId ? getProcessTitle() : getItemTitle());
const workflowSubtitle = workflowEntry
  ? ("Página " + workflowEntry.pageName)
  : (processId ? ("Proceso " + processId) : (itemId ? ("Nodo " + itemId) : "Workflow no especificado"));
const workflowToken = workflowId || processId || itemId || "WF";
const workflowStorageKey = WORKFLOW_LAYOUT_STORAGE_KEY_PREFIX + workflowToken;
const workflowBaseStorageKey = WORKFLOW_BASE_LAYOUT_STORAGE_KEY_PREFIX + workflowToken;
const workflowJsonStorageKey = WORKFLOW_JSON_LAYOUT_STORAGE_KEY_PREFIX + workflowToken;
const workflowJsonBaseStorageKey = WORKFLOW_JSON_BASE_LAYOUT_STORAGE_KEY_PREFIX + workflowToken;
const workflowPaletteStorageKey = WORKFLOW_PALETTE_STORAGE_KEY_PREFIX + workflowToken;
const workflowSourceStorageKey = WORKFLOW_SOURCE_STORAGE_KEY_PREFIX + workflowToken;
const WORKFLOW_ZOOM_STORAGE_KEY_PREFIX = "conemi-workflow-zoom-v1:";
const PUBLICATION_WIDTH = 1200;
const PUBLICATION_HEIGHT = 380;
const EDITOR_WIDTH = 2200;
const EDITOR_HEIGHT = 1400;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.8;
const ZOOM_STEP = 0.1;
const WORKFLOW_ICON_PRESETS = {
  current: {
    label: "Actual",
    markup: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.3 4.8 5.2.8-3.8 3.8.9 5.3L12 15.2 7.4 17.7l.9-5.3L4.5 8.6l5.2-.8z"></path></svg>'
  },
  warning: {
    label: "Alerta",
    markup: '<svg class="workflow-icon-filled" viewBox="0 0 24 24" aria-hidden="true"><path fill="#ffc107" d="M10.5 3.9a1.8 1.8 0 0 1 3 0l7 11.9A2.1 2.1 0 0 1 18.7 19H5.3a2.1 2.1 0 0 1-1.8-3.2Z"></path><path fill="#687282" d="M12 7.8c.9 0 1.4.6 1.4 1.5l-.4 4.5a1 1 0 0 1-2 0l-.4-4.5c0-.9.5-1.5 1.4-1.5Z"></path><circle cx="12" cy="16.8" r="1.35" fill="#687282"></circle></svg>'
  },
  excel: {
    label: "Excel",
    markup: '<svg class="workflow-icon-filled" viewBox="0 0 256 256" aria-hidden="true"><defs><linearGradient id="excelG1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#33C481"></stop><stop offset="100%" stop-color="#21A366"></stop></linearGradient><linearGradient id="excelG2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#2DB978"></stop><stop offset="100%" stop-color="#107C41"></stop></linearGradient><linearGradient id="excelG3" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#185C37"></stop><stop offset="100%" stop-color="#0E5A33"></stop></linearGradient></defs><rect x="96" y="24" width="120" height="160" rx="8" fill="url(#excelG1)"></rect><rect x="112" y="40" width="120" height="160" rx="8" fill="url(#excelG2)"></rect><g opacity="0.20"><rect x="124" y="36" width="14" height="150" fill="#ffffff"></rect><rect x="144" y="36" width="14" height="150" fill="#ffffff"></rect><rect x="164" y="36" width="14" height="150" fill="#ffffff"></rect><rect x="184" y="36" width="14" height="150" fill="#ffffff"></rect></g><rect x="24" y="56" width="120" height="120" rx="10" fill="url(#excelG3)"></rect><g transform="translate(84 116)"><polygon points="-30,-40 -10,-40 0,-15 10,-40 30,-40 10,0 30,40 10,40 0,15 -10,40 -30,40 -10,0" fill="#ffffff"></polygon></g></svg>'
  },
  documentStack: {
    label: "Documento doble",
    markup: '<svg class="workflow-icon-filled" viewBox="0 0 24 24" aria-hidden="true"><path fill="#d8e1ec" stroke="#7f90a4" stroke-width="1.2" d="M8.3 4.7h7l2.8 2.8V18a1.7 1.7 0 0 1-1.7 1.7H8.3A1.7 1.7 0 0 1 6.6 18V6.4a1.7 1.7 0 0 1 1.7-1.7Z"></path><path fill="#ffffff" stroke="#6f8298" stroke-width="1.2" d="M5.5 3.2h7.1l2.9 2.9v11a1.7 1.7 0 0 1-1.7 1.7H5.5a1.7 1.7 0 0 1-1.7-1.7V4.9a1.7 1.7 0 0 1 1.7-1.7Z"></path><path fill="#dbe4ef" stroke="#6f8298" stroke-width=".8" d="M12.6 3.2v2.9h2.9Z"></path><path fill="#7f90a4" d="M6.8 8.7h6.2V10H6.8zm0 3h6.2V13H6.8zm0 3h4.1V16H6.8z"></path></svg>'
  },
  documentOk: {
    label: "Documento OK",
    markup: '<svg class="workflow-icon-filled" viewBox="0 0 24 24" aria-hidden="true"><path fill="#ffffff" stroke="#6f8298" stroke-width="1.2" d="M5.2 3.2h7.1l2.9 2.9v11.6a1.7 1.7 0 0 1-1.7 1.7H5.2a1.7 1.7 0 0 1-1.7-1.7V4.9a1.7 1.7 0 0 1 1.7-1.7Z"></path><path fill="#dbe4ef" stroke="#6f8298" stroke-width=".8" d="M12.3 3.2v2.9h2.9Z"></path><path fill="#7f90a4" d="M6.5 8.7h5.9V10H6.5zm0 3h4.2V13H6.5z"></path><circle cx="16.7" cy="16.8" r="3.9" fill="#21a366" stroke="#157a46" stroke-width=".8"></circle><path d="m14.9 16.8 1.2 1.2 2.4-2.6" stroke="#ffffff" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" fill="none"></path></svg>'
  },
  labFlask: {
    label: "Laboratorio",
    markup: '<svg class="workflow-icon-filled" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 3h6" stroke="#5a6575" stroke-width="1.6" stroke-linecap="round" fill="none"></path><path fill="#dfe7f1" stroke="#6f7f91" stroke-width="1.2" d="M10 3.8v4.5l-4 6.6A2.3 2.3 0 0 0 8 18.4h8a2.3 2.3 0 0 0 2-3.5l-4-6.6V3.8"></path><path fill="#69c6dd" d="M8.4 12.8h7.2l1.3 2.2a1.3 1.3 0 0 1-1.1 2H8.2a1.3 1.3 0 0 1-1.1-2Z"></path><path d="M8.8 9.3h6.4" stroke="#8a99aa" stroke-width="1" stroke-linecap="round" fill="none"></path><circle cx="10.2" cy="14.4" r=".7" fill="#b8f0ff"></circle><circle cx="13.1" cy="15.3" r=".55" fill="#b8f0ff"></circle></svg>'
  },
  microscope: {
    label: "Microscopio",
    markup: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.7 4.2 18 6.5l-3.2 3.2-2.3-2.3Z"></path><path d="m13.7 7.2-3.5 3.5"></path><circle cx="15.7" cy="10.8" r="1.6"></circle><path d="M16.9 12.1a6.6 6.6 0 0 1 1.8 4.5 4.5 4.5 0 0 1-9 0"></path><path d="M6.2 13.2h5.4a1 1 0 0 1 0 2H6.2a1 1 0 0 1 0-2Z"></path><path d="M5.2 19.4h13.6a1.2 1.2 0 0 1 0 2.4H5.2a1.2 1.2 0 0 1 0-2.4Z"></path><path d="M11.5 17.8h3.6l1.2 1.6h-6Z"></path></svg>'
  },
  airplane: {
    label: "Avión",
    markup: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 11.2-7.1 1.8-3.8-7.2-2 .5 1.7 6-3.2.8-2.1-1.6-1.4.4 1.3 2.5-1.3 2.5 1.4.4 2.1-1.6 3.2.8-1.7 6 2 .5 3.8-7.2 7.1 1.8c.8.2 1.6-.3 1.8-1.1.2-.8-.3-1.6-1.1-1.8Z"></path></svg>'
  },
  inspector: {
    label: "Inspector",
    markup: '<svg class="workflow-icon-filled" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10" cy="10" r="4.6" fill="#ffffff" stroke="#6f7f91" stroke-width="1.4"></circle><path d="M13.4 13.4 18.5 18.5" stroke="#6f7f91" stroke-width="2" stroke-linecap="round"></path><path d="M8.2 10h3.6" stroke="#21a366" stroke-width="1.6" stroke-linecap="round"></path><path d="M10 8.2v3.6" stroke="#21a366" stroke-width="1.6" stroke-linecap="round"></path></svg>'
  },
  inspectorsGroup: {
    label: "Grupo inspectores",
    markup: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="6.1" r="2.6"></circle><circle cx="6.6" cy="11" r="2.2"></circle><circle cx="17.4" cy="11" r="2.2"></circle><path d="M9 18.8v-2.2a2.6 2.6 0 0 1 2.6-2.6h.8a2.6 2.6 0 0 1 2.6 2.6v2.2"></path><path d="M3.3 18.8v-1.8a2.4 2.4 0 0 1 2.4-2.4h1.8a2.4 2.4 0 0 1 2.4 2.4v1.8"></path><path d="M14.1 18.8v-1.8a2.4 2.4 0 0 1 2.4-2.4h1.8a2.4 2.4 0 0 1 2.4 2.4v1.8"></path></svg>'
  },
  personMessage: {
    label: "Persona mensaje",
    markup: '<svg class="workflow-icon-filled" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.2" cy="7.2" r="3.2" fill="#8c8c8c"></circle><path fill="#8c8c8c" d="M2.8 18.8c.4-3.3 2.6-5.4 5.4-5.4 3 0 5.2 2.1 5.6 5.4Z"></path><path fill="#ffffff" stroke="#7a7a7a" stroke-width="1.2" d="M12.5 4.3h7.2a1.8 1.8 0 0 1 1.8 1.8v5.7a1.8 1.8 0 0 1-1.8 1.8h-2.8l-2.5 2.4v-2.4h-1.9a1.8 1.8 0 0 1-1.8-1.8V6.1a1.8 1.8 0 0 1 1.8-1.8Z"></path><path d="M14.2 7.4h4.9M14.2 10h4.1M14.2 12.6h3.3" stroke="#7a7a7a" stroke-width="1.3" stroke-linecap="round"></path></svg>'
  },
  email: {
    label: "Email",
    markup: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2"></rect><path d="m4.8 7.5 7.2 5.5 7.2-5.5"></path></svg>'
  },
  phone: {
    label: "Teléfono",
    markup: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 4.5h2.7l1.1 3.7-1.8 1.7a13.4 13.4 0 0 0 4.9 4.9l1.7-1.8 3.7 1.1v2.7a1.8 1.8 0 0 1-1.8 1.8A13.2 13.2 0 0 1 5.4 6.3 1.8 1.8 0 0 1 7.2 4.5Z"></path></svg>'
  },
  role: {
    label: "Rol",
    markup: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"></circle><path d="M5.5 19a6.5 6.5 0 0 1 13 0"></path></svg>'
  },
  system: {
    label: "Sistema",
    markup: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="11" rx="2"></rect><path d="M9 19h6"></path><path d="M12 16v3"></path></svg>'
  }
};

function getDefaultWorkflowItem(type){
  if(type === "entry"){
    return { width: 16, height: 16, fontSize: 12, borderColor: "transparent", backgroundColor: "transparent", textColor: "#30424d" };
  }
  if(type === "output"){
    return { width: 16, height: 16, fontSize: 12, borderColor: "transparent", backgroundColor: "transparent", textColor: "#30424d" };
  }
  if(type === "text"){
    return { width: 220, height: 40, fontSize: 15, borderColor: "transparent", backgroundColor: "transparent", textColor: "#30424d" };
  }
  if(type === "decision"){
    return { width: 24, height: 24, fontSize: 12, borderColor: "#d9c1a3", backgroundColor: "#f7f2ed", textColor: "#30424d" };
  }
  if(type === "icon"){
    return { width: 32, height: 32, fontSize: 12, borderColor: "transparent", backgroundColor: "transparent", textColor: "#30424d" };
  }
  if(type === "process"){
    return { width: 260, height: 88, fontSize: 18, borderColor: "#355fb8", backgroundColor: "#ffffff", textColor: "#5b5b5b" };
  }
  return { width: 260, height: 88, fontSize: 18, borderColor: "#d9c1a3", backgroundColor: "#f7f2ed", textColor: "#30424d" };
}

function normalizeThemeComparableColor(value){
  return String(value || "").trim().toLowerCase();
}

function normalizeWorkflowArrowMode(value){
  const normalized = String(value || "").trim().toLowerCase();
  if(normalized === "none" || normalized === "start" || normalized === "end" || normalized === "both"){
    return normalized;
  }
  if(value === false){
    return "none";
  }
  return "end";
}

function getThemedWorkflowColorToken(value, role){
  const normalized = normalizeThemeComparableColor(value);
  if(role === "node-border" && ["#d9c1a3", "#e9c59d", "#f3a454", "#6fa8d8"].includes(normalized)){
    return "var(--node-border)";
  }
  if(role === "node-fill" && ["#f7f2ed", "#eef5fb"].includes(normalized)){
    return "var(--node-fill)";
  }
  if(role === "node-text" && ["#30424d", "#28507a"].includes(normalized)){
    return "var(--node-text)";
  }
  if(role === "process-stroke" && normalized && normalized !== "transparent"){
    return "var(--process-stroke)";
  }
  if(role === "process-fill" && normalized && normalized !== "transparent"){
    return "var(--process-fill)";
  }
  if(role === "process-text" && normalized && normalized !== "transparent"){
    return "var(--process-text)";
  }
  if(role === "accent-text" && ["#eb7a07", "#1f6fb2"].includes(normalized)){
    return "var(--accent-text)";
  }
  return value;
}

function getWorkflowTextColorRole(item, fallbackRole){
  const baseRole = fallbackRole || "node-text";
  const normalized = normalizeThemeComparableColor(item && item.textColor);
  if(item && (item.kind === "note" || item.kind === "tag")){
    return "accent-text";
  }
  if(item && item.type === "text" && ["#eb7a07", "#1f6fb2"].includes(normalized)){
    return "accent-text";
  }
  if(item && item.type === "process"){
    return "process-text";
  }
  return baseRole;
}

function isInspectorEditableItem(item){
  return Boolean(item && (item.type === "activity" || item.type === "process" || item.kind === "flow-card" || item.type === "text" || item.type === "icon" || item.type === "decision" || item.type === "entry" || item.type === "output"));
}

function isWorkflowResizableItem(item){
  if(!item){
    return false;
  }
  if(item.kind === "subactivity" || item.kind === "actor"){
    return false;
  }
  return Boolean(item.type === "activity" || item.type === "process" || item.type === "decision" || item.type === "text" || item.type === "icon");
}

function canTransferWorkflowStyle(item){
  return Boolean(item && (item.type === "activity" || item.type === "process" || item.type === "entry" || item.type === "output" || item.type === "text" || item.type === "icon"));
}

function getDefaultEntryLabelLayout(){
  return {
    labelOffsetX: 24,
    labelOffsetY: -2,
    labelWidth: 68,
    labelHeight: 20
  };
}

function isWorkflowTerminalType(type){
  return type === "entry" || type === "output";
}

function hasWorkflowFloatingLabel(type){
  return type === "entry" || type === "output" || type === "icon";
}

function getDefaultActorLabelLayout(){
  return {
    labelOffsetX: 0,
    labelOffsetY: 0,
    labelWidth: 110,
    labelHeight: 24
  };
}

function getWorkflowActorMaxWidth(item){
  const labelWidth = Number.isFinite(item && item.labelWidth) && item.labelWidth > 0
    ? item.labelWidth
    : getDefaultActorLabelLayout().labelWidth;
  return Math.max(34, labelWidth + 12);
}

function getWorkflowIconPreset(variant){
  return WORKFLOW_ICON_PRESETS[variant] || WORKFLOW_ICON_PRESETS.current;
}

function getCotizacionesSystemIcon(label){
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="13" rx="2"></rect><path d="M8 20h8"></path><path d="M12 17v3"></path></svg>';
}

function getCotizacionesMiniIcon(label){
  const normalized = String(label || "").replace(/<br\s*\/?>/gi, " ").trim().toLowerCase();
  if(normalized === "llamado telefónico" || normalized === "llamado telefonico"){
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23282828' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.1 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.5 3a2 2 0 0 1-.6 1.8l-1.3 1.3a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 1.8-.6l3 .5A2 2 0 0 1 22 16.9z'/%3E%3C/svg%3E";
  }
  if(normalized === "email"){
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23282828' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='5' width='18' height='14' rx='2'/%3E%3Cpath d='m4 7 8 6 8-6'/%3E%3C/svg%3E";
  }
  if(normalized === "portal licitaciones"){
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23282828' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='4' width='18' height='13' rx='2'/%3E%3Cpath d='M8 20h8'/%3E%3Cpath d='M12 17v3'/%3E%3Cpath d='M7 8h10'/%3E%3Cpath d='M7 11h6'/%3E%3C/svg%3E";
  }
  return "";
}

function getWorkflowDashedBoxLineIcon(label){
  const normalized = String(label || "").trim().toLowerCase();
  if(normalized === "laboratorios/etfa"){
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d47a1f' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M9 3h6'/%3E%3Cpath d='M10 3v5l-4.6 7.4A3 3 0 0 0 8 20h8a3 3 0 0 0 2.6-4.6L14 8V3'/%3E%3Cpath d='M8.5 14h7'/%3E%3C/svg%3E";
  }
  if(normalized === "permisología" || normalized === "permisologia"){
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d47a1f' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8 3.5h6l4 4V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5.5a2 2 0 0 1 2-2Z'/%3E%3Cpath d='M14 3.5v4h4'/%3E%3Cpath d='m9 14 2 2 4-4'/%3E%3C/svg%3E";
  }
  if(normalized === "inspectores/otros" || normalized === "inspecciones/otros"){
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d47a1f' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='9' cy='8' r='2.5'/%3E%3Cpath d='M4.5 18a4.5 4.5 0 0 1 9 0'/%3E%3Cpath d='M15.5 8.5h4'/%3E%3Cpath d='M17.5 6.5v4'/%3E%3C/svg%3E";
  }
  if(normalized === "equipos/insumos"){
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d47a1f' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M15.7 4.2 18 6.5l-3.2 3.2-2.3-2.3Z'/%3E%3Cpath d='m13.7 7.2-3.5 3.5'/%3E%3Ccircle cx='15.7' cy='10.8' r='1.6'/%3E%3Cpath d='M16.9 12.1a6.6 6.6 0 0 1 1.8 4.5 4.5 4.5 0 0 1-9 0'/%3E%3Cpath d='M6.2 13.2h5.4a1 1 0 0 1 0 2H6.2a1 1 0 0 1 0-2Z'/%3E%3Cpath d='M5.2 19.4h13.6a1.2 1.2 0 0 1 0 2.4H5.2a1.2 1.2 0 0 1 0-2.4Z'/%3E%3Cpath d='M11.5 17.8h3.6l1.2 1.6h-6Z'/%3E%3C/svg%3E";
  }
  if(normalized === "logística" || normalized === "logistica"){
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23d47a1f' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 7h10v8H3Z'/%3E%3Cpath d='M13 10h4l3 3v2h-7Z'/%3E%3Ccircle cx='8' cy='18' r='1.8'/%3E%3Ccircle cx='18' cy='18' r='1.8'/%3E%3C/svg%3E";
  }
  return "";
}

function buildWorkflowDashedBoxMarkup(html){
  const lines = String(html || "")
    .split(/<br\s*\/?>/i)
    .map(function(line){ return stripHtml(line); })
    .filter(Boolean);
  if(!lines.length){
    return "";
  }
  return lines.map(function(line){
    const icon = getWorkflowDashedBoxLineIcon(line);
    return `<div class="workflow-dashed-box-row">${icon ? `<span class="workflow-dashed-box-icon" style="background-image:url('${icon}')"></span>` : ""}<span class="workflow-dashed-box-label">${escapeHtml(line)}</span></div>`;
  }).join("");
}

function getCotizacionesWorkflowKindDefaults(kind){
  const kindDefaults = {
    "start-dot": { width: 14, height: 14 },
    "end-dot": { width: 14, height: 14 },
    "label": { width: 90, height: 28 },
    "actor": { width: 150, height: 44 },
    "flow-card": { width: 102, height: 54 },
    "mini-icon": { width: 84, height: 18 },
    "decision-label": { width: 90, height: 18 },
    "decision": { width: 18, height: 18 },
    "subactivity": { width: 132, height: 26 },
    "dashed-box": { width: 145, height: 112 },
    "soft-icon": { width: 82, height: 18 },
    "tag": { width: 74, height: 18 },
    "note": { width: 160, height: 36 }
  };
  return kindDefaults[kind] || { width: 120, height: 24 };
}

function getWorkflowKindTextDefaults(kind){
  const kindDefaults = {
    "actor": { fontSize: 11, textColor: "#777" },
    "flow-card": { fontSize: 12, textColor: "#30424d" },
    "decision-label": { fontSize: 12, textColor: "#30424d" },
    "tag": { fontSize: 10, textColor: "#eb7a07" },
    "note": { fontSize: 11, textColor: "#eb7a07" },
    "mini-icon": { fontSize: 9, textColor: "#555" },
    "label": { fontSize: 13, textColor: "#30424d" },
    "soft-icon": { fontSize: 10, textColor: "#6d7680" },
    "subactivity": { fontSize: 10, textColor: "#30424d" },
    "dashed-box": { fontSize: 12, textColor: "#30424d" }
  };
  return kindDefaults[kind] || null;
}

function normalizeWorkflowRoleKind(item){
  const html = String(item && item.html || "").toLowerCase();
  if(item && item.kind === "soft-icon" && (html.includes("jefe técnico") || html.includes("jefe tecnico") || html.includes("jefe<br>operaciones"))){
    return "actor";
  }
  return item.kind;
}

function normalizeCotizacionesWorkflowItems(items){
  return items.map(function(item){
    const normalizedKind = normalizeWorkflowRoleKind(item);
    const defaults = normalizedKind ? getCotizacionesWorkflowKindDefaults(normalizedKind) : getDefaultWorkflowItem(item.type || "activity");
    const textDefaults = normalizedKind ? getWorkflowKindTextDefaults(normalizedKind) : null;
    const entryLayout = normalizedKind === "actor" ? getDefaultActorLabelLayout() : null;
    return Object.assign({}, item, {
      kind: normalizedKind,
      width: Number.isFinite(item.width) ? item.width : defaults.width,
      height: Number.isFinite(item.height) ? item.height : defaults.height,
      fontSize: Number.isFinite(item.fontSize) ? item.fontSize : (textDefaults ? textDefaults.fontSize : undefined),
      textColor: item.textColor || (textDefaults ? textDefaults.textColor : undefined),
      labelOffsetX: entryLayout ? (Number.isFinite(item.labelOffsetX) ? item.labelOffsetX : entryLayout.labelOffsetX) : item.labelOffsetX,
      labelOffsetY: entryLayout ? (Number.isFinite(item.labelOffsetY) ? item.labelOffsetY : entryLayout.labelOffsetY) : item.labelOffsetY,
      labelWidth: entryLayout ? (Number.isFinite(item.labelWidth) ? item.labelWidth : entryLayout.labelWidth) : item.labelWidth,
      labelHeight: entryLayout ? (Number.isFinite(item.labelHeight) ? item.labelHeight : entryLayout.labelHeight) : item.labelHeight
    });
  });
}

function getWorkflowTemplateVersionForId(targetWorkflowId){
  if(targetWorkflowId === "wf-cotizaciones"){
    return COTIZACIONES_WORKFLOW_TEMPLATE_VERSION;
  }
  if(targetWorkflowId === "wf-planificacion"){
    return PLANIFICACION_WORKFLOW_TEMPLATE_VERSION;
  }
  return "";
}

function getWorkflowAnchorResolverForId(targetWorkflowId){
  if(targetWorkflowId === "wf-cotizaciones"){
    return getCotizacionesWorkflowAnchorPoint;
  }
  return function(item, side){
    const geometry = getWorkflowAnchorGeometryFromRect(item.x, item.y, item.width || 0, item.height || 0, item);
    return getWorkflowAnchorPointFromGeometry(geometry, side);
  };
}

function normalizeWorkflowTemplateDefinition(targetWorkflowId, template){
  if(!template || !Array.isArray(template.items)){
    return null;
  }
  const normalizedTemplate = structuredClone(template);
  normalizedTemplate.templateVersion = normalizedTemplate.templateVersion || getWorkflowTemplateVersionForId(targetWorkflowId);
  if(targetWorkflowId === "wf-cotizaciones"){
    normalizedTemplate.items = normalizeCotizacionesWorkflowItems(normalizedTemplate.items);
  }
  return normalizedTemplate;
}

function loadWorkflowTemplateDefinitionFromRepo(targetWorkflowId, options){
  const settings = options || {};
  const bypassCache = settings.bypassCache === true;
  const templatePath = WORKFLOW_TEMPLATE_REPO_PATHS[targetWorkflowId];
  if(!templatePath){
    return null;
  }
  if(!bypassCache && Object.prototype.hasOwnProperty.call(workflowTemplateRepoCache, targetWorkflowId)){
    const cached = workflowTemplateRepoCache[targetWorkflowId];
    return cached ? structuredClone(cached) : null;
  }
  try{
    const request = new XMLHttpRequest();
    request.open("GET", templatePath, false);
    request.send();
    const hasSuccessfulStatus = (request.status >= 200 && request.status < 300) || (request.status === 0 && request.responseText);
    if(hasSuccessfulStatus && request.responseText){
      const parsed = JSON.parse(request.responseText);
      const normalized = normalizeWorkflowTemplateDefinition(targetWorkflowId, parsed);
      workflowTemplateRepoCache[targetWorkflowId] = normalized ? structuredClone(normalized) : null;
      return normalized ? structuredClone(normalized) : null;
    }
  }catch(error){
  }
  workflowTemplateRepoCache[targetWorkflowId] = null;
  return null;
}

function getWorkflowStateOriginLabel(origin){
  switch(origin){
    case "storage":
      return "storage local";
    case "json-draft":
      return "draft local del JSON";
    case "repo-json":
      return "JSON del repo";
    case "embedded-template":
      return "template embebido";
    case "base-storage":
      return "base guardada en storage";
    default:
      return "fuente desconocida";
  }
}

function createWorkflowStateFromTemplateDefinition(targetWorkflowId, template){
  const normalizedTemplate = normalizeWorkflowTemplateDefinition(targetWorkflowId, template);
  if(!normalizedTemplate){
    return null;
  }
  if(Array.isArray(normalizedTemplate.connectors)){
    const normalizedState = {
      templateVersion: normalizedTemplate.templateVersion || getWorkflowTemplateVersionForId(targetWorkflowId),
      items: structuredClone(normalizedTemplate.items || []),
      connectors: structuredClone(normalizedTemplate.connectors || [])
    };
    if(targetWorkflowId === "wf-cotizaciones"){
      normalizedState.items = normalizeCotizacionesWorkflowItems(normalizedState.items);
    }
    return normalizedState;
  }
  const baseState = createWorkflowStateFromTemplate(normalizedTemplate, getWorkflowAnchorResolverForId(targetWorkflowId));
  if(Number.isFinite(normalizedTemplate.scaleFactor) && normalizedTemplate.scaleFactor > 0 && normalizedTemplate.scaleFactor !== 1){
    return scaleWorkflowState(baseState, normalizedTemplate.scaleFactor);
  }
  return baseState;
}

function createWorkflowStateFromRepoTemplate(targetWorkflowId, options){
  const repoTemplate = loadWorkflowTemplateDefinitionFromRepo(targetWorkflowId, options);
  return repoTemplate ? createWorkflowStateFromTemplateDefinition(targetWorkflowId, repoTemplate) : null;
}

function getCotizacionesWorkflowTemplate(){
  return {
    templateVersion: COTIZACIONES_WORKFLOW_TEMPLATE_VERSION,
    items: normalizeCotizacionesWorkflowItems([
      { id:"start-1", kind:"start-dot", x:48, y:133 },
      { id:"label-1", kind:"label", x:12, y:150, width:90, html:"Necesidad del<br>Cliente" },
      { id:"actor-1", kind:"actor", x:124, y:60, width:150, html:"Ejecutivo<br>Comercial" },
      { id:"step-1", kind:"flow-card", x:128, y:122, width:102, html:"Recepcionar<br>Requerimiento", badge:"1", step:"1" },
      { id:"mini-1", kind:"mini-icon", x:142, y:175, html:"Llamado telefónico" },
      { id:"mini-2", kind:"mini-icon", x:142, y:198, html:"Email" },
      { id:"mini-3", kind:"mini-icon", x:142, y:221, width:110, html:"Portal Licitaciones" },
      { id:"mini-4", kind:"mini-icon", x:264, y:120, width:92, height:28, html:"Documentos<br>de soporte" },
      { id:"decision-label-1", kind:"decision-label", x:389, y:104, width:110, height:30, html:"¿Requerimiento<br>corresponde a Licitación?" },
      { id:"decision-1", kind:"decision", x:424, y:132, width:18, height:18 },
      { id:"decision-label-2", kind:"decision-label", x:405, y:168, width:50, html:"Si" },
      { id:"decision-label-3", kind:"decision-label", x:470, y:135, width:44, html:"No" },
      { id:"actor-2", kind:"actor", x:301, y:204, width:150, html:"Ejecutivo<br>Comercial" },
      { id:"step-1-1", kind:"flow-card", x:387, y:182, width:102, html:"Validar Técnica y<br>Operativamente", badge:"1.1", badgeClass:"small", step:"1.1" },
      { id:"soft-1", kind:"subactivity", x:377, y:272, width:132, height:26, html:"Consultas a las áreas" },
      { id:"icon-lab-etfa", type:"icon", x:206, y:326, width:20, height:20, iconVariant:"labFlask", title:"", labelOffsetX:0, labelOffsetY:0, labelWidth:0, labelHeight:0 },
      { id:"dash-1", kind:"dashed-box", x:225, y:313, width:145, html:"Laboratorios/ETFA<br>Permisología<br>Inspectores/Otros<br>Equipos/Insumos<br>Logística" },
      { id:"soft-2", kind:"soft-icon", x:486, y:266, width:82, html:"Operaciones" },
      { id:"soft-3", kind:"soft-icon", x:486, y:286, width:82, html:"Técnicas" },
      { id:"soft-4", kind:"subactivity", x:382, y:372, width:126, height:26, html:"Entrega de la información" },
      { id:"soft-5", kind:"soft-icon", x:505, y:332, width:92, height:28, html:"Jefe<br>Operaciones" },
      { id:"soft-6", kind:"soft-icon", x:505, y:362, width:92, height:28, html:"Jefe Técnico" },
      { id:"actor-3", kind:"actor", x:542, y:62, width:150, html:"Ejecutivo<br>Comercial" },
      { id:"step-2", kind:"flow-card", x:575, y:122, width:102, html:"Elaborar<br>Cotización", badge:"2", step:"2" },
      { id:"icon-excel-step-2", type:"icon", x:686, y:136, width:20, height:20, iconVariant:"excel", title:"", labelOffsetX:0, labelOffsetY:0, labelWidth:0, labelHeight:0 },
      { id:"tag-1", kind:"tag", x:671, y:146, html:"Qcotizador" },
      { id:"tag-2", kind:"tag", x:683, y:166, width:54, html:"QETFA" },
      { id:"note-1", kind:"note", x:620, y:175, width:165, height:54, html:"Se adjunta archivo de costeo y se especifican los servicios ETFA, el sistema realiza la validación." },
      { id:"actor-4", kind:"actor", x:738, y:56, width:180, html:"Gerente de Desarrollo de<br>Negocios" },
      { id:"step-3", kind:"flow-card", x:742, y:122, width:102, html:"Aprobar<br>Cotización", badge:"3", step:"3" },
      { id:"tag-3", kind:"tag", x:796, y:166, html:"Qcotizador" },
      { id:"decision-label-4", kind:"decision-label", x:866, y:104, width:110, height:30, html:"¿Se aprueba la<br>Cotización?" },
      { id:"decision-2", kind:"decision", x:906, y:132, width:18, height:18 },
      { id:"decision-label-5", kind:"decision-label", x:892, y:168, width:46, html:"No" },
      { id:"decision-label-6", kind:"decision-label", x:964, y:135, width:44, html:"Si" },
      { id:"mini-5", kind:"mini-icon", x:866, y:182, width:92, html:"Corregir" },
      { id:"mini-6", kind:"mini-icon", x:900, y:202, width:85, height:28, html:"Solicitar<br>Correcciones" },
      { id:"mini-7", kind:"mini-icon", x:970, y:205, width:70, html:"Email" },
      { id:"mini-8", kind:"mini-icon", x:1044, y:120, width:82, height:28, html:"Cotización<br>Aprobada" },
      { id:"actor-5", kind:"actor", x:1115, y:60, width:150, html:"Ejecutivo<br>Comercial" },
      { id:"step-4", kind:"flow-card", x:1148, y:122, width:102, html:"Notificar al<br>Cliente", badge:"4", step:"4" },
      { id:"icon-doc-stack-step-4", type:"icon", x:1264, y:120, width:20, height:20, iconVariant:"documentStack", title:"", labelOffsetX:0, labelOffsetY:0, labelWidth:0, labelHeight:0 },
      { id:"icon-doc-ok-step-4", type:"icon", x:1264, y:144, width:20, height:20, iconVariant:"documentOk", title:"", labelOffsetX:0, labelOffsetY:0, labelWidth:0, labelHeight:0 },
      { id:"tag-4", kind:"tag", x:1254, y:146, html:"Qcotizador" },
      { id:"icon-warning-note-2", type:"icon", x:1174, y:184, width:20, height:20, iconVariant:"warning", title:"", labelOffsetX:0, labelOffsetY:0, labelWidth:0, labelHeight:0 },
      { id:"note-2", kind:"note", x:1201, y:177, width:155, html:"Se realiza correo personalizado al Cliente." },
      { id:"mini-9", kind:"mini-icon", x:1146, y:196, width:108, height:28, html:"Cotización<br>Enviada" },
      { id:"mini-10", kind:"mini-icon", x:1220, y:208, width:54, html:"Email" },
      { id:"actor-6", kind:"actor", x:1244, y:275, width:150, html:"Ejecutivo<br>Comercial" },
      { id:"step-5", kind:"flow-card", x:1148, y:286, width:102, html:"Realizar seguimiento", badge:"5", step:"5" },
      { id:"tag-4b", kind:"tag", x:1201, y:332, html:"Qcotizador" },
      { id:"note-3", kind:"note", x:1200, y:349, width:180, html:"Al tercer día si no se obtiene respuesta aún." },
      { id:"actor-7", kind:"actor", x:1244, y:381, width:150, html:"Ejecutivo<br>Comercial" },
      { id:"step-6", kind:"flow-card", x:1148, y:389, width:102, html:"Realizar Negociación", badge:"6", step:"6" },
      { id:"tag-4c", kind:"tag", x:1201, y:435, html:"Qcotizador" },
      { id:"note-4", kind:"note", x:1200, y:452, width:192, height:44, html:"Ajustar precios, plazos y condiciones según las necesidades del cliente." },
      { id:"decision-label-7", kind:"decision-label", x:1088, y:543, width:95, height:28, html:"¿Cotización<br>aceptada?" },
      { id:"decision-3", kind:"decision", x:1191, y:545, width:18, height:18 },
      { id:"decision-label-8", kind:"decision-label", x:1178, y:584, width:45, html:"Si" },
      { id:"decision-label-9", kind:"decision-label", x:1247, y:548, width:44, html:"No" },
      { id:"actor-8", kind:"actor", x:1294, y:493, width:150, html:"Ejecutivo<br>Comercial" },
      { id:"step-6-1", kind:"flow-card", x:1282, y:535, width:102, html:"Rechazar Cotización", badge:"7", step:"7" },
      { id:"tag-5", kind:"tag", x:1357, y:576, html:"Qcotizador" },
      { id:"end-1", kind:"end-dot", x:1468, y:548, width:14, height:14 },
      { id:"label-2", kind:"label", x:1428, y:566, width:92, html:"Cotización<br>Rechazada" },
      { id:"decision-label-10", kind:"decision-label", x:1080, y:640, width:110, height:30, html:"¿Cotización de<br>Cliente prospecto?" },
      { id:"decision-4", kind:"decision", x:1191, y:645, width:18, height:18 },
      { id:"decision-label-11", kind:"decision-label", x:1177, y:684, width:45, html:"No" },
      { id:"decision-label-12", kind:"decision-label", x:1246, y:648, width:44, html:"Si" },
      { id:"boss-1", type:"process", x:1304, y:626, width:170, height:92, title:"Creación de\nCliente en\nBOSS" },
      { id:"note-5", kind:"note", x:1348, y:684, width:160, height:44, html:"Se debe tener el cliente creado en BOSS para aceptar la cotización en sistema." },
      { id:"actor-9", kind:"actor", x:1046, y:698, width:150, html:"Ejecutivo<br>Comercial" },
      { id:"step-6-2", kind:"flow-card", x:1148, y:718, width:102, html:"Aceptar Cotización", badge:"7.2", badgeClass:"small", step:"7.2" },
      { id:"tag-6", kind:"tag", x:1201, y:759, html:"Qcotizador" },
      { id:"actor-10", kind:"actor", x:1257, y:798, width:150, html:"Ejecutivo<br>Comercial" },
      { id:"step-7", kind:"flow-card", x:1148, y:816, width:102, html:"Crear o Actualizar<br>OL", badge:"8", step:"8" },
      { id:"tag-7", kind:"tag", x:1201, y:857, html:"Syscom" },
      { id:"end-2", kind:"end-dot", x:1193, y:889, width:14, height:14 },
      { id:"label-3", kind:"label", x:1142, y:907, width:118, html:"OL creada o<br>actualizada" }
    ]),
    lines: [
      { id:"line-1", from:{ itemId:"start-1", side:"right" }, to:{ itemId:"step-1", side:"left" } },
      { id:"line-2", from:{ itemId:"step-1", side:"right" }, to:{ itemId:"decision-1", side:"left" } },
      { id:"line-3", from:{ itemId:"decision-1", side:"bottom" }, to:{ itemId:"step-1-1", side:"top" } },
      { id:"line-4", from:{ itemId:"decision-1", side:"right" }, to:{ itemId:"step-2", side:"left" } },
      { id:"line-5", from:{ itemId:"step-1-1", side:"bottom" }, to:{ itemId:"soft-1", side:"top" } },
      { id:"line-6", from:{ itemId:"soft-1", side:"left" }, via:[{ x:356, y:285 }], to:{ itemId:"dash-1", side:"top" } },
      { id:"line-7", from:{ itemId:"dash-1", side:"right" }, via:[{ x:438, y:349 }], to:{ itemId:"soft-4", side:"left" } },
      { id:"line-8", from:{ itemId:"soft-4", side:"right" }, to:{ itemId:"step-2", side:"bottom" } },
      { id:"line-9", from:{ itemId:"step-2", side:"right" }, to:{ itemId:"step-3", side:"left" } },
      { id:"line-10", from:{ itemId:"step-3", side:"right" }, to:{ itemId:"decision-2", side:"left" } },
      { id:"line-11", from:{ itemId:"decision-2", side:"right" }, to:{ itemId:"step-4", side:"left" } },
      { id:"line-12", from:{ itemId:"decision-2", side:"bottom" }, via:[{ x:915, y:235 }, { x:540, y:235 }, { x:540, y:178 }], to:{ itemId:"step-2", side:"top" } },
      { id:"line-13", from:{ itemId:"step-4", side:"bottom" }, via:[{ x:1200, y:225 }], to:{ itemId:"step-5", side:"top" } },
      { id:"line-14", from:{ itemId:"step-5", side:"bottom" }, via:[{ x:1200, y:389 }], to:{ itemId:"step-6", side:"top" } },
      { id:"line-15", from:{ itemId:"step-6", side:"bottom" }, via:[{ x:1200, y:553 }], to:{ itemId:"decision-3", side:"top" } },
      { id:"line-16", from:{ itemId:"decision-3", side:"right" }, to:{ itemId:"step-6-1", side:"left" } },
      { id:"line-17", from:{ itemId:"step-6-1", side:"right" }, to:{ itemId:"end-1", side:"left" } },
      { id:"line-18", from:{ itemId:"decision-3", side:"bottom" }, via:[{ x:1200, y:652 }], to:{ itemId:"decision-4", side:"top" } },
      { id:"line-19", from:{ itemId:"decision-4", side:"right" }, to:{ itemId:"boss-1", side:"left" } },
      { id:"line-20", from:{ itemId:"boss-1", side:"bottom" }, via:[{ x:1350, y:700 }, { x:1250, y:700 }], to:{ itemId:"step-6-2", side:"right" } },
      { id:"line-21", from:{ itemId:"decision-4", side:"bottom" }, via:[{ x:1200, y:700 }], to:{ itemId:"step-6-2", side:"top" } },
      { id:"line-22", from:{ itemId:"step-6-2", side:"bottom" }, via:[{ x:1200, y:816 }], to:{ itemId:"step-7", side:"top" } },
      { id:"line-23", from:{ itemId:"step-7", side:"bottom" }, to:{ itemId:"end-2", side:"top" } }
    ]
  };
}

function getCotizacionesWorkflowAnchorPoint(item, side){
  const anchorHeights = {
    "decision": 18,
    "start-dot": 14,
    "end-dot": 14,
    "subactivity": 26,
    "dashed-box": 92,
    "tag": 14
  };
  const anchorWidths = {
    "decision": 18,
    "start-dot": 14,
    "end-dot": 14,
    "subactivity": 120,
    "dashed-box": 145,
    "tag": 54
  };
  const usesVisibleBounds = item.kind === "flow-card" || item.kind === "subactivity";
  const anchorWidth = usesVisibleBounds ? item.width : (anchorWidths[item.kind] || item.width);
  const anchorHeight = usesVisibleBounds ? item.height : (anchorHeights[item.kind] || item.height);
  if(item.kind === "decision"){
    const centerX = item.x + (anchorWidth / 2);
    const centerY = item.y + (anchorHeight / 2);
    const radiusX = anchorWidth / 2;
    const radiusY = anchorHeight / 2;
    const touchOffset = 1.5;
    const normalizedSide = normalizeWorkflowAnchorSide(side);
    const edge = normalizedSide === "center" ? "center" : normalizedSide.split("-")[0];
    if(edge === "left"){
      return { x: centerX - radiusX - touchOffset, y: centerY };
    }
    if(edge === "right"){
      return { x: centerX + radiusX + touchOffset, y: centerY };
    }
    if(edge === "top"){
      return { x: centerX, y: centerY - radiusY - touchOffset };
    }
    if(edge === "bottom"){
      return { x: centerX, y: centerY + radiusY + touchOffset };
    }
    return { x: centerX, y: centerY };
  }
  const geometry = getWorkflowAnchorGeometryFromRect(item.x, item.y, anchorWidth, anchorHeight, item);
  return getWorkflowAnchorPointFromGeometry(geometry, side);
}

function normalizeWorkflowAnchorSide(side){
  const normalized = String(side || "").trim().toLowerCase();
  if(!normalized || normalized === "center"){
    return "center";
  }
  if(normalized === "left" || normalized === "right" || normalized === "top" || normalized === "bottom"){
    return normalized + "-middle";
  }
  return normalized;
}

function getWorkflowAnchorFractionsForLength(length){
  const size = Number.isFinite(length) ? length : 0;
  if(size >= 180){
    return [0.125, 0.25, 0.5, 0.75, 0.875];
  }
  if(size >= 110){
    return [0.17, 0.33, 0.5, 0.67, 0.83];
  }
  return [0.25, 0.5, 0.75];
}

function getWorkflowAnchorFractionsByItem(item, width, height){
  const horizontalFractions = getWorkflowAnchorFractionsForLength(width);
  const verticalFractions = getWorkflowAnchorFractionsForLength(height);
  if(item && item.kind === "subactivity"){
    return {
      left: [0.17, 0.33, 0.5, 0.67, 0.83],
      right: [0.17, 0.33, 0.5, 0.67, 0.83],
      top: horizontalFractions,
      bottom: horizontalFractions
    };
  }
  return {
    left: verticalFractions,
    right: verticalFractions,
    top: horizontalFractions,
    bottom: horizontalFractions
  };
}

function getWorkflowAnchorGeometryFromRect(x, y, width, height, item){
  const safeWidth = Number.isFinite(width) ? width : 0;
  const safeHeight = Number.isFinite(height) ? height : 0;
  const centerX = x + (safeWidth / 2);
  const centerY = y + (safeHeight / 2);
  return {
    x: x,
    y: y,
    width: safeWidth,
    height: safeHeight,
    centerX: centerX,
    centerY: centerY,
    edgeFractions: getWorkflowAnchorFractionsByItem(item, safeWidth, safeHeight)
  };
}

function getWorkflowAnchorFraction(edge, position, fractions){
  if(position === "top" || position === "left"){
    return fractions[0];
  }
  if(position === "middle" || position === "center"){
    const middleFraction = fractions.find(function(value){
      return Math.abs(value - 0.5) < 0.001;
    });
    return typeof middleFraction === "number" ? middleFraction : fractions[Math.floor(fractions.length / 2)];
  }
  if(position === "bottom" || position === "right"){
    return fractions[fractions.length - 1];
  }
  const numericPosition = Number(position);
  if(Number.isFinite(numericPosition)){
    const normalizedNumeric = numericPosition > 1 ? (numericPosition / 100) : numericPosition;
    let closestFraction = fractions[0];
    let closestDistance = Math.abs(fractions[0] - normalizedNumeric);
    fractions.forEach(function(fraction){
      const distance = Math.abs(fraction - normalizedNumeric);
      if(distance < closestDistance){
        closestFraction = fraction;
        closestDistance = distance;
      }
    });
    return closestFraction;
  }
  return fractions[Math.floor(fractions.length / 2)];
}

function getWorkflowAnchorPointFromGeometry(geometry, side){
  const normalizedSide = normalizeWorkflowAnchorSide(side);
  if(normalizedSide === "center"){
    return {
      x: geometry.centerX,
      y: geometry.centerY
    };
  }
  const parts = normalizedSide.split("-");
  const edge = parts[0];
  const position = parts[1] || "middle";
  const width = geometry.width || 0;
  const height = geometry.height || 0;
  const fractions = geometry.edgeFractions || {};
  const horizontalFractions = (fractions.top && fractions.top.length ? fractions.top : [0.25, 0.5, 0.75]);
  const verticalFractions = (fractions.left && fractions.left.length ? fractions.left : [0.25, 0.5, 0.75]);

  if(edge === "left"){
    const fraction = getWorkflowAnchorFraction(edge, position, verticalFractions);
    return {
      x: geometry.x,
      y: geometry.y + (height * fraction)
    };
  }
  if(edge === "right"){
    const fraction = getWorkflowAnchorFraction(edge, position, verticalFractions);
    return {
      x: geometry.x + width,
      y: geometry.y + (height * fraction)
    };
  }
  if(edge === "top"){
    const fraction = getWorkflowAnchorFraction(edge, position, horizontalFractions);
    return {
      x: geometry.x + (width * fraction),
      y: geometry.y
    };
  }
  const fraction = getWorkflowAnchorFraction(edge, position, horizontalFractions);
  return {
    x: geometry.x + (width * fraction),
    y: geometry.y + height
  };
}

function getWorkflowAnchorSidesForItem(item){
  if(!item){
    return ["center"];
  }
  const geometry = getWorkflowAnchorGeometryFromRect(item.x, item.y, item.width || 0, item.height || 0, item);
  const sides = ["center"];
  ["top", "right", "bottom", "left"].forEach(function(edge){
    const fractions = (geometry.edgeFractions[edge] || []).slice();
    fractions.forEach(function(fraction){
      if(Math.abs(fraction - 0.5) < 0.001){
        sides.push(edge + "-middle");
      }else{
        sides.push(edge + "-" + String(Math.round(fraction * 100)));
      }
    });
  });
  return sides;
}

function createCotizacionesWorkflowState(){
  const repoState = createWorkflowStateFromRepoTemplate("wf-cotizaciones");
  if(repoState){
    return repoState;
  }
  const template = getCotizacionesWorkflowTemplate();
  return createWorkflowStateFromTemplateDefinition("wf-cotizaciones", template);
}

function createWorkflowStateFromTemplate(template, anchorResolver){
  const itemsById = template.items.reduce(function(acc, item){
    acc[item.id] = item;
    return acc;
  }, {});
  const connectors = [];

  template.lines.forEach(function(line){
    const points = [];
    const fromItem = line.from && line.from.itemId ? itemsById[line.from.itemId] : null;
    const toItem = line.to && line.to.itemId ? itemsById[line.to.itemId] : null;
    if(fromItem){
      points.push(anchorResolver(fromItem, line.from.side || "right"));
    }
    if(Array.isArray(line.via)){
      line.via.forEach(function(point){
        points.push({ x: point.x, y: point.y });
      });
    }
    if(toItem){
      points.push(anchorResolver(toItem, line.to.side || "left"));
    }
    for(let index = 0; index < points.length - 1; index += 1){
      const start = points[index];
      const end = points[index + 1];
      connectors.push({
        id: points.length > 2 ? (line.id + "-seg-" + (index + 1)) : line.id,
        x1: start.x,
        y1: start.y,
        x2: end.x,
        y2: end.y,
        from: index === 0 && line.from && line.from.itemId ? {
          itemId: line.from.itemId,
          side: line.from.side || "right"
        } : null,
        to: index === (points.length - 2) && line.to && line.to.itemId ? {
          itemId: line.to.itemId,
          side: line.to.side || "left"
        } : null,
        via: [],
        color: line.color || "#7d7d7d",
        strokeWidth: Number.isFinite(line.strokeWidth) ? line.strokeWidth : 2,
        dashed: Boolean(line.dashed),
        arrow: line.arrow !== false,
        groupId: line.groupId || ""
      });
    }
  });

  return {
    templateVersion: template.templateVersion || "",
    items: structuredClone(template.items),
    connectors: connectors
  };
}

function scaleWorkflowState(state, factor){
  const next = structuredClone(state);
  next.items = (next.items || []).map(function(item){
    const scaled = Object.assign({}, item, {
      x: Math.round((Number(item.x) || 0) * factor),
      y: Math.round((Number(item.y) || 0) * factor)
    });
    if(Number.isFinite(item.width)){
      scaled.width = Math.max(16, Math.round(item.width * factor));
    }
    if(Number.isFinite(item.height)){
      scaled.height = Math.max(16, Math.round(item.height * factor));
    }
    if(Number.isFinite(item.fontSize)){
      scaled.fontSize = Math.max(8, Math.round(item.fontSize * factor * 10) / 10);
    }
    if(Number.isFinite(item.labelOffsetX)){
      scaled.labelOffsetX = Math.round(item.labelOffsetX * factor);
    }
    if(Number.isFinite(item.labelOffsetY)){
      scaled.labelOffsetY = Math.round(item.labelOffsetY * factor);
    }
    if(Number.isFinite(item.labelWidth)){
      scaled.labelWidth = Math.max(0, Math.round(item.labelWidth * factor));
    }
    if(Number.isFinite(item.labelHeight)){
      scaled.labelHeight = Math.max(0, Math.round(item.labelHeight * factor));
    }
    return scaled;
  });
  next.connectors = (next.connectors || []).map(function(connector){
    return Object.assign({}, connector, {
      x1: Math.round((Number(connector.x1) || 0) * factor),
      y1: Math.round((Number(connector.y1) || 0) * factor),
      x2: Math.round((Number(connector.x2) || 0) * factor),
      y2: Math.round((Number(connector.y2) || 0) * factor),
      strokeWidth: Number.isFinite(connector.strokeWidth) ? Math.max(1, Math.round(connector.strokeWidth * factor * 10) / 10) : connector.strokeWidth,
      via: Array.isArray(connector.via) ? connector.via.map(function(point){
        return {
          x: Math.round((Number(point.x) || 0) * factor),
          y: Math.round((Number(point.y) || 0) * factor)
        };
      }) : []
    });
  });
  return next;
}

function getPlanificacionWorkflowTemplate(){
  return {
    templateVersion: PLANIFICACION_WORKFLOW_TEMPLATE_VERSION,
    scaleFactor: 0.9,
    items: [
      { id: "entry-p2", type: "entry", title: "Cotización\nAceptada", x: 42, y: 160, width: 16, height: 16, fontSize: 12, labelOffsetX: -28, labelOffsetY: 8, labelWidth: 96, labelHeight: 32 },
      { id: "actor-p2-1", type: "activity", kind: "actor", x: 124, y: 26, width: 150, height: 44, html: "Ejecutivo<br>Comercial", fontSize: 11, textColor: "#777", labelWidth: 150, labelHeight: 32, labelOffsetX: -6, labelOffsetY: 18 },
      { id: "step-p2-1", type: "activity", kind: "flow-card", x: 132, y: 88, width: 102, height: 54, html: "Asignar Administrador<br>de Contrato", badge: "1", step: "p2-1", fontSize: 12, borderColor: "#f3a454", backgroundColor: "#f7f2ed", textColor: "#30424d" },
      { id: "tag-p2-1", type: "activity", kind: "tag", x: 240, y: 112, width: 82, height: 18, html: "Qinspecciones", fontSize: 10, textColor: "#eb7a07" },
      { id: "icon-p2-1", type: "icon", x: 192, y: 147, width: 20, height: 20, iconVariant: "warning", title: "", borderColor: "transparent", backgroundColor: "transparent", textColor: "#30424d" },
      { id: "note-p2-1", type: "text", x: 196, y: 152, width: 260, height: 48, title: "Asignar tareas, plazos, responsables\ny plan, según corresponda.", fontSize: 13, borderColor: "transparent", backgroundColor: "transparent", textColor: "#1f6fb2" },
      { id: "icon-p2-email", type: "icon", x: 216, y: 208, width: 18, height: 18, iconVariant: "documentOk", title: "", borderColor: "transparent", backgroundColor: "transparent", textColor: "#30424d" },
      { id: "text-p2-info", type: "text", x: 128, y: 226, width: 212, height: 40, title: "Informar al Coordinador de\nContrato la OL asignada", fontSize: 13, borderColor: "transparent", backgroundColor: "transparent", textColor: "#5d6470" },
      { id: "actor-p2-2", type: "activity", kind: "actor", x: 270, y: 196, width: 150, height: 44, html: "Ejecutivo<br>Comercial", fontSize: 11, textColor: "#777", labelWidth: 150, labelHeight: 32, labelOffsetX: -4, labelOffsetY: 18 },
      { id: "actor-p2-3", type: "activity", kind: "actor", x: 286, y: 282, width: 150, height: 44, html: "Asistente<br>Técnico", fontSize: 11, textColor: "#777", labelWidth: 150, labelHeight: 32, labelOffsetX: -6, labelOffsetY: 18 },
      { id: "step-p2-2", type: "activity", kind: "flow-card", x: 132, y: 328, width: 102, height: 54, html: "Revisar la OL", badge: "2", step: "p2-2", fontSize: 12, borderColor: "#f3a454", backgroundColor: "#f7f2ed", textColor: "#30424d" },
      { id: "tag-p2-2", type: "activity", kind: "tag", x: 200, y: 382, width: 82, height: 18, html: "Qinspecciones", fontSize: 10, textColor: "#eb7a07" },
      { id: "step-p2-3", type: "activity", kind: "flow-card", x: 116, y: 454, width: 102, height: 54, html: "Planificar Servicios de<br>Muestreo y Análisis", badge: "3", step: "p2-3", fontSize: 12, borderColor: "#f3a454", backgroundColor: "#f7f2ed", textColor: "#30424d" },
      { id: "icon-p2-doc", type: "icon", x: 222, y: 544, width: 24, height: 24, iconVariant: "documentStack", title: "", borderColor: "transparent", backgroundColor: "transparent", textColor: "#30424d" },
      { id: "text-p2-doc", type: "text", x: 252, y: 536, width: 250, height: 62, title: "Subcontratos\nde laboratorios\nSe debe indicar si los servicios\nsolicitados son ETFA.", fontSize: 12, borderColor: "transparent", backgroundColor: "transparent", textColor: "#1f6fb2" },
      { id: "icon-p2-doc2", type: "icon", x: 222, y: 614, width: 24, height: 24, iconVariant: "documentOk", title: "", borderColor: "transparent", backgroundColor: "transparent", textColor: "#30424d" },
      { id: "text-p2-doc2", type: "text", x: 252, y: 606, width: 250, height: 48, title: "Documentación\nSe genera la documentación para\nterreno y se revisan los permisos.", fontSize: 12, borderColor: "transparent", backgroundColor: "transparent", textColor: "#1f6fb2" },
      { id: "icon-p2-team", type: "icon", x: 220, y: 676, width: 24, height: 24, iconVariant: "inspectorsGroup", title: "", borderColor: "transparent", backgroundColor: "transparent", textColor: "#6f7f91" },
      { id: "text-p2-team", type: "text", x: 252, y: 668, width: 270, height: 52, title: "Equipo de Trabajo\nSe asigna al Asistente Muestreador y\nal Inspector Ambiental, según aplique.", fontSize: 12, borderColor: "transparent", backgroundColor: "transparent", textColor: "#1f6fb2" },
      { id: "icon-p2-micro", type: "icon", x: 220, y: 738, width: 24, height: 24, iconVariant: "microscope", title: "", borderColor: "transparent", backgroundColor: "transparent", textColor: "#6f7f91" },
      { id: "text-p2-micro", type: "text", x: 252, y: 730, width: 280, height: 52, title: "Equipos de muestreo\nSe revisa la disponibilidad de equipos y si\nestán en condiciones óptimas (calibración).", fontSize: 12, borderColor: "transparent", backgroundColor: "transparent", textColor: "#1f6fb2" },
      { id: "icon-p2-log", type: "icon", x: 220, y: 804, width: 24, height: 24, iconVariant: "airplane", title: "", borderColor: "transparent", backgroundColor: "transparent", textColor: "#6f7f91" },
      { id: "text-p2-log", type: "text", x: 252, y: 796, width: 280, height: 50, title: "Logística (FXR)\nSe coordina transporte, hospedaje, alimentación,\nropa de trabajo y otros requerimientos.", fontSize: 12, borderColor: "transparent", backgroundColor: "transparent", textColor: "#1f6fb2" },
      { id: "actor-p2-4", type: "activity", kind: "actor", x: 432, y: 382, width: 150, height: 44, html: "Asistente<br>Técnico", fontSize: 11, textColor: "#777", labelWidth: 150, labelHeight: 32, labelOffsetX: -6, labelOffsetY: 18 },
      { id: "step-p2-4", type: "activity", kind: "flow-card", x: 392, y: 454, width: 102, height: 54, html: "Coordinar los servicios<br>con Cliente", badge: "4", step: "p2-4", fontSize: 12, borderColor: "#f3a454", backgroundColor: "#f7f2ed", textColor: "#30424d" },
      { id: "actor-p2-5", type: "activity", kind: "actor", x: 632, y: 382, width: 150, height: 44, html: "Asistente<br>Técnico", fontSize: 11, textColor: "#777", labelWidth: 150, labelHeight: 32, labelOffsetX: -6, labelOffsetY: 18 },
      { id: "step-p2-5", type: "activity", kind: "flow-card", x: 594, y: 454, width: 102, height: 54, html: "Calendarizar Servicios", badge: "5", step: "p2-5", fontSize: 12, borderColor: "#f3a454", backgroundColor: "#f7f2ed", textColor: "#30424d" },
      { id: "tag-p2-5", type: "activity", kind: "tag", x: 700, y: 470, width: 82, height: 18, html: "Qinspecciones", fontSize: 10, textColor: "#eb7a07" },
      { id: "actor-p2-6", type: "activity", kind: "actor", x: 854, y: 382, width: 150, height: 44, html: "Asistente<br>Técnico", fontSize: 11, textColor: "#777", labelWidth: 150, labelHeight: 32, labelOffsetX: -6, labelOffsetY: 18 },
      { id: "step-p2-6", type: "activity", kind: "flow-card", x: 818, y: 454, width: 102, height: 54, html: "Crear Órdenes de<br>Inspecciones", badge: "6", step: "p2-6", fontSize: 12, borderColor: "#f3a454", backgroundColor: "#f7f2ed", textColor: "#30424d" },
      { id: "tag-p2-6", type: "activity", kind: "tag", x: 924, y: 470, width: 82, height: 18, html: "Qinspecciones", fontSize: 10, textColor: "#eb7a07" },
      { id: "icon-p2-warn2", type: "icon", x: 832, y: 528, width: 20, height: 20, iconVariant: "warning", title: "", borderColor: "transparent", backgroundColor: "transparent", textColor: "#30424d" },
      { id: "note-p2-6", type: "text", x: 836, y: 534, width: 250, height: 70, title: "Asignar supervisor por localidad y\noperación. Se asignan las fechas\ntentativas para ejecutar los\nservicios de muestreo y mediciones.", fontSize: 12, borderColor: "transparent", backgroundColor: "transparent", textColor: "#1f6fb2" },
      { id: "actor-p2-j1", type: "activity", kind: "actor", x: 1082, y: 388, width: 150, height: 44, html: "Jefe de<br>Operaciones", fontSize: 11, textColor: "#777", labelWidth: 150, labelHeight: 32, labelOffsetX: -4, labelOffsetY: 18 },
      { id: "mini-p2-ols", type: "activity", kind: "mini-icon", x: 1080, y: 484, width: 108, height: 28, html: "Revisar el sistema (OIs)", fontSize: 9, textColor: "#555" },
      { id: "decision-p2-1", type: "decision", x: 1292, y: 476, width: 24, height: 24, title: "?", fontSize: 12, borderColor: "#d9c1a3", backgroundColor: "#ffffff", textColor: "#30424d" },
      { id: "text-p2-q", type: "text", x: 1234, y: 420, width: 160, height: 40, title: "¿Es factible ejecutar\nla planificación?", fontSize: 13, borderColor: "transparent", backgroundColor: "transparent", textColor: "#5d6470" },
      { id: "actor-p2-j2", type: "activity", kind: "actor", x: 1512, y: 382, width: 150, height: 44, html: "Jefe de<br>Operaciones", fontSize: 11, textColor: "#777", labelWidth: 150, labelHeight: 32, labelOffsetX: -4, labelOffsetY: 18 },
      { id: "step-p2-7", type: "activity", kind: "flow-card", x: 1480, y: 454, width: 102, height: 54, html: "Asignar Muestreador<br>Ambiental", badge: "7", step: "p2-7", fontSize: 12, borderColor: "#f3a454", backgroundColor: "#f7f2ed", textColor: "#30424d" },
      { id: "icon-p2-warn3", type: "icon", x: 1564, y: 520, width: 20, height: 20, iconVariant: "warning", title: "", borderColor: "transparent", backgroundColor: "transparent", textColor: "#30424d" },
      { id: "note-p2-7", type: "text", x: 1568, y: 526, width: 180, height: 44, title: "Se pone en firme la\nfecha de ejecución.", fontSize: 12, borderColor: "transparent", backgroundColor: "transparent", textColor: "#1f6fb2" },
      { id: "tag-p2-7a", type: "activity", kind: "tag", x: 1588, y: 494, width: 82, height: 18, html: "Qinspecciones", fontSize: 10, textColor: "#eb7a07" },
      { id: "tag-p2-7b", type: "activity", kind: "tag", x: 1604, y: 516, width: 54, height: 18, html: "QETFA", fontSize: 10, textColor: "#eb7a07" },
      { id: "output-p2", type: "output", title: "Planificación aceptada\ne Inspector asignado", x: 1820, y: 474, width: 16, height: 16, fontSize: 12, labelOffsetX: 20, labelOffsetY: 8, labelWidth: 170, labelHeight: 36 },
      { id: "actor-p2-j3", type: "activity", kind: "actor", x: 1338, y: 616, width: 150, height: 44, html: "Jefe de<br>Operaciones", fontSize: 11, textColor: "#777", labelWidth: 150, labelHeight: 32, labelOffsetX: -4, labelOffsetY: 18 },
      { id: "step-p2-6-1", type: "activity", kind: "flow-card", x: 1248, y: 684, width: 102, height: 54, html: "Modificar fechas en<br>sistema", badge: "6.1", badgeClass: "small", step: "p2-6.1", fontSize: 12, borderColor: "#f3a454", backgroundColor: "#f7f2ed", textColor: "#30424d" },
      { id: "tag-p2-6-1", type: "activity", kind: "tag", x: 1354, y: 708, width: 82, height: 18, html: "Qinspecciones", fontSize: 10, textColor: "#eb7a07" }
    ],
    lines: [
      { id: "p2-line-1", from: { itemId: "entry-p2", side: "right-middle" }, via: [{ x: 58, y: 115 }], to: { itemId: "step-p2-1", side: "left-middle" } },
      { id: "p2-line-2", from: { itemId: "step-p2-1", side: "bottom-middle" }, to: { itemId: "step-p2-2", side: "top-middle" } },
      { id: "p2-line-3", from: { itemId: "step-p2-2", side: "bottom-middle" }, to: { itemId: "step-p2-3", side: "top-middle" } },
      { id: "p2-line-4", from: { itemId: "step-p2-3", side: "right-middle" }, to: { itemId: "step-p2-4", side: "left-middle" } },
      { id: "p2-line-5", from: { itemId: "step-p2-4", side: "right-middle" }, to: { itemId: "step-p2-5", side: "left-middle" } },
      { id: "p2-line-6", from: { itemId: "step-p2-5", side: "right-middle" }, to: { itemId: "step-p2-6", side: "left-middle" } },
      { id: "p2-line-7", from: { itemId: "step-p2-6", side: "right-middle" }, to: { itemId: "mini-p2-ols", side: "left-middle" } },
      { id: "p2-line-8", from: { itemId: "mini-p2-ols", side: "right-middle" }, to: { itemId: "decision-p2-1", side: "left-middle" } },
      { id: "p2-line-9", from: { itemId: "decision-p2-1", side: "right-middle" }, to: { itemId: "step-p2-7", side: "left-middle" } },
      { id: "p2-line-10", from: { itemId: "step-p2-7", side: "right-middle" }, to: { itemId: "output-p2", side: "left-middle" } },
      { id: "p2-line-11", from: { itemId: "decision-p2-1", side: "bottom-middle" }, via: [{ x: 1304, y: 711 }], to: { itemId: "step-p2-6-1", side: "top-middle" } },
      { id: "p2-line-12", from: { itemId: "step-p2-6-1", side: "right-middle" }, via: [{ x: 1582, y: 711 }, { x: 1582, y: 508 }], to: { itemId: "step-p2-7", side: "bottom-middle" } },
      { id: "p2-support-1", from: { itemId: "step-p2-3", side: "bottom-middle" }, via: [{ x: 167, y: 846 }], dashed: true, arrow: false, color: "#989898", strokeWidth: 1.4 },
      { id: "p2-support-2", x1: 167, y1: 556, x2: 220, y2: 556, dashed: true, arrow: false, color: "#989898", strokeWidth: 1.4 },
      { id: "p2-support-3", x1: 167, y1: 626, x2: 220, y2: 626, dashed: true, arrow: false, color: "#989898", strokeWidth: 1.4 },
      { id: "p2-support-4", x1: 167, y1: 688, x2: 218, y2: 688, dashed: true, arrow: false, color: "#989898", strokeWidth: 1.4 },
      { id: "p2-support-5", x1: 167, y1: 750, x2: 218, y2: 750, dashed: true, arrow: false, color: "#989898", strokeWidth: 1.4 },
      { id: "p2-support-6", x1: 167, y1: 816, x2: 218, y2: 816, dashed: true, arrow: false, color: "#989898", strokeWidth: 1.4 }
    ]
  };
}

function createPlanificacionWorkflowState(){
  const repoState = createWorkflowStateFromRepoTemplate("wf-planificacion");
  if(repoState){
    return repoState;
  }
  const template = getPlanificacionWorkflowTemplate();
  return createWorkflowStateFromTemplateDefinition("wf-planificacion", template);
}

function getInitialWorkflowState(){
  if(workflowId === "wf-cotizaciones"){
    return createCotizacionesWorkflowState();
  }
  if(workflowId === "wf-planificacion"){
    return createPlanificacionWorkflowState();
  }
  return {
  items: [
    {
      id: "activity-1",
      type: "activity",
      title: "Actividad inicial",
      x: 160,
      y: 120,
      width: 260,
      height: 88,
      fontSize: 18,
      borderColor: "#d9c1a3",
      backgroundColor: "#f7f2ed"
    }
  ],
  connectors: []
  };
}

function getDefaultWorkflowStateSnapshot(){
  if(workflowStateSource === "json" && WORKFLOW_TEMPLATE_REPO_PATHS[workflowId]){
    const freshRepoState = createWorkflowStateFromRepoTemplate(workflowId, { bypassCache: true });
    if(freshRepoState){
      workflowLastResolvedStateOrigin = "repo-json";
      return structuredClone(freshRepoState);
    }
    workflowLastResolvedStateOrigin = "embedded-template";
  }else if(!workflowLastResolvedStateOrigin){
    workflowLastResolvedStateOrigin = "embedded-template";
  }
  return structuredClone(getInitialWorkflowState());
}

function loadWorkflowStateSource(){
  try{
    const raw = String(window.localStorage.getItem(workflowSourceStorageKey) || "").trim().toLowerCase();
    if(raw === "json" || raw === "storage"){
      return raw;
    }
  }catch(error){
  }
  return window.location.protocol === "file:" ? "storage" : "json";
}

function saveWorkflowStateSource(){
  window.localStorage.setItem(workflowSourceStorageKey, workflowStateSource);
}

function shouldLoadWorkflowDraft(){
  return workflowStateSource === "storage" || workflowStateSource === "json";
}

function getActiveWorkflowLayoutStorageKey(){
  return workflowStateSource === "json" ? workflowJsonStorageKey : workflowStorageKey;
}

function getActiveWorkflowBaseStorageKey(){
  return workflowStateSource === "json" ? workflowJsonBaseStorageKey : workflowBaseStorageKey;
}

let isEditingWorkflow = false;
let workflowStateSource = loadWorkflowStateSource();
let workflowLastResolvedStateOrigin = "";
let workflowState = loadWorkflowState({ preferLocalStorage: shouldLoadWorkflowDraft() });
let activeDrag = null;
let workflowZoom = loadWorkflowZoom();
let workflowPalette = loadWorkflowPalette();
let selectedWorkflowItemId = workflowState.items[0] ? workflowState.items[0].id : "";
let selectedWorkflowConnectorId = "";
let selectedWorkflowItemIds = selectedWorkflowItemId ? [selectedWorkflowItemId] : [];
let selectedWorkflowConnectorIds = [];
let openWorkflowConnectorToolbarId = "";
let activeWorkflowAnchorPreview = null;
let activeWorkflowSelectionBox = null;
let suppressWorkflowViewportClick = false;
let workflowUndoStack = [];
let workflowRedoStack = [];
let workflowLastSavedSnapshot = JSON.stringify(workflowState);
let copiedWorkflowActivityStyle = null;
let openWorkflowTransformMenuItemId = "";
let isWorkflowPanning = false;
const workflowEditToolsHome = document.getElementById("workflowEditTools").parentElement;
const workflowFloatingToolsHome = document.getElementById("floatingWorkflowTools").parentElement;

document.title = workflowTitle + " | Workflow";
document.getElementById("workflowTitle").textContent = workflowTitle;
document.getElementById("workflowPill").textContent = workflowToken;
document.getElementById("workflowHeading").textContent = workflowTitle;
renderSidebarTree();

function loadWorkflowState(options){
  const settings = options || {};
  const preferLocalStorage = settings.preferLocalStorage !== false;
  try{
    let parsed = null;
    if(preferLocalStorage){
      const raw = window.localStorage.getItem(getActiveWorkflowLayoutStorageKey());
      parsed = raw ? JSON.parse(raw) : null;
      if(parsed && Array.isArray(parsed.items) && parsed.items.length){
        workflowLastResolvedStateOrigin = workflowStateSource === "json" ? "json-draft" : "storage";
      }
    }
    if(!parsed || !Array.isArray(parsed.items) || !parsed.items.length){
      parsed = getDefaultWorkflowStateSnapshot();
    }
    parsed.items = parsed.items.map(function(item, index){
      const processDefaults = getDefaultWorkflowItem("process");
      const normalizedSourceItem = workflowId === "wf-cotizaciones" && item && item.id === "boss-1"
        ? Object.assign({}, item, {
            type: "process",
            kind: "",
            title: htmlToPlainText(item.title || item.html || "Creación de\nCliente en\nBOSS") || "Creación de\nCliente en\nBOSS",
            html: "",
            badge: "",
            badgeClass: "",
            step: "",
            width: Number.isFinite(item.width) ? item.width : processDefaults.width,
            height: Number.isFinite(item.height) ? item.height : processDefaults.height,
            fontSize: Number.isFinite(item.fontSize) ? item.fontSize : processDefaults.fontSize,
            borderColor: item.borderColor || processDefaults.borderColor,
            backgroundColor: item.backgroundColor || processDefaults.backgroundColor,
            textColor: item.textColor || processDefaults.textColor
          })
        : item;
      const normalizedKind = normalizeWorkflowRoleKind(normalizedSourceItem);
      const normalizedType = normalizedSourceItem.type || (normalizedKind === "flow-card" ? "activity" : "activity");
      const defaults = getDefaultWorkflowItem(normalizedType);
      const entryLayout = hasWorkflowFloatingLabel(normalizedType)
        ? getDefaultEntryLabelLayout()
        : (normalizedKind === "actor" ? getDefaultActorLabelLayout() : null);
      const kindTextDefaults = normalizedKind ? getWorkflowKindTextDefaults(normalizedKind) : null;
      const normalizedFontSize = Number.isFinite(normalizedSourceItem.fontSize)
        ? ((normalizedKind === "tag" && normalizedSourceItem.fontSize <= 9) ? 10 : normalizedSourceItem.fontSize)
        : (kindTextDefaults ? kindTextDefaults.fontSize : (normalizedKind === "flow-card" ? 12 : defaults.fontSize));
      const normalizedTextColor = normalizedKind === "tag" && (!normalizedSourceItem.textColor || String(normalizedSourceItem.textColor).trim().toLowerCase() === "#555")
        ? "#eb7a07"
        : (normalizedSourceItem.textColor || (kindTextDefaults ? kindTextDefaults.textColor : defaults.textColor));
      return {
        id: normalizedSourceItem.id || ("item-" + (index + 1)),
        type: normalizedType,
        kind: normalizedKind || "",
        title: Object.prototype.hasOwnProperty.call(normalizedSourceItem, "title") ? String(normalizedSourceItem.title || "") : "Elemento",
        html: normalizedSourceItem.html || "",
        badge: normalizedSourceItem.badge || "",
        badgeClass: normalizedSourceItem.badgeClass || "",
        step: normalizedSourceItem.step || "",
        x: Number.isFinite(normalizedSourceItem.x) ? normalizedSourceItem.x : 160,
        y: Number.isFinite(normalizedSourceItem.y) ? normalizedSourceItem.y : 120,
        width: Number.isFinite(normalizedSourceItem.width) ? normalizedSourceItem.width : defaults.width,
        height: Number.isFinite(normalizedSourceItem.height) ? normalizedSourceItem.height : defaults.height,
        fontSize: normalizedFontSize,
        borderColor: normalizedSourceItem.borderColor || defaults.borderColor,
        backgroundColor: normalizedSourceItem.backgroundColor || defaults.backgroundColor,
        textColor: normalizedTextColor,
        iconVariant: normalizedSourceItem.iconVariant || "current",
        groupId: normalizedSourceItem.groupId || "",
        labelOffsetX: entryLayout ? (Number.isFinite(normalizedSourceItem.labelOffsetX) ? normalizedSourceItem.labelOffsetX : entryLayout.labelOffsetX) : 0,
        labelOffsetY: entryLayout ? (Number.isFinite(normalizedSourceItem.labelOffsetY) ? normalizedSourceItem.labelOffsetY : entryLayout.labelOffsetY) : 0,
        labelWidth: entryLayout ? (Number.isFinite(normalizedSourceItem.labelWidth) ? normalizedSourceItem.labelWidth : entryLayout.labelWidth) : 0,
        labelHeight: entryLayout ? (Number.isFinite(normalizedSourceItem.labelHeight) ? normalizedSourceItem.labelHeight : entryLayout.labelHeight) : 0
      };
    });
    if(workflowId === "wf-cotizaciones" && !parsed.items.some(function(item){ return item.id === "icon-warning-note-2"; })){
      parsed.items.push({
        id: "icon-warning-note-2",
        type: "icon",
        kind: "",
        title: "",
        html: "",
        badge: "",
        badgeClass: "",
        step: "",
        x: 1174,
        y: 184,
        width: 20,
        height: 20,
        fontSize: 12,
        borderColor: "transparent",
        backgroundColor: "transparent",
        textColor: "#30424d",
        iconVariant: "warning",
        groupId: "",
        labelOffsetX: 0,
        labelOffsetY: 0,
        labelWidth: 0,
        labelHeight: 0
      });
    }
    if(workflowId === "wf-cotizaciones" && !parsed.items.some(function(item){ return item.id === "icon-lab-etfa"; })){
      parsed.items.push({
        id: "icon-lab-etfa",
        type: "icon",
        kind: "",
        title: "",
        html: "",
        badge: "",
        badgeClass: "",
        step: "",
        x: 206,
        y: 326,
        width: 20,
        height: 20,
        fontSize: 12,
        borderColor: "transparent",
        backgroundColor: "transparent",
        textColor: "#30424d",
        iconVariant: "system",
        groupId: "",
        labelOffsetX: 0,
        labelOffsetY: 0,
        labelWidth: 0,
        labelHeight: 0
      });
    }
    if(workflowId === "wf-cotizaciones" && !parsed.items.some(function(item){ return item.id === "icon-doc-stack-step-4"; })){
      parsed.items.push({
        id: "icon-doc-stack-step-4",
        type: "icon",
        kind: "",
        title: "",
        html: "",
        badge: "",
        badgeClass: "",
        step: "",
        x: 1264,
        y: 120,
        width: 20,
        height: 20,
        fontSize: 12,
        borderColor: "transparent",
        backgroundColor: "transparent",
        textColor: "#30424d",
        iconVariant: "documentStack",
        groupId: "",
        labelOffsetX: 0,
        labelOffsetY: 0,
        labelWidth: 0,
        labelHeight: 0
      });
    }
    if(workflowId === "wf-cotizaciones" && !parsed.items.some(function(item){ return item.id === "icon-doc-ok-step-4"; })){
      parsed.items.push({
        id: "icon-doc-ok-step-4",
        type: "icon",
        kind: "",
        title: "",
        html: "",
        badge: "",
        badgeClass: "",
        step: "",
        x: 1264,
        y: 144,
        width: 20,
        height: 20,
        fontSize: 12,
        borderColor: "transparent",
        backgroundColor: "transparent",
        textColor: "#30424d",
        iconVariant: "documentOk",
        groupId: "",
        labelOffsetX: 0,
        labelOffsetY: 0,
        labelWidth: 0,
        labelHeight: 0
      });
    }
    if(workflowId === "wf-cotizaciones" && !parsed.items.some(function(item){ return item.id === "icon-excel-step-2"; })){
      parsed.items.push({
        id: "icon-excel-step-2",
        type: "icon",
        kind: "",
        title: "",
        html: "",
        badge: "",
        badgeClass: "",
        step: "",
        x: 686,
        y: 136,
        width: 20,
        height: 20,
        fontSize: 12,
        borderColor: "transparent",
        backgroundColor: "transparent",
        textColor: "#30424d",
        iconVariant: "excel",
        groupId: "",
        labelOffsetX: 0,
        labelOffsetY: 0,
        labelWidth: 0,
        labelHeight: 0
      });
    }
    parsed.items = parsed.items.map(function(item){
      if(workflowId === "wf-cotizaciones" && item && item.id === "icon-warning-note-2"){
        return Object.assign({}, item, {
          x: Number.isFinite(item.x) ? item.x : 1174,
          y: Number.isFinite(item.y) ? item.y : 184,
          width: 20,
          height: 20,
          iconVariant: "warning"
        });
      }
      if(workflowId === "wf-cotizaciones" && item && item.id === "icon-lab-etfa"){
        return Object.assign({}, item, {
          x: Number.isFinite(item.x) ? item.x : 206,
          y: Number.isFinite(item.y) ? item.y : 326,
          width: Number.isFinite(item.width) ? item.width : 20,
          height: Number.isFinite(item.height) ? item.height : 20,
          iconVariant: "labFlask"
        });
      }
      if(workflowId === "wf-cotizaciones" && item && item.id === "icon-doc-stack-step-4"){
        return Object.assign({}, item, {
          x: Number.isFinite(item.x) ? item.x : 1264,
          y: Number.isFinite(item.y) ? item.y : 120,
          width: Number.isFinite(item.width) ? item.width : 20,
          height: Number.isFinite(item.height) ? item.height : 20,
          iconVariant: "documentStack"
        });
      }
      if(workflowId === "wf-cotizaciones" && item && item.id === "icon-doc-ok-step-4"){
        return Object.assign({}, item, {
          x: Number.isFinite(item.x) ? item.x : 1264,
          y: Number.isFinite(item.y) ? item.y : 144,
          width: Number.isFinite(item.width) ? item.width : 20,
          height: Number.isFinite(item.height) ? item.height : 20,
          iconVariant: "documentOk"
        });
      }
      if(workflowId === "wf-cotizaciones" && item && item.id === "icon-excel-step-2"){
        return Object.assign({}, item, {
          x: Number.isFinite(item.x) ? item.x : 686,
          y: Number.isFinite(item.y) ? item.y : 136,
          width: Number.isFinite(item.width) ? item.width : 20,
          height: Number.isFinite(item.height) ? item.height : 20,
          iconVariant: "excel"
        });
      }
      return item;
    });
    parsed.connectors = Array.isArray(parsed.connectors) ? parsed.connectors.map(function(connector, index){
      return {
        id: connector.id || ("connector-" + (index + 1)),
        x1: Number.isFinite(connector.x1) ? connector.x1 : 180,
        y1: Number.isFinite(connector.y1) ? connector.y1 : 180,
        x2: Number.isFinite(connector.x2) ? connector.x2 : 360,
        y2: Number.isFinite(connector.y2) ? connector.y2 : 180,
        from: connector.from && connector.from.itemId ? {
          itemId: connector.from.itemId,
          side: connector.from.side || "right"
        } : null,
        to: connector.to && connector.to.itemId ? {
          itemId: connector.to.itemId,
          side: connector.to.side || "left"
        } : null,
        via: Array.isArray(connector.via) ? connector.via.map(function(point){
          return {
            x: Number.isFinite(point.x) ? point.x : 0,
            y: Number.isFinite(point.y) ? point.y : 0
          };
        }) : [],
        color: connector.color || "#7d7d7d",
        strokeWidth: Number.isFinite(connector.strokeWidth) ? connector.strokeWidth : 2,
        dashed: Boolean(connector.dashed),
        arrow: normalizeWorkflowArrowMode(connector.arrow),
        groupId: connector.groupId || ""
      };
    }) : [];
    if(workflowId === "wf-planificacion"){
      const supportConnectors = [
        { id: "p2-support-1", from: { itemId: "step-p2-3", side: "bottom-middle" }, x1: 150, y1: 457, x2: 150, y2: 761, via: [{ x: 150, y: 761 }], dashed: true, arrow: "none", color: "#989898", strokeWidth: 1.4 },
        { id: "p2-support-2", from: null, to: null, x1: 150, y1: 500, x2: 198, y2: 500, via: [], dashed: true, arrow: "none", color: "#989898", strokeWidth: 1.4 },
        { id: "p2-support-3", from: null, to: null, x1: 150, y1: 563, x2: 198, y2: 563, via: [], dashed: true, arrow: "none", color: "#989898", strokeWidth: 1.4 },
        { id: "p2-support-4", from: null, to: null, x1: 150, y1: 619, x2: 196, y2: 619, via: [], dashed: true, arrow: "none", color: "#989898", strokeWidth: 1.4 },
        { id: "p2-support-5", from: null, to: null, x1: 150, y1: 675, x2: 196, y2: 675, via: [], dashed: true, arrow: "none", color: "#989898", strokeWidth: 1.4 },
        { id: "p2-support-6", from: null, to: null, x1: 150, y1: 735, x2: 196, y2: 735, via: [], dashed: true, arrow: "none", color: "#989898", strokeWidth: 1.4 }
      ];
      supportConnectors.forEach(function(connector){
        if(!parsed.connectors.some(function(entry){ return entry.id === connector.id; })){
          parsed.connectors.push(connector);
        }
      });
      parsed.connectors = parsed.connectors.map(function(connector){
        if(connector.id === "p2-line-1"){
          return Object.assign({}, connector, {
            from: { itemId: "entry-p2", side: "right-middle" },
            to: { itemId: "step-p2-1", side: "left-middle" },
            via: [{ x: 58, y: 115 }],
            arrow: "end"
          });
        }
        return connector;
      });
      parsed.connectors = normalizePlanificacionSupportConnectors(parsed.items, parsed.connectors);
      if(parsed.templateVersion !== PLANIFICACION_WORKFLOW_TEMPLATE_VERSION){
        parsed = scaleWorkflowState(parsed, 0.9);
        parsed.templateVersion = PLANIFICACION_WORKFLOW_TEMPLATE_VERSION;
        parsed.connectors = normalizePlanificacionSupportConnectors(parsed.items, parsed.connectors);
      }
    }
    return parsed;
  }catch(error){
    return getDefaultWorkflowStateSnapshot();
  }
}

function saveWorkflowState(options){
  const settings = options || {};
  const serialized = JSON.stringify(workflowState);
  if(settings.trackHistory !== false && serialized !== workflowLastSavedSnapshot){
    workflowUndoStack.push(workflowLastSavedSnapshot);
    if(workflowUndoStack.length > 80){
      workflowUndoStack.shift();
    }
    workflowRedoStack = [];
  }
  workflowLastSavedSnapshot = serialized;
  window.localStorage.setItem(getActiveWorkflowLayoutStorageKey(), serialized);
}

function loadWorkflowBaseState(){
  try{
    const raw = window.localStorage.getItem(getActiveWorkflowBaseStorageKey());
    const parsed = raw ? JSON.parse(raw) : null;
    if(!parsed || !Array.isArray(parsed.items) || !parsed.items.length){
      return getDefaultWorkflowStateSnapshot();
    }
    workflowLastResolvedStateOrigin = "base-storage";
    window.localStorage.setItem(getActiveWorkflowLayoutStorageKey(), JSON.stringify(parsed));
    return loadWorkflowState();
  }catch(error){
    return getDefaultWorkflowStateSnapshot();
  }
}

function saveWorkflowBaseState(){
  window.localStorage.setItem(getActiveWorkflowBaseStorageKey(), JSON.stringify(workflowState));
}

function loadWorkflowZoom(){
  try{
    const raw = window.localStorage.getItem(WORKFLOW_ZOOM_STORAGE_KEY_PREFIX + workflowToken);
    const parsed = Number(raw);
    if(!parsed || Number.isNaN(parsed)){
      return 1;
    }
    return clamp(parsed, ZOOM_MIN, ZOOM_MAX);
  }catch(error){
    return 1;
  }
}

function saveWorkflowZoom(){
  window.localStorage.setItem(WORKFLOW_ZOOM_STORAGE_KEY_PREFIX + workflowToken, String(workflowZoom));
}

function loadWorkflowPalette(){
  try{
    const raw = String(window.localStorage.getItem(workflowPaletteStorageKey) || "").trim().toLowerCase();
    return raw === "blue" ? "blue" : "orange";
  }catch(error){
    return "orange";
  }
}

function saveWorkflowPalette(){
  window.localStorage.setItem(workflowPaletteStorageKey, workflowPalette);
}

function applyWorkflowPalette(){
  document.body.dataset.palette = workflowPalette;
  const orangeButton = document.getElementById("workflowPaletteOrangeButton");
  const blueButton = document.getElementById("workflowPaletteBlueButton");
  if(orangeButton){
    orangeButton.classList.toggle("is-active", workflowPalette === "orange");
    orangeButton.setAttribute("aria-pressed", workflowPalette === "orange" ? "true" : "false");
  }
  if(blueButton){
    blueButton.classList.toggle("is-active", workflowPalette === "blue");
    blueButton.setAttribute("aria-pressed", workflowPalette === "blue" ? "true" : "false");
  }
}

function setWorkflowPalette(nextPalette){
  const normalized = nextPalette === "blue" ? "blue" : "orange";
  if(workflowPalette === normalized){
    applyWorkflowPalette();
    return;
  }
  workflowPalette = normalized;
  saveWorkflowPalette();
  applyWorkflowPalette();
  updateWorkflowStatus(normalized === "blue" ? "Paleta azul PDF aplicada." : "Paleta naranjo aplicada.");
}

const WORKFLOW_STEP_CONTENT = {
  "1": `
<h2>Recepción de Requerimiento</h2>
<p><span class="pill">Responsable: Ejecutivo Comercial</span><span class="pill">Sistema: QCotizador</span></p>
<h3>Objetivo</h3>
<p>Establecer el proceso mediante el cual el área comercial recibe y revisa preliminarmente los requerimientos del cliente para iniciar la evaluación y elaboración de cotizaciones.</p>
<h3>Roles y responsabilidades</h3>
<ol>
<li>Recibir el requerimiento del cliente por los distintos canales disponibles.</li>
<li>Revisar preliminarmente la información proporcionada.</li>
<li>Solicitar antecedentes adicionales cuando la información sea insuficiente.</li>
<li>Registrar el requerimiento en el sistema comercial.</li>
</ol>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>RG-CC-001 Solicitud de Cliente</a>
<a class="doc-link" href="#" download>RG-CC-002 Respaldo de Comunicaciones Comerciales</a>
</div>
`,
  "1.1": `
<h2>Validar Técnica y Operativamente</h2>
<p><span class="pill">Responsable: Ejecutivo Comercial</span></p>
<h3>Consultas</h3>
<ol>
<li>Operaciones y áreas técnicas.</li>
<li>Laboratorios / ETFA.</li>
<li>Permisología, inspectores, equipos, insumos y logística.</li>
</ol>
<h3>Objetivo</h3>
<p>Levantar la factibilidad técnica y operativa antes de elaborar la cotización.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>RG-CC-004 Matriz de Validación Técnica</a>
<a class="doc-link" href="#" download>RG-CC-005 Respuesta de Áreas de Apoyo</a>
</div>
`,
  "2": `
<h2>Elaborar Cotización</h2>
<p><span class="pill">Responsable: Ejecutivo Comercial</span><span class="pill">Sistemas: Qcotizador / QETFA</span></p>
<h3>Pasos</h3>
<ol>
<li>Analizar el requerimiento y la información levantada.</li>
<li>Seleccionar servicios ETFA aplicables.</li>
<li>Adjuntar el archivo de costeo.</li>
<li>Registrar la propuesta y validar su estructura en sistema.</li>
</ol>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>RG-CC-006 Archivo de Costeo</a>
<a class="doc-link" href="#" download>RG-CC-007 Borrador de Cotización</a>
</div>
`,
  "3": `
<h2>Aprobar Cotización</h2>
<p><span class="pill">Responsable: Gerente de Desarrollo de Negocios</span></p>
<h3>Revisión</h3>
<ol>
<li>Validar estructura técnica y comercial.</li>
<li>Revisar precios, alcances y condiciones.</li>
<li>Aprobar o devolver para corrección.</li>
</ol>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>RG-CC-008 Registro de Aprobación Comercial</a>
<a class="doc-link" href="#" download>RG-CC-009 Observaciones de Revisión</a>
</div>
`,
  "4": `
<h2>Notificar al Cliente</h2>
<p><span class="pill">Responsable: Ejecutivo Comercial</span><span class="pill">Sistema: Qcotizador</span></p>
<h3>Acciones</h3>
<ol>
<li>Enviar correo personalizado al cliente.</li>
<li>Adjuntar la cotización aprobada.</li>
<li>Dejar registro del envío.</li>
</ol>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>RG-CC-010 Cotización Emitida al Cliente</a>
<a class="doc-link" href="#" download>RG-CC-011 Comprobante de Envío</a>
</div>
`,
  "5": `
<h2>Realizar Seguimiento</h2>
<p><span class="pill">Responsable: Ejecutivo Comercial</span></p>
<h3>Regla</h3>
<p>Se ejecuta seguimiento si al tercer día aún no existe respuesta del cliente.</p>
<h3>Acciones</h3>
<ol>
<li>Confirmar recepción de la cotización.</li>
<li>Resolver dudas comerciales y técnicas.</li>
<li>Detectar interés o necesidad de ajuste.</li>
</ol>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>RG-CC-012 Bitácora de Seguimiento Comercial</a>
<a class="doc-link" href="#" download>RG-CC-013 Respuesta del Cliente</a>
</div>
`,
  "6": `
<h2>Realizar Negociación</h2>
<p><span class="pill">Responsable: Ejecutivo Comercial</span></p>
<h3>Objetivo</h3>
<p>Ajustar precios, plazos y condiciones comerciales según la necesidad del cliente.</p>
<h3>Resultado</h3>
<p>La cotización puede ser aceptada o rechazada.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>RG-CC-014 Registro de Negociación</a>
<a class="doc-link" href="#" download>RG-CC-015 Condiciones Comerciales Ajustadas</a>
</div>
`,
  "7": `
<h2>Rechazar Cotización</h2>
<p><span class="pill">Responsable: Ejecutivo Comercial</span><span class="pill">Sistema: Qcotizador</span></p>
<h3>Acción</h3>
<p>Registrar el rechazo de la propuesta cuando el cliente no acepta la cotización.</p>
<h3>Salida</h3>
<p>Cotización rechazada y cerrada en el flujo.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>RG-CC-016 Registro de Rechazo de Cotización</a>
</div>
`,
  "7.1": `
<h2>Creación de Cliente en BOSS</h2>
<p><span class="pill">Responsable: Ejecutivo Comercial</span><span class="pill">Sistema: BOSS</span></p>
<h3>Condición</h3>
<p>Aplica cuando la cotización aceptada corresponde a un cliente prospecto que aún no existe en los sistemas corporativos.</p>
<h3>Acciones</h3>
<ol>
<li>Crear el cliente en BOSS.</li>
<li>Validar que la información maestra quede disponible para el cierre comercial.</li>
<li>Continuar con la aceptación y posterior creación o actualización de la OL.</li>
</ol>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>RG-CC-018 Creación de Cliente Prospecto en BOSS</a>
</div>
`,
  "7.2": `
<h2>Aceptar Cotización</h2>
<p><span class="pill">Responsable: Ejecutivo Comercial</span><span class="pill">Sistema: Qcotizador</span></p>
<h3>Validación previa</h3>
<p>Si el cliente es prospecto, primero debe existir en BOSS antes de aceptar la cotización en sistema.</p>
<h3>Salida</h3>
<p>Cotización aceptada para crear o actualizar la OL.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>RG-CC-017 Aceptación de Cotización</a>
<a class="doc-link" href="#" download>RG-CC-018 Creación de Cliente Prospecto en BOSS</a>
</div>
`,
  "8": `
<h2>Crear o Actualizar OL</h2>
<p><span class="pill">Responsable: Ejecutivo Comercial</span><span class="pill">Sistema: Syscom</span></p>
<h3>Pasos</h3>
<ol>
<li>Confirmar aceptación comercial.</li>
<li>Crear o actualizar la OL.</li>
<li>Dejar la orden lista para continuar el proceso.</li>
</ol>
<h3>Salida</h3>
<p>OL creada o actualizada.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>RG-CC-019 Orden de Laboratorio</a>
<a class="doc-link" href="#" download>RG-CC-020 Confirmación de Actualización de OL</a>
</div>
`
};

Object.assign(WORKFLOW_STEP_CONTENT, {
  "p2-1": `
<h2>Asignar Administrador de Contrato</h2>
<p><span class="pill">Responsable: Ejecutivo Comercial</span><span class="pill">Sistema: Qinspecciones</span></p>
<h3>Pasos</h3>
<ol>
<li>Tomar la cotización aceptada como entrada de planificación.</li>
<li>Asignar administrador de contrato y base del servicio.</li>
<li>Definir tareas, plazos, responsables y plan preliminar.</li>
</ol>
<h3>Salida</h3>
<p>Administrador de contrato asignado y planificación inicial registrada.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>Asignación inicial del contrato</a>
</div>
`,
  "p2-2": `
<h2>Revisar la OL</h2>
<p><span class="pill">Responsable: Asistente Técnico</span><span class="pill">Sistema: Qinspecciones</span></p>
<h3>Pasos</h3>
<ol>
<li>Revisar la orden de laboratorio u orden operativa base.</li>
<li>Validar alcance, servicios y antecedentes disponibles.</li>
<li>Confirmar que la información permita continuar la planificación.</li>
</ol>
<h3>Salida</h3>
<p>Orden revisada y lista para planificación de servicios.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>Revisión de orden operativa</a>
</div>
`,
  "p2-3": `
<h2>Planificar Servicios de Muestreo y Análisis</h2>
<p><span class="pill">Responsable: Asistente Técnico</span></p>
<h3>Pasos</h3>
<ol>
<li>Definir subcontratos, documentación, equipos y logística.</li>
<li>Preparar recursos de terreno y condiciones de ejecución.</li>
<li>Dejar lista la base para coordinar con cliente y calendarizar.</li>
</ol>
<h3>Salida</h3>
<p>Plan de servicio preliminar con recursos críticos identificados.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>Plan preliminar del servicio</a>
</div>
`,
  "p2-4": `
<h2>Coordinar los servicios con Cliente</h2>
<p><span class="pill">Responsable: Asistente Técnico</span></p>
<h3>Pasos</h3>
<ol>
<li>Coordinar condiciones de ejecución y disponibilidad con el cliente.</li>
<li>Confirmar ventanas de atención y observaciones relevantes.</li>
<li>Alinear la planificación con el alcance confirmado.</li>
</ol>
<h3>Salida</h3>
<p>Coordinación con cliente validada para calendarizar.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>Confirmación de coordinación con cliente</a>
</div>
`,
  "p2-5": `
<h2>Calendarizar Servicios</h2>
<p><span class="pill">Responsable: Asistente Técnico</span><span class="pill">Sistema: Qinspecciones</span></p>
<h3>Pasos</h3>
<ol>
<li>Calendarizar fechas tentativas de los servicios.</li>
<li>Ordenar la secuencia de muestreo, mediciones y análisis.</li>
<li>Preparar la creación de órdenes de inspección.</li>
</ol>
<h3>Salida</h3>
<p>Servicios calendarizados en forma preliminar.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>Agenda preliminar de servicios</a>
</div>
`,
  "p2-6": `
<h2>Crear Órdenes de Inspecciones</h2>
<p><span class="pill">Responsable: Asistente Técnico</span><span class="pill">Sistema: Qinspecciones</span></p>
<h3>Pasos</h3>
<ol>
<li>Crear órdenes de inspección en el sistema.</li>
<li>Asignar supervisor por localidad y operación.</li>
<li>Registrar fechas tentativas de ejecución.</li>
</ol>
<h3>Salida</h3>
<p>Órdenes de inspección creadas para revisión operativa.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>Órdenes de inspección</a>
</div>
`,
  "p2-6.1": `
<h2>Modificar fechas en sistema</h2>
<p><span class="pill">Responsable: Jefe de Operaciones</span><span class="pill">Sistema: Qinspecciones</span></p>
<h3>Pasos</h3>
<ol>
<li>Actualizar fechas y restricciones detectadas en revisión.</li>
<li>Reprogramar servicios cuando la planificación no sea factible.</li>
<li>Dejar el sistema listo para una nueva validación.</li>
</ol>
<h3>Salida</h3>
<p>Fechas corregidas en sistema.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>Historial de reprogramación</a>
</div>
`,
  "p2-7": `
<h2>Asignar Muestreador Ambiental</h2>
<p><span class="pill">Responsable: Jefe de Operaciones</span><span class="pill">Sistemas: Qinspecciones / QETFA</span></p>
<h3>Pasos</h3>
<ol>
<li>Asignar muestreador e inspector según factibilidad.</li>
<li>Dejar confirmada la fecha de ejecución.</li>
<li>Cerrar la planificación con recursos definidos.</li>
</ol>
<h3>Salida</h3>
<p>Planificación aceptada e inspector asignado.</p>
<h3>Registros</h3>
<div class="doc-links">
<a class="doc-link" href="#" download>Asignación final de recursos</a>
</div>
`
});

function getWorkflowPublicationStepId(item){
  if(!item){
    return "";
  }
  if(item.kind === "flow-card" && item.step){
    return String(item.step);
  }
  if(item.type === "process" && item.id === "boss-1"){
    return "7.1";
  }
  return "";
}

function openStep(step){
  const normalizedStep = String(step || "").trim();
  const content = WORKFLOW_STEP_CONTENT[normalizedStep] || "<h2>Sin detalle</h2><p>No hay contenido configurado para esta actividad.</p>";
  const titleMatch = content.match(/<h2>(.*?)<\/h2>/);
  let rendered = content;
  if(titleMatch){
    rendered = content.replace(
      titleMatch[0],
      `<div class="content-title"><span class="content-step-badge">${escapeHtml(normalizedStep || "•")}</span><h2>${titleMatch[1]}</h2></div>`
    );
  }
  const panelEl = document.getElementById("workflowPublicationPanel");
  const contentEl = document.getElementById("workflowPublicationContent");
  if(!panelEl || !contentEl){
    return;
  }
  contentEl.innerHTML = rendered;
  panelEl.dataset.currentStep = normalizedStep;
  panelEl.classList.add("is-open");
  document.body.classList.add("panel-open");
}

function closeWorkflowPublicationPanel(event){
  if(event){
    event.stopPropagation();
  }
  const panelEl = document.getElementById("workflowPublicationPanel");
  if(panelEl){
    panelEl.classList.remove("is-open");
  }
  document.body.classList.remove("panel-open");
}

function updateWorkflowStatus(message){
  document.getElementById("workflowStatus").textContent = message;
}

function escapeHtml(value){
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(value){
  return String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function htmlToPlainText(value){
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function clamp(value, min, max){
  return Math.min(max, Math.max(min, value));
}

function dedupeWorkflowConnectorPoints(points){
  return points.filter(function(point, index){
    if(index === 0){
      return true;
    }
    const previous = points[index - 1];
    return previous.x !== point.x || previous.y !== point.y;
  });
}

function getWorkflowItemById(itemId){
  return workflowState.items.find(function(entry){
    return entry.id === itemId;
  }) || null;
}

function getWorkflowAnchorableKinds(){
  return [
    "flow-card",
    "decision",
    "start-dot",
    "end-dot",
    "subactivity",
    "dashed-box",
    "tag",
    "actor",
    "mini-icon",
    "soft-icon"
  ];
}

function getWorkflowAnchorPointForItem(item, side){
  if(!item){
    return { x: 0, y: 0 };
  }
  if(workflowId === "wf-cotizaciones"){
    return getCotizacionesWorkflowAnchorPoint(item, side);
  }
  const geometry = getWorkflowAnchorGeometryFromRect(item.x, item.y, item.width || 0, item.height || 0, item);
  return getWorkflowAnchorPointFromGeometry(geometry, side);
}

function isPointNearWorkflowItem(item, point, padding){
  const extra = Number.isFinite(padding) ? padding : 0;
  const width = item.width || 0;
  const height = item.height || 0;
  return point.x >= (item.x - extra)
    && point.x <= (item.x + width + extra)
    && point.y >= (item.y - extra)
    && point.y <= (item.y + height + extra);
}

function isPointInsideWorkflowItemInterior(item, point){
  const width = item.width || 0;
  const height = item.height || 0;
  const insetX = Math.max(6, Math.min(14, width * 0.18));
  const insetY = Math.max(6, Math.min(10, height * 0.3));
  return point.x >= (item.x + insetX)
    && point.x <= (item.x + width - insetX)
    && point.y >= (item.y + insetY)
    && point.y <= (item.y + height - insetY);
}

function getWorkflowAnchorSnapBias(item, pointer, side){
  const normalizedSide = normalizeWorkflowAnchorSide(side);
  if(normalizedSide === "center"){
    return 0;
  }
  const edge = normalizedSide.split("-")[0];
  const position = normalizedSide.split("-")[1] || "middle";
  const width = item.width || 0;
  const height = item.height || 0;
  const centerX = item.x + (width / 2);
  const centerY = item.y + (height / 2);
  const outsideLeft = pointer.x < item.x;
  const outsideRight = pointer.x > (item.x + width);
  const outsideTop = pointer.y < item.y;
  const outsideBottom = pointer.y > (item.y + height);
  const nearTopEdge = pointer.y >= (item.y - 18) && pointer.y <= (item.y + Math.max(10, height * 0.22));
  const nearBottomEdge = pointer.y <= (item.y + height + 18) && pointer.y >= (item.y + height - Math.max(10, height * 0.22));
  const nearCenterX = Math.abs(pointer.x - centerX) <= Math.max(12, width * 0.14);
  const nearCenterY = Math.abs(pointer.y - centerY) <= Math.max(10, height * 0.2);
  let bias = 0;

  if(outsideTop || (nearTopEdge && pointer.y <= centerY)){
    if(edge === "top"){
      bias -= 10;
      if(position === "middle" && nearCenterX){
        bias -= 18;
      }else if(nearCenterX){
        bias += 14;
      }
    }else if(edge === "bottom"){
      bias += 8;
    }
  }else if(outsideBottom || (nearBottomEdge && pointer.y >= centerY)){
    if(edge === "bottom"){
      bias -= 10;
      if(position === "middle" && nearCenterX){
        bias -= 18;
      }else if(nearCenterX){
        bias += 14;
      }
    }else if(edge === "top"){
      bias += 8;
    }
  }

  if(outsideLeft){
    if(edge === "left"){
      bias -= 10;
      if(position === "middle" && nearCenterY){
        bias -= 6;
      }
    }else if(edge === "right"){
      bias += 8;
    }
  }else if(outsideRight){
    if(edge === "right"){
      bias -= 10;
      if(position === "middle" && nearCenterY){
        bias -= 6;
      }
    }else if(edge === "left"){
      bias += 8;
    }
  }

  return bias;
}

function getWorkflowPointer(event){
  const viewportEl = document.getElementById("workflowViewport");
  if(!viewportEl){
    return { x: 0, y: 0 };
  }
  const rect = viewportEl.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / workflowZoom,
    y: (event.clientY - rect.top) / workflowZoom
  };
}

function getWorkflowConnectionSide(item, point){
  const center = getWorkflowAnchorPointForItem(item, "center");
  const deltaX = point.x - center.x;
  const deltaY = point.y - center.y;
  if(Math.abs(deltaX) >= Math.abs(deltaY)){
    return deltaX >= 0 ? "right-middle" : "left-middle";
  }
  return deltaY >= 0 ? "bottom-middle" : "top-middle";
}

function getWorkflowConnectorEndpointPoint(connector, endpointKey){
  const endpoint = endpointKey === "start" ? connector.from : connector.to;
  const fallbackSide = endpointKey === "start" ? "right" : "left";
  if(endpoint && endpoint.itemId){
    const item = getWorkflowItemById(endpoint.itemId);
    if(item){
      return getWorkflowAnchorPointForItem(item, endpoint.side || fallbackSide);
    }
  }
  return {
    x: endpointKey === "start" ? connector.x1 : connector.x2,
    y: endpointKey === "start" ? connector.y1 : connector.y2
  };
}

function syncWorkflowConnectorEndpoint(connector, endpointKey){
  const point = getWorkflowConnectorEndpointPoint(connector, endpointKey);
  if(endpointKey === "start"){
    connector.x1 = point.x;
    connector.y1 = point.y;
  }else{
    connector.x2 = point.x;
    connector.y2 = point.y;
  }
}

function getNearestWorkflowAnchorTarget(pointer, options){
  const settings = options || {};
  let bestMatch = null;
  workflowState.items.forEach(function(item){
    if(settings.excludeItemId && item.id === settings.excludeItemId){
      return;
    }
    if(item.kind && !getWorkflowAnchorableKinds().includes(item.kind)){
      return;
    }
    getWorkflowAnchorSidesForItem(item).forEach(function(side){
      const anchor = getWorkflowAnchorPointForItem(item, side);
      let distance = Math.hypot(pointer.x - anchor.x, pointer.y - anchor.y);
      distance += getWorkflowAnchorSnapBias(item, pointer, side);
      if(side === "center" && isPointInsideWorkflowItemInterior(item, pointer)){
        distance = Math.max(0, distance - 12);
      }
      if(!bestMatch || distance < bestMatch.distance){
        bestMatch = {
          itemId: item.id,
          side: side,
          distance: distance,
          anchorX: anchor.x,
          anchorY: anchor.y
        };
      }
    });
  });
  return bestMatch;
}

function setWorkflowConnectorEndpointAnchor(connector, endpointKey, anchor){
  if(endpointKey === "start"){
    connector.from = anchor;
  }else{
    connector.to = anchor;
  }
  syncWorkflowConnectorEndpoint(connector, endpointKey);
}

function clearWorkflowConnectorEndpointAnchor(connector, endpointKey, point){
  if(endpointKey === "start"){
    connector.from = null;
    connector.x1 = point.x;
    connector.y1 = point.y;
  }else{
    connector.to = null;
    connector.x2 = point.x;
    connector.y2 = point.y;
  }
}

function workflowItemHasAnchoredConnectors(itemId){
  return workflowState.connectors.some(function(connector){
    return (connector.from && connector.from.itemId === itemId) || (connector.to && connector.to.itemId === itemId);
  });
}

function buildWorkflowOrthogonalPoints(start, end, viaPoints){
  const waypoints = Array.isArray(viaPoints) ? viaPoints : [];
  if(waypoints.length){
    return dedupeWorkflowConnectorPoints([start].concat(waypoints, [end]));
  }
  const deltaX = Math.abs(end.x - start.x);
  const deltaY = Math.abs(end.y - start.y);
  if(deltaX < 1 || deltaY < 1){
    return [start, end];
  }
  if(deltaX >= deltaY){
    const midX = Math.round((start.x + end.x) / 2);
    return dedupeWorkflowConnectorPoints([
      start,
      { x: midX, y: start.y },
      { x: midX, y: end.y },
      end
    ]);
  }
  const midY = Math.round((start.y + end.y) / 2);
  return dedupeWorkflowConnectorPoints([
    start,
    { x: start.x, y: midY },
    { x: end.x, y: midY },
    end
  ]);
}

function getWorkflowAnchorStemPoint(point, side, distance){
  const normalizedSide = normalizeWorkflowAnchorSide(side);
  const edge = normalizedSide === "center" ? "center" : normalizedSide.split("-")[0];
  if(edge === "top"){
    return { x: point.x, y: point.y - distance };
  }
  if(edge === "right"){
    return { x: point.x + distance, y: point.y };
  }
  if(edge === "bottom"){
    return { x: point.x, y: point.y + distance };
  }
  if(edge === "left"){
    return { x: point.x - distance, y: point.y };
  }
  return { x: point.x, y: point.y };
}

function getWorkflowConnectorEndpointSide(connector, endpointKey){
  const endpoint = endpointKey === "start" ? connector.from : connector.to;
  if(endpoint && endpoint.itemId){
    return normalizeWorkflowAnchorSide(endpoint.side || (endpointKey === "start" ? "right" : "left"));
  }
  return "center";
}

function normalizePlanificacionSupportConnectors(items, connectors){
  const itemsById = (items || []).reduce(function(acc, item){
    acc[item.id] = item;
    return acc;
  }, {});
  const source = itemsById["step-p2-3"];
  if(!source){
    return connectors;
  }
  const trunkStart = getWorkflowAnchorPointFromGeometry(
    getWorkflowAnchorGeometryFromRect(source.x, source.y, source.width || 0, source.height || 0, source),
    "bottom-middle"
  );
  const branchTargets = [
    { connectorId: "p2-support-2", itemId: "icon-p2-doc" },
    { connectorId: "p2-support-3", itemId: "icon-p2-doc2" },
    { connectorId: "p2-support-4", itemId: "icon-p2-team" },
    { connectorId: "p2-support-5", itemId: "icon-p2-micro" },
    { connectorId: "p2-support-6", itemId: "icon-p2-log" }
  ].map(function(entry){
    const item = itemsById[entry.itemId];
    if(!item){
      return null;
    }
    return {
      connectorId: entry.connectorId,
      targetX: Math.round(item.x - 8),
      targetY: Math.round(item.y + ((item.height || 24) / 2))
    };
  }).filter(Boolean);
  if(!branchTargets.length){
    return connectors;
  }
  const trunkBottomY = branchTargets[branchTargets.length - 1].targetY + 24;
  return (connectors || []).map(function(connector){
    if(connector.id === "p2-support-1"){
      return Object.assign({}, connector, {
        from: { itemId: "step-p2-3", side: "bottom-middle" },
        to: null,
        x1: trunkStart.x,
        y1: trunkStart.y,
        x2: trunkStart.x,
        y2: trunkBottomY,
        via: [{ x: trunkStart.x, y: trunkBottomY }],
        dashed: true,
        arrow: "none",
        color: "#989898",
        strokeWidth: 1.4
      });
    }
    const branch = branchTargets.find(function(entry){ return entry.connectorId === connector.id; });
    if(branch){
      return Object.assign({}, connector, {
        from: null,
        to: null,
        x1: trunkStart.x,
        y1: branch.targetY,
        x2: branch.targetX,
        y2: branch.targetY,
        via: [],
        dashed: true,
        arrow: "none",
        color: "#989898",
        strokeWidth: 1.4
      });
    }
    return connector;
  });
}

function getWorkflowAnchorEdge(side){
  const normalizedSide = normalizeWorkflowAnchorSide(side);
  return normalizedSide === "center" ? "center" : normalizedSide.split("-")[0];
}

function isWorkflowHorizontalEdge(edge){
  return edge === "left" || edge === "right";
}

function isWorkflowVerticalEdge(edge){
  return edge === "top" || edge === "bottom";
}

function isWorkflowPointCompatibleWithEdge(point, anchor, edge){
  if(edge === "left"){
    return point.x <= anchor.x + 0.5;
  }
  if(edge === "right"){
    return point.x >= anchor.x - 0.5;
  }
  if(edge === "top"){
    return point.y <= anchor.y + 0.5;
  }
  if(edge === "bottom"){
    return point.y >= anchor.y - 0.5;
  }
  return true;
}

function buildWorkflowSingleElbowPoints(start, startSide, end, endSide){
  const startEdge = getWorkflowAnchorEdge(startSide);
  const endEdge = getWorkflowAnchorEdge(endSide);
  if(isWorkflowHorizontalEdge(startEdge) && isWorkflowVerticalEdge(endEdge)){
    const elbow = { x: end.x, y: start.y };
    if(isWorkflowPointCompatibleWithEdge(elbow, start, startEdge) && isWorkflowPointCompatibleWithEdge(elbow, end, endEdge)){
      return dedupeWorkflowConnectorPoints([start, elbow, end]);
    }
  }
  if(isWorkflowVerticalEdge(startEdge) && isWorkflowHorizontalEdge(endEdge)){
    const elbow = { x: start.x, y: end.y };
    if(isWorkflowPointCompatibleWithEdge(elbow, start, startEdge) && isWorkflowPointCompatibleWithEdge(elbow, end, endEdge)){
      return dedupeWorkflowConnectorPoints([start, elbow, end]);
    }
  }
  return null;
}

function buildWorkflowConnectorPoints(connector){
  const start = getWorkflowConnectorEndpointPoint(connector, "start");
  const end = getWorkflowConnectorEndpointPoint(connector, "end");
  const viaPoints = Array.isArray(connector.via) ? connector.via : [];
  if(viaPoints.length){
    return buildWorkflowOrthogonalPoints(start, end, viaPoints);
  }
  const startSide = getWorkflowConnectorEndpointSide(connector, "start");
  const endSide = getWorkflowConnectorEndpointSide(connector, "end");
  if(startSide !== "center" && endSide !== "center"){
    const singleElbowPoints = buildWorkflowSingleElbowPoints(start, startSide, end, endSide);
    if(singleElbowPoints){
      return singleElbowPoints;
    }
    const stemDistance = 18;
    const startStem = getWorkflowAnchorStemPoint(start, startSide, stemDistance);
    const endStem = getWorkflowAnchorStemPoint(end, endSide, stemDistance);
    const middlePoints = buildWorkflowOrthogonalPoints(startStem, endStem, []);
    return dedupeWorkflowConnectorPoints([start].concat(middlePoints, [end]));
  }
  return buildWorkflowOrthogonalPoints(start, end, []);
}

function getWorkflowConnectorToolbarPoint(connector){
  const points = buildWorkflowConnectorPoints(connector);
  if(points.length < 2){
    return { x: connector.x1, y: connector.y1, totalLength: 0, segmentOrientation: "horizontal" };
  }
  let totalLength = 0;
  const segments = [];
  for(let index = 0; index < points.length - 1; index += 1){
    const start = points[index];
    const end = points[index + 1];
    const length = Math.abs(end.x - start.x) + Math.abs(end.y - start.y);
    segments.push({ start, end, length });
    totalLength += length;
  }
  if(totalLength <= 0){
    return { x: points[0].x, y: points[0].y, totalLength: 0, segmentOrientation: "horizontal" };
  }
  let targetLength = totalLength / 2;
  for(let index = 0; index < segments.length; index += 1){
    const segment = segments[index];
    if(targetLength <= segment.length){
      if(segment.start.x === segment.end.x){
        const direction = segment.end.y >= segment.start.y ? 1 : -1;
        return {
          x: segment.start.x,
          y: segment.start.y + (targetLength * direction),
          totalLength: totalLength,
          segmentOrientation: "vertical"
        };
      }
      const direction = segment.end.x >= segment.start.x ? 1 : -1;
      return {
        x: segment.start.x + (targetLength * direction),
        y: segment.start.y,
        totalLength: totalLength,
        segmentOrientation: "horizontal"
      };
    }
    targetLength -= segment.length;
  }
  return {
    x: points[points.length - 1].x,
    y: points[points.length - 1].y,
    totalLength: totalLength,
    segmentOrientation: "horizontal"
  };
}

function getWorkflowConnectorBounds(points){
  const sourcePoints = Array.isArray(points) && points.length ? points : [];
  if(!sourcePoints.length){
    return {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0
    };
  }
  let minX = sourcePoints[0].x;
  let maxX = sourcePoints[0].x;
  let minY = sourcePoints[0].y;
  let maxY = sourcePoints[0].y;
  sourcePoints.forEach(function(point){
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });
  return {
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY,
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2
  };
}

function getWorkflowEditableConnectorPoints(connector){
  const start = getWorkflowConnectorEndpointPoint(connector, "start");
  const end = getWorkflowConnectorEndpointPoint(connector, "end");
  if(Array.isArray(connector.via) && connector.via.length){
    return [start].concat(connector.via.map(function(point){
      return { x: point.x, y: point.y };
    }), [end]);
  }
  return buildWorkflowConnectorPoints(connector).map(function(point){
    return { x: point.x, y: point.y };
  });
}

function getWorkflowConnectorSegmentHandles(connector){
  const points = getWorkflowEditableConnectorPoints(connector);
  const handles = [];
  for(let index = 1; index < points.length - 2; index += 1){
    const start = points[index];
    const end = points[index + 1];
    const isHorizontal = Math.abs(start.y - end.y) < 0.5;
    const isVertical = Math.abs(start.x - end.x) < 0.5;
    const length = isHorizontal ? Math.abs(end.x - start.x) : Math.abs(end.y - start.y);
    if((!isHorizontal && !isVertical) || length < 36){
      continue;
    }
    handles.push({
      segmentIndex: index,
      orientation: isHorizontal ? "horizontal" : "vertical",
      x: (start.x + end.x) / 2,
      y: (start.y + end.y) / 2
    });
  }
  return handles;
}

function moveWorkflowConnectorSegment(points, segmentIndex, orientation, pointer){
  const sourcePoints = points.map(function(point){
    return { x: point.x, y: point.y };
  });
  const start = sourcePoints[segmentIndex];
  const end = sourcePoints[segmentIndex + 1];
  if(!start || !end){
    return sourcePoints;
  }
  if(orientation === "horizontal"){
    const newY = Math.round(pointer.y);
    sourcePoints[segmentIndex].y = newY;
    sourcePoints[segmentIndex + 1].y = newY;
    return dedupeWorkflowConnectorPoints(sourcePoints);
  }
  const newX = Math.round(pointer.x);
  sourcePoints[segmentIndex].x = newX;
  sourcePoints[segmentIndex + 1].x = newX;
  return dedupeWorkflowConnectorPoints(sourcePoints);
}

function getWorkflowConnectorToolbarPlacement(connector){
  const points = buildWorkflowConnectorPoints(connector);
  const bounds = getWorkflowConnectorBounds(points);
  const canvasBounds = getCanvasBounds();
  const screenGap = 72;
  const sideGap = 56;
  const topGap = screenGap / Math.max(workflowZoom, 0.01);
  const lateralGap = sideGap / Math.max(workflowZoom, 0.01);
  const canPlaceAbove = (bounds.minY - topGap) >= 28;
  const x = canPlaceAbove
    ? Math.min(Math.max(bounds.centerX, 48), canvasBounds.width - 48)
    : Math.min(canvasBounds.width - 36, bounds.maxX + lateralGap);
  const y = canPlaceAbove
    ? Math.max(28, bounds.minY - topGap)
    : Math.max(28, bounds.centerY - (18 / Math.max(workflowZoom, 0.01)));
  return {
    x: x,
    y: y,
    toolbarClass: canPlaceAbove ? "" : " is-side"
  };
}

function normalizeWorkflowSelectionRect(rect){
  const startX = Number(rect.startX) || 0;
  const startY = Number(rect.startY) || 0;
  const currentX = Number(rect.currentX) || startX;
  const currentY = Number(rect.currentY) || startY;
  const x = Math.min(startX, currentX);
  const y = Math.min(startY, currentY);
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  return { x, y, width, height };
}

function getWorkflowItemBounds(item){
  return {
    minX: item.x,
    minY: item.y,
    maxX: item.x + (item.width || 0),
    maxY: item.y + (item.height || 0)
  };
}

function doesWorkflowRectIntersectBounds(rect, bounds){
  return rect.x <= bounds.maxX
    && (rect.x + rect.width) >= bounds.minX
    && rect.y <= bounds.maxY
    && (rect.y + rect.height) >= bounds.minY;
}

function getWorkflowConnectorSelectionBounds(connector){
  return getWorkflowConnectorBounds(getWorkflowEditableConnectorPoints(connector));
}

function renderWorkflowSelectionBox(){
  if(!isEditingWorkflow || !activeWorkflowSelectionBox){
    return "";
  }
  const rect = normalizeWorkflowSelectionRect(activeWorkflowSelectionBox);
  if(rect.width < 2 && rect.height < 2){
    return "";
  }
  return `<div class="workflow-selection-box" style="left:${rect.x}px;top:${rect.y}px;width:${rect.width}px;height:${rect.height}px"></div>`;
}

function getWorkflowItemPublicationBounds(item){
  const left = Number.isFinite(item.x) ? item.x : 0;
  const top = Number.isFinite(item.y) ? item.y : 0;
  const width = Number.isFinite(item.width) ? item.width : 0;
  const height = Number.isFinite(item.height) ? item.height : 0;
  let minX = left;
  let minY = top;
  let maxX = left + width;
  let maxY = top + height;

  if(hasWorkflowFloatingLabel(item.type) || item.type === "icon"){
    const labelOffsetX = Number.isFinite(item.labelOffsetX) ? item.labelOffsetX : 0;
    const labelOffsetY = Number.isFinite(item.labelOffsetY) ? item.labelOffsetY : 0;
    const labelWidth = Number.isFinite(item.labelWidth) ? item.labelWidth : 0;
    const labelHeight = Number.isFinite(item.labelHeight) ? item.labelHeight : 0;
    minX = Math.min(minX, left + labelOffsetX);
    minY = Math.min(minY, top + labelOffsetY);
    maxX = Math.max(maxX, left + labelOffsetX + labelWidth);
    maxY = Math.max(maxY, top + labelOffsetY + labelHeight);
  }

  if(item.kind === "actor"){
    const actorWidth = getWorkflowActorMaxWidth(item);
    const labelOffsetX = Number.isFinite(item.labelOffsetX) ? item.labelOffsetX : 0;
    const labelOffsetY = Number.isFinite(item.labelOffsetY) ? item.labelOffsetY : 0;
    const labelWidth = Number.isFinite(item.labelWidth) ? item.labelWidth : getDefaultActorLabelLayout().labelWidth;
    const labelHeight = Number.isFinite(item.labelHeight) ? item.labelHeight : getDefaultActorLabelLayout().labelHeight;
    minX = Math.min(minX, left + labelOffsetX);
    minY = Math.min(minY, top + labelOffsetY);
    maxX = Math.max(maxX, left + actorWidth, left + labelOffsetX + labelWidth);
    maxY = Math.max(maxY, top + 22, top + labelOffsetY + labelHeight);
  }

  return { minX, minY, maxX, maxY };
}

function getPublicationBounds(){
  const publicationPadding = 72;
  let contentMinX = Infinity;
  let contentMinY = Infinity;
  let contentMaxX = -Infinity;
  let contentMaxY = -Infinity;
  workflowState.items.forEach(function(item){
    const bounds = getWorkflowItemPublicationBounds(item);
    contentMinX = Math.min(contentMinX, bounds.minX);
    contentMinY = Math.min(contentMinY, bounds.minY);
    contentMaxX = Math.max(contentMaxX, bounds.maxX);
    contentMaxY = Math.max(contentMaxY, bounds.maxY);
  });
  workflowState.connectors.forEach(function(connector){
    buildWorkflowConnectorPoints(connector).forEach(function(point){
      contentMinX = Math.min(contentMinX, point.x);
      contentMinY = Math.min(contentMinY, point.y);
      contentMaxX = Math.max(contentMaxX, point.x);
      contentMaxY = Math.max(contentMaxY, point.y);
    });
  });
  if(!Number.isFinite(contentMinX) || !Number.isFinite(contentMinY) || !Number.isFinite(contentMaxX) || !Number.isFinite(contentMaxY)){
    return {
      width: PUBLICATION_WIDTH,
      height: PUBLICATION_HEIGHT,
      offsetX: 0,
      offsetY: 0
    };
  }
  const width = Math.max(PUBLICATION_WIDTH, Math.ceil((contentMaxX - contentMinX) + (publicationPadding * 2)));
  const height = Math.max(PUBLICATION_HEIGHT, Math.ceil((contentMaxY - contentMinY) + (publicationPadding * 2)));
  return {
    width: width,
    height: height,
    offsetX: Math.round(publicationPadding - contentMinX),
    offsetY: Math.round(publicationPadding - contentMinY)
  };
}

function getCanvasBounds(){
  if(!isEditingWorkflow){
    return getPublicationBounds();
  }
  return {
    width: EDITOR_WIDTH,
    height: EDITOR_HEIGHT
  };
}

function renderWorkflowCanvas(){
  const diagramEl = document.getElementById("workflowDiagram");
  const canvasShellEl = document.getElementById("workflowCanvasShell");
  const zoomLayerEl = document.getElementById("workflowZoomLayer");
  const canvasEl = document.getElementById("workflowCanvas");
  const viewportEl = document.getElementById("workflowViewport");
  const modeChipEl = document.getElementById("workflowModeChip");
  const toggleButtonEl = document.getElementById("toggleWorkflowModeButton");
  const floatingEditButtonEl = document.getElementById("floatingWorkflowEditModeButton");
  const fullscreenButtonEl = document.getElementById("workflowFullscreenButton");
  const zoomValueEl = document.getElementById("workflowZoomValue");
  const editToolsEl = document.getElementById("workflowEditTools");
  const floatingToolsEl = document.getElementById("floatingWorkflowTools");
  const inlineToolsEl = document.getElementById("workflowDiagramInlineTools");
  const inspectorEl = document.getElementById("workflowInspector");
  const undoButtonEl = document.getElementById("undoWorkflowButton");
  const redoButtonEl = document.getElementById("redoWorkflowButton");
  const sourceJsonButtonEl = document.getElementById("workflowSourceJsonButton");
  const sourceStorageButtonEl = document.getElementById("workflowSourceStorageButton");
  const selectedItem = getSelectedWorkflowItem();
  const selectedConnector = getSelectedWorkflowConnector();
  const bounds = getCanvasBounds();
  const scaledWidth = Math.ceil(bounds.width * workflowZoom);
  const scaledHeight = Math.ceil(bounds.height * workflowZoom);
  const isDraggingObject = Boolean(activeDrag && (
    activeDrag.mode === "item" ||
    activeDrag.mode === "selection-move" ||
    activeDrag.mode === "item-resize" ||
    activeDrag.mode === "entry-label-move" ||
    activeDrag.mode === "actor-label-move" ||
    activeDrag.mode === "entry-label-resize" ||
    activeDrag.mode === "connector-end" ||
    activeDrag.mode === "connector-move"
  ));

  const totalSelected = selectedWorkflowItemIds.length + selectedWorkflowConnectorIds.length;
  diagramEl.dataset.editing = isEditingWorkflow ? "true" : "false";
  diagramEl.dataset.connecting = activeDrag && activeDrag.mode === "connector-create" ? "true" : "false";
  diagramEl.dataset.draggingObject = isDraggingObject ? "true" : "false";
  diagramEl.dataset.multiselect = totalSelected > 1 ? "true" : "false";
  modeChipEl.textContent = isEditingWorkflow ? "Modo edición" : "Modo publicación";
  toggleButtonEl.textContent = isEditingWorkflow ? "Volver a publicación" : "Editar mapa";
  toggleButtonEl.classList.toggle("is-active", isEditingWorkflow);
  floatingEditButtonEl.classList.toggle("is-active", isEditingWorkflow);
  if(sourceJsonButtonEl){
    sourceJsonButtonEl.classList.toggle("is-active", workflowStateSource === "json");
    sourceJsonButtonEl.setAttribute("aria-pressed", workflowStateSource === "json" ? "true" : "false");
  }
  if(sourceStorageButtonEl){
    sourceStorageButtonEl.classList.toggle("is-active", workflowStateSource === "storage");
    sourceStorageButtonEl.setAttribute("aria-pressed", workflowStateSource === "storage" ? "true" : "false");
  }
  const isFullscreen = document.fullscreenElement === document.getElementById("workflowFullscreenTarget");
  fullscreenButtonEl.textContent = isFullscreen ? "⤢" : "⛶";
  fullscreenButtonEl.title = isFullscreen ? "Volver a vista normal" : "Pantalla completa";
  fullscreenButtonEl.setAttribute("aria-label", isFullscreen ? "Volver a vista normal" : "Pantalla completa");
  if(isFullscreen){
    if(editToolsEl.parentElement !== inlineToolsEl){
      inlineToolsEl.appendChild(editToolsEl);
    }
    if(floatingToolsEl.parentElement !== inlineToolsEl){
      inlineToolsEl.appendChild(floatingToolsEl);
    }
  }else{
    if(editToolsEl.parentElement !== workflowEditToolsHome){
      workflowEditToolsHome.appendChild(editToolsEl);
    }
    if(floatingToolsEl.parentElement !== workflowFloatingToolsHome){
      workflowFloatingToolsHome.appendChild(floatingToolsEl);
    }
  }
  editToolsEl.classList.toggle("is-visible", isEditingWorkflow);
  undoButtonEl.disabled = !workflowUndoStack.length;
  redoButtonEl.disabled = !workflowRedoStack.length;
  inspectorEl.classList.toggle("is-visible", Boolean(isEditingWorkflow && (isInspectorEditableItem(selectedItem) || selectedConnector)));
  floatingEditButtonEl.title = isEditingWorkflow ? "Volver a publicación" : "Entrar a edición";
  floatingEditButtonEl.setAttribute("aria-label", isEditingWorkflow ? "Volver a publicación" : "Entrar a edición");
  zoomLayerEl.style.width = scaledWidth + "px";
  zoomLayerEl.style.height = scaledHeight + "px";
  canvasEl.style.width = bounds.width + "px";
  canvasEl.style.height = bounds.height + "px";
  canvasEl.style.setProperty("--workflow-zoom", String(workflowZoom));
  canvasEl.style.transform = `scale(${workflowZoom})`;
  viewportEl.style.transform = isEditingWorkflow ? "" : `translate(${bounds.offsetX || 0}px, ${bounds.offsetY || 0}px)`;
  viewportEl.style.transformOrigin = "top left";
  canvasShellEl.style.height = isEditingWorkflow ? "" : scaledHeight + "px";
  if(!isEditingWorkflow){
    canvasShellEl.scrollLeft = 0;
    canvasShellEl.scrollTop = 0;
  }
  zoomValueEl.textContent = Math.round(workflowZoom * 100) + "%";
  selectedWorkflowItemIds = selectedWorkflowItemIds.filter(function(id){ return Boolean(getWorkflowItemById(id)); });
  selectedWorkflowConnectorIds = selectedWorkflowConnectorIds.filter(function(id){
    return workflowState.connectors.some(function(connector){ return connector.id === id; });
  });
  if(selectedWorkflowItemId && !selectedItem){
    selectedWorkflowItemId = "";
  }
  if(selectedWorkflowConnectorId && !selectedConnector){
    selectedWorkflowConnectorId = "";
    openWorkflowConnectorToolbarId = "";
  }
  viewportEl.innerHTML = "";
  let publicationLimitEl = canvasEl.querySelector(".workflow-publication-limit");
  if(!publicationLimitEl){
    publicationLimitEl = document.createElement("div");
    publicationLimitEl.className = "workflow-publication-limit";
    canvasEl.appendChild(publicationLimitEl);
  }
  publicationLimitEl.style.display = isEditingWorkflow ? "none" : "block";
  if(isEditingWorkflow){
    viewportEl.onclick = function(event){
      if(suppressWorkflowViewportClick){
        suppressWorkflowViewportClick = false;
        return;
      }
      if(event.target === viewportEl){
        clearWorkflowSelectionState();
        renderWorkflowCanvas();
        updateWorkflowStatus("Selección limpiada.");
      }
    };
    viewportEl.onpointerdown = startWorkflowSelectionBox;
  }else{
    viewportEl.onclick = null;
    viewportEl.onpointerdown = null;
  }
  viewportEl.insertAdjacentHTML("beforeend", renderWorkflowConnectors(bounds));
  viewportEl.insertAdjacentHTML("beforeend", renderWorkflowConnectorDraft());
  viewportEl.insertAdjacentHTML("beforeend", renderWorkflowAnchorPreview());
  viewportEl.insertAdjacentHTML("beforeend", renderWorkflowSelectionBox());
  bindWorkflowConnectorInteractions();
  workflowState.items.forEach(function(item){
    const el = document.createElement("div");
    el.className = getWorkflowItemClassName(item);
    if(isWorkflowItemSelected(item.id)){
      el.classList.add("is-selected");
    }
    el.dataset.itemId = item.id;
    el.style.left = item.x + "px";
    el.style.top = item.y + "px";
    if(item.kind === "actor"){
      const actorWidth = getWorkflowActorMaxWidth(item);
      el.style.width = "fit-content";
      el.style.maxWidth = actorWidth + "px";
      el.style.height = "auto";
      el.style.minHeight = item.height + "px";
    }else{
      el.style.width = item.width + "px";
      el.style.height = item.height + "px";
    }
    el.style.fontSize = (item.fontSize || getDefaultWorkflowItem(item.type).fontSize) + "px";
    el.style.color = getThemedWorkflowColorToken(item.textColor || getDefaultWorkflowItem(item.type).textColor, getWorkflowTextColorRole(item, "node-text"));
    if(item.type === "process"){
      el.style.setProperty("--workflow-process-stroke", getThemedWorkflowColorToken(item.borderColor || getDefaultWorkflowItem("process").borderColor, "process-stroke"));
    }
    if(item.kind){
      if(item.kind === "actor"){
        el.innerHTML = buildWorkflowActorMarkup(item);
        const actorLabelShell = el.querySelector(".workflow-actor-label-shell");
        const actorLabelResize = el.querySelector(".workflow-entry-label-resize");
        if(actorLabelShell && isEditingWorkflow && item.id === selectedWorkflowItemId){
          actorLabelShell.addEventListener("pointerdown", function(event){
            startWorkflowActorLabelDrag(event, item.id);
          });
        }
        if(actorLabelResize){
          actorLabelResize.addEventListener("pointerdown", function(event){
            startWorkflowEntryLabelResize(event, item.id);
          });
        }
      }else if(item.kind === "flow-card"){
        el.style.borderColor = getThemedWorkflowColorToken(item.borderColor || getDefaultWorkflowItem("activity").borderColor, "node-border");
        el.style.background = getThemedWorkflowColorToken(item.backgroundColor || getDefaultWorkflowItem("activity").backgroundColor, "node-fill");
        el.style.fontSize = (item.fontSize || getDefaultWorkflowItem("activity").fontSize) + "px";
        el.style.color = getThemedWorkflowColorToken(item.textColor || getDefaultWorkflowItem("activity").textColor, "node-text");
        el.innerHTML = `${item.badge ? `<div class="badge${item.badgeClass ? " " + item.badgeClass : ""}">${escapeHtml(item.badge)}</div>` : ""}<div class="canvas-item-flow-content">${item.html || ""}</div>`;
      }else if(item.kind === "tag"){
        el.style.color = getThemedWorkflowColorToken(item.textColor || "#eb7a07", "accent-text");
        const icon = getCotizacionesSystemIcon(item.html);
        const iconEl = document.createElement("span");
        const labelEl = document.createElement("span");
        iconEl.className = "tag-icon";
        iconEl.innerHTML = icon;
        labelEl.className = "tag-label";
        labelEl.textContent = String(item.html || "");
        el.appendChild(iconEl);
        el.appendChild(labelEl);
      }else if(item.kind === "mini-icon"){
        const icon = getCotizacionesMiniIcon(item.html);
        if(icon){
          const iconEl = document.createElement("span");
          const labelEl = document.createElement("span");
          el.classList.add("is-channel");
          iconEl.className = "mini-icon-symbol";
          iconEl.style.backgroundImage = `url("${icon}")`;
          labelEl.className = "mini-icon-label";
          labelEl.textContent = String(item.html || "").replace(/<br\s*\/?>/gi, " ");
          el.appendChild(iconEl);
          el.appendChild(labelEl);
        }else{
          el.innerHTML = item.html || "";
        }
      }else if(item.kind === "dashed-box"){
        el.innerHTML = buildWorkflowDashedBoxMarkup(item.html);
      }else{
        el.style.color = getThemedWorkflowColorToken(item.textColor || getDefaultWorkflowItem("text").textColor, getWorkflowTextColorRole(item, "node-text"));
        el.innerHTML = item.html || "";
      }
    }else{
      el.style.borderColor = getThemedWorkflowColorToken(item.borderColor || getDefaultWorkflowItem(item.type).borderColor, item.type === "process" ? "process-stroke" : "node-border");
      el.style.background = getThemedWorkflowColorToken(item.backgroundColor || getDefaultWorkflowItem(item.type).backgroundColor, item.type === "process" ? "process-fill" : "node-fill");
      if(isWorkflowTerminalType(item.type)){
        const dot = document.createElement("span");
        dot.className = item.type === "output" ? "workflow-output-dot" : "workflow-entry-dot";
        const labelShell = document.createElement("div");
        labelShell.className = "workflow-entry-label-shell";
        labelShell.style.left = item.labelOffsetX + "px";
        labelShell.style.top = item.labelOffsetY + "px";
        labelShell.style.width = item.labelWidth + "px";
        labelShell.style.height = item.labelHeight + "px";
        const label = document.createElement("span");
        label.className = "workflow-item-label";
        label.innerHTML = escapeHtml(item.title).replace(/\n/g, "<br>");
        labelShell.appendChild(label);
        if(isEditingWorkflow && item.id === selectedWorkflowItemId){
          const labelResize = document.createElement("button");
          labelResize.type = "button";
          labelResize.className = "workflow-entry-label-resize";
          labelResize.addEventListener("pointerdown", function(event){
            startWorkflowEntryLabelResize(event, item.id);
          });
          labelShell.appendChild(labelResize);
        }
        if(isEditingWorkflow){
          labelShell.addEventListener("pointerdown", function(event){
            startWorkflowEntryLabelDrag(event, item.id);
          });
        }
        el.appendChild(dot);
        el.appendChild(labelShell);
      }else if(item.type === "icon"){
        const glyph = document.createElement("div");
        glyph.className = "workflow-icon-glyph";
        glyph.innerHTML = getWorkflowIconPreset(item.iconVariant).markup;
        const labelShell = document.createElement("div");
        labelShell.className = "workflow-entry-label-shell workflow-icon-label-shell";
        labelShell.style.left = item.labelOffsetX + "px";
        labelShell.style.top = item.labelOffsetY + "px";
        labelShell.style.width = item.labelWidth + "px";
        labelShell.style.height = item.labelHeight + "px";
        const label = document.createElement("span");
        label.className = "workflow-item-label";
        label.innerHTML = escapeHtml(item.title || "").replace(/\n/g, "<br>");
        labelShell.appendChild(label);
        if(isEditingWorkflow && item.id === selectedWorkflowItemId){
          const labelResize = document.createElement("button");
          labelResize.type = "button";
          labelResize.className = "workflow-entry-label-resize";
          labelResize.addEventListener("pointerdown", function(event){
            startWorkflowEntryLabelResize(event, item.id);
          });
          labelShell.appendChild(labelResize);
        }
        if(isEditingWorkflow){
          labelShell.addEventListener("pointerdown", function(event){
            startWorkflowEntryLabelDrag(event, item.id);
          });
        }
        el.appendChild(glyph);
        el.appendChild(labelShell);
      }else{
        const label = document.createElement("span");
        label.className = "workflow-item-label";
        label.innerHTML = escapeHtml(item.title).replace(/\n/g, "<br>");
        el.appendChild(label);
      }
    }
    if(isEditingWorkflow){
      syncWorkflowItemControls(el, item);
      el.addEventListener("pointerdown", startWorkflowDrag);
      el.addEventListener("click", function(event){
        if(event.target.closest(".workflow-item-toolbar, .workflow-item-tool, .workflow-resize-handle")){
          return;
        }
        selectWorkflowItem(item.id);
      });
    }else{
      const publicationStep = getWorkflowPublicationStepId(item);
      if(publicationStep){
        el.addEventListener("click", function(){
          openStep(publicationStep);
        });
      }
    }
    viewportEl.appendChild(el);
  });
  renderWorkflowInspector();
}

function renderWorkflowConnectors(bounds){
  const lines = workflowState.connectors.map(function(connector){
    const selectedClass = isWorkflowConnectorSelected(connector.id) ? " is-selected" : "";
    const dashedClass = connector.dashed ? " is-dashed" : "";
    const arrowMode = normalizeWorkflowArrowMode(connector.arrow);
    const points = buildWorkflowConnectorPoints(connector).map(function(point){
      return point.x + "," + point.y;
    }).join(" ");
    const markerStart = (arrowMode === "start" || arrowMode === "both") ? ' marker-start="url(#workflow-arrow)"' : ' marker-start="none"';
    const markerEnd = (arrowMode === "end" || arrowMode === "both") ? ' marker-end="url(#workflow-arrow)"' : ' marker-end="none"';
    return `<polyline class="workflow-connector-hit${selectedClass}" data-connector-id="${connector.id}" data-drag="move" points="${points}"></polyline><polyline class="${selectedClass ? "is-selected" : ""}${dashedClass}" data-connector-id="${connector.id}" data-drag="move" points="${points}" stroke="${escapeHtml(connector.color || "#7d7d7d")}" stroke-width="${connector.strokeWidth || 2}"${markerStart}${markerEnd}></polyline>`;
  }).join("");
  const handles = isEditingWorkflow ? workflowState.connectors.map(function(connector){
    const start = getWorkflowConnectorEndpointPoint(connector, "start");
    const end = getWorkflowConnectorEndpointPoint(connector, "end");
    const visibleClass = connector.id === selectedWorkflowConnectorId ? " is-visible" : "";
    return `<div class="workflow-connector-handle${visibleClass}" data-connector-id="${connector.id}" data-endpoint="start" style="left:${start.x}px;top:${start.y}px"></div><div class="workflow-connector-handle${visibleClass}" data-connector-id="${connector.id}" data-endpoint="end" style="left:${end.x}px;top:${end.y}px"></div>`;
  }).join("") : "";
  const bendHandles = isEditingWorkflow ? workflowState.connectors.map(function(connector){
    if(connector.id !== selectedWorkflowConnectorId){
      return "";
    }
    return getWorkflowConnectorSegmentHandles(connector).map(function(handle){
      return `<button class="workflow-connector-bend-handle is-visible" type="button" data-connector-id="${connector.id}" data-segment-index="${handle.segmentIndex}" data-orientation="${handle.orientation}" style="left:${handle.x}px;top:${handle.y}px" title="Mover tramo del conector" aria-label="Mover tramo del conector"></button>`;
    }).join("");
  }).join("") : "";
  const toolbars = isEditingWorkflow ? workflowState.connectors.map(function(connector){
    const placement = getWorkflowConnectorToolbarPlacement(connector);
    return `<div class="workflow-connector-toolbar${connector.id === openWorkflowConnectorToolbarId ? " is-visible" : ""}${placement.toolbarClass}" data-connector-toolbar="${connector.id}" style="left:${placement.x}px;top:${placement.y}px"><button class="workflow-toolbar-close workflow-connector-close" type="button" data-connector-close="${connector.id}" title="Cerrar panel" aria-label="Cerrar panel">${WORKFLOW_TOOL_ICONS.close}</button><button class="workflow-item-tool is-edit" type="button" data-connector-action="edit" data-connector-id="${connector.id}" title="Editar" aria-label="Editar">${WORKFLOW_TOOL_ICONS.edit}</button><button class="workflow-item-tool is-delete" type="button" data-connector-action="delete" data-connector-id="${connector.id}" title="Eliminar" aria-label="Eliminar">${WORKFLOW_TOOL_ICONS.delete}</button></div>`;
  }).join("") : "";
  return `<svg class="workflow-connectors" viewBox="0 0 ${bounds.width} ${bounds.height}" aria-hidden="true"><defs><marker id="workflow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7d7d7d"></path></marker></defs>${lines}</svg>${handles}${bendHandles}${toolbars}`;
}

function renderWorkflowAnchorPreview(){
  if(!isEditingWorkflow || !activeWorkflowAnchorPreview){
    return "";
  }
  return `<div class="workflow-anchor-preview is-visible${activeWorkflowAnchorPreview.side === "center" ? " is-center" : ""}" style="left:${activeWorkflowAnchorPreview.anchorX}px;top:${activeWorkflowAnchorPreview.anchorY}px"></div>`;
}

function renderWorkflowConnectorDraft(){
  if(!isEditingWorkflow || !activeDrag || activeDrag.mode !== "connector-create"){
    return "";
  }
  const sourceItem = getWorkflowItemById(activeDrag.sourceItemId);
  if(!sourceItem){
    return "";
  }
  const endPoint = activeWorkflowAnchorPreview
    ? { x: activeWorkflowAnchorPreview.anchorX, y: activeWorkflowAnchorPreview.anchorY }
    : { x: activeDrag.currentX, y: activeDrag.currentY };
  const sourceSide = getWorkflowConnectionSide(sourceItem, endPoint);
  const startPoint = getWorkflowAnchorPointForItem(sourceItem, sourceSide);
  const points = buildWorkflowOrthogonalPoints(startPoint, endPoint, []).map(function(point){
    return point.x + "," + point.y;
  }).join(" ");
  return `<svg class="workflow-connectors workflow-connectors-draft" viewBox="0 0 ${getCanvasBounds().width} ${getCanvasBounds().height}" aria-hidden="true"><polyline class="is-draft" points="${points}"></polyline></svg>`;
}

function bindWorkflowConnectorInteractions(){
  if(!isEditingWorkflow){
    return;
  }
  document.querySelectorAll("[data-connector-id][data-drag=\"move\"]").forEach(function(el){
    el.addEventListener("pointerdown", startWorkflowConnectorDrag);
    el.addEventListener("click", function(event){
      event.stopPropagation();
      selectWorkflowConnector(event.currentTarget.dataset.connectorId, { openToolbar: true });
    });
    el.addEventListener("contextmenu", function(event){
      event.preventDefault();
      event.stopPropagation();
      selectWorkflowConnector(event.currentTarget.dataset.connectorId, { openToolbar: true });
    });
  });
  document.querySelectorAll(".workflow-connector-handle").forEach(function(el){
    el.addEventListener("pointerdown", startWorkflowConnectorHandleDrag);
  });
  document.querySelectorAll(".workflow-connector-bend-handle").forEach(function(el){
    el.addEventListener("pointerdown", startWorkflowConnectorBendDrag);
  });
  document.querySelectorAll("[data-connector-action]").forEach(function(el){
    el.addEventListener("pointerdown", function(event){
      event.stopPropagation();
    });
    el.addEventListener("click", function(event){
      event.stopPropagation();
      const connectorId = event.currentTarget.dataset.connectorId;
      if(event.currentTarget.dataset.connectorAction === "edit"){
        selectWorkflowConnector(connectorId, { openToolbar: true });
      }else if(event.currentTarget.dataset.connectorAction === "delete"){
        deleteWorkflowConnector(connectorId);
      }
    });
  });
  document.querySelectorAll("[data-connector-close]").forEach(function(el){
    el.addEventListener("pointerdown", function(event){
      event.stopPropagation();
    });
    el.addEventListener("click", function(event){
      event.stopPropagation();
      openWorkflowConnectorToolbarId = "";
      renderWorkflowCanvas();
      updateWorkflowStatus("Panel del conector cerrado.");
    });
  });
}

function getWorkflowItemClassName(item){
  if(item.kind){
    return "canvas-item " + item.kind + (isEditingWorkflow ? " is-draggable" : "");
  }
  if(item.type === "process"){
    return "workflow-node workflow-process";
  }
  if(item.type === "text"){
    return "workflow-text";
  }
  if(item.type === "entry"){
    return "workflow-entry";
  }
  if(item.type === "output"){
    return "workflow-output";
  }
  if(item.type === "decision"){
    return "workflow-decision";
  }
  if(item.type === "icon"){
    return "workflow-icon";
  }
  return "workflow-node";
}

function getSelectedWorkflowItem(){
  return workflowState.items.find(function(entry){ return entry.id === selectedWorkflowItemId; }) || null;
}

function getSelectedWorkflowConnector(){
  return workflowState.connectors.find(function(entry){ return entry.id === selectedWorkflowConnectorId; }) || null;
}

function dedupeWorkflowIds(ids){
  return Array.from(new Set((Array.isArray(ids) ? ids : []).filter(Boolean)));
}

function setWorkflowSelectionState(itemIds, connectorIds, primaryItemId, primaryConnectorId){
  selectedWorkflowItemIds = dedupeWorkflowIds(itemIds);
  selectedWorkflowConnectorIds = dedupeWorkflowIds(connectorIds);
  selectedWorkflowItemId = selectedWorkflowItemIds.length === 1 && !selectedWorkflowConnectorIds.length
    ? (primaryItemId || selectedWorkflowItemIds[0])
    : "";
  selectedWorkflowConnectorId = selectedWorkflowConnectorIds.length === 1 && !selectedWorkflowItemIds.length
    ? (primaryConnectorId || selectedWorkflowConnectorIds[0])
    : "";
  if(openWorkflowConnectorToolbarId && !selectedWorkflowConnectorIds.includes(openWorkflowConnectorToolbarId)){
    openWorkflowConnectorToolbarId = "";
  }
}

function clearWorkflowSelectionState(){
  setWorkflowSelectionState([], [], "", "");
  openWorkflowTransformMenuItemId = "";
}

function isWorkflowItemSelected(itemId){
  return selectedWorkflowItemIds.includes(itemId);
}

function isWorkflowConnectorSelected(connectorId){
  return selectedWorkflowConnectorIds.includes(connectorId);
}

function getWorkflowGroupSelection(groupId){
  if(!groupId){
    return { itemIds: [], connectorIds: [] };
  }
  return {
    itemIds: workflowState.items.filter(function(item){ return item.groupId === groupId; }).map(function(item){ return item.id; }),
    connectorIds: workflowState.connectors.filter(function(connector){ return connector.groupId === groupId; }).map(function(connector){ return connector.id; })
  };
}

function getWorkflowSelectionForItem(itemId){
  const item = getWorkflowItemById(itemId);
  if(!item){
    return { itemIds: [], connectorIds: [] };
  }
  if(item.groupId){
    return getWorkflowGroupSelection(item.groupId);
  }
  return { itemIds: [itemId], connectorIds: [] };
}

function getWorkflowSelectionForConnector(connectorId){
  const connector = workflowState.connectors.find(function(entry){ return entry.id === connectorId; });
  if(!connector){
    return { itemIds: [], connectorIds: [] };
  }
  if(connector.groupId){
    return getWorkflowGroupSelection(connector.groupId);
  }
  return { itemIds: [], connectorIds: [connectorId] };
}

function buildWorkflowActorMarkup(item){
  const showResize = isEditingWorkflow && item.id === selectedWorkflowItemId;
  const labelWidth = item.labelWidth || getDefaultActorLabelLayout().labelWidth;
  const labelHeight = item.labelHeight || getDefaultActorLabelLayout().labelHeight;
  return `<span class="actor-icon" aria-hidden="true"></span><div class="workflow-actor-label-shell${showResize ? " is-selected" : ""}" style="--actor-label-offset-x:${item.labelOffsetX || 0}px;--actor-label-offset-y:${item.labelOffsetY || 0}px;max-width:${labelWidth}px;min-height:${labelHeight}px"><span class="workflow-item-label">${item.html || ""}</span>${showResize ? '<button type="button" class="workflow-entry-label-resize"></button>' : ""}</div>`;
}

function getWorkflowTransformType(item){
  if(!item){
    return "";
  }
  if(item.kind === "flow-card"){
    return "activity";
  }
  if(item.kind === "subactivity"){
    return "subactivity";
  }
  if(item.kind === "actor"){
    return "role";
  }
  if(item.type === "process"){
    return "process";
  }
  return item.type;
}

function selectWorkflowItem(itemId){
  if(!isEditingWorkflow){
    return;
  }
  const selection = getWorkflowSelectionForItem(itemId);
  setWorkflowSelectionState(selection.itemIds, selection.connectorIds, selection.itemIds.length === 1 ? itemId : "", "");
  openWorkflowConnectorToolbarId = "";
  openWorkflowTransformMenuItemId = "";
  renderWorkflowCanvas();
  updateWorkflowStatus((selection.itemIds.length + selection.connectorIds.length) > 1 ? "Grupo seleccionado." : "Objeto seleccionado para personalización.");
}

function selectWorkflowConnector(connectorId, options){
  if(!isEditingWorkflow){
    return;
  }
  const settings = options || {};
  const selection = getWorkflowSelectionForConnector(connectorId);
  setWorkflowSelectionState(selection.itemIds, selection.connectorIds, "", selection.connectorIds.length === 1 ? connectorId : "");
  openWorkflowTransformMenuItemId = "";
  openWorkflowConnectorToolbarId = settings.openToolbar ? connectorId : "";
  renderWorkflowCanvas();
  updateWorkflowStatus(settings.openToolbar ? "Panel del conector abierto." : ((selection.itemIds.length + selection.connectorIds.length) > 1 ? "Grupo seleccionado." : "Conector seleccionado. Arrastra los extremos para reanclar."));
}

function editWorkflowItem(itemId){
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item){
    return;
  }
  if(item.kind && item.kind !== "flow-card"){
    openWorkflowTransformMenuItemId = "";
    const nextHtml = window.prompt("Editar contenido del objeto", item.html || "");
    if(nextHtml === null){
      return;
    }
    item.html = nextHtml;
    saveWorkflowState();
    renderWorkflowCanvas();
    updateWorkflowStatus("Objeto del mapa actualizado.");
    return;
  }
  selectedWorkflowItemId = item.id;
  openWorkflowTransformMenuItemId = "";
  renderWorkflowCanvas();
  updateWorkflowStatus(item.type === "activity" ? "Detalle de actividad abierto para personalización." : "Detalle del objeto abierto para personalización.");
}

function deleteWorkflowItem(itemId){
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item){
    return;
  }
  const itemLabel = item.kind === "flow-card"
    ? stripHtml(item.html || "Actividad")
    : (item.title || stripHtml(item.html || "Objeto"));
  if(!window.confirm('Se eliminará "' + itemLabel + '". ¿Deseas continuar?')){
    return;
  }
  workflowState.items = workflowState.items.filter(function(entry){
    return entry.id !== itemId;
  });
  if(selectedWorkflowItemId === itemId){
    selectedWorkflowItemId = "";
  }
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Objeto eliminado del workflow.");
}

function duplicateWorkflowItem(itemId){
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item){
    return;
  }
  const clone = structuredClone(item);
  clone.id = item.type + "-" + Date.now();
  clone.x = item.x + 32;
  clone.y = item.y + 32;
  workflowState.items.push(clone);
  selectedWorkflowItemId = clone.id;
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Objeto duplicado.");
}

function groupWorkflowSelection(){
  const totalSelected = selectedWorkflowItemIds.length + selectedWorkflowConnectorIds.length;
  if(totalSelected < 2){
    updateWorkflowStatus("Selecciona al menos dos elementos para agrupar.");
    return;
  }
  const groupId = "group-" + Date.now();
  workflowState.items.forEach(function(item){
    if(selectedWorkflowItemIds.includes(item.id)){
      item.groupId = groupId;
    }
  });
  workflowState.connectors.forEach(function(connector){
    if(selectedWorkflowConnectorIds.includes(connector.id)){
      connector.groupId = groupId;
    }
  });
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Selección agrupada.");
}

function ungroupWorkflowSelection(){
  let changed = false;
  workflowState.items.forEach(function(item){
    if(selectedWorkflowItemIds.includes(item.id) && item.groupId){
      item.groupId = "";
      changed = true;
    }
  });
  workflowState.connectors.forEach(function(connector){
    if(selectedWorkflowConnectorIds.includes(connector.id) && connector.groupId){
      connector.groupId = "";
      changed = true;
    }
  });
  if(!changed){
    updateWorkflowStatus("La selección no pertenece a un grupo.");
    return;
  }
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Selección desagrupada.");
}

function deleteWorkflowConnector(connectorId){
  const connector = workflowState.connectors.find(function(entry){ return entry.id === connectorId; });
  if(!connector){
    return;
  }
  workflowState.connectors = workflowState.connectors.filter(function(entry){
    return entry.id !== connectorId;
  });
  if(selectedWorkflowConnectorId === connectorId){
    selectedWorkflowConnectorId = "";
  }
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Conector eliminado del workflow.");
}

function deleteWorkflowSelection(){
  if(!isEditingWorkflow || activeDrag){
    return;
  }
  const itemIdsToDelete = dedupeWorkflowIds(selectedWorkflowItemIds);
  const connectorIdsToDelete = dedupeWorkflowIds(selectedWorkflowConnectorIds.concat(
    workflowState.connectors.filter(function(connector){
      return itemIdsToDelete.includes(connector.from && connector.from.itemId)
        || itemIdsToDelete.includes(connector.to && connector.to.itemId);
    }).map(function(connector){
      return connector.id;
    })
  ));
  if(!itemIdsToDelete.length && !connectorIdsToDelete.length){
    return;
  }
  workflowState.items = workflowState.items.filter(function(item){
    return !itemIdsToDelete.includes(item.id);
  });
  workflowState.connectors = workflowState.connectors.filter(function(connector){
    return !connectorIdsToDelete.includes(connector.id);
  });
  clearWorkflowSelectionState();
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Selección eliminada del workflow.");
}

function toggleWorkflowTransformMenu(itemId){
  openWorkflowTransformMenuItemId = openWorkflowTransformMenuItemId === itemId ? "" : itemId;
  if(selectedWorkflowItemId !== itemId){
    selectedWorkflowItemId = itemId;
  }
  renderWorkflowCanvas();
}

function convertWorkflowItem(itemId, targetType){
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item || !targetType){
    return;
  }
  const currentType = getWorkflowTransformType(item);
  if(currentType === targetType){
    openWorkflowTransformMenuItemId = "";
    renderWorkflowCanvas();
    return;
  }
  const sourceText = item.kind ? htmlToPlainText(item.html || "") : String(item.title || "");
  const defaults = getDefaultWorkflowItem(targetType);
  item.type = targetType;
  item.width = defaults.width;
  item.height = defaults.height;
  item.fontSize = defaults.fontSize;
  item.borderColor = defaults.borderColor;
  item.backgroundColor = defaults.backgroundColor;
  item.textColor = defaults.textColor;
  if(targetType === "activity"){
    if(workflowId === "wf-cotizaciones"){
      item.kind = "flow-card";
      item.html = escapeHtml(sourceText || "Nueva actividad").replace(/\n/g, "<br>");
      item.badge = item.badge || getNextCotizacionesActivityBadge();
      item.badgeClass = item.badgeClass || "";
      item.step = item.step || "";
      item.width = 102;
      item.height = 54;
      item.fontSize = 12;
      item.borderColor = "#f3a454";
      item.backgroundColor = "#f7f2ed";
      item.textColor = "#30424d";
    }else{
      delete item.kind;
      delete item.html;
      delete item.badge;
      delete item.badgeClass;
      delete item.step;
      item.title = sourceText || "Nueva actividad";
    }
  }else if(targetType === "subactivity"){
    item.type = "activity";
    item.kind = "subactivity";
    item.html = escapeHtml(sourceText || "Consultas a las áreas").replace(/\n/g, "<br>");
    delete item.title;
    delete item.badge;
    delete item.badgeClass;
    delete item.step;
    item.width = 132;
    item.height = 26;
    item.fontSize = 10;
    item.borderColor = "transparent";
    item.backgroundColor = "transparent";
    item.textColor = "#30424d";
    delete item.labelOffsetX;
    delete item.labelOffsetY;
    delete item.labelWidth;
    delete item.labelHeight;
    delete item.iconVariant;
  }else if(targetType === "role"){
    item.type = "activity";
    item.kind = "actor";
    item.html = escapeHtml(sourceText || "Nuevo rol").replace(/\n/g, "<br>");
    delete item.title;
    delete item.badge;
    delete item.badgeClass;
    delete item.step;
    item.width = 150;
    item.height = 44;
    item.fontSize = 11;
    item.borderColor = "transparent";
    item.backgroundColor = "transparent";
    item.textColor = "#777";
    const actorLabelLayout = getDefaultActorLabelLayout();
    item.labelOffsetX = actorLabelLayout.labelOffsetX;
    item.labelOffsetY = actorLabelLayout.labelOffsetY;
    item.labelWidth = actorLabelLayout.labelWidth;
    item.labelHeight = actorLabelLayout.labelHeight;
  }else if(targetType === "process"){
    const processDefaults = getDefaultWorkflowItem("process");
    delete item.kind;
    delete item.html;
    delete item.badge;
    delete item.badgeClass;
    delete item.step;
    item.title = sourceText || "Nuevo proceso";
    item.width = processDefaults.width;
    item.height = processDefaults.height;
    item.fontSize = processDefaults.fontSize;
    item.borderColor = processDefaults.borderColor;
    item.backgroundColor = processDefaults.backgroundColor;
    item.textColor = processDefaults.textColor;
  }else if(targetType === "text"){
    delete item.kind;
    delete item.html;
    delete item.badge;
    delete item.badgeClass;
    delete item.step;
    item.title = sourceText || "Texto de apoyo";
  }else if(targetType === "decision"){
    delete item.kind;
    delete item.html;
    delete item.badge;
    delete item.badgeClass;
    delete item.step;
    item.title = sourceText || "Decisión";
  }else if(targetType === "entry" || targetType === "output"){
    delete item.kind;
    delete item.html;
    delete item.badge;
    delete item.badgeClass;
    delete item.step;
    item.title = sourceText || (targetType === "output" ? "Salida" : "Entrada");
    item.width = 16;
    item.height = 16;
    item.fontSize = 12;
    item.borderColor = "transparent";
    item.backgroundColor = "transparent";
    item.textColor = "#30424d";
    const labelLayout = getDefaultEntryLabelLayout();
    item.labelOffsetX = labelLayout.labelOffsetX;
    item.labelOffsetY = labelLayout.labelOffsetY;
    item.labelWidth = labelLayout.labelWidth;
    item.labelHeight = labelLayout.labelHeight;
  }else if(targetType === "icon"){
    delete item.kind;
    delete item.html;
    delete item.badge;
    delete item.badgeClass;
    delete item.step;
    item.title = sourceText && sourceText.length <= 3 ? sourceText : "★";
    item.iconVariant = "current";
    const labelLayout = getDefaultEntryLabelLayout();
    item.labelOffsetX = labelLayout.labelOffsetX;
    item.labelOffsetY = labelLayout.labelOffsetY;
    item.labelWidth = labelLayout.labelWidth;
    item.labelHeight = labelLayout.labelHeight;
  }
  if(targetType !== "subactivity" && targetType !== "role" && (!["activity", "subactivity", "role"].includes(targetType) || workflowId !== "wf-cotizaciones")){
    delete item.kind;
    delete item.html;
    delete item.badge;
    delete item.badgeClass;
    delete item.step;
    if(targetType === "activity"){
      item.title = sourceText || "Nueva actividad";
    }
  }
  openWorkflowTransformMenuItemId = "";
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Objeto convertido a " + getInspectorTypeLabel(targetType).toLowerCase() + ".");
}

function syncWorkflowItemControls(el, item){
  const existingToolbar = el.querySelector(".workflow-item-toolbar");
  if(existingToolbar){
    existingToolbar.remove();
  }
  const existingResizeHandle = el.querySelector(".workflow-resize-handle");
  if(existingResizeHandle){
    existingResizeHandle.remove();
  }
  if(!isEditingWorkflow || item.type === "connector"){
    return;
  }
  const toolbar = document.createElement("div");
  toolbar.className = "workflow-item-toolbar";
  if(hasWorkflowFloatingLabel(item.type)){
    const toolbarHeight = 35;
    const upperEdge = Math.min(0, item.labelOffsetY || 0);
    toolbar.style.top = Math.min(-54, upperEdge - toolbarHeight - 12) + "px";
  }else if(item.kind === "actor"){
    const toolbarHeight = 35;
    const upperEdge = Math.min(0, item.labelOffsetY || 0);
    toolbar.style.top = Math.min(-56, upperEdge - toolbarHeight - 18) + "px";
  }
  const convertButton = document.createElement("button");
  convertButton.type = "button";
  convertButton.className = "workflow-item-tool is-convert";
  convertButton.title = "Convertir objeto";
  convertButton.setAttribute("aria-label", "Convertir objeto");
  convertButton.innerHTML = WORKFLOW_TOOL_ICONS.convert;
  convertButton.addEventListener("pointerdown", function(event){
    event.stopPropagation();
  });
  convertButton.addEventListener("click", function(event){
    event.stopPropagation();
    toggleWorkflowTransformMenu(item.id);
  });
  toolbar.appendChild(convertButton);
  const connectButton = document.createElement("button");
  connectButton.type = "button";
  connectButton.className = "workflow-item-tool is-connect";
  connectButton.title = "Conectar";
  connectButton.setAttribute("aria-label", "Conectar");
  connectButton.innerHTML = WORKFLOW_TOOL_ICONS.connect;
  connectButton.addEventListener("pointerdown", function(event){
    startWorkflowConnectorCreate(event, item.id);
  });
  toolbar.appendChild(connectButton);
  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "workflow-item-tool is-edit";
  editButton.title = "Editar";
  editButton.setAttribute("aria-label", "Editar");
  editButton.innerHTML = WORKFLOW_TOOL_ICONS.edit;
  editButton.addEventListener("pointerdown", function(event){
    event.stopPropagation();
  });
  editButton.addEventListener("click", function(event){
    event.stopPropagation();
    editWorkflowItem(item.id);
  });
  toolbar.appendChild(editButton);
  const duplicateButton = document.createElement("button");
  duplicateButton.type = "button";
  duplicateButton.className = "workflow-item-tool is-duplicate";
  duplicateButton.title = "Duplicar";
  duplicateButton.setAttribute("aria-label", "Duplicar");
  duplicateButton.innerHTML = WORKFLOW_TOOL_ICONS.duplicate;
  duplicateButton.addEventListener("pointerdown", function(event){
    event.stopPropagation();
  });
  duplicateButton.addEventListener("click", function(event){
    event.stopPropagation();
    duplicateWorkflowItem(item.id);
  });
  toolbar.appendChild(duplicateButton);
  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "workflow-item-tool is-delete";
  deleteButton.title = "Eliminar";
  deleteButton.setAttribute("aria-label", "Eliminar");
  deleteButton.innerHTML = WORKFLOW_TOOL_ICONS.delete;
  deleteButton.addEventListener("pointerdown", function(event){
    event.stopPropagation();
  });
  deleteButton.addEventListener("click", function(event){
    event.stopPropagation();
    deleteWorkflowItem(item.id);
  });
  toolbar.appendChild(deleteButton);
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "workflow-item-tool is-close workflow-toolbar-close";
  closeButton.title = "Cerrar panel";
  closeButton.setAttribute("aria-label", "Cerrar panel");
  closeButton.innerHTML = WORKFLOW_TOOL_ICONS.close;
  closeButton.addEventListener("pointerdown", function(event){
    event.stopPropagation();
  });
  closeButton.addEventListener("click", function(event){
    event.stopPropagation();
    selectedWorkflowItemId = "";
    openWorkflowTransformMenuItemId = "";
    renderWorkflowCanvas();
    updateWorkflowStatus("Panel de funciones cerrado.");
  });
  toolbar.appendChild(closeButton);
  if(openWorkflowTransformMenuItemId === item.id){
    const menu = document.createElement("div");
    menu.className = "workflow-item-transform-menu";
    [
      { type: "activity", label: "Actividad" },
      { type: "process", label: "Proceso" },
      { type: "subactivity", label: "Subactividad" },
      { type: "role", label: "Rol" },
      { type: "entry", label: "Entrada" },
      { type: "output", label: "Salida" },
      { type: "decision", label: "Decisión" },
      { type: "text", label: "Texto" },
      { type: "icon", label: "Icono" }
    ].forEach(function(option){
      const optionButton = document.createElement("button");
      optionButton.type = "button";
      optionButton.className = "workflow-item-transform-option";
      optionButton.textContent = option.label;
      optionButton.disabled = (getWorkflowTransformType(item) === option.type);
      optionButton.addEventListener("pointerdown", function(event){
        event.stopPropagation();
      });
      optionButton.addEventListener("click", function(event){
        event.stopPropagation();
        convertWorkflowItem(item.id, option.type);
      });
      menu.appendChild(optionButton);
    });
    toolbar.appendChild(menu);
  }
  el.appendChild(toolbar);
  if(isWorkflowResizableItem(item) && item.id === selectedWorkflowItemId){
    const resizeHandle = document.createElement("button");
    resizeHandle.type = "button";
    resizeHandle.className = "workflow-resize-handle";
    resizeHandle.addEventListener("pointerdown", function(event){
      startWorkflowResize(event, item.id);
    });
    el.appendChild(resizeHandle);
  }
}

function renderWorkflowInspector(){
  const inspectorEl = document.getElementById("workflowInspector");
  if(!inspectorEl){
    return;
  }
  const item = getSelectedWorkflowItem();
  const connector = getSelectedWorkflowConnector();
  if(!isEditingWorkflow || (!isInspectorEditableItem(item) && !connector)){
    inspectorEl.innerHTML = '<div class="workflow-inspector-empty">Selecciona un objeto en modo edición para personalizarlo.</div>';
    return;
  }
  if(connector){
    inspectorEl.innerHTML = `
      <div class="workflow-inspector-header">
        <div>
          <h3 class="workflow-inspector-title">Personalizar conector</h3>
          <p class="workflow-inspector-subtitle">Flecha</p>
        </div>
        <button class="workflow-inspector-close" id="closeWorkflowInspectorButton" type="button">Cerrar</button>
      </div>
      <div class="workflow-inspector-color-row">
        <div class="workflow-inspector-color">
          <label for="workflowConnectorColor">Color de línea</label>
          <input id="workflowConnectorColor" type="color" value="${normalizeColorValue(connector.color || "#7d7d7d")}">
        </div>
      </div>
      <div class="workflow-inspector-group">
        <label for="workflowConnectorStroke">Grosor de línea</label>
        <input class="workflow-inspector-range" id="workflowConnectorStroke" type="range" min="1" max="6" step="0.5" value="${connector.strokeWidth || 2}">
        <input class="workflow-inspector-input" id="workflowConnectorStrokeValue" type="number" min="1" max="6" step="0.5" value="${connector.strokeWidth || 2}">
      </div>
      <div class="workflow-inspector-group">
        <label for="workflowConnectorLineStyle">Tipo de línea</label>
        <select class="workflow-inspector-input" id="workflowConnectorLineStyle">
          <option value="solid"${connector.dashed ? "" : " selected"}>Sólida</option>
          <option value="dashed"${connector.dashed ? " selected" : ""}>Punteada</option>
        </select>
      </div>
      <div class="workflow-inspector-group">
        <label for="workflowConnectorArrowMode">Sentido de flecha</label>
        <select class="workflow-inspector-input" id="workflowConnectorArrowMode">
          <option value="none"${normalizeWorkflowArrowMode(connector.arrow) === "none" ? " selected" : ""}>Sin flecha</option>
          <option value="end"${normalizeWorkflowArrowMode(connector.arrow) === "end" ? " selected" : ""}>Al final</option>
          <option value="start"${normalizeWorkflowArrowMode(connector.arrow) === "start" ? " selected" : ""}>Al inicio</option>
          <option value="both"${normalizeWorkflowArrowMode(connector.arrow) === "both" ? " selected" : ""}>En ambos sentidos</option>
        </select>
      </div>
      <div class="workflow-inspector-actions is-apply-row">
        <button class="workflow-inspector-button is-primary" id="applyWorkflowConnectorButton" type="button">Aplicar</button>
      </div>
    `;
    const colorEl = document.getElementById("workflowConnectorColor");
    const strokeEl = document.getElementById("workflowConnectorStroke");
    const strokeValueEl = document.getElementById("workflowConnectorStrokeValue");
    const lineStyleEl = document.getElementById("workflowConnectorLineStyle");
    const arrowModeEl = document.getElementById("workflowConnectorArrowMode");
    function applyConnectorDraft(live){
      const target = getSelectedWorkflowConnector();
      if(!target){
        return;
      }
      target.color = colorEl.value;
      target.strokeWidth = clamp(Number(strokeEl.value) || 2, 1, 6);
      target.dashed = lineStyleEl.value === "dashed";
      target.arrow = normalizeWorkflowArrowMode(arrowModeEl.value);
      saveWorkflowState();
      renderWorkflowCanvas();
      if(!live){
        updateWorkflowStatus("Cambios aplicados sobre el conector.");
      }
    }
    document.getElementById("closeWorkflowInspectorButton").addEventListener("click", function(){
      selectedWorkflowConnectorId = "";
      renderWorkflowCanvas();
      updateWorkflowStatus("Panel de personalización cerrado.");
    });
    colorEl.addEventListener("input", function(){ applyConnectorDraft(true); });
    strokeEl.addEventListener("input", function(){
      strokeValueEl.value = strokeEl.value;
      applyConnectorDraft(true);
    });
    strokeValueEl.addEventListener("change", function(){
      strokeEl.value = clamp(Number(strokeValueEl.value) || 2, 1, 6);
      strokeValueEl.value = strokeEl.value;
      applyConnectorDraft(true);
    });
    lineStyleEl.addEventListener("change", function(){ applyConnectorDraft(true); });
    arrowModeEl.addEventListener("change", function(){ applyConnectorDraft(true); });
    document.getElementById("applyWorkflowConnectorButton").addEventListener("click", function(){
      applyConnectorDraft(false);
    });
    return;
  }
  const minFontSize = 8;
  const maxFontSize = item.type === "icon" ? 40 : 32;
  const defaultBackgroundColor = item.backgroundColor || getDefaultWorkflowItem(item.type).backgroundColor;
  const initialBackgroundInputColor = normalizeColorValue(
    isTransparentColor(defaultBackgroundColor)
      ? getDefaultWorkflowItem("activity").backgroundColor
      : defaultBackgroundColor
  );
  const draft = {
    title: item.kind ? (item.html || "") : item.title,
    badge: item.badge || "",
    fontSize: item.fontSize || getDefaultWorkflowItem(item.type).fontSize,
    borderColor: normalizeColorValue(item.borderColor || getDefaultWorkflowItem(item.type).borderColor),
    backgroundColor: defaultBackgroundColor,
    backgroundColorInput: initialBackgroundInputColor,
    textColor: normalizeColorValue(item.textColor || getDefaultWorkflowItem(item.type).textColor),
    iconVariant: item.iconVariant || "current"
  };
  inspectorEl.innerHTML = `
    <div class="workflow-inspector-header">
      <div>
        <h3 class="workflow-inspector-title">Personalizar objeto</h3>
        <p class="workflow-inspector-subtitle">${escapeHtml(getInspectorTypeLabel(item.type))}</p>
      </div>
      <button class="workflow-inspector-close" id="closeWorkflowInspectorButton" type="button">Cerrar</button>
    </div>
    <div class="workflow-inspector-group">
      <label for="workflowObjectTitle">Contenido</label>
      <textarea class="workflow-inspector-input" id="workflowObjectTitle">${escapeHtml(draft.title)}</textarea>
    </div>
    ${item.type === "activity" ? `
    <div class="workflow-inspector-group">
      <label for="workflowObjectBadge">Numeral</label>
      <input class="workflow-inspector-input" id="workflowObjectBadge" type="text" value="${escapeHtml(draft.badge)}" placeholder="Ej. 1 o 1.1">
    </div>` : ""}
    ${item.type === "icon" ? `
    <div class="workflow-inspector-group">
      <label for="workflowIconVariant">Tipo de icono</label>
      <select class="workflow-inspector-input" id="workflowIconVariant">
        ${Object.keys(WORKFLOW_ICON_PRESETS).map(function(key){
          return `<option value="${key}"${draft.iconVariant === key ? " selected" : ""}>${WORKFLOW_ICON_PRESETS[key].label}</option>`;
        }).join("")}
      </select>
    </div>` : ""}
    <div class="workflow-inspector-group">
      <label for="workflowObjectFontSize">Tamaño del texto</label>
      <input class="workflow-inspector-range" id="workflowObjectFontSize" type="range" min="${minFontSize}" max="${maxFontSize}" step="1" value="${draft.fontSize}">
      <input class="workflow-inspector-input" id="workflowObjectFontSizeValue" type="number" min="${minFontSize}" max="${maxFontSize}" step="1" value="${draft.fontSize}">
    </div>
    ${canTransferWorkflowStyle(item) ? `
    <div class="workflow-inspector-actions">
      <button class="workflow-inspector-button" id="copyWorkflowStyleButton" type="button">Copiar estilo</button>
      <button class="workflow-inspector-button" id="pasteWorkflowStyleButton" type="button"${copiedWorkflowActivityStyle ? "" : " disabled"}>Pegar estilo</button>
    </div>` : ""}
    <div class="workflow-inspector-color-row">
      <div class="workflow-inspector-color">
        <label for="workflowObjectBorderColor">Color de borde</label>
        <input id="workflowObjectBorderColor" type="color" value="${draft.borderColor}">
      </div>
      <div class="workflow-inspector-color">
        <label for="workflowObjectBackgroundColor">Color de fondo</label>
        <input id="workflowObjectBackgroundColor" type="color" value="${draft.backgroundColorInput}"${isTransparentColor(draft.backgroundColor) ? " disabled" : ""}>
        <label class="workflow-inspector-check" for="workflowObjectBackgroundTransparent">
          <input id="workflowObjectBackgroundTransparent" type="checkbox"${isTransparentColor(draft.backgroundColor) ? " checked" : ""}>
          <span>Fondo transparente</span>
        </label>
      </div>
    </div>
    <div class="workflow-inspector-color-row">
      <div class="workflow-inspector-color">
        <label for="workflowObjectTextColor">Color del texto</label>
        <input id="workflowObjectTextColor" type="color" value="${draft.textColor}">
      </div>
    </div>
    ${isWorkflowResizableItem(item) ? `
    <div class="workflow-inspector-metrics">
      <div class="workflow-inspector-metric"><strong>Ancho</strong><span id="workflowObjectWidthValue">${Math.round(item.width)} px</span></div>
      <div class="workflow-inspector-metric"><strong>Alto</strong><span id="workflowObjectHeightValue">${Math.round(item.height)} px</span></div>
    </div>` : ""}
    <div class="workflow-inspector-actions is-apply-row">
      <button class="workflow-inspector-button is-primary" id="applyWorkflowInspectorButton" type="button">Aplicar</button>
    </div>
  `;
  const titleEl = document.getElementById("workflowObjectTitle");
  const badgeEl = document.getElementById("workflowObjectBadge");
  const rangeEl = document.getElementById("workflowObjectFontSize");
  const valueEl = document.getElementById("workflowObjectFontSizeValue");
  const borderColorEl = document.getElementById("workflowObjectBorderColor");
  const backgroundColorEl = document.getElementById("workflowObjectBackgroundColor");
  const backgroundTransparentEl = document.getElementById("workflowObjectBackgroundTransparent");
  const textColorEl = document.getElementById("workflowObjectTextColor");
  const iconVariantEl = document.getElementById("workflowIconVariant");
  const applyButton = document.getElementById("applyWorkflowInspectorButton");
  function applyInspectorDraft(live){
    mutateSelectedWorkflowItem(function(target){
      if(target.kind){
        target.html = draft.title;
      }else{
        target.title = draft.title;
      }
      if(target.type === "activity"){
        target.badge = draft.badge;
      }
      target.fontSize = draft.fontSize;
      target.borderColor = draft.borderColor;
      target.backgroundColor = draft.backgroundColor;
      target.textColor = draft.textColor;
      target.iconVariant = draft.iconVariant;
    });
    if(!live){
      updateWorkflowStatus("Cambios aplicados sobre el objeto.");
    }
  }
  document.getElementById("closeWorkflowInspectorButton").addEventListener("click", function(){
    selectedWorkflowItemId = "";
    openWorkflowTransformMenuItemId = "";
    renderWorkflowCanvas();
    updateWorkflowStatus("Panel de personalización cerrado.");
  });
  titleEl.addEventListener("input", function(){
    draft.title = titleEl.value;
    applyInspectorDraft(true);
  });
  if(badgeEl){
    badgeEl.addEventListener("input", function(){
      draft.badge = badgeEl.value.trim();
      applyInspectorDraft(true);
    });
  }
  rangeEl.addEventListener("input", function(){
    valueEl.value = rangeEl.value;
    draft.fontSize = clamp(Number(rangeEl.value) || getDefaultWorkflowItem(item.type).fontSize, Number(rangeEl.min), Number(rangeEl.max));
    applyInspectorDraft(true);
  });
  valueEl.addEventListener("change", function(){
    const nextValue = clamp(Number(valueEl.value) || getDefaultWorkflowItem(item.type).fontSize, Number(rangeEl.min), Number(rangeEl.max));
    rangeEl.value = nextValue;
    valueEl.value = nextValue;
    draft.fontSize = nextValue;
    applyInspectorDraft(true);
  });
  borderColorEl.addEventListener("input", function(){
    draft.borderColor = borderColorEl.value;
    applyInspectorDraft(true);
  });
  backgroundColorEl.addEventListener("input", function(){
    draft.backgroundColorInput = backgroundColorEl.value;
    draft.backgroundColor = backgroundColorEl.value;
    applyInspectorDraft(true);
  });
  if(backgroundTransparentEl){
    backgroundTransparentEl.addEventListener("change", function(){
      if(backgroundTransparentEl.checked){
        draft.backgroundColor = "transparent";
        backgroundColorEl.disabled = true;
      }else{
        draft.backgroundColor = draft.backgroundColorInput || initialBackgroundInputColor;
        backgroundColorEl.disabled = false;
      }
      applyInspectorDraft(true);
    });
  }
  textColorEl.addEventListener("input", function(){
    draft.textColor = textColorEl.value;
    applyInspectorDraft(true);
  });
  if(iconVariantEl){
    iconVariantEl.addEventListener("change", function(){
      draft.iconVariant = iconVariantEl.value;
      applyInspectorDraft(true);
    });
  }
  applyButton.addEventListener("click", function(){
    applyInspectorDraft(false);
  });
  const copyStyleButton = document.getElementById("copyWorkflowStyleButton");
  const pasteStyleButton = document.getElementById("pasteWorkflowStyleButton");
  if(copyStyleButton){
    copyStyleButton.addEventListener("click", function(){
      copiedWorkflowActivityStyle = buildWorkflowActivityStyleSnapshot(item);
      renderWorkflowInspector();
      updateWorkflowStatus("Estilo de actividad copiado.");
    });
  }
  if(pasteStyleButton){
    pasteStyleButton.addEventListener("click", function(){
      if(!copiedWorkflowActivityStyle){
        return;
      }
      draft.fontSize = copiedWorkflowActivityStyle.fontSize;
      draft.borderColor = normalizeColorValue(copiedWorkflowActivityStyle.borderColor || draft.borderColor);
      draft.backgroundColor = copiedWorkflowActivityStyle.backgroundColor || draft.backgroundColor;
      draft.backgroundColorInput = normalizeColorValue(
        isTransparentColor(draft.backgroundColor)
          ? initialBackgroundInputColor
          : draft.backgroundColor
      );
      draft.textColor = normalizeColorValue(copiedWorkflowActivityStyle.textColor || draft.textColor);
      rangeEl.value = draft.fontSize;
      valueEl.value = draft.fontSize;
      borderColorEl.value = draft.borderColor;
      backgroundColorEl.value = draft.backgroundColorInput;
      backgroundColorEl.disabled = isTransparentColor(draft.backgroundColor);
      if(backgroundTransparentEl){
        backgroundTransparentEl.checked = isTransparentColor(draft.backgroundColor);
      }
      textColorEl.value = draft.textColor;
      mutateSelectedWorkflowItem(function(target){
        applyWorkflowActivityStyleSnapshot(target, copiedWorkflowActivityStyle);
      });
      updateWorkflowStatus("Estilo aplicado sobre el objeto seleccionado.");
    });
  }
}

function mutateSelectedWorkflowItem(mutator){
  const item = getSelectedWorkflowItem();
  if(!item){
    return;
  }
  mutator(item);
  saveWorkflowState();
  applySelectedWorkflowItemPreview(item);
}

function getInspectorTypeLabel(type){
  if(type === "process"){
    return "Proceso";
  }
  if(type === "subactivity"){
    return "Subactividad";
  }
  if(type === "role"){
    return "Rol";
  }
  if(type === "text"){
    return "Texto";
  }
  if(type === "entry"){
    return "Entrada";
  }
  if(type === "output"){
    return "Salida";
  }
  if(type === "decision"){
    return "Punto de decisión";
  }
  if(type === "icon"){
    return "Icono";
  }
  return "Actividad";
}

function applySelectedWorkflowItemPreview(item){
  const el = document.querySelector('[data-item-id="' + item.id + '"]');
  if(el){
    el.style.left = item.x + "px";
    el.style.top = item.y + "px";
    if(item.kind === "actor"){
      const actorWidth = getWorkflowActorMaxWidth(item);
      el.style.width = "fit-content";
      el.style.maxWidth = actorWidth + "px";
      el.style.height = "auto";
      el.style.minHeight = item.height + "px";
    }else{
      el.style.width = item.width + "px";
      el.style.height = item.height + "px";
    }
    el.style.color = getThemedWorkflowColorToken(item.textColor || getDefaultWorkflowItem(item.type).textColor, getWorkflowTextColorRole(item, "node-text"));
    if(item.type === "process"){
      el.style.setProperty("--workflow-process-stroke", getThemedWorkflowColorToken(item.borderColor || getDefaultWorkflowItem("process").borderColor, "process-stroke"));
    }
    if(item.kind){
      if(item.kind === "actor"){
        el.innerHTML = buildWorkflowActorMarkup(item);
        const actorLabelShell = el.querySelector(".workflow-actor-label-shell");
        const actorLabelResize = el.querySelector(".workflow-entry-label-resize");
        if(actorLabelShell && isEditingWorkflow && item.id === selectedWorkflowItemId){
          actorLabelShell.addEventListener("pointerdown", function(event){
            startWorkflowActorLabelDrag(event, item.id);
          });
        }
        if(actorLabelResize){
          actorLabelResize.addEventListener("pointerdown", function(event){
            startWorkflowEntryLabelResize(event, item.id);
          });
        }
      }else if(item.kind === "flow-card"){
        el.style.borderColor = getThemedWorkflowColorToken(item.borderColor || getDefaultWorkflowItem("activity").borderColor, "node-border");
        el.style.background = getThemedWorkflowColorToken(item.backgroundColor || getDefaultWorkflowItem("activity").backgroundColor, "node-fill");
        el.style.fontSize = (item.fontSize || getDefaultWorkflowItem("activity").fontSize) + "px";
        el.style.color = getThemedWorkflowColorToken(item.textColor || getDefaultWorkflowItem("activity").textColor, getWorkflowTextColorRole(item, "node-text"));
        el.innerHTML = `${item.badge ? `<div class="badge${item.badgeClass ? " " + item.badgeClass : ""}">${escapeHtml(item.badge)}</div>` : ""}<div class="canvas-item-flow-content">${item.html || ""}</div>`;
      }else if(item.kind === "tag"){
        el.style.color = getThemedWorkflowColorToken(item.textColor || "#eb7a07", "accent-text");
        el.innerHTML = `<span class="tag-icon">${getCotizacionesSystemIcon(item.html)}</span><span class="tag-label">${escapeHtml(String(item.html || ""))}</span>`;
      }else if(item.kind === "dashed-box"){
        el.innerHTML = buildWorkflowDashedBoxMarkup(item.html);
      }else{
        el.style.color = getThemedWorkflowColorToken(item.textColor || getDefaultWorkflowItem("text").textColor, item.kind === "note" ? "accent-text" : "node-text");
        el.innerHTML = `${item.html || ""}`;
      }
      syncWorkflowItemControls(el, item);
    }else{
      el.style.fontSize = (item.fontSize || getDefaultWorkflowItem(item.type).fontSize) + "px";
      el.style.borderColor = getThemedWorkflowColorToken(item.borderColor || getDefaultWorkflowItem(item.type).borderColor, item.type === "process" ? "process-stroke" : "node-border");
      el.style.background = getThemedWorkflowColorToken(item.backgroundColor || getDefaultWorkflowItem(item.type).backgroundColor, item.type === "process" ? "process-fill" : "node-fill");
      el.style.color = getThemedWorkflowColorToken(item.textColor || getDefaultWorkflowItem(item.type).textColor, getWorkflowTextColorRole(item, "node-text"));
      const labelEl = el.querySelector(".workflow-item-label");
      const labelShellEl = el.querySelector(".workflow-entry-label-shell");
      if(labelShellEl && hasWorkflowFloatingLabel(item.type)){
        labelShellEl.style.left = item.labelOffsetX + "px";
        labelShellEl.style.top = item.labelOffsetY + "px";
        labelShellEl.style.width = item.labelWidth + "px";
        labelShellEl.style.height = item.labelHeight + "px";
      }
      if(item.type === "icon"){
        el.innerHTML = `<div class="workflow-icon-glyph">${getWorkflowIconPreset(item.iconVariant).markup}</div><div class="workflow-entry-label-shell workflow-icon-label-shell" style="left:${item.labelOffsetX}px;top:${item.labelOffsetY}px;width:${item.labelWidth}px;height:${item.labelHeight}px"><span class="workflow-item-label">${escapeHtml(item.title || "").replace(/\n/g, "<br>")}</span>${item.id === selectedWorkflowItemId && isEditingWorkflow ? '<button type="button" class="workflow-entry-label-resize"></button>' : ""}</div>`;
        const iconLabelShell = el.querySelector(".workflow-icon-label-shell");
        const iconLabelResize = el.querySelector(".workflow-entry-label-resize");
        if(iconLabelResize){
          iconLabelResize.addEventListener("pointerdown", function(event){
            startWorkflowEntryLabelResize(event, item.id);
          });
        }
        if(iconLabelShell){
          iconLabelShell.addEventListener("pointerdown", function(event){
            startWorkflowEntryLabelDrag(event, item.id);
          });
        }
      }
      if(labelEl){
        labelEl.innerHTML = escapeHtml(item.title).replace(/\n/g, "<br>");
      }
      syncWorkflowItemControls(el, item);
    }
  }
  const widthEl = document.getElementById("workflowObjectWidthValue");
  const heightEl = document.getElementById("workflowObjectHeightValue");
  if(widthEl){
    widthEl.textContent = Math.round(item.width) + " px";
  }
  if(heightEl){
    heightEl.textContent = Math.round(item.height) + " px";
  }
}

function normalizeColorValue(value){
  const normalized = String(value || "").trim().toLowerCase();
  if(/^#([0-9a-f]{3}|[0-9a-f]{6})$/.test(normalized)){
    return normalized.length === 4
      ? "#" + normalized.slice(1).split("").map(function(char){ return char + char; }).join("")
      : normalized;
  }
  return "#ffffff";
}

function isTransparentColor(value){
  return String(value || "").trim().toLowerCase() === "transparent";
}

function buildWorkflowActivityStyleSnapshot(item){
  const snapshot = {
    width: item.width,
    height: item.height,
    fontSize: item.fontSize,
    borderColor: item.borderColor,
    backgroundColor: item.backgroundColor,
    textColor: item.textColor
  };
  if(hasWorkflowFloatingLabel(item.type)){
    snapshot.labelOffsetX = item.labelOffsetX;
    snapshot.labelOffsetY = item.labelOffsetY;
    snapshot.labelWidth = item.labelWidth;
    snapshot.labelHeight = item.labelHeight;
  }
  return snapshot;
}

function applyWorkflowActivityStyleSnapshot(target, snapshot){
  target.width = snapshot.width;
  target.height = snapshot.height;
  target.fontSize = snapshot.fontSize;
  target.borderColor = snapshot.borderColor;
  target.backgroundColor = snapshot.backgroundColor;
  target.textColor = snapshot.textColor;
  if(hasWorkflowFloatingLabel(target.type)){
    target.labelOffsetX = Number.isFinite(snapshot.labelOffsetX) ? snapshot.labelOffsetX : target.labelOffsetX;
    target.labelOffsetY = Number.isFinite(snapshot.labelOffsetY) ? snapshot.labelOffsetY : target.labelOffsetY;
    target.labelWidth = Number.isFinite(snapshot.labelWidth) ? snapshot.labelWidth : target.labelWidth;
    target.labelHeight = Number.isFinite(snapshot.labelHeight) ? snapshot.labelHeight : target.labelHeight;
  }
}

function startWorkflowDrag(event){
  if(!isEditingWorkflow){
    return;
  }
  if(event.button === 2){
    return;
  }
  const itemId = event.currentTarget.dataset.itemId;
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item){
    return;
  }
  if(event.target.closest(".workflow-item-toolbar, .workflow-item-tool, .workflow-resize-handle, .workflow-entry-label-shell, .workflow-entry-label-resize")){
    return;
  }
  event.preventDefault();
  const selection = isWorkflowItemSelected(itemId)
    ? { itemIds: selectedWorkflowItemIds.slice(), connectorIds: selectedWorkflowConnectorIds.slice() }
    : getWorkflowSelectionForItem(itemId);
  if(selection.itemIds.length + selection.connectorIds.length > 1){
    setWorkflowSelectionState(selection.itemIds, selection.connectorIds, "", "");
    activeDrag = {
      mode: "selection-move",
      startX: event.clientX,
      startY: event.clientY,
      itemOrigins: selection.itemIds.map(function(id){
        const entry = getWorkflowItemById(id);
        return entry ? { id: id, x: entry.x, y: entry.y } : null;
      }).filter(Boolean),
      connectorOrigins: selection.connectorIds.map(function(id){
        const entry = workflowState.connectors.find(function(connector){ return connector.id === id; });
        return entry ? {
          id: id,
          x1: entry.x1,
          y1: entry.y1,
          x2: entry.x2,
          y2: entry.y2,
          via: (entry.via || []).map(function(point){ return { x: point.x, y: point.y }; })
        } : null;
      }).filter(Boolean)
    };
  }else{
    setWorkflowSelectionState([itemId], [], itemId, "");
    activeDrag = {
      mode: "item",
      id: itemId,
      startX: event.clientX,
      startY: event.clientY,
      originX: item.x,
      originY: item.y
    };
  }
  event.currentTarget.classList.add("is-dragging");
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
}

function startWorkflowEntryLabelDrag(event, itemId){
  if(!isEditingWorkflow || event.target.closest(".workflow-entry-label-resize")){
    return;
  }
  if(event.button === 2){
    return;
  }
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item || !hasWorkflowFloatingLabel(item.type)){
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  selectedWorkflowItemId = itemId;
  activeDrag = {
    mode: "entry-label-move",
    id: itemId,
    startX: event.clientX,
    startY: event.clientY,
    originLabelOffsetX: item.labelOffsetX,
    originLabelOffsetY: item.labelOffsetY
  };
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
}

function startWorkflowSelectionBox(event){
  if(!isEditingWorkflow || event.button !== 0){
    return;
  }
  if(event.target !== event.currentTarget){
    return;
  }
  const pointer = getWorkflowPointer(event);
  event.preventDefault();
  clearWorkflowSelectionState();
  activeWorkflowSelectionBox = {
    startX: pointer.x,
    startY: pointer.y,
    currentX: pointer.x,
    currentY: pointer.y
  };
  activeDrag = {
    mode: "selection-marquee",
    startX: event.clientX,
    startY: event.clientY
  };
  renderWorkflowCanvas();
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
}

function startWorkflowActorLabelDrag(event, itemId){
  if(!isEditingWorkflow){
    return;
  }
  if(event.button === 2){
    return;
  }
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item || item.kind !== "actor"){
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  selectedWorkflowItemId = itemId;
  activeDrag = {
    mode: "actor-label-move",
    id: itemId,
    startX: event.clientX,
    startY: event.clientY,
    originLabelOffsetX: Number(item.labelOffsetX) || 0,
    originLabelOffsetY: Number(item.labelOffsetY) || 0
  };
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
}

function startWorkflowEntryLabelResize(event, itemId){
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item || !(hasWorkflowFloatingLabel(item.type) || item.kind === "actor")){
    return;
  }
  if(event.button === 2){
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if(typeof event.currentTarget.setPointerCapture === "function"){
    try{
      event.currentTarget.setPointerCapture(event.pointerId);
    }catch(error){
    }
  }
  selectedWorkflowItemId = itemId;
  activeDrag = {
    mode: "entry-label-resize",
    id: itemId,
    pointerId: event.pointerId,
    pointerTarget: event.currentTarget,
    startX: event.clientX,
    startY: event.clientY,
    originLabelWidth: item.labelWidth,
    originLabelHeight: item.labelHeight
  };
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
}

function startWorkflowResize(event, itemId){
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item){
    return;
  }
  if(event.button === 2){
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if(typeof event.currentTarget.setPointerCapture === "function"){
    try{
      event.currentTarget.setPointerCapture(event.pointerId);
    }catch(error){
    }
  }
  selectedWorkflowItemId = itemId;
  activeDrag = {
    mode: "item-resize",
    id: itemId,
    pointerId: event.pointerId,
    pointerTarget: event.currentTarget,
    startX: event.clientX,
    startY: event.clientY,
    originWidth: item.width,
    originHeight: item.height
  };
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
}

function startWorkflowConnectorCreate(event, itemId){
  const item = getWorkflowItemById(itemId);
  if(!isEditingWorkflow || !item || event.button === 2){
    return;
  }
  const pointer = getWorkflowPointer(event);
  event.preventDefault();
  event.stopPropagation();
  if(typeof event.currentTarget.setPointerCapture === "function"){
    try{
      event.currentTarget.setPointerCapture(event.pointerId);
    }catch(error){
    }
  }
  selectedWorkflowItemId = itemId;
  selectedWorkflowConnectorId = "";
  openWorkflowTransformMenuItemId = "";
  activeWorkflowAnchorPreview = null;
  activeDrag = {
    mode: "connector-create",
    sourceItemId: itemId,
    pointerId: event.pointerId,
    pointerTarget: event.currentTarget,
    currentX: pointer.x,
    currentY: pointer.y
  };
  renderWorkflowCanvas();
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
  updateWorkflowStatus("Arrastra hacia otro objeto para crear el conector.");
}

function onWorkflowPointerMove(event){
  if(!activeDrag){
    return;
  }
  if(activeDrag.mode === "canvas-pan"){
    const shellEl = document.getElementById("workflowCanvasShell");
    if(!shellEl){
      return;
    }
    shellEl.scrollLeft = activeDrag.originScrollLeft - (event.clientX - activeDrag.startX);
    shellEl.scrollTop = activeDrag.originScrollTop - (event.clientY - activeDrag.startY);
    return;
  }
  if(activeDrag.mode === "selection-marquee"){
    const pointer = getWorkflowPointer(event);
    activeWorkflowSelectionBox = Object.assign({}, activeWorkflowSelectionBox || {}, {
      currentX: pointer.x,
      currentY: pointer.y
    });
    renderWorkflowCanvas();
    return;
  }
  if(activeDrag.mode === "connector-create"){
    const pointer = getWorkflowPointer(event);
    activeDrag.currentX = pointer.x;
    activeDrag.currentY = pointer.y;
    const nearest = getNearestWorkflowAnchorTarget(pointer, { excludeItemId: activeDrag.sourceItemId });
    activeWorkflowAnchorPreview = nearest && nearest.distance <= 32 ? nearest : null;
    renderWorkflowCanvas();
    return;
  }
  const bounds = getCanvasBounds();
  const deltaX = (event.clientX - activeDrag.startX) / workflowZoom;
  const deltaY = (event.clientY - activeDrag.startY) / workflowZoom;
  let shouldRender = false;
  if(activeDrag.mode === "item"){
    const item = workflowState.items.find(function(entry){ return entry.id === activeDrag.id; });
    if(!item){
      return;
    }
    item.x = clamp(activeDrag.originX + deltaX, 20, bounds.width - item.width - 20);
    item.y = clamp(activeDrag.originY + deltaY, 20, bounds.height - item.height - 20);
    if(workflowItemHasAnchoredConnectors(item.id)){
      shouldRender = true;
    }else{
      applySelectedWorkflowItemPreview(item);
    }
  }else if(activeDrag.mode === "selection-move"){
    activeDrag.itemOrigins.forEach(function(origin){
      const item = getWorkflowItemById(origin.id);
      if(!item){
        return;
      }
      item.x = clamp(origin.x + deltaX, 20, bounds.width - item.width - 20);
      item.y = clamp(origin.y + deltaY, 20, bounds.height - item.height - 20);
    });
    activeDrag.connectorOrigins.forEach(function(origin){
      const connector = workflowState.connectors.find(function(entry){ return entry.id === origin.id; });
      if(!connector){
        return;
      }
      connector.x1 = clamp(origin.x1 + deltaX, 20, bounds.width - 20);
      connector.y1 = clamp(origin.y1 + deltaY, 20, bounds.height - 20);
      connector.x2 = clamp(origin.x2 + deltaX, 20, bounds.width - 20);
      connector.y2 = clamp(origin.y2 + deltaY, 20, bounds.height - 20);
      connector.via = origin.via.map(function(point){
        return {
          x: clamp(point.x + deltaX, 20, bounds.width - 20),
          y: clamp(point.y + deltaY, 20, bounds.height - 20)
        };
      });
    });
    shouldRender = true;
  }else if(activeDrag.mode === "entry-label-move"){
    const item = workflowState.items.find(function(entry){ return entry.id === activeDrag.id; });
    if(!item){
      return;
    }
    item.labelOffsetX = clamp(activeDrag.originLabelOffsetX + deltaX, -400, 400);
    item.labelOffsetY = clamp(activeDrag.originLabelOffsetY + deltaY, -300, 300);
    applySelectedWorkflowItemPreview(item);
  }else if(activeDrag.mode === "actor-label-move"){
    const item = workflowState.items.find(function(entry){ return entry.id === activeDrag.id; });
    if(!item){
      return;
    }
    item.labelOffsetX = clamp(activeDrag.originLabelOffsetX + deltaX, -180, 180);
    item.labelOffsetY = clamp(activeDrag.originLabelOffsetY + deltaY, -120, 180);
    applySelectedWorkflowItemPreview(item);
  }else if(activeDrag.mode === "entry-label-resize"){
    const item = workflowState.items.find(function(entry){ return entry.id === activeDrag.id; });
    if(!item){
      return;
    }
    item.labelWidth = clamp(activeDrag.originLabelWidth + deltaX, 24, 320);
    item.labelHeight = clamp(activeDrag.originLabelHeight + deltaY, 16, 160);
    applySelectedWorkflowItemPreview(item);
  }else if(activeDrag.mode === "item-resize"){
    const item = workflowState.items.find(function(entry){ return entry.id === activeDrag.id; });
    if(!item){
      return;
    }
    if(item.type === "decision"){
      const nextSide = clamp(Math.max(activeDrag.originWidth + deltaX, activeDrag.originHeight + deltaY), 24, Math.min(bounds.width - item.x, bounds.height - item.y));
      item.width = nextSide;
      item.height = nextSide;
    }else{
      item.width = clamp(activeDrag.originWidth + deltaX, 24, bounds.width - item.x);
      item.height = clamp(activeDrag.originHeight + deltaY, 24, bounds.height - item.y);
    }
    applySelectedWorkflowItemPreview(item);
  }else if(activeDrag.mode === "connector-move"){
    const connector = workflowState.connectors.find(function(entry){ return entry.id === activeDrag.id; });
    if(!connector){
      return;
    }
    connector.x1 = clamp(activeDrag.originX1 + deltaX, 20, bounds.width - 20);
    connector.y1 = clamp(activeDrag.originY1 + deltaY, 20, bounds.height - 20);
    connector.x2 = clamp(activeDrag.originX2 + deltaX, 20, bounds.width - 20);
    connector.y2 = clamp(activeDrag.originY2 + deltaY, 20, bounds.height - 20);
    shouldRender = true;
  }else if(activeDrag.mode === "connector-end"){
    const connector = workflowState.connectors.find(function(entry){ return entry.id === activeDrag.id; });
    if(!connector){
      return;
    }
    const nextPoint = {
      x: clamp(activeDrag.originX + deltaX, 20, bounds.width - 20),
      y: clamp(activeDrag.originY + deltaY, 20, bounds.height - 20)
    };
    const nearest = getNearestWorkflowAnchorTarget(nextPoint);
    if(nearest && nearest.distance <= 28){
      activeWorkflowAnchorPreview = nearest;
      setWorkflowConnectorEndpointAnchor(connector, activeDrag.endpoint, {
        itemId: nearest.itemId,
        side: nearest.side
      });
    }else{
      activeWorkflowAnchorPreview = null;
      clearWorkflowConnectorEndpointAnchor(connector, activeDrag.endpoint, nextPoint);
    }
    shouldRender = true;
  }else if(activeDrag.mode === "connector-bend"){
    const connector = workflowState.connectors.find(function(entry){ return entry.id === activeDrag.id; });
    if(!connector){
      return;
    }
    const pointer = getWorkflowPointer(event);
    const nextPoints = moveWorkflowConnectorSegment(
      Array.isArray(activeDrag.originalPoints) ? activeDrag.originalPoints : getWorkflowEditableConnectorPoints(connector),
      activeDrag.segmentIndex,
      activeDrag.orientation,
      pointer
    );
    connector.via = nextPoints.slice(1, -1).map(function(point){
      return { x: point.x, y: point.y };
    });
    shouldRender = true;
  }
  if(shouldRender){
    renderWorkflowCanvas();
  }
}

function onWorkflowPointerUp(){
  if(!activeDrag){
    return;
  }
  if(activeDrag.mode === "selection-marquee"){
    const rect = normalizeWorkflowSelectionRect(activeWorkflowSelectionBox || {});
    if(rect.width > 4 || rect.height > 4){
      const itemIds = workflowState.items.filter(function(item){
        return doesWorkflowRectIntersectBounds(rect, getWorkflowItemBounds(item));
      }).map(function(item){
        return item.id;
      });
      const connectorIds = workflowState.connectors.filter(function(connector){
        return doesWorkflowRectIntersectBounds(rect, getWorkflowConnectorSelectionBounds(connector));
      }).map(function(connector){
        return connector.id;
      });
      setWorkflowSelectionState(itemIds, connectorIds, "", "");
      suppressWorkflowViewportClick = true;
      updateWorkflowStatus((itemIds.length + connectorIds.length) ? "Selección múltiple creada." : "No se encontraron elementos en el área.");
    }else{
      clearWorkflowSelectionState();
    }
    activeWorkflowSelectionBox = null;
  }
  if(activeDrag.mode === "connector-create"){
    const sourceItem = getWorkflowItemById(activeDrag.sourceItemId);
    const targetAnchor = activeWorkflowAnchorPreview;
    if(sourceItem && targetAnchor && targetAnchor.itemId !== sourceItem.id){
      const targetPoint = { x: targetAnchor.anchorX, y: targetAnchor.anchorY };
      const sourceSide = getWorkflowConnectionSide(sourceItem, targetPoint);
      const startPoint = getWorkflowAnchorPointForItem(sourceItem, sourceSide);
      const connectorId = "connector-" + Date.now();
      workflowState.connectors.push({
        id: connectorId,
        x1: startPoint.x,
        y1: startPoint.y,
        x2: targetPoint.x,
        y2: targetPoint.y,
        from: {
          itemId: sourceItem.id,
          side: sourceSide
        },
        to: {
          itemId: targetAnchor.itemId,
          side: targetAnchor.side
        },
        via: [],
        color: "#7d7d7d",
        strokeWidth: 2
      });
      selectedWorkflowConnectorId = "";
      selectedWorkflowItemId = sourceItem.id;
      updateWorkflowStatus("Conector creado entre objetos.");
    }else{
      if(sourceItem){
        selectedWorkflowItemId = sourceItem.id;
        selectedWorkflowConnectorId = "";
      }
      updateWorkflowStatus("Conexión cancelada. Acerca el cursor a otro objeto para anclar.");
    }
  }
  if(activeDrag.pointerTarget && typeof activeDrag.pointerTarget.releasePointerCapture === "function" && typeof activeDrag.pointerId !== "undefined"){
    try{
      activeDrag.pointerTarget.releasePointerCapture(activeDrag.pointerId);
    }catch(error){
    }
  }
  activeDrag = null;
  activeWorkflowAnchorPreview = null;
  isWorkflowPanning = false;
  window.removeEventListener("pointermove", onWorkflowPointerMove);
  window.removeEventListener("pointerup", onWorkflowPointerUp);
  saveWorkflowState();
  renderWorkflowCanvas();
}

function startWorkflowCanvasPan(event){
  if(!isEditingWorkflow || event.button !== 2){
    return;
  }
  const shellEl = document.getElementById("workflowCanvasShell");
  if(!shellEl){
    return;
  }
  event.preventDefault();
  isWorkflowPanning = true;
  activeDrag = {
    mode: "canvas-pan",
    startX: event.clientX,
    startY: event.clientY,
    originScrollLeft: shellEl.scrollLeft,
    originScrollTop: shellEl.scrollTop
  };
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
}

function toggleWorkflowMode(){
  isEditingWorkflow = !isEditingWorkflow;
  workflowState = loadWorkflowState({ preferLocalStorage: shouldLoadWorkflowDraft() });
  workflowLastSavedSnapshot = JSON.stringify(workflowState);
  workflowUndoStack = [];
  workflowRedoStack = [];
  activeWorkflowSelectionBox = null;
  activeWorkflowAnchorPreview = null;
  activeDrag = null;
  selectedWorkflowItemIds = [];
  selectedWorkflowConnectorIds = [];
  if(!isEditingWorkflow){
    openWorkflowTransformMenuItemId = "";
    selectedWorkflowConnectorId = "";
  }
  if(isEditingWorkflow && !workflowState.items.some(function(item){ return item.id === selectedWorkflowItemId; })){
    selectedWorkflowItemId = workflowState.items[0] ? workflowState.items[0].id : "";
  }
  if(!isEditingWorkflow){
    selectedWorkflowItemId = "";
  }
  renderWorkflowCanvas();
  updateWorkflowStatus(isEditingWorkflow ? "Modo edición activo. Puedes arrastrar elementos y agregar actividad, conector, texto o icono." : "Vista en modo publicación.");
}

function setWorkflowStateSource(nextSource){
  const normalized = nextSource === "storage" ? "storage" : "json";
  if(workflowStateSource === normalized){
    renderWorkflowCanvas();
    return;
  }
  workflowStateSource = normalized;
  saveWorkflowStateSource();
  workflowState = loadWorkflowState({ preferLocalStorage: shouldLoadWorkflowDraft() });
  workflowLastSavedSnapshot = JSON.stringify(workflowState);
  workflowUndoStack = [];
  workflowRedoStack = [];
  clearWorkflowSelectionState();
  activeWorkflowSelectionBox = null;
  activeWorkflowAnchorPreview = null;
  activeDrag = null;
  selectedWorkflowItemId = isEditingWorkflow && workflowState.items[0] ? workflowState.items[0].id : "";
  selectedWorkflowConnectorId = "";
  renderWorkflowCanvas();
  updateWorkflowStatus("Workflow cargado desde " + getWorkflowStateOriginLabel(workflowLastResolvedStateOrigin) + ".");
}

async function copyWorkflowLayoutToClipboard(){
  const serialized = JSON.stringify(workflowState, null, 2);
  try{
    await navigator.clipboard.writeText(serialized);
    updateWorkflowStatus("JSON del workflow copiado al portapapeles.");
  }catch(error){
    updateWorkflowStatus("No se pudo copiar el JSON. El navegador bloqueó el portapapeles.");
  }
}

function exportWorkflowLayoutToJson(){
  const serialized = JSON.stringify(workflowState, null, 2);
  const safeToken = String(workflowToken || "workflow")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "workflow";
  const blob = new Blob([serialized], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = safeToken + ".export.json";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(function(){
    URL.revokeObjectURL(url);
  }, 0);
  updateWorkflowStatus("Workflow exportado a JSON.");
}

function resetWorkflow(){
  if(workflowStateSource === "json"){
    workflowState = getDefaultWorkflowStateSnapshot();
    workflowLastSavedSnapshot = JSON.stringify(workflowState);
    workflowUndoStack = [];
    workflowRedoStack = [];
    clearWorkflowSelectionState();
    activeWorkflowSelectionBox = null;
    activeWorkflowAnchorPreview = null;
    activeDrag = null;
    renderWorkflowCanvas();
    updateWorkflowStatus("Workflow restablecido desde " + getWorkflowStateOriginLabel(workflowLastResolvedStateOrigin) + ".");
    return;
  }
  workflowState = loadWorkflowBaseState();
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Workflow restablecido a la base guardada.");
}

function saveCurrentWorkflowAsBase(){
  saveWorkflowBaseState();
  updateWorkflowStatus("Base del workflow guardada. Restablecer volvera a este punto.");
}

function applyWorkflowSnapshot(snapshot){
  workflowState = JSON.parse(snapshot);
  workflowLastSavedSnapshot = snapshot;
  clearWorkflowSelectionState();
  activeWorkflowSelectionBox = null;
  activeWorkflowAnchorPreview = null;
  activeDrag = null;
  window.localStorage.setItem(getActiveWorkflowLayoutStorageKey(), snapshot);
  renderWorkflowCanvas();
}

function undoWorkflow(){
  if(!workflowUndoStack.length){
    updateWorkflowStatus("No hay acciones para deshacer.");
    return;
  }
  const currentSnapshot = JSON.stringify(workflowState);
  const previousSnapshot = workflowUndoStack.pop();
  workflowRedoStack.push(currentSnapshot);
  applyWorkflowSnapshot(previousSnapshot);
  updateWorkflowStatus("Se deshizo la última acción.");
}

function redoWorkflow(){
  if(!workflowRedoStack.length){
    updateWorkflowStatus("No hay acciones para rehacer.");
    return;
  }
  const currentSnapshot = JSON.stringify(workflowState);
  const nextSnapshot = workflowRedoStack.pop();
  workflowUndoStack.push(currentSnapshot);
  applyWorkflowSnapshot(nextSnapshot);
  updateWorkflowStatus("Se rehizo la última acción.");
}

function getViewportCenter(){
  const shellEl = document.getElementById("workflowCanvasShell");
  const bounds = getCanvasBounds();
  if(!shellEl){
    return { x: 120, y: 120 };
  }
  const x = isEditingWorkflow ? ((shellEl.scrollLeft + shellEl.clientWidth / 2) / workflowZoom) : (bounds.width / 2);
  const y = isEditingWorkflow ? ((shellEl.scrollTop + shellEl.clientHeight / 2) / workflowZoom) : (bounds.height / 2);
  return { x, y };
}

function getNextCotizacionesActivityBadge(){
  const numericBadges = workflowState.items
    .filter(function(item){
      return item.kind === "flow-card" && item.badge && /^\d+$/.test(String(item.badge).trim());
    })
    .map(function(item){
      return Number(item.badge);
    });
  if(!numericBadges.length){
    return "1";
  }
  return String(Math.max.apply(null, numericBadges) + 1);
}

function addWorkflowActivity(){
  const center = getViewportCenter();
  if(workflowId === "wf-cotizaciones"){
    workflowState.items.push({
      id: "step-" + Date.now(),
      type: "activity",
      kind: "flow-card",
      html: "Nueva actividad",
      badge: getNextCotizacionesActivityBadge(),
      badgeClass: "",
      step: "",
      x: Math.max(20, center.x - 51),
      y: Math.max(20, center.y - 27),
      width: 102,
      height: 54,
      fontSize: 12,
      borderColor: "#f3a454",
      backgroundColor: "#f7f2ed"
    });
    saveWorkflowState();
    renderWorkflowCanvas();
    updateWorkflowStatus("Actividad de cotizaciones agregada al workflow.");
    return;
  }
  workflowState.items.push({
    id: "activity-" + Date.now(),
    type: "activity",
    title: "Nueva actividad",
    x: Math.max(20, center.x - 130),
    y: Math.max(20, center.y - 44),
    width: 260,
    height: 88
  });
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Actividad agregada al workflow.");
}

function addWorkflowText(){
  const center = getViewportCenter();
  workflowState.items.push({
    id: "text-" + Date.now(),
    type: "text",
    title: "Texto de apoyo",
    x: Math.max(20, center.x - 70),
    y: Math.max(20, center.y - 18),
    width: 200,
    height: 40
  });
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Texto agregado al workflow.");
}

function addWorkflowEntry(){
  const center = getViewportCenter();
  const labelLayout = getDefaultEntryLabelLayout();
  workflowState.items.push({
    id: "entry-" + Date.now(),
    type: "entry",
    title: "Entrada",
    x: Math.max(20, center.x - 8),
    y: Math.max(20, center.y - 8),
    width: 16,
    height: 16,
    fontSize: 12,
    labelOffsetX: labelLayout.labelOffsetX,
    labelOffsetY: labelLayout.labelOffsetY,
    labelWidth: labelLayout.labelWidth,
    labelHeight: labelLayout.labelHeight
  });
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Entrada agregada al workflow.");
}

function addWorkflowOutput(){
  const center = getViewportCenter();
  const labelLayout = getDefaultEntryLabelLayout();
  workflowState.items.push({
    id: "output-" + Date.now(),
    type: "output",
    title: "Salida",
    x: Math.max(20, center.x - 8),
    y: Math.max(20, center.y - 8),
    width: 16,
    height: 16,
    fontSize: 12,
    labelOffsetX: labelLayout.labelOffsetX,
    labelOffsetY: labelLayout.labelOffsetY,
    labelWidth: labelLayout.labelWidth,
    labelHeight: labelLayout.labelHeight
  });
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Salida agregada al workflow.");
}

function addWorkflowDecision(){
  const center = getViewportCenter();
  workflowState.items.push({
    id: "decision-" + Date.now(),
    type: "decision",
    title: "?",
    x: Math.max(20, center.x - 12),
    y: Math.max(20, center.y - 12),
    width: 24,
    height: 24,
    fontSize: 12
  });
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Punto de decisión agregado al workflow.");
}

function addWorkflowIcon(){
  const center = getViewportCenter();
  const labelLayout = getDefaultEntryLabelLayout();
  workflowState.items.push({
    id: "icon-" + Date.now(),
    type: "icon",
    title: "",
    iconVariant: "current",
    x: Math.max(20, center.x - 16),
    y: Math.max(20, center.y - 16),
    width: 32,
    height: 32,
    labelOffsetX: labelLayout.labelOffsetX,
    labelOffsetY: labelLayout.labelOffsetY,
    labelWidth: labelLayout.labelWidth,
    labelHeight: labelLayout.labelHeight
  });
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Icono agregado al workflow.");
}

function addWorkflowConnector(){
  const center = getViewportCenter();
  workflowState.connectors.push({
    id: "connector-" + Date.now(),
    x1: Math.max(20, center.x - 90),
    y1: Math.max(20, center.y),
    x2: Math.max(40, center.x + 90),
    y2: Math.max(20, center.y),
    from: null,
    to: null,
    via: [],
    color: "#7d7d7d",
    strokeWidth: 2
  });
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Conector agregado al workflow.");
}

function startWorkflowConnectorDrag(event){
  if(!isEditingWorkflow){
    return;
  }
  if(event.button === 2){
    return;
  }
  const connectorId = event.currentTarget.dataset.connectorId;
  const connector = workflowState.connectors.find(function(entry){ return entry.id === connectorId; });
  if(!connector){
    return;
  }
  const startPoint = getWorkflowConnectorEndpointPoint(connector, "start");
  const endPoint = getWorkflowConnectorEndpointPoint(connector, "end");
  event.preventDefault();
  event.stopPropagation();
  activeWorkflowAnchorPreview = null;
  const selection = isWorkflowConnectorSelected(connectorId)
    ? { itemIds: selectedWorkflowItemIds.slice(), connectorIds: selectedWorkflowConnectorIds.slice() }
    : getWorkflowSelectionForConnector(connectorId);
  if(selection.itemIds.length + selection.connectorIds.length > 1){
    setWorkflowSelectionState(selection.itemIds, selection.connectorIds, "", "");
    activeDrag = {
      mode: "selection-move",
      startX: event.clientX,
      startY: event.clientY,
      itemOrigins: selection.itemIds.map(function(id){
        const entry = getWorkflowItemById(id);
        return entry ? { id: id, x: entry.x, y: entry.y } : null;
      }).filter(Boolean),
      connectorOrigins: selection.connectorIds.map(function(id){
        const entry = workflowState.connectors.find(function(connectorEntry){ return connectorEntry.id === id; });
        if(!entry){
          return null;
        }
        const entryStart = getWorkflowConnectorEndpointPoint(entry, "start");
        const entryEnd = getWorkflowConnectorEndpointPoint(entry, "end");
        return {
          id: id,
          x1: entryStart.x,
          y1: entryStart.y,
          x2: entryEnd.x,
          y2: entryEnd.y,
          via: (entry.via || []).map(function(point){ return { x: point.x, y: point.y }; })
        };
      }).filter(Boolean)
    };
  }else{
    setWorkflowSelectionState([], [connectorId], "", connectorId);
    openWorkflowConnectorToolbarId = "";
    connector.from = null;
    connector.to = null;
    connector.x1 = startPoint.x;
    connector.y1 = startPoint.y;
    connector.x2 = endPoint.x;
    connector.y2 = endPoint.y;
    activeDrag = {
      mode: "connector-move",
      id: connectorId,
      startX: event.clientX,
      startY: event.clientY,
      originX1: startPoint.x,
      originY1: startPoint.y,
      originX2: endPoint.x,
      originY2: endPoint.y
    };
  }
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
}

function startWorkflowConnectorHandleDrag(event){
  if(!isEditingWorkflow){
    return;
  }
  if(event.button === 2){
    return;
  }
  const connectorId = event.currentTarget.dataset.connectorId;
  const endpoint = event.currentTarget.dataset.endpoint;
  const connector = workflowState.connectors.find(function(entry){ return entry.id === connectorId; });
  if(!connector){
    return;
  }
  const point = getWorkflowConnectorEndpointPoint(connector, endpoint);
  event.preventDefault();
  event.stopPropagation();
  activeWorkflowAnchorPreview = null;
  selectedWorkflowConnectorId = connectorId;
  openWorkflowConnectorToolbarId = "";
  selectedWorkflowItemId = "";
  activeDrag = {
    mode: "connector-end",
    id: connectorId,
    endpoint: endpoint,
    startX: event.clientX,
    startY: event.clientY,
    originX: point.x,
    originY: point.y
  };
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
}

function startWorkflowConnectorBendDrag(event){
  if(!isEditingWorkflow || event.button === 2){
    return;
  }
  const connectorId = event.currentTarget.dataset.connectorId;
  const segmentIndex = Number(event.currentTarget.dataset.segmentIndex);
  const orientation = event.currentTarget.dataset.orientation;
  const connector = workflowState.connectors.find(function(entry){ return entry.id === connectorId; });
  if(!connector || !Number.isFinite(segmentIndex) || !orientation){
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  selectedWorkflowConnectorId = connectorId;
  openWorkflowConnectorToolbarId = "";
  selectedWorkflowItemId = "";
  activeDrag = {
    mode: "connector-bend",
    id: connectorId,
    segmentIndex: segmentIndex,
    orientation: orientation,
    originalPoints: getWorkflowEditableConnectorPoints(connector)
  };
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
  updateWorkflowStatus("Arrastra el handle para mover el tramo del conector.");
}

function setWorkflowZoom(nextZoom){
  workflowZoom = clamp(Math.round(nextZoom * 100) / 100, ZOOM_MIN, ZOOM_MAX);
  saveWorkflowZoom();
  renderWorkflowCanvas();
}

function zoomWorkflowIn(){
  setWorkflowZoom(workflowZoom + ZOOM_STEP);
}

function zoomWorkflowOut(){
  setWorkflowZoom(workflowZoom - ZOOM_STEP);
}

function resetWorkflowZoom(){
  setWorkflowZoom(1);
}

function isWorkflowTypingTarget(target){
  if(!target || !(target instanceof Element)){
    return false;
  }
  return Boolean(target.closest("input, textarea, select, [contenteditable=\"true\"]"));
}

function nudgeSelectedWorkflowItem(event){
  if(!isEditingWorkflow || activeDrag || !selectedWorkflowItemId || isWorkflowTypingTarget(event.target)){
    return;
  }
  const movementByKey = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 }
  };
  const movement = movementByKey[event.key];
  if(!movement){
    return;
  }
  const item = getSelectedWorkflowItem();
  if(!item){
    return;
  }
  const step = event.shiftKey ? 10 : 1;
  const bounds = getCanvasBounds();
  item.x = clamp(item.x + (movement.x * step), 20, bounds.width - item.width - 20);
  item.y = clamp(item.y + (movement.y * step), 20, bounds.height - item.height - 20);
  event.preventDefault();
  saveWorkflowState();
  if(workflowItemHasAnchoredConnectors(item.id)){
    renderWorkflowCanvas();
  }else{
    applySelectedWorkflowItemPreview(item);
  }
  updateWorkflowStatus("Objeto movido con teclado.");
}

function handleWorkflowKeyboardShortcuts(event){
  if(isWorkflowTypingTarget(event.target)){
    return;
  }
  if((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z"){
    event.preventDefault();
    undoWorkflow();
    return;
  }
  if(((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") || ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "z")){
    event.preventDefault();
    redoWorkflow();
    return;
  }
  if(!isEditingWorkflow || activeDrag){
    return;
  }
  if(event.key === "Delete" || event.key === "Backspace"){
    event.preventDefault();
    deleteWorkflowSelection();
  }
}

async function toggleWorkflowFullscreen(){
  const target = document.getElementById("workflowFullscreenTarget");
  if(!target){
    return;
  }
  try{
    if(document.fullscreenElement === target){
      await document.exitFullscreen();
      updateWorkflowStatus("Vista normal restaurada.");
    }else{
      await target.requestFullscreen();
      updateWorkflowStatus("Canvas en pantalla completa.");
    }
    renderWorkflowCanvas();
  }catch(error){
    updateWorkflowStatus("No se pudo cambiar a pantalla completa.");
  }
}

document.getElementById("toggleWorkflowModeButton").addEventListener("click", toggleWorkflowMode);
document.getElementById("floatingWorkflowEditModeButton").addEventListener("click", toggleWorkflowMode);
document.getElementById("workflowPaletteOrangeButton").addEventListener("click", function(){
  setWorkflowPalette("orange");
});
document.getElementById("workflowPaletteBlueButton").addEventListener("click", function(){
  setWorkflowPalette("blue");
});
document.getElementById("workflowSourceJsonButton").addEventListener("click", function(){
  setWorkflowStateSource("json");
});
document.getElementById("workflowSourceStorageButton").addEventListener("click", function(){
  setWorkflowStateSource("storage");
});
document.getElementById("undoWorkflowButton").addEventListener("click", undoWorkflow);
document.getElementById("redoWorkflowButton").addEventListener("click", redoWorkflow);
document.getElementById("copyWorkflowLayoutButton").addEventListener("click", copyWorkflowLayoutToClipboard);
document.getElementById("exportWorkflowLayoutButton").addEventListener("click", exportWorkflowLayoutToJson);
document.getElementById("saveWorkflowBaseButton").addEventListener("click", saveCurrentWorkflowAsBase);
document.getElementById("resetWorkflowButton").addEventListener("click", resetWorkflow);
document.getElementById("workflowZoomInButton").addEventListener("click", zoomWorkflowIn);
document.getElementById("workflowZoomOutButton").addEventListener("click", zoomWorkflowOut);
document.getElementById("workflowZoomResetButton").addEventListener("click", resetWorkflowZoom);
document.getElementById("workflowFullscreenButton").addEventListener("click", toggleWorkflowFullscreen);
document.getElementById("addWorkflowActivityButton").addEventListener("click", addWorkflowActivity);
document.getElementById("addWorkflowConnectorButton").addEventListener("click", addWorkflowConnector);
document.getElementById("addWorkflowDecisionButton").addEventListener("click", addWorkflowDecision);
document.getElementById("addWorkflowEntryButton").addEventListener("click", addWorkflowEntry);
document.getElementById("addWorkflowOutputButton").addEventListener("click", addWorkflowOutput);
document.getElementById("addWorkflowTextButton").addEventListener("click", addWorkflowText);
document.getElementById("addWorkflowIconButton").addEventListener("click", addWorkflowIcon);
document.getElementById("groupWorkflowSelectionButton").addEventListener("click", groupWorkflowSelection);
document.getElementById("ungroupWorkflowSelectionButton").addEventListener("click", ungroupWorkflowSelection);
document.getElementById("workflowCanvasShell").addEventListener("pointerdown", startWorkflowCanvasPan);
document.getElementById("workflowPublicationPanel").addEventListener("click", closeWorkflowPublicationPanel);
document.getElementById("closeWorkflowPublicationPanelButton").addEventListener("click", closeWorkflowPublicationPanel);
document.getElementById("workflowPublicationContent").addEventListener("click", function(event){
  const link = event.target.closest(".doc-link");
  if(link){
    event.preventDefault();
  }
});
document.getElementById("workflowCanvasShell").addEventListener("contextmenu", function(event){
  if(isEditingWorkflow){
    event.preventDefault();
  }
});
document.addEventListener("keydown", nudgeSelectedWorkflowItem);
document.addEventListener("keydown", handleWorkflowKeyboardShortcuts);
document.addEventListener("fullscreenchange", renderWorkflowCanvas);
applyWorkflowPalette();
renderWorkflowCanvas();
updateWorkflowStatus("Vista en modo publicación.");

