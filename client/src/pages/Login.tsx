import { useState } from "react";
import { useLocation } from "wouter";
import { useData } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { School, User, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [, setLocation] = useLocation();
  const { login } = useData();
  const { toast } = useToast();
  
  const [adminEmail, setAdminEmail] = useState("admin@school.edu");
  const [teacherEmail, setTeacherEmail] = useState("sarah@school.edu");

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(adminEmail, 'admin')) {
      toast({ title: "Welcome back, Admin" });
      setLocation("/");
    } else {
      toast({ title: "Login Failed", description: "Invalid admin credentials", variant: "destructive" });
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(teacherEmail, 'teacher')) {
      toast({ title: "Welcome back" });
      setLocation("/portal");
    } else {
      toast({ title: "Login Failed", description: "Email not found in teacher records", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-primary rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
              <School className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">EduTrack</h1>
          <p className="text-muted-foreground">School Management System</p>
        </div>

        <Tabs defaultValue="admin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="teacher">Teacher</TabsTrigger>
          </TabsList>
          
          <TabsContent value="admin">
            <Card>
              <CardHeader>
                <CardTitle>Admin Access</CardTitle>
                <CardDescription>Manage school records and reports</CardDescription>
              </CardHeader>
              <form onSubmit={handleAdminLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="admin-email" 
                        type="email" 
                        className="pl-9"
                        value={adminEmail} 
                        onChange={(e) => setAdminEmail(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Login as Admin</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="teacher">
            <Card>
              <CardHeader>
                <CardTitle>Teacher Portal</CardTitle>
                <CardDescription>Mark attendance and view schedule</CardDescription>
              </CardHeader>
              <form onSubmit={handleTeacherLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacher-email">School Email</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="teacher-email" 
                        type="email" 
                        className="pl-9"
                        value={teacherEmail} 
                        onChange={(e) => setTeacherEmail(e.target.value)} 
                        required 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Try: sarah@school.edu</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full">Login as Teacher</Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
