import { useState } from "react";
import { useRole } from "@/lib/role-context";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, CheckCircle2, DollarSign } from "lucide-react";
import { useAdmissions, useCreateAdmission, useConfirmAdmission, useUpdateFeeStatus } from "@/hooks/use-admissions";
import { useApplicants } from "@/hooks/use-applicants";
import { usePrograms } from "@/hooks/use-master-data";
import { useToast } from "@/hooks/use-toast";

export default function Admissions() {
  const { canManageAdmissions } = useRole();
  const { data: admissions = [], isLoading } = useAdmissions();
  const { data: applicants = [] } = useApplicants();
  const { data: programs = [] } = usePrograms();
  const createMut = useCreateAdmission();
  const confirmMut = useConfirmAdmission();
  const feeMut = useUpdateFeeStatus();
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    applicantId: "",
    programId: "",
    quotaType: "Management"
  });

  if (!canManageAdmissions) return <Redirect to="/" />;

  const handleAllocate = async () => {
    try {
      await createMut.mutateAsync({
        applicantId: parseInt(form.applicantId),
        programId: parseInt(form.programId),
        quotaType: form.quotaType
      });
      setOpen(false);
      toast({ title: "Seat Allocated Successfully" });
    } catch (e: any) {
      toast({ title: "Allocation Failed", description: e.message, variant: "destructive" });
    }
  };

  const getProgramName = (id: number) => programs.find((p:any) => p.id === id)?.name || `Prog #${id}`;
  const getApplicantName = (id: number) => applicants.find((a:any) => a.id === id)?.fullName || `App #${id}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Seat Allocation & Admissions</h1>
          <p className="text-muted-foreground mt-1">Allocate seats, manage fee statuses, and confirm final admissions.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 text-white">
              <GraduationCap className="w-5 h-5 mr-2" /> Allocate Seat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>New Seat Allocation</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Select Applicant</Label>
                <Select value={form.applicantId} onValueChange={v => setForm({...form, applicantId: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose applicant" /></SelectTrigger>
                  <SelectContent>
                    {applicants.map((a: any) => (
                      <SelectItem key={a.id} value={a.id.toString()}>{a.fullName} (ID: {a.id})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Select Program</Label>
                <Select value={form.programId} onValueChange={v => setForm({...form, programId: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Choose program" /></SelectTrigger>
                  <SelectContent>
                    {programs.map((p: any) => (
                      <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quota</Label>
                <Select value={form.quotaType} onValueChange={v => setForm({...form, quotaType: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KCET">KCET (Govt)</SelectItem>
                    <SelectItem value="COMEDK">COMEDK</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAllocate} disabled={createMut.isPending} className="w-full rounded-xl mt-4">Confirm Allocation</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-xl shadow-black/5 overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead>Admission Details</TableHead>
                <TableHead>Program & Quota</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : admissions.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No allocations yet</TableCell></TableRow>
              ) : (
                admissions.map((adm: any) => (
                  <TableRow key={adm.id} className="group transition-colors hover:bg-muted/20">
                    <TableCell>
                      <div className="font-semibold text-foreground">{getApplicantName(adm.applicantId)}</div>
                      {adm.admissionNumber && (
                        <div className="text-xs font-mono font-medium text-primary mt-1">USN: {adm.admissionNumber}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{getProgramName(adm.programId)}</div>
                      <div className="text-xs text-muted-foreground">{adm.quotaType}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`
                        ${adm.feeStatus === 'Paid' ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}
                      `}>
                        {adm.feeStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`
                        ${adm.status === 'Confirmed' ? 'bg-primary hover:bg-primary/90' : 'bg-secondary text-secondary-foreground'}
                      `}>
                        {adm.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {adm.feeStatus === 'Pending' && (
                          <Button 
                            size="sm" variant="outline" 
                            className="rounded-lg h-8 text-xs border-amber-200 hover:bg-amber-50"
                            onClick={() => feeMut.mutate({ id: adm.id, feeStatus: 'Paid' })}
                            disabled={feeMut.isPending}
                          >
                            <DollarSign className="w-3 h-3 mr-1" /> Mark Paid
                          </Button>
                        )}
                        {adm.status === 'Allocated' && adm.feeStatus === 'Paid' && (
                          <Button 
                            size="sm" 
                            className="rounded-lg h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => confirmMut.mutate(adm.id)}
                            disabled={confirmMut.isPending}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Confirm
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
