import { useState } from "react";
import { useRole } from "@/lib/role-context";
import { Redirect } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, UserCheck, Search } from "lucide-react";
import { useApplicants, useCreateApplicant, useUpdateDocumentStatus } from "@/hooks/use-applicants";
import { useToast } from "@/hooks/use-toast";

export default function Applicants() {
  const { canManageAdmissions } = useRole();
  const { data: applicants = [], isLoading } = useApplicants();
  const createMut = useCreateApplicant();
  const updateDocMut = useUpdateDocumentStatus();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    category: "GM",
    entryType: "Regular",
    admissionMode: "Management",
    marks: ""
  });

  if (!canManageAdmissions) return <Redirect to="/" />;

  const handleCreate = async () => {
    try {
      await createMut.mutateAsync(form);
      setOpen(false);
      setForm({ fullName: "", category: "GM", entryType: "Regular", admissionMode: "Management", marks: "" });
      toast({ title: "Applicant Created Successfully" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await updateDocMut.mutateAsync({ id, documentStatus: status });
      toast({ title: "Status Updated" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  const filteredApplicants = applicants.filter((a: any) => 
    a.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Verified': return 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25';
      case 'Submitted': return 'bg-blue-500/15 text-blue-700 hover:bg-blue-500/25';
      default: return 'bg-amber-500/15 text-amber-700 hover:bg-amber-500/25';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Applicants</h1>
          <p className="text-muted-foreground mt-1">Manage student profiles and document verification.</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300">
              <Plus className="w-5 h-5 mr-2" /> Add Applicant
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>New Applicant Profile</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="rounded-xl" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="GM">GM</SelectItem><SelectItem value="SC/ST">SC/ST</SelectItem><SelectItem value="OBC">OBC</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Qualifying Marks</Label>
                  <Input value={form.marks} onChange={e => setForm({...form, marks: e.target.value})} placeholder="e.g. 85%" className="rounded-xl" />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={createMut.isPending} className="w-full rounded-xl mt-2">Create Profile</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-xl shadow-black/5">
        <CardHeader className="border-b bg-muted/30 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="font-display">Applicant Roster</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search applicants..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl bg-background border-border"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[100px]">App ID</TableHead>
                  <TableHead>Applicant Name</TableHead>
                  <TableHead>Category / Marks</TableHead>
                  <TableHead>Document Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading...</TableCell></TableRow>
                ) : filteredApplicants.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No applicants found</TableCell></TableRow>
                ) : (
                  filteredApplicants.map((a: any) => (
                    <TableRow key={a.id} className="group">
                      <TableCell className="font-medium text-muted-foreground">#{a.id.toString().padStart(4, '0')}</TableCell>
                      <TableCell>
                        <div className="font-semibold text-foreground">{a.fullName}</div>
                        <div className="text-xs text-muted-foreground">{a.admissionMode} • {a.entryType}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm">{a.category}</span>
                          <span className="text-xs font-mono text-muted-foreground">Score: {a.marks}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`px-2.5 py-1 ${getStatusColor(a.documentStatus)}`}>
                          {a.documentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {a.documentStatus !== 'Verified' && (
                          <Select 
                            onValueChange={(v) => handleUpdateStatus(a.id, v)}
                            value={a.documentStatus}
                          >
                            <SelectTrigger className="w-[140px] ml-auto rounded-lg h-8 text-xs">
                              <SelectValue placeholder="Update Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pending">Pending</SelectItem>
                              <SelectItem value="Submitted">Submitted</SelectItem>
                              <SelectItem value="Verified">Verified</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {a.documentStatus === 'Verified' && (
                          <span className="flex items-center justify-end text-emerald-600 text-sm font-medium">
                            <UserCheck className="w-4 h-4 mr-1" /> Complete
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
