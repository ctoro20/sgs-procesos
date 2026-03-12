
const PROCESS_DETAILS_STORAGE_KEY = "conemi-process-details-v1";
const ITEM_DETAILS_STORAGE_KEY = "conemi-item-details-v1";
const WORKFLOW_CATALOG_STORAGE_KEY = "conemi-workflow-catalog-v1";
const WORKFLOW_LAYOUT_STORAGE_KEY_PREFIX = "conemi-workflow-layout-v1:";
const params = new URLSearchParams(window.location.search);
const processId = params.get("process") || "";
const itemId = params.get("item") || "";
const workflowId = params.get("workflow") || "";
const COTIZACIONES_WORKFLOW_URL = "workflow.html?workflow=wf-cotizaciones";
const WORKFLOW_TOOL_ICONS = {
  edit: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 11.8 11.9 3a1.4 1.4 0 0 1 2 2L5 13.8 2.5 14.5z"></path><path d="m10.8 4.1 1.1 1.1"></path></svg>',
  delete: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.3 3.3h5.4"></path><path d="M6.2 3.3V2.5h3.6v.8"></path><path d="M4.4 4.6 5 13.2c.1.7.6 1.3 1.4 1.3h3.2c.8 0 1.3-.6 1.4-1.3l.6-8.6"></path><path d="M6.7 6.3v5.1"></path><path d="M9.3 6.3v5.1"></path></svg>',
  convert: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 5.2h7.5"></path><path d="m8.3 2.7 2.5 2.5-2.5 2.5"></path><path d="M13 10.8H5.5"></path><path d="m7.7 8.3-2.5 2.5 2.5 2.5"></path></svg>',
  duplicate: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5.5" y="5.5" width="7" height="7" rx="1.5"></rect><path d="M3.5 10.5h-.2A1.3 1.3 0 0 1 2 9.2V3.3A1.3 1.3 0 0 1 3.3 2h5.9a1.3 1.3 0 0 1 1.3 1.3v.2"></path></svg>'
};
const PROCESS_TREE = [
  { areaId: "A", areaLabel: "Comercial", nodes: [{ id: "P1", label: "Cotizaciones", href: COTIZACIONES_WORKFLOW_URL }] },
  { areaId: "B", areaLabel: "Operaciones", nodes: [{ id: "P2", label: "Planificación" }, { id: "P3", label: "Ejecución Servicios en Terreno" }, { id: "P4", label: "Integración con Laboratorios" }] },
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
  if(!workflowId){
    return null;
  }
  try{
    const raw = window.localStorage.getItem(WORKFLOW_CATALOG_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return (Array.isArray(parsed) ? parsed : []).find(function(entry){
      return entry.id === workflowId;
    }) || null;
  }catch(error){
    return null;
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
    }) || "";
  }catch(error){
    return "";
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
  return { width: 260, height: 88, fontSize: 18, borderColor: "#d9c1a3", backgroundColor: "#f7f2ed", textColor: "#30424d" };
}

function isInspectorEditableItem(item){
  return Boolean(item && (item.type === "activity" || item.kind === "flow-card" || item.type === "text" || item.type === "icon" || item.type === "decision" || item.type === "entry" || item.type === "output"));
}

function isWorkflowResizableItem(item){
  return Boolean(item && (item.type === "activity" || item.type === "decision" || item.type === "text" || item.type === "icon"));
}

function canTransferWorkflowStyle(item){
  return Boolean(item && (item.type === "activity" || item.type === "entry" || item.type === "output" || item.type === "text" || item.type === "icon"));
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

function getWorkflowIconPreset(variant){
  return WORKFLOW_ICON_PRESETS[variant] || WORKFLOW_ICON_PRESETS.current;
}

function createCotizacionesWorkflowState(){
  return {
    items: [
      { id:"label-1", kind:"label", html:"Necesidad del<br>Cliente", x:12, y:120, width:90, height:32 },
      { id:"actor-1", kind:"actor", html:"Ejecutivo<br>Comercial", x:124, y:30, width:150, height:44 },
      { id:"step-1", kind:"flow-card", html:"Recepcionar<br>Requerimiento", badge:"1", step:"1", x:128, y:92, width:102, height:54 },
      { id:"mini-1", kind:"mini-icon", html:"Llamado telefónico", x:142, y:145, width:104, height:18 },
      { id:"mini-2", kind:"mini-icon", html:"Email", x:142, y:168, width:72, height:18 },
      { id:"mini-3", kind:"mini-icon", html:"Portal Licitaciones", x:142, y:191, width:110, height:18 },
      { id:"mini-4", kind:"mini-icon", html:"Documentos<br>de soporte", x:264, y:90, width:92, height:28 },
      { id:"decision-label-1", kind:"decision-label", html:"¿Requerimiento<br>corresponde a Licitación?", x:389, y:74, width:110, height:30 },
      { id:"decision-1", kind:"decision", x:424, y:101, width:18, height:18 },
      { id:"decision-label-2", kind:"decision-label", html:"Si", x:405, y:138, width:50, height:18 },
      { id:"decision-label-3", kind:"decision-label", html:"No", x:470, y:105, width:44, height:18 },
      { id:"actor-2", kind:"actor", html:"Ejecutivo<br>Comercial", x:301, y:204, width:150, height:44 },
      { id:"step-1-1", kind:"flow-card", html:"Validar Técnica y<br>Operativamente", badge:"1.1", badgeClass:"small", step:"1.1", x:387, y:182, width:102, height:54 },
      { id:"soft-1", kind:"soft-icon", html:"Consultas a las áreas", x:382, y:278, width:118, height:18 },
      { id:"dash-1", kind:"dashed-box", html:"Laboratorios/ETFA<br>Permisología<br>Inspectores/Otros<br>Equipos/Insumos<br>Logística", x:225, y:313, width:145, height:112 },
      { id:"soft-2", kind:"soft-icon", html:"Operaciones", x:486, y:266, width:82, height:18 },
      { id:"soft-3", kind:"soft-icon", html:"Técnicas", x:486, y:286, width:82, height:18 },
      { id:"soft-4", kind:"soft-icon", html:"Entrega de la información", x:391, y:377, width:108, height:18 },
      { id:"soft-5", kind:"soft-icon", html:"Jefe<br>Operaciones", x:505, y:332, width:92, height:28 },
      { id:"soft-6", kind:"soft-icon", html:"Jefe Técnico", x:505, y:362, width:92, height:28 },
      { id:"actor-3", kind:"actor", html:"Ejecutivo<br>Comercial", x:542, y:32, width:150, height:44 },
      { id:"step-2", kind:"flow-card", html:"Elaborar<br>Cotización", badge:"2", step:"2", x:575, y:92, width:102, height:54 },
      { id:"tag-1", kind:"tag", html:"Qcotizador", x:671, y:116, width:74, height:18 },
      { id:"tag-2", kind:"tag", html:"QETFA", x:683, y:136, width:54, height:18 },
      { id:"note-1", kind:"note", html:"Se adjunta archivo de costeo y se especifican los servicios ETFA, el sistema realiza la validación.", x:620, y:145, width:165, height:54 },
      { id:"actor-4", kind:"actor", html:"Gerente de Desarrollo de<br>Negocios", x:738, y:26, width:180, height:44 },
      { id:"step-3", kind:"flow-card", html:"Aprobar<br>Cotización", badge:"3", step:"3", x:742, y:92, width:102, height:54 },
      { id:"tag-3", kind:"tag", html:"Qcotizador", x:796, y:136, width:74, height:18 },
      { id:"decision-label-4", kind:"decision-label", html:"¿Se aprueba la<br>Cotización?", x:866, y:74, width:110, height:30 },
      { id:"decision-2", kind:"decision", x:906, y:101, width:18, height:18 },
      { id:"decision-label-5", kind:"decision-label", html:"No", x:892, y:138, width:46, height:18 },
      { id:"decision-label-6", kind:"decision-label", html:"Si", x:964, y:105, width:44, height:18 },
      { id:"mini-5", kind:"mini-icon", html:"Corregir", x:866, y:182, width:92, height:18 },
      { id:"mini-6", kind:"mini-icon", html:"Solicitar<br>Correcciones", x:900, y:202, width:85, height:28 },
      { id:"mini-7", kind:"mini-icon", html:"Email", x:970, y:205, width:70, height:18 },
      { id:"mini-8", kind:"mini-icon", html:"Cotización<br>Aprobada", x:1044, y:90, width:82, height:28 },
      { id:"actor-5", kind:"actor", html:"Ejecutivo<br>Comercial", x:1115, y:30, width:150, height:44 },
      { id:"step-4", kind:"flow-card", html:"Notificar al<br>Cliente", badge:"4", step:"4", x:1148, y:92, width:102, height:54 },
      { id:"tag-4", kind:"tag", html:"Qcotizador", x:1254, y:116, width:74, height:18 },
      { id:"note-2", kind:"note", html:"Se realiza correo personalizado al Cliente.", x:1201, y:147, width:155, height:36 },
      { id:"mini-9", kind:"mini-icon", html:"Cotización<br>Enviada", x:1146, y:196, width:108, height:28 },
      { id:"mini-10", kind:"mini-icon", html:"Email", x:1220, y:208, width:54, height:18 },
      { id:"actor-6", kind:"actor", html:"Ejecutivo<br>Comercial", x:1244, y:275, width:150, height:44 },
      { id:"step-5", kind:"flow-card", html:"Realizar seguimiento", badge:"5", step:"5", x:1148, y:286, width:102, height:54 },
      { id:"note-3", kind:"note", html:"Al tercer día si no se obtiene respuesta aún.", x:1200, y:349, width:180, height:36 },
      { id:"actor-7", kind:"actor", html:"Ejecutivo<br>Comercial", x:1244, y:381, width:150, height:44 },
      { id:"step-6", kind:"flow-card", html:"Realizar Negociación", badge:"6", step:"6", x:1148, y:389, width:102, height:54 },
      { id:"note-4", kind:"note", html:"Ajustar precios, plazos y condiciones según las necesidades del cliente.", x:1200, y:452, width:192, height:44 },
      { id:"decision-label-7", kind:"decision-label", html:"¿Cotización<br>aceptada?", x:1088, y:543, width:95, height:28 },
      { id:"decision-3", kind:"decision", x:1191, y:545, width:18, height:18 },
      { id:"decision-label-8", kind:"decision-label", html:"Si", x:1178, y:584, width:45, height:18 },
      { id:"decision-label-9", kind:"decision-label", html:"No", x:1247, y:548, width:44, height:18 },
      { id:"actor-8", kind:"actor", html:"Ejecutivo<br>Comercial", x:1294, y:493, width:150, height:44 },
      { id:"step-6-1", kind:"flow-card", html:"Rechazar Cotización", badge:"6.1", badgeClass:"small", step:"6.1", x:1282, y:535, width:102, height:54 },
      { id:"tag-5", kind:"tag", html:"Qcotizador", x:1357, y:576, width:74, height:18 },
      { id:"end-1", kind:"end-dot", x:1468, y:548, width:14, height:14 },
      { id:"label-2", kind:"label", html:"Cotización<br>Rechazada", x:1428, y:566, width:92, height:28 },
      { id:"decision-label-10", kind:"decision-label", html:"¿Cotización de<br>Cliente prospecto?", x:1080, y:640, width:110, height:30 },
      { id:"decision-4", kind:"decision", x:1191, y:645, width:18, height:18 },
      { id:"decision-label-11", kind:"decision-label", html:"No", x:1177, y:684, width:45, height:18 },
      { id:"decision-label-12", kind:"decision-label", html:"Si", x:1246, y:648, width:44, height:18 },
      { id:"boss-1", kind:"flow-card", html:"Creación de<br>Cliente en<br>BOSS", x:1304, y:626, width:92, height:62 },
      { id:"note-5", kind:"note", html:"Se debe tener el cliente creado en BOSS para aceptar la cotización en sistema.", x:1348, y:684, width:160, height:44 },
      { id:"actor-9", kind:"actor", html:"Ejecutivo<br>Comercial", x:1046, y:698, width:150, height:44 },
      { id:"step-6-2", kind:"flow-card", html:"Aceptar Cotización", badge:"6.2", badgeClass:"small", step:"6.2", x:1148, y:718, width:102, height:54 },
      { id:"tag-6", kind:"tag", html:"Qcotizador", x:1201, y:759, width:74, height:18 },
      { id:"actor-10", kind:"actor", html:"Ejecutivo<br>Comercial", x:1257, y:798, width:150, height:44 },
      { id:"step-7", kind:"flow-card", html:"Crear o Actualizar<br>OL", badge:"7", step:"7", x:1148, y:816, width:102, height:54 },
      { id:"tag-7", kind:"tag", html:"Qcotizador", x:1201, y:857, width:74, height:18 },
      { id:"end-2", kind:"end-dot", x:1193, y:889, width:14, height:14 },
      { id:"label-3", kind:"label", html:"OL creada o<br>actualizada", x:1142, y:907, width:118, height:28 }
    ],
    connectors: [
      { id:"line-1", x1:54, y1:110, x2:125, y2:110 },
      { id:"line-2", x1:222, y1:110, x2:262, y2:110 },
      { id:"line-3", x1:334, y1:110, x2:415, y2:110 },
      { id:"line-4", x1:433, y1:120, x2:433, y2:180 },
      { id:"line-5", x1:442, y1:110, x2:575, y2:110 },
      { id:"line-6", x1:659, y1:110, x2:742, y2:110 },
      { id:"line-7", x1:842, y1:110, x2:922, y2:110 },
      { id:"line-8", x1:940, y1:110, x2:1038, y2:110 },
      { id:"line-9", x1:1124, y1:110, x2:1162, y2:110 },
      { id:"line-10", x1:1200, y1:148, x2:1200, y2:195 },
      { id:"line-11", x1:1200, y1:232, x2:1200, y2:286 },
      { id:"line-12", x1:1200, y1:322, x2:1200, y2:389 },
      { id:"line-13", x1:1200, y1:425, x2:1200, y2:553 },
      { id:"line-14", x1:1200, y1:589, x2:1200, y2:652 },
      { id:"line-15", x1:1200, y1:688, x2:1200, y2:736 },
      { id:"line-16", x1:1200, y1:773, x2:1200, y2:816 },
      { id:"line-17", x1:1209, y1:553, x2:1282, y2:553 },
      { id:"line-18", x1:1302, y1:553, x2:1470, y2:553 },
      { id:"line-19", x1:1209, y1:652, x2:1292, y2:652 },
      { id:"line-20", x1:1388, y1:652, x2:1440, y2:652 },
      { id:"line-21", x1:1440, y1:652, x2:1440, y2:726 },
      { id:"line-22", x1:1440, y1:726, x2:1289, y2:726 },
      { id:"line-23", x1:1209, y1:736, x2:1146, y2:736 },
      { id:"line-24", x1:1270, y1:736, x2:1282, y2:736 },
      { id:"line-25", x1:540, y1:220, x2:540, y2:418 },
      { id:"line-26", x1:435, y1:220, x2:435, y2:360 },
      { id:"line-27", x1:438, y1:398, x2:438, y2:420 },
      { id:"line-28", x1:438, y1:420, x2:540, y2:420 },
      { id:"line-29", x1:540, y1:420, x2:540, y2:148 },
      { id:"line-30", x1:915, y1:120, x2:915, y2:175 }
    ]
  };
}

function getInitialWorkflowState(){
  if(workflowId === "wf-cotizaciones"){
    return createCotizacionesWorkflowState();
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

const defaultWorkflowState = getInitialWorkflowState();
let workflowState = loadWorkflowState();
let isEditingWorkflow = false;
let activeDrag = null;
let workflowZoom = loadWorkflowZoom();
let selectedWorkflowItemId = workflowState.items[0] ? workflowState.items[0].id : "";
let selectedWorkflowConnectorId = "";
let copiedWorkflowActivityStyle = null;
let openWorkflowTransformMenuItemId = "";
let isWorkflowPanning = false;
const workflowEditToolsHome = document.getElementById("workflowEditTools").parentElement;
const workflowFloatingToolsHome = document.getElementById("floatingWorkflowTools").parentElement;

document.title = workflowTitle + " | Workflow";
document.getElementById("workflowTitle").textContent = workflowTitle;
document.getElementById("workflowSubtitle").textContent = workflowSubtitle;
document.getElementById("workflowPill").textContent = workflowToken;
document.getElementById("workflowHeading").textContent = workflowTitle;
document.getElementById("workflowHint").textContent = "Canvas persistido por workflow. En edición puedes mover y renombrar la actividad base de " + workflowTitle + ".";
renderSidebarTree();

function loadWorkflowState(){
  try{
    const raw = window.localStorage.getItem(workflowStorageKey);
    const parsed = raw ? JSON.parse(raw) : null;
    if(!parsed || !Array.isArray(parsed.items) || !parsed.items.length){
      return structuredClone(defaultWorkflowState);
    }
    parsed.items = parsed.items.map(function(item, index){
      const normalizedType = item.type || (item.kind === "flow-card" ? "activity" : "activity");
      const defaults = getDefaultWorkflowItem(normalizedType);
      const entryLayout = hasWorkflowFloatingLabel(normalizedType) ? getDefaultEntryLabelLayout() : null;
      const normalizedFontSize = Number.isFinite(item.fontSize)
        ? item.fontSize
        : (item.kind === "flow-card" ? 12 : defaults.fontSize);
      return {
        id: item.id || ("item-" + (index + 1)),
        type: normalizedType,
        kind: item.kind || "",
        title: item.title || "Elemento",
        html: item.html || "",
        badge: item.badge || "",
        badgeClass: item.badgeClass || "",
        step: item.step || "",
        x: Number.isFinite(item.x) ? item.x : 160,
        y: Number.isFinite(item.y) ? item.y : 120,
        width: Number.isFinite(item.width) ? item.width : defaults.width,
        height: Number.isFinite(item.height) ? item.height : defaults.height,
        fontSize: normalizedFontSize,
        borderColor: item.borderColor || defaults.borderColor,
        backgroundColor: item.backgroundColor || defaults.backgroundColor,
        textColor: item.textColor || defaults.textColor,
        iconVariant: item.iconVariant || "current",
        labelOffsetX: entryLayout ? (Number.isFinite(item.labelOffsetX) ? item.labelOffsetX : entryLayout.labelOffsetX) : 0,
        labelOffsetY: entryLayout ? (Number.isFinite(item.labelOffsetY) ? item.labelOffsetY : entryLayout.labelOffsetY) : 0,
        labelWidth: entryLayout ? (Number.isFinite(item.labelWidth) ? item.labelWidth : entryLayout.labelWidth) : 0,
        labelHeight: entryLayout ? (Number.isFinite(item.labelHeight) ? item.labelHeight : entryLayout.labelHeight) : 0
      };
    });
    parsed.connectors = Array.isArray(parsed.connectors) ? parsed.connectors.map(function(connector, index){
      return {
        id: connector.id || ("connector-" + (index + 1)),
        x1: Number.isFinite(connector.x1) ? connector.x1 : 180,
        y1: Number.isFinite(connector.y1) ? connector.y1 : 180,
        x2: Number.isFinite(connector.x2) ? connector.x2 : 360,
        y2: Number.isFinite(connector.y2) ? connector.y2 : 180,
        color: connector.color || "#7d7d7d",
        strokeWidth: Number.isFinite(connector.strokeWidth) ? connector.strokeWidth : 2
      };
    }) : [];
    return parsed;
  }catch(error){
    return structuredClone(defaultWorkflowState);
  }
}

function saveWorkflowState(){
  window.localStorage.setItem(workflowStorageKey, JSON.stringify(workflowState));
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

function getPublicationBounds(){
  let maxX = PUBLICATION_WIDTH;
  let maxY = PUBLICATION_HEIGHT;
  workflowState.items.forEach(function(item){
    maxX = Math.max(maxX, item.x + item.width + 36);
    maxY = Math.max(maxY, item.y + item.height + 36);
  });
  workflowState.connectors.forEach(function(connector){
    maxX = Math.max(maxX, connector.x1 + 36, connector.x2 + 36);
    maxY = Math.max(maxY, connector.y1 + 36, connector.y2 + 36);
  });
  return {
    width: Math.ceil(maxX),
    height: Math.ceil(maxY)
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
  const selectedItem = getSelectedWorkflowItem();
  const selectedConnector = getSelectedWorkflowConnector();
  const bounds = getCanvasBounds();
  const scaledWidth = Math.ceil(bounds.width * workflowZoom);
  const scaledHeight = Math.ceil(bounds.height * workflowZoom);

  diagramEl.dataset.editing = isEditingWorkflow ? "true" : "false";
  modeChipEl.textContent = isEditingWorkflow ? "Modo edición" : "Modo publicación";
  toggleButtonEl.textContent = isEditingWorkflow ? "Volver a publicación" : "Editar mapa";
  toggleButtonEl.classList.toggle("is-active", isEditingWorkflow);
  floatingEditButtonEl.classList.toggle("is-active", isEditingWorkflow);
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
  inspectorEl.classList.toggle("is-visible", Boolean(isEditingWorkflow && (isInspectorEditableItem(selectedItem) || selectedConnector)));
  floatingEditButtonEl.title = isEditingWorkflow ? "Volver a publicación" : "Entrar a edición";
  floatingEditButtonEl.setAttribute("aria-label", isEditingWorkflow ? "Volver a publicación" : "Entrar a edición");
  zoomLayerEl.style.width = scaledWidth + "px";
  zoomLayerEl.style.height = scaledHeight + "px";
  canvasEl.style.width = bounds.width + "px";
  canvasEl.style.height = bounds.height + "px";
  canvasEl.style.transform = `scale(${workflowZoom})`;
  canvasShellEl.style.height = isEditingWorkflow ? "" : scaledHeight + "px";
  if(!isEditingWorkflow){
    canvasShellEl.scrollLeft = 0;
    canvasShellEl.scrollTop = 0;
  }
  zoomValueEl.textContent = Math.round(workflowZoom * 100) + "%";
  if(selectedWorkflowItemId && !selectedItem){
    selectedWorkflowItemId = "";
  }
  if(selectedWorkflowConnectorId && !selectedConnector){
    selectedWorkflowConnectorId = "";
  }
  viewportEl.innerHTML = "";
  if(isEditingWorkflow){
    viewportEl.onclick = function(event){
      if(event.target === viewportEl){
        selectedWorkflowItemId = "";
        renderWorkflowCanvas();
        updateWorkflowStatus("Selección limpiada.");
      }
    };
  }else{
    viewportEl.onclick = null;
  }
  viewportEl.insertAdjacentHTML("beforeend", renderWorkflowConnectors(bounds));
  bindWorkflowConnectorInteractions();
  workflowState.items.forEach(function(item){
    const el = document.createElement("div");
    el.className = getWorkflowItemClassName(item);
    if(item.id === selectedWorkflowItemId){
      el.classList.add("is-selected");
    }
    el.dataset.itemId = item.id;
    el.style.left = item.x + "px";
    el.style.top = item.y + "px";
    el.style.width = item.width + "px";
    el.style.height = item.height + "px";
    el.style.fontSize = (item.fontSize || getDefaultWorkflowItem(item.type).fontSize) + "px";
    el.style.color = item.textColor || getDefaultWorkflowItem(item.type).textColor;
    if(item.kind){
      if(item.kind === "flow-card"){
        el.style.borderColor = item.borderColor || getDefaultWorkflowItem("activity").borderColor;
        el.style.background = item.backgroundColor || getDefaultWorkflowItem("activity").backgroundColor;
        el.style.fontSize = (item.fontSize || getDefaultWorkflowItem("activity").fontSize) + "px";
        el.style.color = item.textColor || getDefaultWorkflowItem("activity").textColor;
        el.innerHTML = `${item.badge ? `<div class="badge${item.badgeClass ? " " + item.badgeClass : ""}">${escapeHtml(item.badge)}</div>` : ""}<div class="canvas-item-flow-content">${item.html || ""}</div>`;
      }else{
        el.style.color = item.textColor || getDefaultWorkflowItem("text").textColor;
        el.innerHTML = item.html || "";
      }
    }else{
      el.style.borderColor = item.borderColor || getDefaultWorkflowItem(item.type).borderColor;
      el.style.background = item.backgroundColor || getDefaultWorkflowItem(item.type).backgroundColor;
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
    }else if(item.kind === "flow-card" && item.step){
      el.addEventListener("click", function(){
        if(typeof window.openStep === "function"){
          window.openStep(item.step);
        }
      });
    }
    viewportEl.appendChild(el);
  });
  renderWorkflowInspector();
}

function renderWorkflowConnectors(bounds){
  const lines = workflowState.connectors.map(function(connector){
    const selectedClass = connector.id === selectedWorkflowConnectorId ? " is-selected" : "";
    return `<line class="workflow-connector-hit${selectedClass}" data-connector-id="${connector.id}" data-drag="move" x1="${connector.x1}" y1="${connector.y1}" x2="${connector.x2}" y2="${connector.y2}"></line><line class="${selectedClass ? "is-selected" : ""}" data-connector-id="${connector.id}" data-drag="move" x1="${connector.x1}" y1="${connector.y1}" x2="${connector.x2}" y2="${connector.y2}" stroke="${escapeHtml(connector.color || "#7d7d7d")}" stroke-width="${connector.strokeWidth || 2}"></line>`;
  }).join("");
  const handles = isEditingWorkflow ? workflowState.connectors.map(function(connector){
    return `<div class="workflow-connector-handle" data-connector-id="${connector.id}" data-endpoint="start" style="left:${connector.x1}px;top:${connector.y1}px"></div><div class="workflow-connector-handle" data-connector-id="${connector.id}" data-endpoint="end" style="left:${connector.x2}px;top:${connector.y2}px"></div>`;
  }).join("") : "";
  const toolbars = isEditingWorkflow ? workflowState.connectors.map(function(connector){
    const midX = (connector.x1 + connector.x2) / 2;
    const midY = (connector.y1 + connector.y2) / 2;
    return `<div class="workflow-connector-toolbar${connector.id === selectedWorkflowConnectorId ? " is-visible" : ""}" data-connector-toolbar="${connector.id}" style="left:${midX}px;top:${midY - 34}px"><button class="workflow-item-tool is-edit" type="button" data-connector-action="edit" data-connector-id="${connector.id}" title="Editar" aria-label="Editar">${WORKFLOW_TOOL_ICONS.edit}</button><button class="workflow-item-tool is-delete" type="button" data-connector-action="delete" data-connector-id="${connector.id}" title="Eliminar" aria-label="Eliminar">${WORKFLOW_TOOL_ICONS.delete}</button></div>`;
  }).join("") : "";
  return `<svg class="workflow-connectors" viewBox="0 0 ${bounds.width} ${bounds.height}" aria-hidden="true"><defs><marker id="workflow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7d7d7d"></path></marker></defs>${lines}</svg>${handles}${toolbars}`;
}

function bindWorkflowConnectorInteractions(){
  if(!isEditingWorkflow){
    return;
  }
  document.querySelectorAll("[data-connector-id][data-drag=\"move\"]").forEach(function(el){
    el.addEventListener("pointerdown", startWorkflowConnectorDrag);
  });
  document.querySelectorAll(".workflow-connector-handle").forEach(function(el){
    el.addEventListener("pointerdown", startWorkflowConnectorHandleDrag);
  });
  document.querySelectorAll("[data-connector-action]").forEach(function(el){
    el.addEventListener("pointerdown", function(event){
      event.stopPropagation();
    });
    el.addEventListener("click", function(event){
      event.stopPropagation();
      const connectorId = event.currentTarget.dataset.connectorId;
      if(event.currentTarget.dataset.connectorAction === "edit"){
        selectWorkflowConnector(connectorId);
      }else if(event.currentTarget.dataset.connectorAction === "delete"){
        deleteWorkflowConnector(connectorId);
      }
    });
  });
}

function getWorkflowItemClassName(item){
  if(item.kind){
    return "canvas-item " + item.kind + (isEditingWorkflow ? " is-draggable" : "");
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

function selectWorkflowItem(itemId){
  if(!isEditingWorkflow){
    return;
  }
  selectedWorkflowItemId = itemId;
  selectedWorkflowConnectorId = "";
  openWorkflowTransformMenuItemId = "";
  renderWorkflowCanvas();
  updateWorkflowStatus("Objeto seleccionado para personalización.");
}

function selectWorkflowConnector(connectorId){
  if(!isEditingWorkflow){
    return;
  }
  selectedWorkflowConnectorId = connectorId;
  selectedWorkflowItemId = "";
  openWorkflowTransformMenuItemId = "";
  renderWorkflowCanvas();
  updateWorkflowStatus("Conector seleccionado para personalización.");
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
  const currentType = item.kind === "flow-card" ? "activity" : item.type;
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
  if(targetType !== "activity" || workflowId !== "wf-cotizaciones"){
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
  if(openWorkflowTransformMenuItemId === item.id){
    const menu = document.createElement("div");
    menu.className = "workflow-item-transform-menu";
    [
      { type: "activity", label: "Actividad" },
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
      optionButton.disabled = ((item.kind === "flow-card" ? "activity" : item.type) === option.type);
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
      <div class="workflow-inspector-actions is-apply-row">
        <button class="workflow-inspector-button is-primary" id="applyWorkflowConnectorButton" type="button">Aplicar</button>
      </div>
    `;
    const colorEl = document.getElementById("workflowConnectorColor");
    const strokeEl = document.getElementById("workflowConnectorStroke");
    const strokeValueEl = document.getElementById("workflowConnectorStrokeValue");
    function applyConnectorDraft(live){
      const target = getSelectedWorkflowConnector();
      if(!target){
        return;
      }
      target.color = colorEl.value;
      target.strokeWidth = clamp(Number(strokeEl.value) || 2, 1, 6);
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
    document.getElementById("applyWorkflowConnectorButton").addEventListener("click", function(){
      applyConnectorDraft(false);
    });
    return;
  }
  const minFontSize = item.type === "icon" ? 16 : 12;
  const maxFontSize = item.type === "icon" ? 40 : 32;
  const draft = {
    title: item.kind === "flow-card" ? (item.html || "") : item.title,
    badge: item.badge || "",
    fontSize: item.fontSize || getDefaultWorkflowItem(item.type).fontSize,
    borderColor: normalizeColorValue(item.borderColor || getDefaultWorkflowItem(item.type).borderColor),
    backgroundColor: normalizeColorValue(item.backgroundColor || getDefaultWorkflowItem(item.type).backgroundColor),
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
        <input id="workflowObjectBackgroundColor" type="color" value="${draft.backgroundColor}">
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
  const textColorEl = document.getElementById("workflowObjectTextColor");
  const iconVariantEl = document.getElementById("workflowIconVariant");
  const applyButton = document.getElementById("applyWorkflowInspectorButton");
  function applyInspectorDraft(live){
    mutateSelectedWorkflowItem(function(target){
      if(target.kind === "flow-card"){
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
    draft.backgroundColor = backgroundColorEl.value;
    applyInspectorDraft(true);
  });
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
      draft.backgroundColor = normalizeColorValue(copiedWorkflowActivityStyle.backgroundColor || draft.backgroundColor);
      draft.textColor = normalizeColorValue(copiedWorkflowActivityStyle.textColor || draft.textColor);
      rangeEl.value = draft.fontSize;
      valueEl.value = draft.fontSize;
      borderColorEl.value = draft.borderColor;
      backgroundColorEl.value = draft.backgroundColor;
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
    el.style.width = item.width + "px";
    el.style.height = item.height + "px";
    el.style.color = item.textColor || getDefaultWorkflowItem(item.type).textColor;
    if(item.kind){
      if(item.kind === "flow-card"){
        el.style.borderColor = item.borderColor || getDefaultWorkflowItem("activity").borderColor;
        el.style.background = item.backgroundColor || getDefaultWorkflowItem("activity").backgroundColor;
        el.style.fontSize = (item.fontSize || getDefaultWorkflowItem("activity").fontSize) + "px";
        el.style.color = item.textColor || getDefaultWorkflowItem("activity").textColor;
        el.innerHTML = `${item.badge ? `<div class="badge${item.badgeClass ? " " + item.badgeClass : ""}">${escapeHtml(item.badge)}</div>` : ""}<div class="canvas-item-flow-content">${item.html || ""}</div>`;
      }else{
        el.style.color = item.textColor || getDefaultWorkflowItem("text").textColor;
        el.innerHTML = `${item.html || ""}`;
      }
      syncWorkflowItemControls(el, item);
    }else{
      el.style.fontSize = (item.fontSize || getDefaultWorkflowItem(item.type).fontSize) + "px";
      el.style.borderColor = item.borderColor || getDefaultWorkflowItem(item.type).borderColor;
      el.style.background = item.backgroundColor || getDefaultWorkflowItem(item.type).backgroundColor;
      el.style.color = item.textColor || getDefaultWorkflowItem(item.type).textColor;
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
  if(normalized === "transparent"){
    return "#ffffff";
  }
  return "#ffffff";
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
  selectedWorkflowItemId = itemId;
  activeDrag = {
    mode: "item",
    id: itemId,
    startX: event.clientX,
    startY: event.clientY,
    originX: item.x,
    originY: item.y
  };
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

function startWorkflowEntryLabelResize(event, itemId){
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item || !hasWorkflowFloatingLabel(item.type)){
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
    applySelectedWorkflowItemPreview(item);
  }else if(activeDrag.mode === "entry-label-move"){
    const item = workflowState.items.find(function(entry){ return entry.id === activeDrag.id; });
    if(!item){
      return;
    }
    item.labelOffsetX = clamp(activeDrag.originLabelOffsetX + deltaX, -400, 400);
    item.labelOffsetY = clamp(activeDrag.originLabelOffsetY + deltaY, -300, 300);
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
    connector[activeDrag.endpoint === "start" ? "x1" : "x2"] = clamp(activeDrag.originX + deltaX, 20, bounds.width - 20);
    connector[activeDrag.endpoint === "start" ? "y1" : "y2"] = clamp(activeDrag.originY + deltaY, 20, bounds.height - 20);
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
  if(activeDrag.pointerTarget && typeof activeDrag.pointerTarget.releasePointerCapture === "function" && typeof activeDrag.pointerId !== "undefined"){
    try{
      activeDrag.pointerTarget.releasePointerCapture(activeDrag.pointerId);
    }catch(error){
    }
  }
  activeDrag = null;
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
  if(!isEditingWorkflow){
    openWorkflowTransformMenuItemId = "";
    selectedWorkflowConnectorId = "";
  }
  renderWorkflowCanvas();
  updateWorkflowStatus(isEditingWorkflow ? "Modo edición activo. Puedes arrastrar elementos y agregar actividad, conector, texto o icono." : "Vista en modo publicación.");
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

function resetWorkflow(){
  workflowState = structuredClone(defaultWorkflowState);
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Workflow restablecido a la actividad base.");
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
  event.preventDefault();
  event.stopPropagation();
  selectedWorkflowConnectorId = connectorId;
  selectedWorkflowItemId = "";
  activeDrag = {
    mode: "connector-move",
    id: connectorId,
    startX: event.clientX,
    startY: event.clientY,
    originX1: connector.x1,
    originY1: connector.y1,
    originX2: connector.x2,
    originY2: connector.y2
  };
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
  event.preventDefault();
  event.stopPropagation();
  selectedWorkflowConnectorId = connectorId;
  selectedWorkflowItemId = "";
  activeDrag = {
    mode: "connector-end",
    id: connectorId,
    endpoint: endpoint,
    startX: event.clientX,
    startY: event.clientY,
    originX: endpoint === "start" ? connector.x1 : connector.x2,
    originY: endpoint === "start" ? connector.y1 : connector.y2
  };
  window.addEventListener("pointermove", onWorkflowPointerMove);
  window.addEventListener("pointerup", onWorkflowPointerUp);
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
document.getElementById("copyWorkflowLayoutButton").addEventListener("click", copyWorkflowLayoutToClipboard);
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
document.getElementById("workflowCanvasShell").addEventListener("pointerdown", startWorkflowCanvasPan);
document.getElementById("workflowCanvasShell").addEventListener("contextmenu", function(event){
  if(isEditingWorkflow){
    event.preventDefault();
  }
});
document.addEventListener("fullscreenchange", renderWorkflowCanvas);
renderWorkflowCanvas();
updateWorkflowStatus("Vista en modo publicación.");

