import { useState } from "react";
import { useData, Session } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CalendarClock, UserCheck, Pencil, Trash2, CalendarRange } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function Sessions() {
  const { sessions, teachers, students, addSession, updateSession, deleteSession } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    teacherId: "",
    startTime: "09:00",
    endTime: "10:00",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    studentIds: [] as string[]
  });

  const handleOpenDialog = (session?: Session) => {
    if (session) {
      setEditingId(session.id);
      setFormData({
        name: session.name,
        teacherId: session.teacherId,
        startTime: session.startTime,
        endTime: session.endTime,
        startDate: session.startDate,
        endDate: session.endDate,
        studentIds: session.studentIds
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        teacherId: "",
        startTime: "09:00",
        endTime: "10:00",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        studentIds: [] 
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.teacherId) return;
    
    if (editingId) {
      updateSession(editingId, formData);
      toast({ title: "Session Updated", description: "Changes saved successfully." });
    } else {
      addSession(formData);
      toast({ title: "Session Created", description: `${formData.name} has been scheduled.` });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteSession(id);
    toast({ title: "Session Deleted", description: "Class removed from schedule." });
  };

  const toggleStudent = (studentId: string) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground">Manage classes, dates, and enrollments.</p>
        </div>
        
        <Button className="gap-2" onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4" /> Create Session
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Session' : 'Create New Session'}</DialogTitle>
            <DialogDescription>
              Set up class details, duration, and assign students.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Session Name</label>
                <Input 
                  placeholder="e.g. Advanced Biology" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2 col-span-2">
                 <label className="text-sm font-medium">Teacher</label>
                 <Select 
                   value={formData.teacherId} 
                   onValueChange={(val) => setFormData({...formData, teacherId: val})}
                 >
                   <SelectTrigger>
                     <SelectValue placeholder="Select Teacher" />
                   </SelectTrigger>
                   <SelectContent>
                     {teachers.map(t => (
                       <SelectItem key={t.id} value={t.id}>{t.name} ({t.department})</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Input 
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Time</label>
                <Input 
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <Input 
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">End Date</label>
                <Input 
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Students ({formData.studentIds.length} selected)</label>
              <div className="border rounded-md p-4 h-48 overflow-y-auto space-y-2">
                 {students.map(student => (
                   <div key={student.id} className="flex items-center space-x-2">
                     <Checkbox 
                       id={`student-${student.id}`} 
                       checked={formData.studentIds.includes(student.id)}
                       onCheckedChange={() => toggleStudent(student.id)}
                     />
                     <label 
                       htmlFor={`student-${student.id}`} 
                       className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                     >
                       {student.name} <span className="text-muted-foreground text-xs">({student.grade})</span>
                     </label>
                   </div>
                 ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingId ? 'Save Changes' : 'Create Session'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Scheduled Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session Name</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Students</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const teacher = teachers.find(t => t.id === session.teacherId);
                return (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.name}
                    </TableCell>
                    <TableCell>
                      {teacher?.name || 'Unassigned'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarClock className="h-3 w-3" />
                        {session.startTime} - {session.endTime}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarRange className="h-3 w-3" />
                        {session.startDate} to {session.endDate}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="h-3 w-3 text-muted-foreground" />
                        {session.studentIds.length} Enrolled
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(session)}>
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will delete the session and all attendance records associated with it.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(session.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sessions.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                     No sessions scheduled.
                   </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
