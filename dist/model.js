/* Persistence boundary. No timers, network calls, credentials, or UI dependencies. */
window.WorkshopData = (() => {
  const clone=x=>structuredClone(x), now=()=>new Date().toISOString(), id=()=>crypto.randomUUID();
  const terminal=s=>['completed','failed','cancelled'].includes(s);
  function event(run,type,label,data={},state=run.status){
    const e={id:id(),runId:run.id,agentId:run.agentId,at:now(),type,label,state,data};run.events.push(e);return e;
  }
  function migrate(state){
    state.schema=3;state.versions ||= {};state.handoffs ||= [];state.queuePaused ||= {};
    state.sessions ||= [];state.memories ||= [];
    for(const a of state.agents){
      a.lifecycle ||= 'active';
      const snapshots=[...state.runs.filter(r=>r.agentId===a.id).map(r=>r.config),a];
      state.versions[a.id] ||= [...new Map(snapshots.map(c=>[c.version,clone(c)])).values()].sort((a,b)=>a.version-b.version);
      if(!state.sessions.some(s=>s.agentId===a.id))state.sessions.push({id:id(),agentId:a.id,title:'Original conversation',created:now(),summary:'',context:[]});
      a.sessionId ||= state.sessions.find(s=>s.agentId===a.id).id;
      for(const r of state.runs.filter(r=>r.agentId===a.id)){r.sessionId ||= a.sessionId;r.created ||= r.started;}
      for(const m of state.messages.filter(m=>m.agentId===a.id))m.sessionId ||= a.sessionId;
    }
    // Work in progress is never replayed automatically. Pending assignments are retained but held.
    for(const r of state.runs){
      if(['working','using-tool','paused','waiting'].includes(r.status)){
        r.status='cancelled';r.finished=now();event(r,'task.interrupted','Stopped by refresh',{message:'Execution stops when the page closes. Retry explicitly to create a new run.'});
      }
      if(r.status==='queued')state.queuePaused[r.agentId]=true;
    }
    for(const h of state.handoffs){const target=state.runs.find(r=>r.id===h.recipientRunId);if(target&&['failed','cancelled'].includes(target.status))h.status=target.status;}
  }
  function enqueue(state,a,task,options={}){
    const r={id:id(),agentId:a.id,sessionId:a.sessionId,task,config:clone(a),created:now(),started:now(),status:'queued',events:[],evaluation:null,queueOrder:Math.max(0,...state.runs.map(r=>r.queueOrder||0))+1,...options};
    state.runs.unshift(r);event(r,'task.queued','Task added to queue',{version:a.version});return r;
  }
  const pending=(state,agentId)=>state.runs.filter(r=>r.agentId===agentId&&r.status==='queued').sort((a,b)=>(a.queueOrder||0)-(b.queueOrder||0));
  function reorder(state,runId,direction){
    const r=state.runs.find(r=>r.id===runId);if(!r||r.status!=='queued')return;
    const list=pending(state,r.agentId),index=list.indexOf(r),other=list[index+direction];if(!other)return;
    [r.queueOrder,other.queueOrder]=[other.queueOrder,r.queueOrder];event(r,'queue.reordered','Pending task reordered',{position:index+direction+1});
  }
  function version(state,a,next){
    const identity={id:a.id,lifecycle:a.lifecycle,practice:a.practice,sessionId:a.sessionId};
    Object.assign(a,clone(next),identity,{version:a.version+1});
    (state.versions[a.id] ||= []).push(clone(a));return a;
  }
  return {clone,now,id,terminal,event,migrate,enqueue,pending,reorder,version};
})();
