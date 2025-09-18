document.addEventListener('DOMContentLoaded', ()=>{
    const video=document.getElementById('video');
    const listEl=document.getElementById('provenanceList');
    navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}).then(stream=>{ video.srcObject=stream; });
    // For demo, simulate QR scan every 5s and fetch provenance
    setInterval(async ()=>{
        const batchId='BATCH-DEMO';
        const r=await get('/provenance/'+batchId);
        listEl.innerHTML='';
        r.provenance.chainOfCustody.forEach(e=>{
            const li=document.createElement('li');
            li.textContent=`${e.event} by ${e.actor} at ${e.time}`;
            listEl.appendChild(li);
        });
    },5000);
});
