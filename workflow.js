
const PROCESS_DETAILS_STORAGE_KEY = "conemi-process-details-v1";
const ITEM_DETAILS_STORAGE_KEY = "conemi-item-details-v1";
const WORKFLOW_CATALOG_STORAGE_KEY = "conemi-workflow-catalog-v1";
const WORKFLOW_LAYOUT_STORAGE_KEY_PREFIX = "conemi-workflow-layout-v1:";
const params = new URLSearchParams(window.location.search);
const processId = params.get("process") || "";
const itemId = params.get("item") || "";
const workflowId = params.get("workflow") || "";
const PROCESS_TREE = [
  { areaId: "A", areaLabel: "Comercial", nodes: [{ id: "P1", label: "Cotizaciones", href: "cotizaciones.html" }] },
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
const defaultWorkflowState = {
  items: [
    {
      id: "activity-1",
      type: "activity",
      title: "Actividad inicial",
      x: 160,
      y: 120,
      width: 260,
      height: 88
    }
  ],
  connectors: []
};
let workflowState = loadWorkflowState();
let isEditingWorkflow = false;
let activeDrag = null;
let workflowZoom = loadWorkflowZoom();

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
      return {
        id: item.id || ("item-" + (index + 1)),
        type: item.type || "activity",
        title: item.title || "Elemento",
        x: Number.isFinite(item.x) ? item.x : 160,
        y: Number.isFinite(item.y) ? item.y : 120,
        width: Number.isFinite(item.width) ? item.width : (item.type === "icon" ? 56 : 260),
        height: Number.isFinite(item.height) ? item.height : (item.type === "activity" ? 88 : (item.type === "icon" ? 56 : 36))
      };
    });
    parsed.connectors = Array.isArray(parsed.connectors) ? parsed.connectors.map(function(connector, index){
      return {
        id: connector.id || ("connector-" + (index + 1)),
        x1: Number.isFinite(connector.x1) ? connector.x1 : 180,
        y1: Number.isFinite(connector.y1) ? connector.y1 : 180,
        x2: Number.isFinite(connector.x2) ? connector.x2 : 360,
        y2: Number.isFinite(connector.y2) ? connector.y2 : 180
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
  const zoomValueEl = document.getElementById("workflowZoomValue");
  const editToolsEl = document.getElementById("workflowEditTools");
  const bounds = getCanvasBounds();
  const scaledWidth = Math.ceil(bounds.width * workflowZoom);
  const scaledHeight = Math.ceil(bounds.height * workflowZoom);

  diagramEl.dataset.editing = isEditingWorkflow ? "true" : "false";
  modeChipEl.textContent = isEditingWorkflow ? "Modo edición" : "Modo publicación";
  toggleButtonEl.textContent = isEditingWorkflow ? "Volver a publicación" : "Editar mapa";
  toggleButtonEl.classList.toggle("is-active", isEditingWorkflow);
  floatingEditButtonEl.classList.toggle("is-active", isEditingWorkflow);
  editToolsEl.classList.toggle("is-visible", isEditingWorkflow);
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
  viewportEl.innerHTML = "";
  viewportEl.insertAdjacentHTML("beforeend", renderWorkflowConnectors(bounds));
  bindWorkflowConnectorInteractions();
  workflowState.items.forEach(function(item){
    const el = document.createElement("div");
    el.className = getWorkflowItemClassName(item);
    el.dataset.itemId = item.id;
    el.style.left = item.x + "px";
    el.style.top = item.y + "px";
    el.style.width = item.width + "px";
    el.style.height = item.height + "px";
    if(item.type === "icon"){
      el.textContent = item.title;
    }else{
      const label = document.createElement("span");
      label.innerHTML = escapeHtml(item.title).replace(/\n/g, "<br>");
      el.appendChild(label);
    }
    if(isEditingWorkflow){
      if(item.type !== "connector"){
        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = item.type === "activity" ? "workflow-node-edit" : "workflow-object-edit";
        editButton.textContent = "✎";
        editButton.addEventListener("pointerdown", function(event){
          event.stopPropagation();
        });
        editButton.addEventListener("click", function(event){
          event.stopPropagation();
          editWorkflowItem(item.id);
        });
        el.appendChild(editButton);
      }
      el.addEventListener("pointerdown", startWorkflowDrag);
    }
    viewportEl.appendChild(el);
  });
}

function renderWorkflowConnectors(bounds){
  const lines = workflowState.connectors.map(function(connector){
    return `<line class="workflow-connector-hit" data-connector-id="${connector.id}" data-drag="move" x1="${connector.x1}" y1="${connector.y1}" x2="${connector.x2}" y2="${connector.y2}"></line><line data-connector-id="${connector.id}" data-drag="move" x1="${connector.x1}" y1="${connector.y1}" x2="${connector.x2}" y2="${connector.y2}"></line>`;
  }).join("");
  const handles = isEditingWorkflow ? workflowState.connectors.map(function(connector){
    return `<div class="workflow-connector-handle" data-connector-id="${connector.id}" data-endpoint="start" style="left:${connector.x1}px;top:${connector.y1}px"></div><div class="workflow-connector-handle" data-connector-id="${connector.id}" data-endpoint="end" style="left:${connector.x2}px;top:${connector.y2}px"></div>`;
  }).join("") : "";
  return `<svg class="workflow-connectors" viewBox="0 0 ${bounds.width} ${bounds.height}" aria-hidden="true"><defs><marker id="workflow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#7d7d7d"></path></marker></defs>${lines}</svg>${handles}`;
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
}

function getWorkflowItemClassName(item){
  if(item.type === "text"){
    return "workflow-text";
  }
  if(item.type === "icon"){
    return "workflow-icon";
  }
  return "workflow-node";
}

function editWorkflowItem(itemId){
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item){
    return;
  }
  const promptLabel = item.type === "icon" ? "Icono o símbolo" : (item.type === "text" ? "Texto" : "Título de la actividad");
  const nextTitle = window.prompt(promptLabel, item.title);
  if(nextTitle && nextTitle.trim()){
    item.title = nextTitle.trim();
    saveWorkflowState();
    renderWorkflowCanvas();
    updateWorkflowStatus("Elemento actualizado.");
  }
}

function startWorkflowDrag(event){
  if(!isEditingWorkflow){
    return;
  }
  const itemId = event.currentTarget.dataset.itemId;
  const item = workflowState.items.find(function(entry){ return entry.id === itemId; });
  if(!item){
    return;
  }
  event.preventDefault();
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

function onWorkflowPointerMove(event){
  if(!activeDrag){
    return;
  }
  const bounds = getCanvasBounds();
  const deltaX = (event.clientX - activeDrag.startX) / workflowZoom;
  const deltaY = (event.clientY - activeDrag.startY) / workflowZoom;
  if(activeDrag.mode === "item"){
    const item = workflowState.items.find(function(entry){ return entry.id === activeDrag.id; });
    if(!item){
      return;
    }
    item.x = clamp(activeDrag.originX + deltaX, 20, bounds.width - item.width - 20);
    item.y = clamp(activeDrag.originY + deltaY, 20, bounds.height - item.height - 20);
  }else if(activeDrag.mode === "connector-move"){
    const connector = workflowState.connectors.find(function(entry){ return entry.id === activeDrag.id; });
    if(!connector){
      return;
    }
    connector.x1 = clamp(activeDrag.originX1 + deltaX, 20, bounds.width - 20);
    connector.y1 = clamp(activeDrag.originY1 + deltaY, 20, bounds.height - 20);
    connector.x2 = clamp(activeDrag.originX2 + deltaX, 20, bounds.width - 20);
    connector.y2 = clamp(activeDrag.originY2 + deltaY, 20, bounds.height - 20);
  }else if(activeDrag.mode === "connector-end"){
    const connector = workflowState.connectors.find(function(entry){ return entry.id === activeDrag.id; });
    if(!connector){
      return;
    }
    connector[activeDrag.endpoint === "start" ? "x1" : "x2"] = clamp(activeDrag.originX + deltaX, 20, bounds.width - 20);
    connector[activeDrag.endpoint === "start" ? "y1" : "y2"] = clamp(activeDrag.originY + deltaY, 20, bounds.height - 20);
  }
  renderWorkflowCanvas();
}

function onWorkflowPointerUp(){
  if(!activeDrag){
    return;
  }
  activeDrag = null;
  window.removeEventListener("pointermove", onWorkflowPointerMove);
  window.removeEventListener("pointerup", onWorkflowPointerUp);
  saveWorkflowState();
  renderWorkflowCanvas();
}

function toggleWorkflowMode(){
  isEditingWorkflow = !isEditingWorkflow;
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

function addWorkflowActivity(){
  const center = getViewportCenter();
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

function addWorkflowIcon(){
  const center = getViewportCenter();
  workflowState.items.push({
    id: "icon-" + Date.now(),
    type: "icon",
    title: "★",
    x: Math.max(20, center.x - 28),
    y: Math.max(20, center.y - 28),
    width: 56,
    height: 56
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
    y2: Math.max(20, center.y)
  });
  saveWorkflowState();
  renderWorkflowCanvas();
  updateWorkflowStatus("Conector agregado al workflow.");
}

function startWorkflowConnectorDrag(event){
  if(!isEditingWorkflow){
    return;
  }
  const connectorId = event.currentTarget.dataset.connectorId;
  const connector = workflowState.connectors.find(function(entry){ return entry.id === connectorId; });
  if(!connector){
    return;
  }
  event.preventDefault();
  event.stopPropagation();
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
  const connectorId = event.currentTarget.dataset.connectorId;
  const endpoint = event.currentTarget.dataset.endpoint;
  const connector = workflowState.connectors.find(function(entry){ return entry.id === connectorId; });
  if(!connector){
    return;
  }
  event.preventDefault();
  event.stopPropagation();
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

document.getElementById("toggleWorkflowModeButton").addEventListener("click", toggleWorkflowMode);
document.getElementById("floatingWorkflowEditModeButton").addEventListener("click", toggleWorkflowMode);
document.getElementById("copyWorkflowLayoutButton").addEventListener("click", copyWorkflowLayoutToClipboard);
document.getElementById("resetWorkflowButton").addEventListener("click", resetWorkflow);
document.getElementById("workflowZoomInButton").addEventListener("click", zoomWorkflowIn);
document.getElementById("workflowZoomOutButton").addEventListener("click", zoomWorkflowOut);
document.getElementById("workflowZoomResetButton").addEventListener("click", resetWorkflowZoom);
document.getElementById("addWorkflowActivityButton").addEventListener("click", addWorkflowActivity);
document.getElementById("addWorkflowConnectorButton").addEventListener("click", addWorkflowConnector);
document.getElementById("addWorkflowTextButton").addEventListener("click", addWorkflowText);
document.getElementById("addWorkflowIconButton").addEventListener("click", addWorkflowIcon);
renderWorkflowCanvas();
updateWorkflowStatus("Vista en modo publicación.");

