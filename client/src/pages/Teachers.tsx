import { useState } from "react";
import { useTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from "@/lib/hooks";
import type { Teacher } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Mail, BookOpen, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function Teachers() {
  const { data: teachers = [], isLoading } = useTeachers();
  const createTeacher = useCreateTeacher();
  const updateTeacher = useUpdateTeacher();
  const deleteTeacher = useDeleteTeacher();

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ name: "", email: "", department: "", password: "" });

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = (teacher?: Omit<Teacher, "password"> | Teacher) => {
    if (teacher) {
      setEditingId(teacher.id);
      setFormData({ name: teacher.name, email: teacher.email, department: teacher.department, password: "" });
    } else {
      setEditingId(null);
      setFormData({ name: "", email: "", department: "", password: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) return;
    
    if (editingId) {
      const updateData: any = { 
        name: formData.name, 
        email: formData.email, 
        department: formData.department 
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await updateTeacher.mutateAsync({ id: editingId, data: updateData });
    } else {
      if (!formData.password) return;
      await createTeacher.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteTeacher.mutateAsync(id);
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold tracking-tight">Teachers</h1>
            <p className="text-muted-foreground">Manage faculty members and departments.</p>
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold tracking-tight">Teachers</h1>
          <p className="text-muted-foreground">Manage faculty members and departments.</p>
        </div>
        
        <Button className="gap-2" onClick={() => handleOpenDialog()} data-testid="button-add-teacher">
          <Plus className="h-4 w-4" /> Add Teacher
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Teacher' : 'Add New Teacher'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update faculty member details.' : 'Enter details for the new faculty member.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                placeholder="e.g. Dr. Jane Smith" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                data-testid="input-teacher-name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                placeholder="jane@school.edu" 
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                data-testid="input-teacher-email"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input 
                placeholder="e.g. Mathematics" 
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                data-testid="input-teacher-department"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password {editingId && "(leave blank to keep unchanged)"}</label>
              <Input 
                placeholder="Set login password" 
                type="text"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                data-testid="input-teacher-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createTeacher.isPending || updateTeacher.isPending}
              data-testid="button-submit-teacher"
            >
              {editingId ? 'Save Changes' : 'Add Teacher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Faculty List</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search teachers..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-teachers"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTeachers.map((teacher) => (
                <TableRow key={teacher.id} data-testid={`row-teacher-${teacher.id}`}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                      {teacher.name.substring(0,2).toUpperCase()}
                    </div>
                    {teacher.name}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      {teacher.department}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {teacher.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenDialog(teacher)}
                        data-testid={`button-edit-teacher-${teacher.id}`}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            data-testid={`button-delete-teacher-${teacher.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the teacher record.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                              onClick={() => handleDelete(teacher.id)}
                              disabled={deleteTeacher.isPending}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredTeachers.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                     No teachers found.
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
