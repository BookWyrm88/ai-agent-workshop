/* Scene-independent spatial simulation. Zones, reservations and movement events are persisted.
   No rendering or timers here: the application schedules arrivals and dispatches tasks afterward. */
window.WorkshopSpatial = (() => {
  const baseZones=[
    {id:'lounge',name:'Lounge',type:'lounge',position:{x:130,y:500},seats:[{x:73,y:475},{x:153,y:490},{x:115,y:560}],activity:'Rest and wait',view:null},
    {id:'briefing',name:'Briefing circle',type:'collaboration',position:{x:630,y:590},seats:[{x:540,y:586},{x:720,y:586},{x:630,y:625}],activity:'Meet and inspect recorded handoffs',view:'laboratory'},
    {id:'library',name:'Reference library',type:'reference',position:{x:125,y:300},seats:[{x:165,y:338},{x:237,y:350}],activity:'Open training and reference lessons',view:'learn'},
    {id:'operations',name:'Task operations',type:'operations',position:{x:1080,y:420},seats:[{x:1050,y:475},{x:1135,y:475}],activity:'Assign, approve and manage tasks',view:'queue'},
    {id:'archive',name:'Memory archive',type:'archive',position:{x:1090,y:620},seats:[{x:1060,y:660},{x:1140,y:660}],activity:'Review sessions and intentional memory',view:'sessions'}
  ];
  const now=()=>new Date().toISOString(),clone=x=>structuredClone(x);
  function slot(index){const row=Math.floor(index/3);return {x:[375,630,885][index%3]+(row%2?14:0),y:row===0?505:695+(row-1)*205,scale:row===0?.85:1,row};}
  const workId=id=>'workstation-'+id;
  const zone=(state,id)=>state.space.zones.find(z=>z.id===id);
  function record(state,a,type,label,detail){
    state.space.events.push({id:crypto.randomUUID(),agentId:a.id,at:now(),type,label,state:'spatial',config:{id:a.id,name:a.name,color:a.color,symbol:a.symbol,avatar:a.avatar,version:a.version},data:{simulated:true,...detail}});
    state.space.events=state.space.events.slice(-500);
  }
  function occupants(state,zoneId){
    return Object.entries(state.space.locations).flatMap(([agentId,l])=>{
      const list=[];if(l.zoneId===zoneId)list.push({agentId,seat:l.seat,arriving:false});
      if(l.move?.toZoneId===zoneId&&l.zoneId!==zoneId)list.push({agentId,seat:l.move.toSeat,arriving:true});return list;
    });
  }
  function sync(state){
    let changed=false;
    if(!state.space||state.space.schema!==1){state.space={schema:1,zones:clone(baseZones),locations:{},events:[],afterTask:{}};changed=true;}
    const space=state.space;space.afterTask||={};
    for(const a of state.agents){
      let desk=zone(state,workId(a.id));
      if(!desk){const index=Math.max(-1,...space.zones.filter(z=>z.type==='workstation').map(z=>z.index))+1,p=slot(index);desk={id:workId(a.id),name:a.name+'’s workstation',type:'workstation',agentId:a.id,index,position:{x:p.x,y:p.y},seats:[{x:p.x,y:p.y}],activity:'Execute assigned tasks',view:'blueprint'};space.zones.push(desk);changed=true;}
      if(desk.name!==a.name+'’s workstation'){desk.name=a.name+'’s workstation';changed=true;}
      let loc=space.locations[a.id];
      if(a.lifecycle!=='active'){
        if(loc?.zoneId||loc?.move){record(state,a,'agent.left','Agent left the active headquarters',{previousZone:loc.zoneId,lifecycle:a.lifecycle});space.locations[a.id]={zoneId:null,seat:0,position:clone(desk.position),activity:a.lifecycle,move:null};changed=true;}continue;
      }
      if(!loc?.zoneId||!zone(state,loc.zoneId)){space.locations[a.id]={zoneId:desk.id,seat:0,position:clone(desk.position),activity:'idle',move:null};changed=true;}
    }
    const ids=new Set(state.agents.map(a=>a.id));
    for(const id of Object.keys(space.locations))if(!ids.has(id)){delete space.locations[id];delete space.afterTask[id];changed=true;}
    const kept=space.zones.filter(z=>!z.agentId||ids.has(z.agentId));if(kept.length!==space.zones.length){space.zones=kept;changed=true;}
    const keptEvents=space.events.filter(e=>ids.has(e.agentId));if(keptEvents.length!==space.events.length){space.events=keptEvents;changed=true;}
    for(const z of space.zones){const current=occupants(state,z.id);if(JSON.stringify(current)!==JSON.stringify(z.occupancy)){z.occupancy=current;changed=true;}}
    return changed;
  }
  function move(state,agentId,destination,reason='Requested by you'){
    sync(state);const a=state.agents.find(a=>a.id===agentId),l=state.space.locations[agentId],z=zone(state,destination);
    if(!a||a.lifecycle!=='active'||!z)throw Error('Choose an active agent and a valid location.');
    if(z.agentId&&z.agentId!==agentId)throw Error('This workstation is assigned to another operator.');
    if(l.move)throw Error('This agent is already moving. Wait for arrival.');
    if(l.zoneId===destination)return false;
    const taken=new Set(occupants(state,destination).filter(o=>o.agentId!==agentId).map(o=>o.seat));
    const toSeat=z.seats.findIndex((_,i)=>!taken.has(i));if(toSeat<0)throw Error(z.name+' is full. Choose another zone or move an occupant first.');
    const from=clone(l.position),to=clone(z.seats[toSeat]);
    // Enter/leave a workstation beside its tabletop; use the aisle between rows.
    const origin=zone(state,l.zoneId),deskDoor=(p,sign)=>({x:p.x+sign*128,y:p.y-62});
    const side=to.x>=from.x?1:-1;
    const exit=origin.type==='workstation'?deskDoor(from,side):from;
    const entry=z.type==='workstation'?deskDoor(to,-side):to;
    const lane=Math.max(531,origin.type==='workstation'?from.y+27:0,z.type==='workstation'?to.y+27:0);
    const points=[from,exit,{x:exit.x,y:lane},{x:entry.x,y:lane},entry,to].filter((p,i,all)=>!i||p.x!==all[i-1].x||p.y!==all[i-1].y);
    l.move={id:crypto.randomUUID(),fromZoneId:l.zoneId,toZoneId:destination,toSeat,from,to,points,startedAt:Date.now(),duration:api.motionMs,reason};l.activity='moving';
    record(state,a,'movement.started','Moving to '+z.name,{fromZoneId:l.zoneId,toZoneId:destination,from,to,reason,movementId:l.move.id});sync(state);return true;
  }
  function arrive(state,agentId,restored=false){
    const a=state.agents.find(a=>a.id===agentId),l=state.space.locations[agentId];if(!a||!l?.move)return false;
    const m=l.move,z=zone(state,m.toZoneId);if(!z)return false;
    l.zoneId=z.id;l.seat=m.toSeat;l.position=clone(m.to);l.move=null;l.activity=z.type==='lounge'?'lounging':'idle';
    record(state,a,restored?'movement.restored':'movement.arrived',(restored?'Location restored at ':'Arrived at ')+z.name,{zoneId:z.id,position:l.position,movementId:m.id,note:restored?'Restored at the reserved destination after reload. No off-page movement or task execution occurred.':'Recorded simulator movement completed.'});sync(state);return true;
  }
  function restore(state){sync(state);for(const id of Object.keys(state.space.locations)){arrive(state,id,true);const l=state.space.locations[id];if(l.zoneId)l.activity=zone(state,l.zoneId)?.type==='lounge'?'lounging':'idle';}sync(state);}
  function position(state,id,time=Date.now()){
    const l=state.space.locations[id];if(!l)return {x:0,y:0};if(!l.move)return l.position;
    const m=l.move,segments=m.points.slice(1).map((p,i)=>Math.hypot(p.x-m.points[i].x,p.y-m.points[i].y)),total=segments.reduce((a,b)=>a+b,0);
    let distance=Math.max(0,Math.min(1,(time-m.startedAt)/m.duration))*total;
    for(let i=0;i<segments.length;i++){if(distance<=segments[i]){const t=segments[i]?distance/segments[i]:1,a=m.points[i],b=m.points[i+1];return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};}distance-=segments[i];}return m.to;
  }
  function cleanImport(input,agents){
    if(!input)return null;const ids=new Set(agents.map(a=>a.id));
    if(input.schema!==1||!input.locations||typeof input.locations!=='object'||!Array.isArray(input.events)||input.events.length>500)throw Error('Invalid spatial backup.');
    const validId=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,150}$/.test(x)&&!['__proto__','constructor','prototype'].includes(x);
    const validZone=(z,id)=>z===workId(id)||baseZones.some(b=>b.id===z);
    const locations={};for(const [id,l] of Object.entries(input.locations)){
      if(!ids.has(id)||!l||!(l.zoneId===null||validZone(l.zoneId,id)))throw Error('Invalid agent location.');
      const target=l.move?.toZoneId||l.zoneId;if(target!==null&&!validZone(target,id))throw Error('Invalid movement destination.');
      locations[id]={zoneId:target,seat:Number.isInteger(l.move?.toSeat??l.seat)?(l.move?.toSeat??l.seat):0};
    }
    function detail(e){const d=e.data||{},out={simulated:true};for(const key of ['fromZoneId','toZoneId','zoneId','previousZone'])if(d[key]!=null){if(!validZone(d[key],e.agentId))throw Error('Invalid event zone.');out[key]=d[key];}for(const key of ['reason','note','lifecycle','movementId'])if(d[key]!=null){if(typeof d[key]!=='string'||d[key].length>500)throw Error('Invalid event detail.');out[key]=d[key];}for(const key of ['from','to','position'])if(d[key]!=null){if(!Number.isFinite(d[key].x)||!Number.isFinite(d[key].y)||Math.abs(d[key].x)>50000||Math.abs(d[key].y)>50000)throw Error('Invalid event coordinate.');out[key]={x:d[key].x,y:d[key].y};}return out;}
    const events=input.events.map(e=>{if(!validId(e.id)||!ids.has(e.agentId)||typeof e.at!=='string'||!Number.isFinite(Date.parse(e.at))||!/^(movement\.(started|arrived|restored)|agent\.left)$/.test(e.type)||typeof e.label!=='string'||e.label.length>200)throw Error('Invalid spatial event.');const a=agents.find(a=>a.id===e.agentId);return {id:e.id,agentId:e.agentId,at:e.at,type:e.type,label:e.label,state:'spatial',config:{id:a.id,name:a.name,color:a.color,symbol:a.symbol,version:a.version},data:detail(e)};});
    if(new Set(events.map(e=>e.id)).size!==events.length)throw Error('Duplicate spatial event IDs.');
    const afterTask={};for(const a of agents)if(input.afterTask?.[a.id]==='lounge')afterTask[a.id]='lounge';return {locations,events,afterTask};
  }
  function merge(state,clean,added){
    sync(state);if(!clean)return;
    for(const id of added){const incoming=clean.locations[id],a=state.agents.find(a=>a.id===id);if(!incoming||a.lifecycle!=='active')continue;
      const z=zone(state,incoming.zoneId);if(z&&z.type!=='workstation'){
        const occupied=new Set(occupants(state,z.id).filter(o=>o.agentId!==id).map(o=>o.seat)),seat=!occupied.has(incoming.seat)&&z.seats[incoming.seat]?incoming.seat:z.seats.findIndex((_,i)=>!occupied.has(i));
        if(seat>=0)state.space.locations[id]={zoneId:z.id,seat,position:clone(z.seats[seat]),activity:z.type==='lounge'?'lounging':'idle',move:null};
      }
      if(clean.afterTask[id])state.space.afterTask[id]=clean.afterTask[id];
    }
    state.space.events.push(...clean.events.filter(e=>added.has(e.agentId)&&!state.space.events.some(x=>x.id===e.id)));state.space.events=state.space.events.slice(-500);sync(state);
  }
  const api={motionMs:2800,baseZones,workId,zone,slot,occupants,sync,move,arrive,restore,position,cleanImport,merge};return api;
})();
