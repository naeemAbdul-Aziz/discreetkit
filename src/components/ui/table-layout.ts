// Shared table layout classes to keep UI consistent across dashboards

export const dashboardTable = {
  container: "w-full bg-white overflow-x-auto",
  table: "w-full border-separate border-spacing-0",
};

export const ordersTableCols = {
  checkbox: "w-10 px-4",
  codeHead: "w-[130px] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400",
  dateHead: "w-[120px] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400",
  customerHead: "w-[240px] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400",
  noteHead: "w-[120px] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400",
  statusHead: "w-[180px] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400",
  pharmacyHead: "w-[200px] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400",
  totalHead: "text-right w-[120px] px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400",
  actionsHead: "w-[60px] px-4 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400",
  codeCell: "font-black font-mono text-xs whitespace-nowrap w-[130px] px-4 py-4 text-slate-900 tracking-tighter",
  dateCell: "text-slate-400 font-bold text-[11px] whitespace-nowrap w-[120px] px-4 py-4",
  customerCell: "truncate max-w-[240px] px-4 py-4 text-sm font-semibold text-slate-700",
  noteCell: "w-[120px] px-4 py-4",
  statusCell: "w-[180px] whitespace-nowrap px-4 py-4",
  pharmacyCell: "w-[200px] px-4 py-4",
  totalCell: "text-right w-[120px] whitespace-nowrap px-6 py-4 font-black text-slate-900 tracking-tight",
  actionsCell: "w-[60px] px-4 py-4",
};

export const adminRefillsCols = {
  codeHead: "w-[120px]",
  patientHead: "w-[240px]",
  productHead: "w-[220px]",
  statusHead: "w-[140px]",
  pharmacyHead: "w-[180px]",
  actionsHead: "w-[140px] text-right",
  codeCell: "font-mono text-xs w-[120px] whitespace-nowrap",
  patientCell: "w-[240px]",
  productCell: "w-[220px] truncate",
  statusCell: "w-[140px] whitespace-nowrap",
  pharmacyCell: "w-[180px]",
  actionsCell: "w-[140px] text-right",
};

export const pharmacyRefillsCols = {
  patientHead: "w-[260px]",
  productHead: "w-[220px]",
  nextDueHead: "w-[120px]",
  statusHead: "w-[120px]",
  actionsHead: "w-[120px] text-right",
  patientCell: "w-[260px]",
  productCell: "w-[220px]",
  nextDueCell: "w-[120px] whitespace-nowrap",
  statusCell: "w-[120px]",
  actionsCell: "w-[120px] text-right",
};

export const actions = {
  iconButton: "h-8 w-8",
  actionButton: "h-8 min-w-[120px] items-center",
};
