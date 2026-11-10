/* Visual adapters only. Theme preference never touches an agent or task. */
window.WorkshopTheme = (() => {
  const key='ai-agent-workshop.theme.v1',names={neon:'Neon Noir',spectrum:'Spectrum Studio',forest:'Forest Sanctuary'};
  let current='neon';try{const value=localStorage.getItem(key);if(names[value])current=value;}catch{}
  const apply=()=>{document.documentElement.dataset.theme=current;document.querySelector('meta[name="theme-color"]')?.setAttribute('content',current==='neon'?'#0c0b10':current==='forest'?'#142a24':'#f4f0e9');};apply();
  function select(value){if(!names[value])return;current=value;apply();try{localStorage.setItem(key,value);return true;}catch{return false;}}
  function avatar(a){
    if(current!=='neon')return null;
    return WorkshopHeadquarters.operator(a);
  }

  function environment(){
    if(current==='spectrum')return null;
    if(current==='forest')return `<div class="studio-wall"><span class="studio-sign">FOREST SANCTUARY<small>A quiet place for curious minds.</small></span><svg viewBox="0 0 900 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="900" height="180" fill="#1a342c"/><circle cx="716" cy="40" r="23" fill="#e5d9af"/><path d="M0 130Q200 40 430 112T900 85V180H0" fill="#305447"/>${[20,85,150,220,680,750,835,885].map((x,i)=>`<path d="m${x} 10-43 120h86Z" fill="${i%2?'#223f35':'#3d6350'}"/><path d="M${x} 90v90" stroke="#a1926b" stroke-width="4"/>`).join('')}<path d="M0 165Q200 125 450 168T900 150V180H0" fill="#466a52"/><g fill="#e5dcad"><circle cx="185" cy="75" r="2"/><circle cx="660" cy="90" r="2"/><circle cx="730" cy="120" r="2"/></g></svg></div>`;
    return `<div class="studio-wall"><span class="studio-sign">NOCTURNE / RESEARCH HQ<small>Independent minds. Shared discoveries.</small></span><svg viewBox="0 0 1000 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="city-sky" x2="0" y2="1"><stop stop-color="#0e1734"/><stop offset="1" stop-color="#253754"/></linearGradient></defs><rect width="1000" height="180" fill="url(#city-sky)"/><circle cx="795" cy="43" r="23" fill="#9cadce" opacity=".5"/>${[0,70,120,180,250,340,410,480,560,640,720,810,900,960].map((x,i)=>{const y=20+(i*37)%80;return `<rect x="${x}" y="${y}" width="${38+i%3*13}" height="${180-y}" fill="${i%2?'#101a30':'#17233c'}"/><path d="M${x+8} ${y+12}h20m-20 12h20m-20 12h20m-20 12h20m-20 12h20m-20 12h20" stroke="${i%3?'#65bac7':'#bd77b1'}" stroke-width="2" opacity=".3"/>`;}).join('')}<path d="M0 170h1000M215 0v175M785 0v175" stroke="#091222" stroke-width="10"/><path d="M0 176h1000" stroke="#41c6da" opacity=".4"/><g class="rain" stroke="#c6e4f1" opacity=".15">${Array.from({length:34},(_,i)=>`<path d="m${i*31} ${(i*47)%180} -6 22"/>`).join('')}</g></svg></div>`;
  }
  function room(html){const env=environment();if(env)html=html.replace(/<div class="studio-wall">[\s\S]*?<\/div>(?=<div class="station-grid")/,env);
    if(current==='neon')html=html.replace(/<svg class="desk-art"[\s\S]*?<\/svg>/g,`<svg class="desk-art" viewBox="0 0 240 105" aria-hidden="true"><ellipse cx="120" cy="97" rx="100" ry="7" fill="#000" opacity=".25"/><path d="m23 51 10 46h12l8-46m134 0 8 46h12l10-46" fill="#19283c" stroke="#48647a"/><path d="M16 36h208l10 17H6Z" fill="#263954" stroke="#52718b"/><path d="M6 53h228v8H6Z" fill="#132438"/><path d="M10 55h220" stroke="var(--agent)" stroke-width="2"/><path d="M28 1h63v37H28Z" fill="#0b192d" stroke="var(--agent)"/><path d="M34 10h46m-46 7h21m-21 7h39m-39 7h31" stroke="var(--agent)" opacity=".65"/><path d="M60 39v7m-12 0h24" stroke="#6d8b9c" stroke-width="3"/><path d="m154 9 52 4-3 31-51-4Z" fill="#142f45" stroke="var(--agent)" opacity=".7"/><path d="m159 19 35 3m-35 6 26 3" stroke="var(--agent)"/><path d="M32 48h55M112 47h20" stroke="#a3bcc7" stroke-width="2"/></svg>`);
    return html.replace('✿ Independent agents, one shared creative space. <span>No collaboration is simulated.</span>','Independent agents · one shared headquarters.<span>Activity and handoffs reflect recorded simulation events.</span>');
  }
  return {select,get current(){return current;},names,avatar,room};
})();
