import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import test from 'node:test';
const source = await readFile(new URL('../worker/cleaning.js',import.meta.url),'utf8');
const {default: script} = await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const key = 'obgyn-cleaning-demo-v1', initial = Date.parse('2026-10-01T10:00:00-04:00');
function client(storage=new Map(), failStorage=false, initialTime=initial) {
  let now=initialTime, tick, storageEvent;
  const nodes=new Map(), beds=[{id:'MAT-05',status:'CLN'},{id:'GYN-05',status:'DUE'},{id:'MAT-01',status:'OCC'}];
  class DemoDate extends Date { static now() {return now;} }
  const document={getElementById(id) {if(!nodes.has(id)) nodes.set(id,{value:id==='room'?'MAT-05':'',textContent:'',innerHTML:'',disabled:false}); return nodes.get(id);}};
  const localStorage={getItem(name){if(failStorage) throw Error('Blocked');return storage.get(name);},setItem(name,value){if(failStorage) throw Error('Blocked');storage.set(name,value);}};
  vm.runInNewContext(script,{document,beds,localStorage,Date:DemoDate,window:{addEventListener(event,fn){assert.equal(event,'storage');storageEvent=fn;}},setInterval(fn){tick=fn;}});
  return {nodes,beds,storage,sync(){storageEvent({key});},advance(ms){now+=ms;tick();}};
}
test('cleaning records exact elapsed time, resumes after reload and never releases beds',()=>{
  const storage=new Map(), first=client(storage);
  assert.equal(first.nodes.get('clean-finish').disabled,true);
  assert.equal(first.nodes.get('cleaning').innerHTML.includes('<option>MAT-01</option>'),false);
  first.nodes.get('clean-start').onclick();
  first.nodes.get('clean-start').onclick();
  assert.equal(JSON.parse(storage.get(key)).length,1,'double start created another timing');
  first.advance(12*60000);
  const resumed=client(storage,false,initial+12*60000);
  assert.equal(resumed.nodes.get('clean-start').disabled,true);
  assert.match(resumed.nodes.get('clean-status').textContent,/12.0 minutes elapsed/);
  resumed.nodes.get('clean-finish').onclick();
  assert.deepEqual(JSON.parse(storage.get(key)),[{room:'MAT-05',start:initial,end:initial+12*60000}]);
  assert.match(resumed.nodes.get('clean-log').textContent,/Local average: 12.0 minutes \(1 completed timings\)/);
  assert.match(resumed.nodes.get('clean-status').textContent,/awaiting staff release/);
  assert.deepEqual(resumed.beds.map(b=>b.status),['CLN','DUE','OCC']);
});
test('two ordinary tabs merge sequential room timings and synchronize completed records',()=>{
  const storage=new Map(), a=client(storage), b=client(storage);
  a.nodes.get('clean-start').onclick();
  b.nodes.get('room').value='GYN-05';b.nodes.get('room').onchange();b.nodes.get('clean-start').onclick();
  assert.equal(JSON.parse(storage.get(key)).length,2,'second tab lost the first room');
  a.advance(2*60000);a.nodes.get('clean-finish').onclick();
  b.sync();
  assert.equal(JSON.parse(storage.get(key)).find(item=>item.room==='GYN-05').end,null);
  assert.match(b.nodes.get('clean-log').textContent,/MAT-05.*Finish/);
  assert.equal(b.nodes.get('clean-finish').disabled,false);
  b.advance(3*60000);b.nodes.get('clean-finish').onclick();a.sync();
  const records=JSON.parse(storage.get(key));assert.equal(records.length,2);assert.ok(records.every(item=>item.end!==null));
  assert.match(a.nodes.get('clean-log').textContent,/2 completed timings/);
});
test('separate rooms keep separate timers and browser storage failures are visible',()=>{
  const app=client(); app.nodes.get('clean-start').onclick();app.advance(5*60000);
  app.nodes.get('room').value='GYN-05';app.nodes.get('room').onchange();app.nodes.get('clean-start').onclick();app.advance(3*60000);app.nodes.get('clean-finish').onclick();
  app.nodes.get('room').value='MAT-05';app.nodes.get('room').onchange();
  assert.match(app.nodes.get('clean-status').textContent,/8.0 minutes elapsed/);
  assert.match(app.nodes.get('clean-log').textContent,/Local average: 3.0 minutes/);
  const blocked=client(new Map(),true);blocked.nodes.get('clean-start').onclick();blocked.advance(60000);blocked.nodes.get('clean-finish').onclick();
  assert.match(blocked.nodes.get('clean-status').textContent,/saving is unavailable/);
  assert.match(blocked.nodes.get('clean-log').textContent,/1.0 minutes/);
});
test('stored cleaning records reject invalid rooms/times and retain only IDs and timestamps',()=>{
  const storage=new Map([[key,JSON.stringify([{room:'MAT-01',start:initial,end:null},{room:'MAT-05',start:'wrong',end:null},{room:'MAT-05',start:initial,end:initial-1},{room:'GYN-05',start:initial,end:initial+60000,extra:'must not persist'}])]]);
  const app=client(storage);app.nodes.get('clean-start').onclick();
  const records=JSON.parse(storage.get(key));
  assert.equal(records.length,2);assert.ok(records.every(item=>Object.keys(item).join(',')==='room,start,end'));
});
