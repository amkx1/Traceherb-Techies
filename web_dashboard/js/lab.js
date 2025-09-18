document.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById('uploadTest')?.addEventListener('click', async ()=>{
        const batchId=document.getElementById('batchId').value;
        const file=document.getElementById('reportFile').files[0];
        const formData=new FormData();
        formData.append('batchId', batchId);
        formData.append('labId','lab-1');
        formData.append('results', JSON.stringify({quality:'good'}));
        if(file) formData.append('reportFile', file);
        const res=await fetch('http://localhost:4000/api/lab/tests',{method:'POST',body:formData});
        alert('Uploaded'); console.log(await res.json());
    });
});
