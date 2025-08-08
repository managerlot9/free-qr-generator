document.addEventListener('DOMContentLoaded', () => {
    const qrCodeInstance = new QRCodeStyling({
        width: 300,
        height: 300,
        type: 'svg',
        data: 'https://github.com/managerlot9',
        image: '',
        dotsOptions: { color: '#000000', type: 'square' },
        backgroundOptions: { color: '#ffffff' },
        imageOptions: { crossOrigin: 'anonymous', margin: 10 }
    });
    qrCodeInstance.append(document.getElementById('qr-code-container'));

    const textInput = document.getElementById('qr-text');
    const sizeSlider = document.getElementById('qr-size');
    const sizeValue = document.getElementById('qr-size-value');
    const colorInput = document.getElementById('qr-color');
    const bgColorInput = document.getElementById('qr-bg-color');
    const dotStyleSelect = document.getElementById('dot-style');
    const logoUpload = document.getElementById('logo-upload');
    const removeLogoBtn = document.getElementById('remove-logo');
    const downloadBtn = document.getElementById('download-btn');
    const shareBtn = document.getElementById('share-btn');

    const updateQrCode = () => {
        qrCodeInstance.update({
            width: parseInt(sizeSlider.value, 10),
            height: parseInt(sizeSlider.value, 10),
            data: textInput.value || ' ',
            dotsOptions: { color: colorInput.value, type: dotStyleSelect.value },
            backgroundOptions: { color: bgColorInput.value }
        });
    };
    
    const params = new URLSearchParams(window.location.search);
    if (params.has('data')) {
        textInput.value = decodeURIComponent(params.get('data'));
        colorInput.value = params.get('fg') || '#000000';
        bgColorInput.value = params.get('bg') || '#ffffff';
        dotStyleSelect.value = params.get('dots') || 'square';
    }
    updateQrCode();

    textInput.addEventListener('input', updateQrCode);
    sizeSlider.addEventListener('input', () => {
        sizeValue.textContent = `${sizeSlider.value}px`;
        updateQrCode();
    });
    colorInput.addEventListener('input', updateQrCode);
    bgColorInput.addEventListener('input', updateQrCode);
    dotStyleSelect.addEventListener('change', updateQrCode);

    logoUpload.addEventListener('change', (event) => {
        if (!event.target.files || !event.target.files[0]) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            qrCodeInstance.update({ image: e.target.result });
            removeLogoBtn.classList.remove('hidden');
        };
        reader.readAsDataURL(event.target.files[0]);
    });

    removeLogoBtn.addEventListener('click', () => {
        qrCodeInstance.update({ image: '' });
        logoUpload.value = '';
        removeLogoBtn.classList.add('hidden');
    });

    downloadBtn.addEventListener('click', () => {
        qrCodeInstance.download({ name: 'qrcode', extension: 'png' });
    });

    const handleShare = async () => {
        const baseUrl = window.location.origin + window.location.pathname;
        const shareParams = new URLSearchParams({
            data: encodeURIComponent(textInput.value),
            fg: colorInput.value,
            bg: bgColorInput.value,
            dots: dotStyleSelect.value
        });
        const shareUrl = `${baseUrl}?${shareParams.toString()}`;
        const shareData = {
            title: 'Free QR Code Generator',
            text: 'Check out this QR code I created with Free QR Code Generator!',
            url: shareUrl,
        };
        if (navigator.share && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.error("Share failed:", err);
            }
        } else {
            navigator.clipboard.writeText(shareUrl).then(() => {
                const originalText = shareBtn.querySelector('span').textContent;
                shareBtn.querySelector('span').textContent = 'Link Copied!';
                setTimeout(() => {
                    shareBtn.querySelector('span').textContent = originalText;
                }, 2000);
            });
        }
    };
    shareBtn.addEventListener('click', handleShare);

    const modal = document.getElementById('about-modal');
    const openModalBtn = document.getElementById('open-about-modal');
    const closeModalBtn = document.getElementById('close-about-modal');
    const openModal = () => {
        document.body.classList.add('modal-open');
        modal.classList.add('visible');
    };
    const closeModal = () => {
        document.body.classList.remove('modal-open');
        modal.classList.remove('visible');
    };
    openModalBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && modal.classList.contains('visible')) closeModal();
    });
    
    modal.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', () => {
            const address = button.dataset.address;
            navigator.clipboard.writeText(address).then(() => {
                const originalText = button.textContent;
                button.textContent = 'Copied!';
                setTimeout(() => {
                    button.textContent = originalText;
                }, 2000);
            }).catch(err => console.error('Failed to copy address: ', err));
        });
    });
});