// ═══════════════════════════════════════════════════════════
//  CHECKOUT — EmailJS Integration
//  Taruh SETELAH <script src="bootstrap.bundle..."></script>
//  dan SETELAH script checkout modal yang sudah ada
// ═══════════════════════════════════════════════════════════

// ── 1. Load EmailJS SDK ─────────────────────────────────
// Tambahkan di <head> index.html:
// <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>

// ── 2. Ganti dengan kredensial kamu dari emailjs.com ────
var EMAILJS_PUBLIC_KEY  = 'isi_dari_emailjs.com';
var EMAILJS_SERVICE_ID  = 'isi_dari_emailjs.com';
var EMAILJS_TEMPLATE_ID = 'isi_dari_emailjs.com';

// ── 3. Init EmailJS ─────────────────────────────────────
emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

// ── 4. Fungsi ambil metode bayar aktif ──────────────────
function getActivePaymentMethod() {
    var activeTab = document.querySelector('.co-pay-tab.active');
    if (!activeTab) return '-';
    var panel = activeTab.getAttribute('data-panel');

    if (panel === 'pay-card') {
        var num  = document.getElementById('cardNumber') ? document.getElementById('cardNumber').value : '';
        var last = num.replace(/\s/g,'').slice(-4);
        return 'Credit Card (**** ' + (last || '****') + ')';
    }
    if (panel === 'pay-transfer') {
        var checked = document.querySelector('input[name="bank"]:checked');
        return 'Bank Transfer — ' + (checked ? checked.value.toUpperCase() : '-');
    }
    if (panel === 'pay-ewallet') {
        var checked = document.querySelector('input[name="ewallet"]:checked');
        return 'E-Wallet — ' + (checked ? checked.value.charAt(0).toUpperCase() + checked.value.slice(1) : '-');
    }
    return '-';
}

// ── 5. Fungsi tampil toast ───────────────────────────────
function showToast() {
    var toast = document.getElementById('coToast');
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 4000);
}

// ── 6. Handle Place Order ────────────────────────────────
document.addEventListener('DOMContentLoaded', function () {

    var btn = document.getElementById('placeOrderBtn');
    if (!btn) return;

    btn.addEventListener('click', function () {

        // Validasi email
        var emailInput = document.getElementById('coEmail');
        var email = emailInput ? emailInput.value.trim() : '';
        if (!email || !email.includes('@')) {
            emailInput.style.borderColor = '#ff3131';
            emailInput.focus();
            return;
        }
        emailInput.style.borderColor = '';

        // Validasi nama
        var nameInput = document.querySelector('.checkout-left input[type="text"]');
        var name = nameInput ? nameInput.value.trim() : 'Customer';

        // Data template EmailJS
        // Sesuaikan key-nya dengan nama variabel di template EmailJS kamu
        var templateParams = {
            to_email    : email,
            to_name     : name || 'Customer',
            order_id    : 'REI-' + Date.now().toString().slice(-6),
            product_name: 'Reijin Naomi',
            product_desc: 'Sepatu Sneakers Casual Wanita Dewasa',
            subtotal    : 'Rp479.900',
            shipping    : 'Rp479.900',
            tax         : 'Rp479.900',
            total       : 'Rp479.900',
            payment     : getActivePaymentMethod(),
            order_date  : new Date().toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          }),
        };

        // Loading state
        var btnText = document.getElementById('placeOrderText');
        btn.disabled = true;
        btnText.textContent = 'Mengirim...';

        // Kirim email
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
            .then(function () {
                // Sukses
                btn.disabled = false;
                btnText.textContent = 'Place Order';

                // Tutup modal
                var modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
                if (modal) modal.hide();

                // Tampilkan toast
                showToast();
            })
            .catch(function (err) {
                console.error('EmailJS error:', err);
                btn.disabled = false;
                btnText.textContent = 'Place Order';
                alert('Gagal mengirim email. Cek koneksi atau kredensial EmailJS.');
            });
    });
});