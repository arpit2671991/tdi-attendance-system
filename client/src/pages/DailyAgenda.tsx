import { useState, useMemo } from "react";
import { useDailySchedule, useTeachers } from "@/lib/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarClock, 
  Search, 
  UserCircle,
  FileDown,
  Printer,
  FileSpreadsheet,
  EyeOff,
  Eye,
  AlertCircle,
  Loader2
} from "lucide-react";
import { format, parse } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export function DailyAgenda() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCancelled, setShowCancelled] = useState(true);
  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  const { data: schedule = [], isLoading, error } = useDailySchedule(today);
  const { data: teachers = [] } = useTeachers();

  // Helper: Format 24h to 12h Time
  const formatTime = (value: string) => {
    try {
      const [hours, minutes] = value.split(":").map(Number);
      const date = new Date();
      date.setHours(hours, minutes, 0);
      return date.toLocaleTimeString("en-US", { 
        hour: "numeric", 
        minute: "2-digit", 
        hour12: true 
      });
    } catch (e) {
      return value;
    }
  };

  // Filter Logic
  const filteredSchedule = useMemo(() => {
    return schedule.filter((item: any) => {
      const matchesSearch = !searchTerm || item.sessionStudents?.some((record: any) => 
        record.student?.phone?.includes(searchTerm) || 
        record.student?.mobile?.includes(searchTerm) ||
        record.student?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesCancelled = showCancelled || item.status !== "cancelled";
      return matchesSearch && matchesCancelled;
    });
  }, [schedule, searchTerm, showCancelled]);

  // --- EXPORT: EXCEL ---
  const exportToExcel = () => {
    const data = filteredSchedule.map(item => ({
      "Time Slot": `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`,
      "Session Name": item.name,
      "Type": item.session_type?.toUpperCase(),
      "Instructor": teachers.find((t) => t.id === item.teacherId)?.name || "Unassigned",
      "Students": item.sessionStudents?.map((s: any) => s.student.name).join(", ") || "None",
      "Status": item.status.toUpperCase(),
      "Remarks": item.reason || ""
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Daily Schedule");

    // Auto-width adjustment
    const colWidths = Object.keys(data[0] || {}).map(key => ({
      wch: Math.max(key.length, ...data.map(row => String(row[key as keyof typeof row]).length)) + 2
    }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `Daily_Agenda_${today}.xlsx`);
  };

  // --- EXPORT: PDF ---
  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableRows = filteredSchedule.map(item => [
      `${formatTime(item.startTime)} - ${formatTime(item.endTime)}`,
      item.name,
      teachers.find((t) => t.id === item.teacherId)?.name || "Unassigned",
      item.sessionStudents?.map((s: any) => s.student.name).join(", ") || "",
      item.status.toUpperCase()
    ]);

    doc.setFontSize(18);
    doc.text("Daily Class Agenda", 14, 15);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated for: ${format(new Date(), "PPPP")}`, 14, 22);

    autoTable(doc, {
      head: [["Time", "Session", "Instructor", "Students", "Status"]],
      body: tableRows,
      startY: 30,
      headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [249, 250, 251] }
    });

    doc.save(`Agenda_${today}.pdf`);
  };

  // --- EXPORT: PRINT ---
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = `
      <html>
        <head>
          <title>Print Agenda - ${today}</title>
          <style>
            body { font-family: system-ui, sans-serif; padding: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 12px; }
            th { background: #f8fafc; color: #64748b; text-transform: uppercase; }
            .cancelled { color: #ef4444; text-decoration: line-through; }
            h1 { color: #1e293b; margin-bottom: 4px; }
          </style>
        </head>
        <body>
          <h1>Daily Agenda</h1>
          <p>${format(new Date(), "PPPP")}</p>
          <table>
            <thead>
              <tr>
                <th>Time</th><th>Session</th><th>Instructor</th><th>Students</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredSchedule.map(item => `
                <tr class="${item.status === 'cancelled' ? 'cancelled' : ''}">
                  <td>${formatTime(item.startTime)} - ${formatTime(item.endTime)}</td>
                  <td>${item.name}</td>
                  <td>${teachers.find((t) => t.id === item.teacherId)?.name || "Unassigned"}</td>
                  <td>${item.sessionStudents?.map((s: any) => s.student.name).join(", ")}</td>
                  <td>${item.status.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
  };

  if (isLoading) return <Skeleton className="h-[500px] w-full rounded-2xl" />;
  if (error) return (
    <div className="p-8 text-center text-destructive flex flex-col items-center gap-2">
      <AlertCircle className="h-10 w-10" />
      <p>Error loading schedule. Please refresh.</p>
    </div>
  );

  return (
    <Card className="shadow-2xl border-none bg-background/60 backdrop-blur-xl overflow-hidden ring-1 ring-black/5">
      <CardHeader className="pb-6 border-b bg-white/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2.5 text-2xl font-black text-slate-800">
              <CalendarClock className="h-6 w-6 text-primary" />
              Daily Agenda
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">
              {format(new Date(), "eeee, MMMM do")}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-white border-slate-200 focus-visible:ring-primary/20 shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-1.5 border rounded-xl p-1.5 bg-white shadow-sm border-slate-200">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowCancelled(!showCancelled)} 
                className={`h-9 w-9 rounded-lg ${!showCancelled ? 'bg-orange-50 text-orange-600' : 'text-slate-500'}`}
                title={showCancelled ? "Hide Cancelled" : "Show Cancelled"}
              >
                {showCancelled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <Button variant="ghost" size="icon" onClick={handlePrint} className="h-9 w-9 text-slate-600 rounded-lg hover:bg-slate-100" title="Print Agenda">
                <Printer className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={exportToPDF} className="h-9 w-9 text-indigo-600 rounded-lg hover:bg-indigo-50" title="Export PDF">
                <FileDown className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={exportToExcel} className="h-9 w-9 text-emerald-600 rounded-lg hover:bg-emerald-50" title="Export Excel">
                <FileSpreadsheet className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="w-[140px] font-bold text-slate-500 text-xs uppercase pl-6">Time</TableHead>
                <TableHead className="font-bold text-slate-500 text-xs uppercase">Class & Instructor</TableHead>
                <TableHead className="hidden md:table-cell font-bold text-slate-500 text-xs uppercase">Attendance List</TableHead>
                <TableHead className="text-right font-bold text-slate-500 text-xs uppercase pr-6">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedule.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-slate-400 font-medium italic">
                    No classes found for the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                filteredSchedule.map((item: any) => {
                  const isCancelled = item.status === 'cancelled';
                  const teacher = teachers.find((t) => t.id === item.teacherId);
                  
                  return (
                    <TableRow key={item.id} className={`group hover:bg-slate-50/50 transition-colors ${isCancelled ? "bg-red-50/30" : ""}`}>
                      <TableCell className="py-5 pl-6">
                        <div className={`flex flex-col font-mono text-xs font-bold ${isCancelled ? "line-through text-slate-400" : "text-primary"}`}>
                          <span>{formatTime(item.startTime)}</span>
                          <span className="text-[10px] opacity-60 font-medium">to {formatTime(item.endTime)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className={`font-bold text-sm ${isCancelled ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {item.name}
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 mt-0.5">
                          <UserCircle className="h-3 w-3" /> {teacher?.name || "No Instructor"}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {item.sessionStudents?.map((record: any) => (
                            <Badge 
                              key={record.student.id} 
                              variant="outline" 
                              className="text-[10px] font-medium px-2 py-0 bg-white border-slate-200 text-slate-600 shadow-sm"
                            >
                              {record.student.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex flex-col items-end gap-1">
                          <Badge 
                            variant={isCancelled ? "destructive" : "outline"} 
                            className={`text-[9px] font-black uppercase tracking-widest px-2 ${!isCancelled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}`}
                          >
                            {item.status}
                          </Badge>
                          {item.reason && (
                            <span className="text-[10px] text-slate-400 italic font-medium truncate max-w-[120px]">
                              "{item.reason}"
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}