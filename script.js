const CATS = {
  belajar:   { n: "Belajar",   c: "var(--belajar)",   q: "Seberapa fokus?" },
  tidur:     { n: "Tidur",     c: "var(--tidur)",     q: "Seberapa nyenyak?" },
  istirahat: { n: "Istirahat", c: "var(--istirahat)", q: "Seberapa segar setelahnya?" },
  aktivitas: { n: "Aktivitas", c: "var(--aktivitas)", q: "Seberapa bermanfaat?" }
};
const KEY = "hahahawkins-jadwal";
const $ = (id) => document.getElementById(id);
const fmt = (n) => String(Math.round(n * 10) / 10).replace(".", ",");

let items = [];
try { items = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { items = []; }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} };

function sumBy(cat) {
  return items.filter((i) => i.cat === cat).reduce((a, i) => a + i.dur, 0);
}

function render() {
  const total = items.reduce((a, i) => a + i.dur, 0);
  const weighted = items.reduce((a, i) => a + i.dur * i.eff, 0);
  const score = total ? Math.round((weighted / total / 5) * 100) : 0;

  $("score").textContent = score + "%";
  $("hours").textContent = "Terpakai " + fmt(total) + " dari 24 jam";

  // bar dan legenda
  $("bar").innerHTML = Object.keys(CATS).map((k) =>
    '<span style="width:' + Math.min(sumBy(k) / 24 * 100, 100) + '%;background:' + CATS[k].c + '"></span>').join("");
  $("legend").innerHTML = Object.keys(CATS).map((k) =>
    '<li><i style="background:' + CATS[k].c + '"></i>' + CATS[k].n + " " + fmt(sumBy(k)) + " jam</li>").join("");

  // saran
  const tips = [];
  const tidur = sumBy("tidur"), belajar = sumBy("belajar"), rehat = sumBy("istirahat");
  if (total > 24) tips.push(["warn", "Totalnya lebih dari 24 jam. Kurangi durasi supaya pas dalam satu hari."]);
  if (items.length) {
    if (tidur < 8) tips.push(["", "Tidur baru " + fmt(tidur) + " jam. Pelajar umumnya butuh sekitar 8 sampai 10 jam."]);
    else tips.push(["", "Jam tidurmu sudah cukup. Pertahankan."]);
    if (belajar >= 5 && rehat < belajar / 3) tips.push(["warn", "Belajar " + fmt(belajar) + " jam tapi istirahat baru " + fmt(rehat) + " jam. Selipkan jeda supaya fokus tetap terjaga."]);
    const low = items.reduce((m, i) => (i.eff < m.eff ? i : m), items[0]);
    if (score < 60) tips.push(["warn", "Keefektifan masih rendah. Mulai dari kegiatan bernilai terendah: " + CATS[low.cat].n + " (" + low.eff + " dari 5)."]);
    else if (score >= 80) tips.push(["", "Harimu seimbang dan efektif."]);
  }
  $("tips").innerHTML = tips.map((t) => '<li class="' + t[0] + '">' + t[1] + "</li>").join("");

  // daftar kegiatan
  $("entries").innerHTML = items.length
    ? items.map((i, n) =>
        '<li><i style="background:' + CATS[i.cat].c + '"></i><span>' + CATS[i.cat].n + ", " + fmt(i.dur) +
        ' jam, efektif ' + i.eff + '/5</span><button type="button" data-n="' + n + '" aria-label="Hapus ' + CATS[i.cat].n + '">&times;</button></li>').join("")
    : '<li class="empty">Belum ada kegiatan. Isi formulir lalu tekan Tambah ke jadwal.</li>';
}

$("cat").addEventListener("change", () => { $("effLabel").textContent = CATS[$("cat").value].q; });
$("eff").addEventListener("input", () => { $("effOut").textContent = $("eff").value + " dari 5"; });

$("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const dur = parseFloat($("dur").value);
  if (!(dur > 0)) return;
  items.push({ cat: $("cat").value, dur, eff: parseInt($("eff").value, 10) });
  save(); render();
});

$("entries").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-n]");
  if (!b) return;
  items.splice(+b.dataset.n, 1);
  save(); render();
});

$("reset").addEventListener("click", () => { items = []; save(); render(); });

render();
