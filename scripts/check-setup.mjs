import assert from 'node:assert/strict';
import vm from 'node:vm';
import app from '../worker/index.js';

const configRequest=new Request('https://bedboard.test/api/config');
for(const [key,configured] of [[undefined,false],['',false],['   ',false],['fixture-server-key',true]]) {
  const response=await app.fetch(configRequest,{TYPESAFE_API_KEY:key});
  assert.equal(response.status,200); assert.equal(response.headers.get('cache-control'),'no-store');
  assert.deepEqual(await response.json(),{configured});
}
const input={bedId:'MAT-02',note:'Pain limits walking. Reassessment pending.',apiKey:'fixture-browser-key'};
const req=()=>new Request('https://bedboard.test/api/jev',{method:'POST',headers:{Origin:'https://bedboard.test'},body:JSON.stringify(input)});
const fixture={model:'jev-test-fixture',answers:{progress:{type:'choice',choice:'needs_review',confidence:0.9,probabilities:{improving:0.02,needs_review:0.96,unclear:0.02}},delay:{type:'noul',noul:0.95}},usage:{input_tokens:100,output_tokens:20}};
const original=globalThis.fetch;
try {
  for(const [serverKey,expected] of [['fixture-server-key','fixture-server-key'],['  ','fixture-browser-key']]) {
    globalThis.fetch=async(url,options)=>{assert.equal(options.headers.Authorization,'Bearer '+expected);return Response.json(fixture);};
    const response=await app.fetch(req(),{TYPESAFE_API_KEY:serverKey});assert.equal(response.status,200);
    assert.equal((await response.text()).includes(expected),false);
  }
} finally {globalThis.fetch=original;}
const html=await (await app.fetch(new Request('https://bedboard.test/'),{})).text();
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
async function client(configured,failed=false) {
  const nodes=new Map(),calls=[];
  const document={getElementById(id){if(!nodes.has(id))nodes.set(id,{value:id==='bed'?'MAT-02':'',textContent:'',innerHTML:'',disabled:false});return nodes.get(id);}};
  const context=vm.createContext({document,Date,Intl,setInterval(){},fetch:async(url,options)=>{calls.push({url,options});if(url==='/api/config'){if(failed)throw Error('Config network error');return Response.json({configured});}return Response.json(fixture);}});
  new vm.Script(script).runInContext(context); await new Promise(setImmediate);
  assert.match(nodes.get('env-status').textContent,failed?/Could not check/:configured?/Server key configured/:/No server key/);
  await nodes.get('analyze').onsubmit({preventDefault(){}});
  assert.equal(calls.filter(x=>x.url==='/api/jev').length,configured&&!failed?1:0);
  if(configured&&!failed) {
    const submitted=JSON.parse(calls.find(x=>x.url==='/api/jev').options.body);
    assert.equal(submitted.apiKey,'');assert.equal(submitted.bedId,'MAT-02');assert.match(nodes.get('result').textContent,/jev-test-fixture/);
  } else { assert.match(nodes.get('result').textContent,/Configure TYPESAFE_API_KEY/); assert.equal(nodes.get('feedback').textContent,nodes.get('result').textContent,'setup guidance must be visible while result details are collapsed'); }
  await nodes.get('check-env').onclick(); assert.equal(calls.filter(x=>x.url==='/api/config').length,2);
}
await client(false); await client(true); await client(false,true);
console.log('Passed: status exposes presence only; no-store; server-key precedence; blank-server fallback; browser auto/manual checks; no browser key required with configured server; missing/config-failure states. All credentials and provider responses were fixtures.');
