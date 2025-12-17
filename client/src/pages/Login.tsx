import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { School, User, KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [location, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  
  const [adminMobile, setAdminMobile] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  
  const [teacherMobile, setTeacherMobile] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherLoading, setTeacherLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminLoading(true);
    try {
      await login(adminMobile, adminPassword, 'admin');
      toast({ title: "Welcome back, Admin" });
      setLocation("/");
    } catch (error: any) {
      console.log(error)
      toast({ title: "Login Failed", description: error.message || "Invalid admin credentials", variant: "destructive" });
      
    } finally {
      setAdminLoading(false);
    }
  };

  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTeacherLoading(true);
    try {
      await login(teacherMobile, teacherPassword, 'teacher');
      toast({ title: "Welcome back" });
      setLocation("/portal");
    } catch (error: any) {
      toast({ title: "Login Failed", description: error.message || "Invalid email or password", variant: "destructive" });
    } finally {
      setTeacherLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-6">
            <div className="h-32 w-32 bg-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/20">
              {/* <School className="h-8 w-8 text-primary-foreground" /> */}
              <img src="../../public/tdi-logo.jpeg" alt="TDI Logo" className="h-30 w-30 object-contain" />
            </div>
          </div>
          <h1 className="text-3xl font-heading font-bold text-gray-900">Technology Domain Institute</h1>
          <p className="text-muted-foreground">Smart Attendance System</p>
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
                <CardDescription>Manage attendace records and reports</CardDescription>
              </CardHeader>
              <form onSubmit={handleAdminLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-mobile">Mobile No.</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="admin-mobile" 
                        type="text" 
                        className="pl-9"
                        value={adminMobile} 
                        onChange={(e) => setAdminMobile(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="admin-password" 
                        type="password" 
                        className="pl-9"
                        value={adminPassword} 
                        onChange={(e) => setAdminPassword(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={adminLoading} data-testid="button-admin-login">
                    {adminLoading ? "Logging in..." : "Login as Admin"}
                  </Button>
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
                    <Label htmlFor="teacher-mobile">Mobile No.</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="teacher-mobile" 
                        type="text" 
                        className="pl-9"
                        value={teacherMobile} 
                        onChange={(e) => setTeacherMobile(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacher-password">Password</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="teacher-password" 
                        type="password" 
                        className="pl-9"
                        value={teacherPassword} 
                        onChange={(e) => setTeacherPassword(e.target.value)} 
                        required 
                      />
                    </div>
                    <p className="text-xs text-muted-foreground"></p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={teacherLoading} data-testid="button-teacher-login">
                    {teacherLoading ? "Logging in..." : "Login as Teacher"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
