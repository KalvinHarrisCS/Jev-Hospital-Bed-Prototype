import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=(await readFile(new URL('../worker/index.js',import.meta.url),'utf8')).replace("import cleaning from './cleaning.js';",(await readFile(new URL('../worker/cleaning.js',import.meta.url),'utf8')).replace('export default','const cleaning ='));

const {default:app}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const request=(data,origin='https://bedboard.test')=>new Request('https://bedboard.test/api/jev',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:typeof data==='string'?data:JSON.stringify(data)});
const input={bedId:'MAT-02',note:'Pain 4/5; mobility assessment pending.',apiKey:'test-only-not-a-real-key'};
const html=await (await app.fetch(new Request('https://bedboard.test/'),{})).text();
new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
assert.equal((await app.fetch(request(input,'https://other.test'),{})).status,403);
assert.equal((await app.fetch(request('{'),{})).status,400);
assert.equal((await app.fetch(request({...input,apiKey:''}),{})).status,400);
assert.equal((await app.fetch(request({...input,bedId:'unknown'}),{})).status,400);
assert.equal((await app.fetch(request({...input,note:'x'.repeat(2001)}),{})).status,400);
assert.equal((await app.fetch(request('x'.repeat(6001)),{})).status,413);
const fixture={model:'jev-test-fixture',answers:{progress:{type:'choice',choice:'needs_review',probabilities:{improving:0.02,needs_review:0.96,unclear:0.02},confidence:0.9},delay:{type:'noul',noul:0.95}},usage:{input_tokens:100,output_tokens:20}};
const originalFetch=globalThis.fetch;
try {
  globalThis.fetch=async(url,options)=>{
    assert.equal(url,'https://api.typesafe.ai/v1/systemone');
    assert.equal(options.headers.Authorization,'Bearer '+input.apiKey);
    const payload=JSON.parse(options.body);
    assert.equal(payload.model,'jev-latest');assert.equal(payload.state.note,input.note);
    assert.equal(payload.state.pain,4);assert.equal(payload.questions.progress.type,'choice');assert.equal(payload.questions.delay.type,'noul');
    assert.equal(JSON.stringify(payload).includes(input.apiKey),false);
    return Response.json(fixture);
  };
  const result=await app.fetch(request(input),{});
  assert.equal(result.status,200);assert.equal(result.headers.get('Cache-Control'),'no-store');assert.deepEqual(await result.json(),fixture);
  for (const code of [401,429,529,422]) {
    globalThis.fetch=async()=>new Response('Upstream secret that must not be exposed',{status:code});
    const response=await app.fetch(request(input),{});
    assert.equal(response.status,502);assert.equal((await response.text()).includes('secret'),false);
  }
  for(const data of [{}, {...fixture,answers:{progress:{type:'choice',choice:'wrong'},delay:{type:'noul',noul:0.9}}},{...fixture,answers:{...fixture.answers,delay:{type:'noul',noul:2}}}]){
    globalThis.fetch=async()=>Response.json(data);assert.equal((await app.fetch(request(input),{})).status,502);
  }
  globalThis.fetch=async()=>{throw new Error('Network failure')};assert.equal((await app.fetch(request(input),{})).status,502);
} finally {globalThis.fetch=originalFetch;}
console.log('Passed: browser-script syntax; Jev contract with simulated upstream; invalid input; origin checks; missing key; malformed provider answers; authentication/rate-limit/provider errors; network failure; no credential in provider payload or result. No live Jev call made.');
