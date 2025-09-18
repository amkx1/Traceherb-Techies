document.addEventListener('DOMContentLoaded', ()=>{
    const listEl = document.getElementById('harvestList');
    let harvests = JSON.parse(localStorage.getItem('harvests')||'[]');
    function render(){ listEl.innerHTML = ''; harvests.forEach(h=>{ const li=document.createElement('li'); li.textContent=JSON.stringify(h); listEl.appendChild(li); }); }
    render();
    document.getElementById('saveHarvest')?.addEventListener('click', ()=>{
        const s=document.getElementById('species').value, w=parseFloat(document.getElementById('weight').value||0);
        const h={species:s,weight:w,timestamp:new Date().toISOString()}; harvests.push(h); localStorage.setItem('harvests', JSON.stringify(harvests)); render();
    });
    document.getElementById('syncHarvest')?.addEventListener('click', async ()=>{
        for(const h of harvests){ await post('/harvests', h); }
        alert('Sync attempted'); harvests=[]; localStorage.setItem('harvests','[]'); render();
    });
});
