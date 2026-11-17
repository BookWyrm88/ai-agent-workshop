// A saved one-operator workspace from before the three-agent starter roster.
module.exports=function legacyWorkspace(w){
 const id=w.crypto.randomUUID(),a={id,name:'Moss',role:'Document explorer',instructions:'Summarize the document accurately. Use bullets.',document:w.WorkshopCore.SAMPLE,tool:true,format:'concise',version:1};
 return JSON.stringify({agents:[a],selected:id,runs:[],messages:[],settings:{advanced:false},ui:{view:'workshop',zoom:1},tutorial:{active:false,step:0},drafts:{agents:{},chats:{},evaluations:{}}});
};
