/* Runtime boundary: future providers implement plan(config, task) and return observable steps.
   The UI subscribes to events; it never invents progress or exposes model reasoning. */
(function (root) {
  const SAMPLE = 'Greenhouse sensor trial — QA field notes\n\nThe team tested 24 temperature sensors over seven days. Twenty-two sensors met the acceptance limit of ±0.5°C. Two sensors drifted beyond the limit after exposure to high humidity. Both failures came from batch B. The reference thermometer was calibrated before the trial. Humidity was not controlled, so the cause of the drift has not been confirmed. Quarantine batch B and repeat testing under controlled humidity before release. The trial lead will review the repeat results on Friday.';
  const split = text => { const parts=text.split(/\n\s*\n/);const body=parts.length>1?parts.slice(1).join(' '):text;return body.split(/(?<=[.!?])\s+(?=[A-Z])/).map(x=>x.trim()).filter(Boolean); };
  class SimulationProvider {
    plan(config, task, fail, input) {
      if(input?.kind==='research.result') {
        const output=String(input.output||'');
        const checks={hasResult:output.length>0,hasSourceLabel:/Source:/.test(output),mentionsUncertainty:/not controlled|not been confirmed|uncertain|limitation/i.test(output),sourceAttached:typeof input.sourceDocument==='string'&&input.sourceDocument.length>0};
        const review='Research review (deterministic simulation)\n\n'+Object.entries(checks).map(([name,pass])=>(pass?'PASS':'CHECK')+' · '+name).join('\n')+'\n\nReviewed '+output.length+' characters from task '+input.sourceTaskId+'. These fixed checks do not establish factual correctness. Human review is still needed.';
        return [
          {type:'task.started',state:'working',label:'Evaluation started',data:{provider:'Deterministic simulation',version:config.version}},
          {type:'evaluation.input',state:'using-tool',label:'Reading received research payload',data:{payload:input}},
          {type:'evaluation.checked',state:'working',label:'Fixed quality checks applied',data:{checks,method:'Presence checks against the actual received output; no model or external research'}},
          {type:'task.completed',state:'completed',label:'Evaluation completed',data:{output:review,checks,cost:0,modelTokens:null}}
        ];
      }
      const base = [{type:'task.started',state:'working',label:'Task received',data:{task,agent:config.name,version:config.version,provider:'Deterministic simulation'}}];
      if (!config.tool) return [...base,{type:'task.failed',state:'failed',label:'Document tool is disabled',data:{error:'Enable the Sample document tool in Blueprint, save, and retry. No document was read.'}}];
      const steps = [...base,{type:'tool.called',state:'using-tool',label:'Reading sample document',data:{tool:'sample_document.read',input:{document:'workshop-sample'},permission:'Local sample only'}}];
      if(fail) return [...steps,{type:'tool.failed',state:'failed',label:'Simulated document read failure',data:{error:'Intentional practice failure. Retry to run again; no external service was contacted.'}}];
      const text=config.document || SAMPLE;
      steps.push({type:'tool.result',state:'working',label:'Document received',data:{tool:'sample_document.read',output:text,characters:text.length}});
      const sentences=split(text); const detailed=config.format==='detailed'||/detailed/i.test(config.instructions);
      let chosen=sentences.slice(0,detailed?7:3);
      if(/risk|uncertain|limitation/i.test(config.instructions)) {
        const risk=sentences.find(s=>/not confirmed|not been confirmed|uncertain|not controlled|limitation|risk/i.test(s));
        if(risk&&!chosen.includes(risk)) chosen.push(risk);
      }
      if(/next steps?/i.test(config.instructions)) {
        const next=sentences.find(s=>/quarantine|repeat|must|should|next/i.test(s));
        if(next&&!chosen.includes(next))chosen.push(next);
      }
      let output;
      if(/checklist|action|next step/i.test(task)) output='Action checklist (simulated)\n\n'+sentences.filter(s=>/quarantine|repeat|review|must|should|next/i.test(s)).map(s=>'☐ '+s).join('\n');
      else if(/summari|summary|explain|document|sensor|report|trial/i.test(task)) output=(detailed?'Detailed summary':'Concise summary')+' (simulated)\n\n'+chosen.map(s=>(/bullet/i.test(config.instructions)||detailed?'• ':'')+s).join(detailed?'\n':' ')+'\n\nSource: the sample document. This is a rule-based extract, not a model-generated answer.';
      else output='This simulation can summarize the sample document or extract an action checklist. Try “Summarize the sample document” or “Create an action checklist.” Open Blueprint to change the document, output style, and supported instruction cues (bullets and risks). General conversation requires a future model integration.';
      steps.push({type:'output.created',state:'working',label:'Preparing response',data:{method:'Deterministic sentence extraction',format:config.format,instructions:config.instructions}});
      steps.push({type:'task.completed',state:'completed',label:'Task completed',data:{output,cost:0,modelTokens:null}});
      return steps;
    }
  }
  class AgentRuntime {
    constructor(provider=new SimulationProvider(),delay=750){this.provider=provider;this.delay=delay;this.listeners=new Set();this.active=null;}
    subscribe(fn){this.listeners.add(fn);return()=>this.listeners.delete(fn);}
    emit(step){const event={...step,id:crypto.randomUUID(),runId:this.active.id,at:new Date().toISOString()};this.listeners.forEach(fn=>fn(event));}
    start(id,config,task,fail=false,input){if(this.active) throw Error('A run is already active');this.active={id,steps:this.provider.plan(config,task,fail,input),index:0,paused:false};this.tick();}
    tick(){if(!this.active||this.active.paused)return;const a=this.active;const step=a.steps[a.index++];if(!step)return;this.emit(step);if(['completed','failed'].includes(step.state)){this.active=null;return;}this.timer=setTimeout(()=>this.tick(),this.delay);}
    pause(){if(!this.active||this.active.paused)return;clearTimeout(this.timer);this.active.paused=true;this.emit({type:'task.paused',state:'paused',label:'Paused by you',data:{message:'The simulation will wait until you resume.'}});}
    resume(){if(!this.active?.paused)return;this.active.paused=false;this.emit({type:'task.resumed',state:'working',label:'Resumed by you',data:{}});this.timer=setTimeout(()=>this.tick(),this.delay);}
    cancel(){if(!this.active)return;clearTimeout(this.timer);this.emit({type:'task.cancelled',state:'cancelled',label:'Cancelled by you',data:{}});this.active=null;}
  }
  root.WorkshopCore={SAMPLE,SimulationProvider,AgentRuntime};
})(typeof window!=='undefined'?window:globalThis);
