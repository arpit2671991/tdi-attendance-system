import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateException, useSessionExceptions, useDeleteException } from "@/lib/hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarX, Clock, Trash2, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export function ManageExceptionsDialog({ 
  session, 
  open, 
  onOpenChange 
}: { 
  session: any, 
  open: boolean, 
  onOpenChange: (open: boolean) => void 
}) {
  const createException = useCreateException();
  const { data: exceptions = [], isLoading: loadingHistory } = useSessionExceptions(session?.id);
  const deleteException = useDeleteException(session?.id);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<"cancelled" | "rescheduled">("cancelled");
  const [reason, setReason] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  useEffect(() => {
    if (session) {
      setStartTime(session.startTime);
      setEndTime(session.endTime);
    }
  }, [session]);

  const handleSave = async () => {
    await createException.mutateAsync({
      sessionId: session.id,
      data: {
        exceptionDate: date,
        status,
        reason: reason || null,
        overrideStartTime: status === "rescheduled" ? startTime : null,
        overrideEndTime: status === "rescheduled" ? endTime : null,
      }
    });
    // Reset form
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Schedule Exceptions</DialogTitle>
          <p className="text-sm text-muted-foreground">Modify {session?.name} schedule.</p>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">New Change</TabsTrigger>
            <TabsTrigger value="history">
              History {exceptions.length > 0 && `(${exceptions.length})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Action</label>
              <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="cancelled">Cancel Session</SelectItem>
                  <SelectItem value="rescheduled">Reschedule (Time Change)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {status === "rescheduled" && (
              <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Start</label>
                  <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New End</label>
                  <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason (Optional)</label>
              <Input 
                placeholder="e.g. Teacher sick" 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
              <Button onClick={handleSave} disabled={createException.isPending}>
                {createException.isPending ? "Saving..." : "Apply Change"}
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="history" className="py-4">
            <div className="space-y-3">
              {exceptions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No exceptions recorded for this session.</p>
                </div>
              ) : (
                exceptions.map((ex: any) => (
                  <div key={ex.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {format(new Date(ex.exceptionDate), "MMM do, yyyy")}
                        </span>
                        <Badge variant={ex.status === "cancelled" ? "destructive" : "outline"} className="text-[10px] h-4">
                          {ex.status}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground italic">
                        {ex.reason || "No reason provided"}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => deleteException.mutate(ex.id)}
                      disabled={deleteException.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}