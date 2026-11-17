/* Backward compatibility only: retain validated legacy appearance in backups and version history. */
window.WorkshopHuman=(()=>{
  const choices={presentation:['androgynous','masculine','feminine'],hairLength:['short','medium','long'],hairStyle:['layered','straight','wavy','tousled','tied-back'],jacket:['technical','tailored','long-coat'],accessory:['headset','glasses','earpiece','none']};
  function normalize(a){const v=a.human||{},i={round:0,square:1,cat:2}[a.avatar]||0,d={presentation:choices.presentation[i],hairLength:choices.hairLength[i],hairStyle:['tousled','layered','tied-back'][i],jacket:choices.jacket[i],accessory:choices.accessory[i],hairColor:['#20242c','#bab9c2','#39233e'][i],skinTone:['#be8f72','#d8a487','#a97359'][i]};for(const k of Object.keys(choices))if(choices[k].includes(v[k]))d[k]=v[k];for(const k of ['hairColor','skinTone'])if(/^#[0-9a-f]{6}$/i.test(v[k]||''))d[k]=v[k];return d;}
  return {normalize};
})();
