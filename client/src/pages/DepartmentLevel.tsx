import { useEffect, useState } from "react";
import {  useDepartmentLevels, useCreateDepartmentLevel, useUpdateDepartmentLevel, useDeleteDepartmentLevel } from "@/lib/hooks";
import type { DepartmentLevel } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, User, Pencil, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Papa from "papaparse";
import { Upload } from "lucide-react";
import { useRef } from "react";
import { useBulkImportDepartmentLevels } from "@/lib/hooks";


export default function DepartmentLevels(){

const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
const [importError, setImportError] = useState<string | null>(null);

const fileInputRef = useRef<HTMLInputElement | null>(null);

const bulkImportDepartmentLevels = useBulkImportDepartmentLevels();

  
   const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
   const { data: departmentlevels = [], isLoading } = useDepartmentLevels();
   const createDepartmentLevel = useCreateDepartmentLevel();
   const updateDepartmentLevel = useUpdateDepartmentLevel();
   const deleteDepartmentLevel   = useDeleteDepartmentLevel();

   const [searchTerm, setSearchTerm] = useState("");
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [editingId, setEditingId] = useState<string | null>(null);

   const [formData, setFormData] = useState({ name: ""});

   const filteredDepartmentLevels = departmentlevels.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) 
   
  );

    const totalPages = Math.ceil(filteredDepartmentLevels.length / pageSize);

const paginatedLevels = filteredDepartmentLevels.slice(
  (currentPage - 1) * pageSize,
  currentPage * pageSize
);

const handleCsvUpload = (file: File) => {
  setImportError(null);

  Papa.parse(file, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      try {
        const levels = (results.data as any[])
          .map((row) => ({
            name: row.name?.trim(),
          }))
          .filter((r) => r.name);

        if (levels.length === 0) {
          setImportError("No valid course levels found in CSV");
          return;
        }

        await bulkImportDepartmentLevels.mutateAsync(levels);
        setIsImportDialogOpen(false);
      } catch (err) {
        console.error(err);
        setImportError("Failed to import course levels");
      }
    },
    error: () => {
      setImportError("Invalid CSV file");
    },
  });
};


  const handleOpenDialog = (department_level?: DepartmentLevel) => {
      if (department_level) {
        setEditingId(department_level.id);
        setFormData({ name: department_level.name });
      } else {
        setEditingId(null);
        setFormData({ name: "" });
      }
      setIsDialogOpen(true);
    };

     const handleSubmit = async () => {
    if (!formData.name ) return;
    
    if (editingId) {
      await updateDepartmentLevel.mutateAsync({ id: editingId, data: formData });
    } else {
      await createDepartmentLevel.mutateAsync(formData);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteDepartmentLevel.mutateAsync(id);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
  

  if (isLoading) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-heading font-bold tracking-tight">Course Levels</h1>
            <p className="text-muted-foreground">Manage Course Level.</p>
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
          <h1 className="text-3xl font-heading font-bold tracking-tight">Course Details</h1>
          <p className="text-muted-foreground">Manage Course Levels.</p>
        </div>
            <div className=" flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <Button className="gap-2" onClick={() => handleOpenDialog()} data-testid="button-add-course-level">
          <Plus className="h-4 w-4" /> Create Course Level
        </Button>
                <Button
    variant="outline"
    className="gap-2"
    onClick={() => setIsImportDialogOpen(true)}
  >
    <Upload className="h-4 w-4" />
    Import CSV
  </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Course Level' : 'Create Course Level'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Update course level.' : 'Add a new course level to the system.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course Level Name</label>
              <Input 
                placeholder="e.g. Mathematics" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                data-testid="input-course-level-name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={createDepartmentLevel.isPending || updateDepartmentLevel.isPending}
              data-testid="button-submit-course-level"
            >
              {editingId ? 'Save Changes' : 'Create Course Level'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
<Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Import Course Levels</DialogTitle>
      <DialogDescription>
        Upload a CSV file with a <strong>name</strong> column.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4 py-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCsvUpload(file);
        }}
      />

      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => fileInputRef.current?.click()}
        disabled={bulkImportDepartmentLevels.isPending}
      >
        <Upload className="h-4 w-4" />
        Select CSV File
      </Button>

      {bulkImportDepartmentLevels.isPending && (
        <p className="text-sm text-muted-foreground text-center">
          Importing course levels…
        </p>
      )}

      {importError && (
        <p className="text-sm text-destructive text-center">
          {importError}
        </p>
      )}
    </div>

    <DialogFooter>
      <Button
        variant="outline"
        onClick={() => setIsImportDialogOpen(false)}
        disabled={bulkImportDepartmentLevels.isPending}
      >
        Close
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">Course Levels</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search course levels..." 
              className="pl-8" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="input-search-departments"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLevels.map((department_level) => (
                <TableRow key={department_level.id} data-testid={`row-department-level${department_level.id}`}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground text-xs font-bold">
                      <User className="h-4 w-4" />
                    </div>
                    {department_level.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenDialog(department_level)}
                        data-testid={`button-edit-department-level-${department_level.id}`}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            data-testid={`button-delete-department-level${department_level.id}`}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove the course level from the system and all enrolled sessions.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90" 
                              onClick={() => handleDelete(department_level.id)}
                              disabled={deleteDepartmentLevel.isPending}
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
              {filteredDepartmentLevels.length === 0 && (
                 <TableRow>
                   <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                     No course levels found.
                   </TableCell>
                 </TableRow>
              )}
            </TableBody>
          </Table>
            <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
          
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </Button>
          
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
