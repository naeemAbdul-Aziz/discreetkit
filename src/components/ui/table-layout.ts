// Shared table layout classes to keep UI consistent across dashboards

export const dashboardTable = {
  container: "rounded-md border bg-card overflow-x-auto",
  table: "table-fixed",
};

export const ordersTableCols = {
  checkbox: "w-8",
  codeHead: "w-[120px]",
  dateHead: "w-[110px]",
  customerHead: "w-[220px]",
  noteHead: "w-[110px]",
  statusHead: "w-[170px] min-w-[170px] max-w-[170px]",
  pharmacyHead: "w-[180px]",
  totalHead: "text-right w-[100px]",
  actionsHead: "w-[44px]",
  codeCell: "font-medium font-mono text-sm whitespace-nowrap w-[120px]",
  dateCell: "text-muted-foreground text-sm whitespace-nowrap w-[110px]",
  customerCell: "truncate max-w-[220px]",
  noteCell: "w-[110px]",
  statusCell: "w-[170px] min-w-[170px] max-w-[170px] whitespace-nowrap overflow-hidden",
  pharmacyCell: "w-[180px]",
  totalCell: "text-right w-[100px] whitespace-nowrap",
  actionsCell: "w-[44px]",
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
