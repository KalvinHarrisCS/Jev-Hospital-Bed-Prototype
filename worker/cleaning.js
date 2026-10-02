export default String.raw`(() => {
  const panel = document.getElementById('cleaning');
  const rooms = beds.filter(b => ['DUE','CLN'].includes(b.status)).map(b => b.id);
  panel.innerHTML = '<div class="section-head"><h2><span class="number">03</span>Room cleaning record</h2><p>Start-to-finish elapsed time · computer clock · New York timestamps</p></div><div class="content"><div class="clean-controls"><label>Room in turnaround <select id="room">'+rooms.map(id => '<option>'+id+'</option>').join('')+'</select></label><p class="actions"><button id="clean-start" type="button">Start cleaning</button> <button id="clean-finish" type="button">Finish cleaning</button></p></div><p id="clean-status" role="status" aria-live="polite"></p><pre id="clean-log"></pre></div><div class="record-footer">Saved in this browser: room IDs and timestamps only. Finishing the timer does not release a bed. Staff still confirm cleaning quality, equipment, staffing and release.</div>';
  const el = id => document.getElementById(id), storageKey = 'obgyn-cleaning-demo-v1';
  let log = [], storageMessage = '';
  function load() { try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (Array.isArray(stored)) log = stored.filter(item => item && rooms.includes(item.room) && Number.isFinite(item.start) && item.start>=0 && (item.end===null || Number.isFinite(item.end) && item.end>=item.start)).map(({room,start,end}) => ({room,start,end}));
  } catch { storageMessage = 'Browser saving is unavailable; this timer will last only for this page.'; } }
  load();
  const active = room => log.find(item => item.room===room && item.end===null);
  const minutes = milliseconds => (Math.max(0,milliseconds)/60000).toFixed(1);
  const stamp = time => new Date(time).toLocaleString('en-US',{timeZone:'America/New_York'});
  function save() {
    try { localStorage.setItem(storageKey,JSON.stringify(log)); }
    catch { storageMessage = 'Browser saving is unavailable; this timer will last only for this page.'; }
  }
  function draw() {
    const room = el('room').value, current = active(room), completed = log.filter(item => item.end!==null), last = completed.filter(item => item.room===room).at(-1);
    el('clean-start').disabled = !!current; el('clean-finish').disabled = !current;
    el('clean-status').textContent = (current ? room+' cleaning: '+minutes(Date.now()-current.start)+' minutes elapsed.' : last ? room+' cleaning finished in '+minutes(last.end-last.start)+' minutes; awaiting staff release.' : 'Select a room and start a new timing.')+' '+storageMessage;
    const average = completed.length ? minutes(completed.reduce((sum,item) => sum+item.end-item.start,0)/completed.length) : 'unknown';
    el('clean-log').textContent = 'Local average: '+average+' minutes ('+completed.length+' completed timings).\n'+log.map(item => item.room+' | Start (New York): '+stamp(item.start)+' | '+(item.end===null ? 'In progress' : 'Finish: '+stamp(item.end)+' | '+minutes(item.end-item.start)+' minutes')).join('\n');
  }
  el('clean-start').onclick = () => {
    load();
    const room = el('room').value;
    if (active(room)) return;
    log.push({room,start:Date.now(),end:null}); save(); draw();
  };
  el('clean-finish').onclick = () => {
    load();
    const current = active(el('room').value);
    if (!current) return;
    current.end = Math.max(current.start,Date.now()); save(); draw();
  };
  window.addEventListener('storage',event => { if (event.key===storageKey) { load(); draw(); } });
  el('room').onchange = draw; draw(); setInterval(draw,1000);
})();`;
