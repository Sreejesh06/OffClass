const today = new Date();
const map = {};
const result = [];
const startDate = new Date(today);
startDate.setDate(today.getDate() - 364);

for (let i = 0; i < startDate.getDay(); i++) {
  result.push({ date: null, points: 0, dateStr: '' });
}

for (let i = 364; i >= 0; i--) {
  const d = new Date(today);
  d.setDate(d.getDate() - i);
  const dateStr = d.toISOString().split('T')[0];
  result.push({ date: d, points: 0, dateStr });
}

const weeks = [];
for (let i = 0; i < result.length; i += 7) weeks.push(result.slice(i, i + 7));

const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const monthLabels = [];
let lastMonth = -1;
weeks.forEach((week, wi) => {
  const validDay = week.find(d => d.date);
  if (!validDay) return;
  const m = validDay.date.getMonth();
  if (m !== lastMonth) { monthLabels.push({ label: months[m], weekIndex: wi }); lastMonth = m; }
});
console.log("Success! Month labels:", monthLabels.length);
