document.addEventListener('DOMContentLoaded', ()=>{
    document.getElementById('sendOtp')?.addEventListener('click', async ()=>{
        const phone = document.getElementById('phone').value;
        const r = await post('/auth/otp', { phone });
        alert('OTP sent: ' + r.code);
    });
    document.getElementById('verifyOtp')?.addEventListener('click', async ()=>{
        const phone = document.getElementById('phone').value;
        const code = document.getElementById('otp').value;
        const r = await post('/auth/verify', { phone, code });
        if(r.token){ localStorage.setItem('token', r.token); alert('Logged in'); window.location='farmer.html'; }
    });
});
