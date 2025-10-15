import fs from 'fs'; import path from 'path';
function csvToRows(csv:string){ return csv.trim().split(/\r?\n/).map(l=>l.replace(/\s+#.*$/,'')).filter(Boolean); }
function parseCSV(csv:string){
  const rows=csvToRows(csv); const [h,...rest]=rows; const headers=h.split(',').map(s=>s.trim());
  return rest.map(line=>{
    const cols=line.split(',').map(s=>s.trim());
    const obj:any={}; headers.forEach((k,i)=> obj[k]=cols[i]); return obj;
  });
}
const srcRates=process.env.SRC_RATES||'';
const srcZones=process.env.SRC_ZONES||'';
const outDir=process.env.OUT_DIR||'';
if(!outDir) throw new Error('OUT_DIR required');
fs.mkdirSync(outDir,{recursive:true});
if (srcRates && fs.existsSync(srcRates)){
  const j=parseCSV(fs.readFileSync(srcRates,'utf8'));
  fs.writeFileSync(path.join(outDir,'rates.json'), JSON.stringify(j,null,2));
  console.log('✔ rates.json written');
} else {
  // minimal fallback
  const j=[{zone:'MAIN',weight_from_kg:'0',weight_to_kg:'2',delivery_method:'HOME',base_rate:'3.5',extra_kg_rate:'0.9'}];
  fs.writeFileSync(path.join(outDir,'rates.json'), JSON.stringify(j,null,2));
  console.log('⚠ fallback rates.json written');
}
if (srcZones && fs.existsSync(srcZones)){
  const raw=parseCSV(fs.readFileSync(srcZones,'utf8'));
  // Map CSV columns to TypeScript interface: postal_code→prefix, zone→zone_id
  const j=raw.map((r:any)=>({
    prefix: String(r.postal_code||r.prefix||'').substring(0,2),
    zone_id: String(r.zone||r.zone_id||'')
  }));
  fs.writeFileSync(path.join(outDir,'zones.json'), JSON.stringify(j,null,2));
  console.log('✔ zones.json written');
} else {
  const j=[{prefix:'10',zone_id:'ATHENS'},{prefix:'54',zone_id:'THESS'},{prefix:'28',zone_id:'ISLANDS'}];
  fs.writeFileSync(path.join(outDir,'zones.json'), JSON.stringify(j,null,2));
  console.log('⚠ fallback zones.json written');
}
