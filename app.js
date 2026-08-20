const STORAGE_KEY = 'radha-jap-tracker-v2';
const state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || { entries: { '2026-08-18': 216, '2026-08-19': 432 }, target: 20000000 };
const getDateKey = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
const getMonthKey = (date) => getDateKey(date).slice(0, 7);
let selectedMonth = getMonthKey(new Date());
let installEvent;

const $ = (selector) => document.querySelector(selector);
const formatNumber = (number) => new Intl.NumberFormat('hi-IN').format(number);
const getMonthLabel = (month) => new Intl.DateTimeFormat('hi-IN', { month: 'long', year: 'numeric' }).format(new Date(`${month}-01T00:00:00`));
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));

function addCount(amount, dateKey = getDateKey(new Date()), source = 'mobile') {
  if (!Number.isFinite(amount) || amount < 1) return;
  state.entries[dateKey] = (state.entries[dateKey] || 0) + Math.floor(amount);
  save(); render(); showToast(source === 'radhe' ? 'RADHA जाप +1' : `${formatNumber(Math.floor(amount))} जाप जुड़ गया`);
}
function showToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  clearTimeout(showToast.timer); showToast.timer = setTimeout(() => toast.classList.remove('show'), 2200);
}
function render() {
  const todayKey = getDateKey(new Date());
  const today = state.entries[todayKey] || 0;
  const monthTotal = Object.entries(state.entries).filter(([key]) => key.startsWith(selectedMonth)).reduce((sum, [, value]) => sum + value, 0);
  const lifetime = Object.values(state.entries).reduce((sum, value) => sum + value, 0);
  const percent = (lifetime / state.target) * 100;
  const percentLabel = percent >= 100 ? '100%' : `${percent.toLocaleString('en-IN', { maximumFractionDigits: 5 })}%`;
  $('#todayTotal').textContent = formatNumber(today); $('#monthTotal').textContent = formatNumber(monthTotal); $('#lifetimeTotal').textContent = formatNumber(lifetime);
  $('#targetText').textContent = `लक्ष्य ${formatNumber(state.target)}`; $('#progressText').textContent = percentLabel; $('#progressBar').style.width = `${Math.min(100, percent)}%`;
  $('#monthName').textContent = getMonthLabel(selectedMonth); $('#historyTotal').textContent = formatNumber(monthTotal);
  const monthEntries = Object.entries(state.entries).filter(([key, value]) => key.startsWith(selectedMonth) && value > 0).sort(([a], [b]) => b.localeCompare(a));
  $('#activeDays').textContent = formatNumber(monthEntries.length);
  $('#historyList').innerHTML = monthEntries.length ? monthEntries.map(([key, value]) => {
    const date = new Date(`${key}T00:00:00`); const day = new Intl.DateTimeFormat('hi-IN', { weekday: 'short' }).format(date); const label = new Intl.DateTimeFormat('hi-IN', { day: 'numeric', month: 'short' }).format(date);
    const width = Math.min(100, Math.max(8, (value / Math.max(...monthEntries.map(([, entryValue]) => entryValue), 1)) * 100));
    return `<div class="history-row"><span class="day">${label}<br><small>${day}</small></span><div class="history-bar"><span style="width:${width}%"></span></div><strong>${formatNumber(value)}</strong></div>`;
  }).join('') : '<div class="empty-history">इस महीने अभी कोई जाप दर्ज नहीं है।<br>आज का पहला नाम जाप जोड़ें।</div>';
}

$('#radheTap').addEventListener('click', () => addCount(1, getDateKey(new Date()), 'radhe'));
$('#manualDate').value = getDateKey(new Date());
$('#addManual').addEventListener('click', () => { addCount(Number($('#manualCount').value), $('#manualDate').value, 'manual'); $('#manualCount').value = ''; });
$('#manualCount').addEventListener('keydown', (event) => { if (event.key === 'Enter') $('#addManual').click(); });
$('#monthPicker').value = selectedMonth; $('#monthPicker').addEventListener('change', (event) => { selectedMonth = event.target.value; render(); });
$('#settingsBtn').addEventListener('click', () => { $('#targetInput').value = state.target; $('#settingsDialog').showModal(); });
$('#settingsForm').addEventListener('submit', (event) => { event.preventDefault(); const target = Number($('#targetInput').value); if (target > 0) { state.target = Math.floor(target); save(); render(); $('#settingsDialog').close(); showToast('कुल लक्ष्य सुरक्षित है'); } });
$('#exportBtn').addEventListener('click', () => { const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `radha-jap-backup-${getDateKey(new Date())}.json`; link.click(); URL.revokeObjectURL(url); showToast('Backup download हो गया'); });
window.addEventListener('beforeinstallprompt', (event) => { event.preventDefault(); installEvent = event; $('#installBtn').hidden = false; });
$('#installBtn').addEventListener('click', async () => { if (!installEvent) return; installEvent.prompt(); await installEvent.userChoice; installEvent = null; $('#installBtn').hidden = true; });
$('#todayLabel').textContent = new Intl.DateTimeFormat('hi-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('sw.js'));
render();
