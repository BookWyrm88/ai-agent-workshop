/* Small layered character renderer. Appearance is configuration, never identity or behavior. */
window.WorkshopHuman=(()=>{
  const choices={presentation:['androgynous','masculine','feminine'],hairLength:['short','medium','long'],hairStyle:['layered','straight','wavy','tousled','tied-back'],jacket:['technical','tailored','long-coat'],accessory:['headset','glasses','earpiece','none']};
  const labels={presentation:'Visual presentation',hairLength:'Hair length',hairStyle:'Hair style',jacket:'Jacket style',accessory:'Accessory'};
  function normalize(a){const v=a.human||{},i={round:0,square:1,cat:2}[a.avatar]||0,d={presentation:choices.presentation[i],hairLength:choices.hairLength[i],hairStyle:['tousled','layered','tied-back'][i],jacket:choices.jacket[i],accessory:choices.accessory[i],hairColor:['#20242c','#bab9c2','#39233e'][i],skinTone:['#be8f72','#d8a487','#a97359'][i]};for(const k of Object.keys(choices))if(choices[k].includes(v[k]))d[k]=v[k];for(const k of ['hairColor','skinTone'])if(/^#[0-9a-f]{6}$/i.test(v[k]||''))d[k]=v[k];return d;}
  function fields(a){const h=normalize(a);return `<div class="human-fields form-pair">${Object.entries(choices).map(([key,values])=>`<label class="field">${labels[key]}<select name="human.${key}">${values.map(v=>`<option value="${v}" ${h[key]===v?'selected':''}>${v.replace('-',' ')}</option>`).join('')}</select></label>`).join('')}<label class="field">Hair color<input type="color" name="human.hairColor" value="${h.hairColor}"></label><label class="field">Skin tone<input type="color" name="human.skinTone" value="${h.skinTone}"></label></div><p class="field-help">Presentation changes the silhouette only. No gender identity is required.</p>`;}
  function svg(a){const h=normalize(a),color=/^#[0-9a-f]{6}$/i.test(a.color)?a.color:'#7edee0',symbol=['✿','◆','★','☀','☾','✦','♥'].includes(a.symbol)?a.symbol:'✿';
    const shoulder=h.presentation==='masculine'?31:h.presentation==='feminine'?37:34,waist=h.presentation==='feminine'?43:40;
    const hairBottom={short:49,medium:69,long:104}[h.hairLength];
    const fringe={straight:'M43 23 69 23 73 42 64 32 43 36Z',layered:'M42 24 66 20 76 33 63 31 59 43 54 33 42 39Z',wavy:'M40 29q4-20 25-10 15 6 8 23-6-15-10-8-9-8-20 5Z',tousled:'M38 30 44 19 42 15 55 20 66 14 66 22 77 26 71 42 64 32 53 39 51 30 41 39Z','tied-back':'M41 31q-1-18 19-14 17 2 15 24L64 28 44 35Z'}[h.hairStyle];
    return `<svg class="bot neon-avatar human-operator" viewBox="0 0 112 224" aria-hidden="true" data-presentation="${h.presentation}" data-hair="${h.hairStyle}"><ellipse cx="56" cy="218" rx="30" ry="5" fill="#000" opacity=".4"/>
      <g class="human-legs" fill="#171a23" stroke="#62606c" stroke-width="1"><path class="leg-left" d="M39 122 56 124 54 173 49 210 36 210 39 171Z"/><path class="leg-right" d="M56 124 74 122 74 168 80 210 65 210 59 174Z"/><path fill="#0c0c11" d="m35 207 15 0 1 10H30q-1-6 5-10m30 0h15l7 10H65Z"/></g>
      <path d="M40 32q-3 0-3 16v${hairBottom-40}q22 14 42 0V36Q70 9 51 18Z" fill="${h.hairColor}" stroke="#111018"/>
      ${h.hairStyle==='tied-back'?`<path d="M73 28q21-6 16 12-10 13 3 ${hairBottom-29}-26-8-17-${hairBottom-38}Z" fill="${h.hairColor}" stroke="#16131b"/>`:''}
      <path d="M49 47v15h16V47" fill="${h.skinTone}" stroke="#382c32"/>
      <path d="M${shoulder} 64 48 56 57 64 66 56 ${112-shoulder} 64 78 103 ${h.jacket==='long-coat'?'88 156 58 146 28 156':'75 131 37 131'} 34 102Z" fill="${h.jacket==='tailored'?'#302a36':'#20242e'}" stroke="#706574"/>
      <path d="M48 57 56 65 64 57 63 112 49 112Z" fill="#11131b"/>
      <path d="M47 59 40 77 50 90 55 66m11-7 7 18-11 13-6-24" fill="#3b3542" stroke="${color}" stroke-width="1"/>
      <path d="M${waist} 109h${112-waist*2}M56 94v33" stroke="#77707b"/><path d="m${shoulder+1} 68-9 32 11 20 8-5-9-20 7-21M${112-shoulder-1} 68 9 32-11 20-8-5 9-20-7-21" fill="#262732" stroke="#6b6072"/>
      <g class="human-hands" fill="${h.skinTone}" stroke="#58404b"><path d="m33 114 8-2 5 9-4 5-7-4Z"/><path d="m79 114-8-2-5 9 4 5 7-4Z"/></g>
      <path d="M42 29q12-13 27 0l-1 18-11 10-12-10Z" fill="${h.skinTone}" stroke="#4f3840"/><path d="m44 39 8-1m8 0 7 1" stroke="#392d37" stroke-width="1.5"/><path d="M47 40h4m10 0h4" stroke="#bce2df" stroke-width="1.5"/><path d="m56 41-1 5 3 1m-6 4h8" fill="none" stroke="#805a59"/>
      <path d="${fringe}" fill="${h.hairColor}" stroke="#17151f"/>
      ${h.accessory==='glasses'?'<g fill="none" stroke="#bedadd"><rect x="43" y="36" width="11" height="8" rx="2"/><rect x="59" y="36" width="11" height="8" rx="2"/><path d="M54 39h5"/></g>':h.accessory==='headset'?`<path d="M39 39V28q17-24 34 0v13" fill="none" stroke="#6b6875" stroke-width="3"/><path d="M40 36v10m32-10v10l-8 3" stroke="${color}" stroke-width="3"/>`:h.accessory==='earpiece'?`<path d="M70 37v10l-6 2" stroke="${color}" stroke-width="3" fill="none"/>`:''}
      <path d="M33 79 31 91m49-12 2 12" stroke="${color}" stroke-width="3"/><text x="68" y="98" font-size="10" fill="${color}" text-anchor="middle">${symbol}</text></svg>`;
  }
  return {normalize,fields,svg,choices};
})();
