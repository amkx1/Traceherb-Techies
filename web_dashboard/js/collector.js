document.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById('createBatch')?.addEventListener('click', async ()=>{
        const r = await post('/batches', { collectionIds:['demo1','demo2'], createdBy:'collector-1'});
        const qrcodeEl=document.getElementById('qrcode'); qrcodeEl.innerHTML='';
        new QRCode(qrcodeEl, r.batchId);
    });
});
