from pathlib import Path
import re, shutil, json, hashlib, subprocess, sys
source=Path(sys.argv[1]).resolve()
target=Path(__file__).resolve().parents[1]/'vendor/cadence-ui'
entries=['PrimaryButton','GhostButton','Dropdown','TextInput','TextArea','Stepper','InlineAlert','Indicator','LineBadge','Icons','Sidebar','AppLayout','Avatar','PageHeader','Breadcrumbs','Accordion','PageSection','FormActions','ProgressBar','Modal','Toaster','DatePicker','Checkbox','SegmentedControl','Badge','ModeIcon']
seen=set()
def copy(p):
 p=p.resolve()
 if p in seen:return
 if not p.is_relative_to(source/'src/components'): raise ValueError(p)
 seen.add(p)
 content=p.read_text()
 dest=target/'src'/p.relative_to(source/'src/components');dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(p,dest)
 for imp in re.findall(r'(?:from\s+|import\s*)[\"\'](\.[^\"\']+)[\"\']',content):
  base=p.parent/imp
  candidates=[base,Path(str(base)+'.tsx'),Path(str(base)+'.ts'),Path(str(base)+'.css')]
  match=next((c for c in candidates if c.is_file()),None)
  if not match:raise ValueError(imp)
  copy(match)
for name in entries:copy(source/'src/components'/f'{name}.tsx')
copy(source/'src/components/tokens.css')
copy(source/'src/components/useToast.ts')
(target/'src/index.ts').write_text('\n'.join(f'export {{ {n} }} from "./{n}";' for n in entries)+'\nexport { toast, useToast } from "./useToast";\nimport "./tokens.css";\n')
fonts=target/'fonts';fonts.mkdir(exist_ok=True)
for font in re.findall(r'/fonts/([^\"]+)',(source/'src/components/tokens.css').read_text()):shutil.copy2(source/'public/fonts'/font,fonts/font)
manifest={'name':'@ddaoellena/cadence-ui','version':json.loads((source/'package.json').read_text())['version'],'private':True,'type':'module','exports':{'.':'./src/index.ts'},'peerDependencies':{'react':'^18 || ^19','react-dom':'^18 || ^19'},'dependencies':{'@untitledui/icons':'0.0.23'}}
(target/'package.json').write_text(json.dumps(manifest,indent=2)+'\n')
provenance={'source':str(source),'version':manifest['version'],'source_commit':subprocess.check_output(['git','-C',str(source),'rev-parse','HEAD'],text=True).strip(),'components':entries,'sha256':{str(p.relative_to(target)):hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((target/'src').iterdir()) if p.is_file()}}
(target/'provenance.json').write_text(json.dumps(provenance,indent=2)+'\n')
print(f'Imported {len(seen)} component source files and {len(list(fonts.iterdir()))} fonts')
