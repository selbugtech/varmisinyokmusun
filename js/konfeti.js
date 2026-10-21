// Oyun sonu konfetisi. Renkler temadan (--konfeti CSS değişkeni) okunur.
const Konfeti = {
    at() {
        const canvas = document.createElement("canvas");
        canvas.className = "konfeti";
        document.body.appendChild(canvas);
        const ctx = canvas.getContext("2d");
        canvas.width = innerWidth;
        canvas.height = innerHeight;

        const renkler = getComputedStyle(document.documentElement)
            .getPropertyValue("--konfeti").split(",").map(r => r.trim()).filter(Boolean);
        if (!renkler.length) renkler.push("#ffd700", "#5ddc6a", "#eb4b4b", "#4169e1");

        const parcalar = Array.from({ length: 160 }, () => ({
            x: Math.random() * canvas.width,
            y: -20 - Math.random() * canvas.height * 0.4,
            w: 6 + Math.random() * 8,
            h: 4 + Math.random() * 5,
            renk: renkler[Math.floor(Math.random() * renkler.length)],
            vx: (Math.random() - 0.5) * 5,
            vy: 2 + Math.random() * 4,
            aci: Math.random() * 360,
            donus: (Math.random() - 0.5) * 12,
        }));

        let kare = 0;
        (function ciz() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            parcalar.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.08;
                p.aci += p.donus;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.aci * Math.PI / 180);
                ctx.fillStyle = p.renk;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            if (++kare < 360) requestAnimationFrame(ciz);
            else canvas.remove();
        })();
    },
};
