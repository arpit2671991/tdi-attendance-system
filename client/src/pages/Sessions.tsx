import { useState } from "react";
import { useData } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, CalendarClock, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Sessions() {
  const { sessions, teachers, students, addSession } = useData();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newSession, setNewSession] = useState({
    name: "",
    teacherId: "",
    startTime: "09:00",
    endTime: "10:00",
    studentIds: [] as string[]
  });

  const handleAddSession = () => {
    if (!newSession.name || !newSession.teacherId) return;
    
    addSession(newSession);
    setNewSession({ name: "", teacherId: "", startTime: "09:00", endTime: "10:00", studentIds: [] });
    setIsDialogOpen(false);
    toast({
      title: "Session Created",
      description: `${newSession.name} has been scheduled.`,
    });
  };

  const toggleStudent = (studentId: string) => {
    setNewSession(prev => ({
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
          <p className="text-muted-foreground">Manage classes and assign teachers/students.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Create Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
              <DialogDescription>
                Set up a new class and assign students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <label className="text-sm font-medium">Session Name</label>
                  <Input 
                    placeholder="e.g. Advanced Biology" 
                    value={newSession.name}
                    onChange={(e) => setNewSession({...newSession, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                   <label className="text-sm font-medium">Teacher</label>
                   <Select 
                     value={newSession.teacherId} 
                     onValueChange={(val) => setNewSession({...newSession, teacherId: val})}
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
                    value={newSession.startTime}
                    onChange={(e) => setNewSession({...newSession, startTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Input 
                    type="time"
                    value={newSession.endTime}
                    onChange={(e) => setNewSession({...newSession, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assign Students ({newSession.studentIds.length} selected)</label>
                <div className="border rounded-md p-4 h-48 overflow-y-auto space-y-2">
                   {students.map(student => (
                     <div key={student.id} className="flex items-center space-x-2">
                       <Checkbox 
                         id={`student-${student.id}`} 
                         checked={newSession.studentIds.includes(student.id)}
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
              <Button onClick={handleAddSession}>Create Session</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

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
                      <div className="flex items-center gap-2 text-sm">
                        <UserCheck className="h-3 w-3 text-muted-foreground" />
                        {session.studentIds.length} Enrolled
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">Edit</Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sessions.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
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
