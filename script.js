document.addEventListener("DOMContentLoaded", () => {
    const qrOptions = {
        width: 300,
        height: 300,
        type: "svg",
        data: "https://github.com/managerlot9",
        image: "",
        dotsOptions: { color: "#000", type: "square" },
        backgroundOptions: { color: "#fff" },
        imageOptions: { crossOrigin: "anonymous", margin: 10 }
    };
    const qrCode = new QRCodeStyling(qrOptions);
    qrCode.append(document.getElementById("qr-code-container"));

    const qrText = document.getElementById("qr-text");
    const qrSize = document.getElementById("qr-size");
    const qrSizeValue = document.getElementById("qr-size-value");
    const qrColor = document.getElementById("qr-color");
    const qrBgColor = document.getElementById("qr-bg-color");
    const dotStyle = document.getElementById("dot-style");
    const logoUpload = document.getElementById("logo-upload");
    const removeLogo = document.getElementById("remove-logo");
    const downloadBtn = document.getElementById("download-btn");
    const shareBtn = document.getElementById("share-btn");
    const disableCaption = document.getElementById("disable-caption");
    const editCaption = document.getElementById("edit-caption");
    const captionEditGroup = document.getElementById("caption-edit-group");
    const captionText = document.getElementById("caption-text");

    const updateQR = () => {
        qrCode.update({
            width: parseInt(qrSize.value, 10),
            height: parseInt(qrSize.value, 10),
            data: qrText.value || " ",
            dotsOptions: { color: qrColor.value, type: dotStyle.value },
            backgroundOptions: { color: qrBgColor.value }
        });
    };

    qrText.addEventListener("input", updateQR);
    qrSize.addEventListener("input", () => {
        qrSizeValue.textContent = `${qrSize.value}px`;
        updateQR();
    });
    qrColor.addEventListener("input", updateQR);
    qrBgColor.addEventListener("input", updateQR);
    dotStyle.addEventListener("change", updateQR);

    logoUpload.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                qrCode.update({ image: ev.target.result });
                removeLogo.classList.remove("hidden");
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    removeLogo.addEventListener("click", () => {
        qrCode.update({ image: "" });
        logoUpload.value = "";
        removeLogo.classList.add("hidden");
    });

    downloadBtn.addEventListener("click", () => {
        qrCode.download({ name: "qrcode", extension: "png" });
    });

    // Показывать/скрывать поле для редактирования подписи
    editCaption.addEventListener("change", () => {
        if (editCaption.checked) {
            captionEditGroup.classList.remove("hidden");
        } else {
            captionEditGroup.classList.add("hidden");
        }
    });

    // --- SHARE BUTTON ---
    shareBtn.addEventListener("click", async () => {
        try {
            const prevType = qrCode._options.type;
            qrCode.update({ type: "canvas" });
            await new Promise(resolve => setTimeout(resolve, 400));
            const container = document.getElementById("qr-code-container");
            const canvas = container.querySelector("canvas");
            if (!canvas) {
                alert("Ошибка: не удалось получить изображение QR-кода.");
                qrCode.update({ type: prevType });
                return;
            }
            const dataUrl = canvas.toDataURL("image/png");
            qrCode.update({ type: prevType });

            if (!dataUrl.startsWith("data:image/png")) {
                alert("Ошибка: не удалось создать PNG-изображение QR-кода.");
                return;
            }

            const res = await fetch(dataUrl);
            const blob = await res.blob();
            const file = new File([blob], "qrcode.png", { type: "image/png" });

            let textToSend = "";
            // Исправленная логика:
            if (disableCaption.checked) {
                textToSend = "";
            } else if (editCaption.checked) {
                textToSend = captionText.value;
            } else {
                textToSend = "Made with https://managerlot9.github.io/free-qr-generator/";
            }

            const shareData = {
                title: "QR Code",
                files: [file]
            };
            if (textToSend) {
                shareData.text = textToSend;
            }

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share(shareData);
            } else {
                alert("Ваш браузер не поддерживает функцию 'Поделиться с файлом'.\n\nЭта функция работает только на мобильных устройствах (Android/iOS) и при открытии сайта по HTTPS.");
            }
        } catch (err) {
            alert("Ошибка при попытке поделиться QR-кодом.");
            console.error(err);
        }
    });

    // --- MODAL ---
    const aboutModal = document.getElementById("about-modal");
    const openAboutModal = document.getElementById("open-about-modal");
    const closeAboutModal = document.getElementById("close-about-modal");
    const showModal = () => {
        document.body.classList.add("modal-open");
        aboutModal.classList.add("visible");
    };
    const hideModal = () => {
        document.body.classList.remove("modal-open");
        aboutModal.classList.remove("visible");
    };
    openAboutModal.addEventListener("click", showModal);
    closeAboutModal.addEventListener("click", hideModal);
    aboutModal.addEventListener("click", (e) => {
        if (e.target === aboutModal) hideModal();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && aboutModal.classList.contains("visible")) hideModal();
    });
    aboutModal.querySelectorAll(".copy-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const addr = btn.dataset.address;
            navigator.clipboard.writeText(addr).then(() => {
                const oldText = btn.textContent;
                btn.textContent = "Copied!";
                setTimeout(() => { btn.textContent = oldText; }, 2000);
            }).catch((err) => console.error("Failed to copy address: ", err));
        });
    });
});