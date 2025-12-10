document.addEventListener("DOMContentLoaded", () => {
    const barras = document.querySelectorAll("[data-percent]");
    
    barras.forEach(barra => {
        const percent = barra.getAttribute("data-percent");
        barra.style.width = percent + "%";
    });
});
