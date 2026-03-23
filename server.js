const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const WORKFLOW_DIR = path.join(DATA_DIR, "workflows");
const WORKFLOW_DETAILS_DIR = path.join(DATA_DIR, "workflow-details");
const FILES_DIR = path.join(DATA_DIR, "files");
const FILES_MANIFEST_PATH = path.join(DATA_DIR, "files-manifest.json");
const PORT = Number(process.env.PORT || 3000);

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8"
};

fs.mkdirSync(WORKFLOW_DIR, { recursive: true });
fs.mkdirSync(WORKFLOW_DETAILS_DIR, { recursive: true });
fs.mkdirSync(FILES_DIR, { recursive: true });
if(!fs.existsSync(FILES_MANIFEST_PATH)){
  fs.writeFileSync(FILES_MANIFEST_PATH, JSON.stringify({ files: [] }, null, 2) + "\n");
}

function sendJson(res, statusCode, payload){
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

function sendText(res, statusCode, message){
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

function readRequestBody(req){
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", chunk => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function sanitizeId(value){
  return String(value || "").trim().replace(/[^a-zA-Z0-9._-]/g, "");
}

function getWorkflowPath(workflowId){
  return path.join(WORKFLOW_DIR, `${sanitizeId(workflowId)}.base.json`);
}

function getWorkflowDetailsPath(workflowId){
  return path.join(WORKFLOW_DETAILS_DIR, `${sanitizeId(workflowId)}.details.json`);
}

function readManifest(){
  try{
    const parsed = JSON.parse(fs.readFileSync(FILES_MANIFEST_PATH, "utf8"));
    return Array.isArray(parsed.files) ? parsed : { files: [] };
  }catch(error){
    return { files: [] };
  }
}

function writeManifest(manifest){
  fs.writeFileSync(FILES_MANIFEST_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");
}

function toSafeOwnerDir(owner){
  return sanitizeId(owner).replace(/\./g, "_");
}

function saveFileRecord(owner, payload){
  const manifest = readManifest();
  const fileId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const ownerDir = path.join(FILES_DIR, toSafeOwnerDir(owner));
  fs.mkdirSync(ownerDir, { recursive: true });
  const originalName = sanitizeId(payload.name || "archivo.bin") || "archivo.bin";
  const filePath = path.join(ownerDir, `${fileId}-${originalName}`);
  const base64 = String(payload.base64 || "");
  fs.writeFileSync(filePath, Buffer.from(base64, "base64"));
  const record = {
    id: fileId,
    owner,
    name: originalName,
    displayName: String(payload.displayName || path.parse(originalName).name || originalName),
    type: String(payload.type || "application/octet-stream"),
    size: Number(payload.size || 0),
    createdAt: new Date().toISOString(),
    path: path.relative(ROOT, filePath).replace(/\\/g, "/")
  };
  manifest.files.push(record);
  writeManifest(manifest);
  return record;
}

function deleteFileRecord(fileId){
  const manifest = readManifest();
  const index = manifest.files.findIndex(file => file.id === fileId);
  if(index < 0){
    return false;
  }
  const [record] = manifest.files.splice(index, 1);
  writeManifest(manifest);
  const absolutePath = path.join(ROOT, record.path);
  if(fs.existsSync(absolutePath)){
    fs.unlinkSync(absolutePath);
  }
  return true;
}

function updateFileDisplayName(fileId, nextName){
  const manifest = readManifest();
  const record = manifest.files.find(file => file.id === fileId);
  if(!record){
    return null;
  }
  record.displayName = String(nextName || "").trim() || record.displayName;
  writeManifest(manifest);
  return record;
}

function getStaticFilePath(requestPath){
  const normalizedPath = decodeURIComponent(requestPath.split("?")[0]);
  const cleanPath = normalizedPath === "/" ? "/index.html" : normalizedPath;
  const candidate = path.normalize(path.join(ROOT, cleanPath));
  if(!candidate.startsWith(ROOT)){
    return "";
  }
  return candidate;
}

async function handleApi(req, res, url){
  if(req.method === "GET" && url.pathname === "/api/health"){
    sendJson(res, 200, { ok: true });
    return true;
  }
  const workflowMatch = url.pathname.match(/^\/api\/workflows\/([^/]+)$/);
  if(workflowMatch){
    const workflowId = sanitizeId(workflowMatch[1]);
    const targetPath = getWorkflowPath(workflowId);
    if(req.method === "GET"){
      if(!fs.existsSync(targetPath)){
        sendJson(res, 404, { error: "workflow-not-found" });
        return true;
      }
      sendJson(res, 200, JSON.parse(fs.readFileSync(targetPath, "utf8")));
      return true;
    }
    if(req.method === "PUT"){
      const body = await readRequestBody(req);
      fs.writeFileSync(targetPath, JSON.stringify(JSON.parse(body), null, 2) + "\n", "utf8");
      sendJson(res, 200, { ok: true, path: path.relative(ROOT, targetPath).replace(/\\/g, "/") });
      return true;
    }
  }
  const detailsMatch = url.pathname.match(/^\/api\/workflow-details\/([^/]+)$/);
  if(detailsMatch){
    const workflowId = sanitizeId(detailsMatch[1]);
    const targetPath = getWorkflowDetailsPath(workflowId);
    if(req.method === "GET"){
      if(!fs.existsSync(targetPath)){
        sendJson(res, 404, { error: "workflow-details-not-found" });
        return true;
      }
      sendJson(res, 200, JSON.parse(fs.readFileSync(targetPath, "utf8")));
      return true;
    }
    if(req.method === "PUT"){
      const body = await readRequestBody(req);
      fs.writeFileSync(targetPath, JSON.stringify(JSON.parse(body), null, 2) + "\n", "utf8");
      sendJson(res, 200, { ok: true, path: path.relative(ROOT, targetPath).replace(/\\/g, "/") });
      return true;
    }
  }
  const filesOwnerMatch = url.pathname.match(/^\/api\/files\/([^/]+)$/);
  if(filesOwnerMatch){
    const owner = sanitizeId(filesOwnerMatch[1]);
    if(req.method === "GET"){
      const manifest = readManifest();
      sendJson(res, 200, manifest.files.filter(file => file.owner === owner));
      return true;
    }
    if(req.method === "POST"){
      const body = JSON.parse(await readRequestBody(req));
      const saved = saveFileRecord(owner, body);
      sendJson(res, 200, saved);
      return true;
    }
  }
  const fileItemMatch = url.pathname.match(/^\/api\/files\/item\/([^/]+)$/);
  if(fileItemMatch){
    const fileId = sanitizeId(fileItemMatch[1]);
    if(req.method === "DELETE"){
      const ok = deleteFileRecord(fileId);
      sendJson(res, ok ? 200 : 404, { ok });
      return true;
    }
    if(req.method === "PATCH"){
      const body = JSON.parse(await readRequestBody(req));
      const record = updateFileDisplayName(fileId, body.displayName);
      sendJson(res, record ? 200 : 404, record || { error: "file-not-found" });
      return true;
    }
  }
  const fileDownloadMatch = url.pathname.match(/^\/api\/files\/download\/([^/]+)$/);
  if(fileDownloadMatch && req.method === "GET"){
    const fileId = sanitizeId(fileDownloadMatch[1]);
    const manifest = readManifest();
    const record = manifest.files.find(file => file.id === fileId);
    if(!record){
      sendJson(res, 404, { error: "file-not-found" });
      return true;
    }
    const absolutePath = path.join(ROOT, record.path);
    if(!fs.existsSync(absolutePath)){
      sendJson(res, 404, { error: "file-missing" });
      return true;
    }
    res.writeHead(200, {
      "Content-Type": record.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${record.name.replace(/"/g, "")}"`
    });
    fs.createReadStream(absolutePath).pipe(res);
    return true;
  }
  return false;
}

const server = http.createServer(async (req, res) => {
  try{
    const url = new URL(req.url, `http://${req.headers.host}`);
    if(url.pathname.startsWith("/api/")){
      const handled = await handleApi(req, res, url);
      if(!handled){
        sendJson(res, 404, { error: "not-found" });
      }
      return;
    }
    const filePath = getStaticFilePath(url.pathname);
    if(!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()){
      sendText(res, 404, "Not found");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  }catch(error){
    sendJson(res, 500, { error: "server-error", message: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
