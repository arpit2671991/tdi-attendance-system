import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {  useTeacherWorkHours } from "@/lib/hooks";
import { Search } from "lucide-react";
import React, { useState } from "react";

const TeacherPayroll = () => {

  const [searchTeacher, setSearchTeacher] = useState("");
const [monthFilter, setMonthFilter] = useState(""); // YYYY-MM
  const { data: teacherData = [], isLoading } = useTeacherWorkHours();
  



const filteredTeachers = React.useMemo(() => {
  return teacherData.filter((t) => {
    const matchesTeacher =
      t.teacherName
        .toLowerCase()
        .includes(searchTeacher.toLowerCase());

    const matchesMonth =
      monthFilter === "" ||
      new Date(t.month).toISOString().slice(0, 7) === monthFilter;

    return matchesTeacher && matchesMonth;
  });
}, [teacherData, searchTeacher, monthFilter]);
 

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-heading font-bold tracking-tight">
            Teachers Monthly Hours - Payroll
          </h1>
        </div>
      </div>
      <Card className="border-none shadow-sm">
        <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
        <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full">
  {/* Teacher search */}
  <div className="relative w-full sm:w-64">
    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input
      placeholder="Search teacher..."
      value={searchTeacher}
      onChange={(e) => setSearchTeacher(e.target.value)}
      className="pl-9"
    />
  </div>

  {/* Month filter */}
  <Input
    type="month"
    value={monthFilter}
    onChange={(e) => setMonthFilter(e.target.value)}
    className="w-full sm:w-48"
  />
</div>
        </CardContent>
        </CardHeader>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Month</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Total Hours</TableHead>
          </TableRow>
        </TableHeader>
     
       <TableBody>
              {filteredTeachers.map((t) => (
  <TableRow key={`${t.teacherId}-${t.month}`}>
    <TableCell>
      {new Date(t.month).toLocaleString("default", {
        month: "long",
        year: "numeric",
      })}
    </TableCell>
    <TableCell>{t.teacherName}</TableCell>
    <TableCell>{t.totalHours}</TableCell>
  </TableRow>
))}
             
       </TableBody>
        </Table>
      {/* <Card className="border-none shadow-sm">
    <CardContent >

      <table className="w-full text-sm">
        <thead>
          <tr>
            <th>Teacher</th>
            <th>Month</th>
            <th>Total Hours</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row: any) => (
            <tr key={`${row.teacherId}-${row.month}`}>
              <td>{row.teacherName}</td>
              <td>
                {new Date(row.month).toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </td>
              <td>{row.totalHours}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </CardContent>
  </Card> */}
    </div>
  );
};

export default TeacherPayroll;
