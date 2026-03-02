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
import { Plus, UserCheck, Search, Upload, FileText } from "lucide-react";
import { useApplicants, useCreateApplicant, useUpdateDocumentStatus } from "@/hooks/use-applicants";
import { useToast } from "@/hooks/use-toast";

export default function Applicants() {
  const { canManageAdmissions } = useRole();
  const { data: applicants = [], isLoading } = useApplicants();
  const createMut = useCreateApplicant();
  const updateDocMut = useUpdateDocumentStatus();
  const { toast } = useToast();
  
  const [open, setOpen] = useState(false);
  const [docDialogOpen, setDocDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [marks10File, setMarks10File] = useState<File | null>(null);
  const [marks12File, setMarks12File] = useState<File | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "Male",
    category: "GM",
    entryType: "Regular",
    qualifyingExam: "KCET",
    marks: "",
    fatherName: "",
    motherName: "",
    address: "",
    city: "",
    state: "Karnataka",
    pincode: ""
  });

  if (!canManageAdmissions) return <Redirect to="/" />;

  const handleCreate = async () => {
    try {
      await createMut.mutateAsync(form);
      setOpen(false);
      setForm({ fullName: "", email: "", phone: "", dateOfBirth: "", gender: "Male", category: "GM", entryType: "Regular", qualifyingExam: "KCET", marks: "", fatherName: "", motherName: "", address: "", city: "", state: "Karnataka", pincode: "" });
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
          <DialogContent className="sm:max-w-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>New Applicant Profile (15 Fields)</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Full Name *</Label>
                  <Input value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Phone *</Label>
                  <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth *</Label>
                  <Input type="date" value={form.dateOfBirth} onChange={e => setForm({...form, dateOfBirth: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Gender *</Label>
                  <Select value={form.gender} onValueChange={v => setForm({...form, gender: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="GM">GM</SelectItem><SelectItem value="SC">SC</SelectItem><SelectItem value="ST">ST</SelectItem><SelectItem value="OBC">OBC</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Entry Type *</Label>
                  <Select value={form.entryType} onValueChange={v => setForm({...form, entryType: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="Regular">Regular</SelectItem><SelectItem value="Lateral">Lateral</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Qualifying Exam *</Label>
                  <Select value={form.qualifyingExam} onValueChange={v => setForm({...form, qualifyingExam: v})}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="KCET">KCET</SelectItem><SelectItem value="COMEDK">COMEDK</SelectItem><SelectItem value="Management">Management</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Marks/Percentage *</Label>
                  <Input value={form.marks} onChange={e => setForm({...form, marks: e.target.value})} placeholder="e.g. 85%" className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Father's Name *</Label>
                  <Input value={form.fatherName} onChange={e => setForm({...form, fatherName: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Mother's Name *</Label>
                  <Input value={form.motherName} onChange={e => setForm({...form, motherName: e.target.value})} className="rounded-xl" />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Address *</Label>
                  <Input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Input value={form.city} onChange={e => setForm({...form, city: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>State *</Label>
                  <Input value={form.state} onChange={e => setForm({...form, state: e.target.value})} className="rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Pincode *</Label>
                  <Input value={form.pincode} onChange={e => setForm({...form, pincode: e.target.value})} maxLength={6} className="rounded-xl" />
                </div>
              </div>
              <Button onClick={handleCreate} disabled={createMut.isPending} className="w-full rounded-xl mt-2">Create Profile</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Document Management Info Card */}
      <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Document Verification Workflow</CardTitle>
              <CardDescription className="mt-1">
                Track document submission and verification status for each applicant
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border">
              <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center">
                <span className="text-amber-700 font-semibold text-sm">1</span>
              </div>
              <div>
                <div className="font-medium text-sm">Pending</div>
                <div className="text-xs text-muted-foreground">Awaiting documents</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border">
              <div className="w-8 h-8 rounded-full bg-blue-500/15 flex items-center justify-center">
                <span className="text-blue-700 font-semibold text-sm">2</span>
              </div>
              <div>
                <div className="font-medium text-sm">Submitted</div>
                <div className="text-xs text-muted-foreground">Documents received</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center">
                <span className="text-emerald-700 font-semibold text-sm">3</span>
              </div>
              <div>
                <div className="font-medium text-sm">Verified</div>
                <div className="text-xs text-muted-foreground">Documents approved</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                        <div className="flex items-center justify-end gap-2">
                          {a.documentStatus === 'Pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-lg h-8 text-xs"
                              onClick={() => {
                                setSelectedApplicant(a);
                                setDocDialogOpen(true);
                              }}
                            >
                              <Upload className="w-3 h-3 mr-1" /> Mark Submitted
                            </Button>
                          )}
                          {a.documentStatus === 'Submitted' && (
                            <Button
                              size="sm"
                              className="rounded-lg h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => handleUpdateStatus(a.id, 'Verified')}
                            >
                              <UserCheck className="w-3 h-3 mr-1" /> Verify
                            </Button>
                          )}
                          {a.documentStatus === 'Verified' && (
                            <span className="flex items-center text-emerald-600 text-sm font-medium">
                              <UserCheck className="w-4 h-4 mr-1" /> Complete
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload/Mark Dialog */}
      <Dialog open={docDialogOpen} onOpenChange={setDocDialogOpen}>
        <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg">Upload Documents</DialogTitle>
          </DialogHeader>
          {selectedApplicant && (
            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-lg bg-muted/50 border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {selectedApplicant.fullName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{selectedApplicant.fullName}</div>
                    <div className="text-xs text-muted-foreground">ID: #{selectedApplicant.id.toString().padStart(4, '0')}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Upload Marks Cards</Label>
                
                {/* 10th Marks Card Upload */}
                <div className="space-y-1.5">
                  <Label htmlFor="marks10" className="text-xs font-medium">10th Marks Card *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="marks10"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setMarks10File(e.target.files?.[0] || null)}
                      className="rounded-lg text-xs h-9"
                    />
                    {marks10File && (
                      <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 12th Marks Card Upload */}
                <div className="space-y-1.5">
                  <Label htmlFor="marks12" className="text-xs font-medium">12th Marks Card *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="marks12"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setMarks12File(e.target.files?.[0] || null)}
                      className="rounded-lg text-xs h-9"
                    />
                    {marks12File && (
                      <Badge variant="secondary" className="bg-emerald-500/15 text-emerald-700 text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG (Max 5MB)</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold">Other Documents</Label>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 p-2 rounded border bg-background text-xs">
                    <div className="w-4 h-4 rounded border-2 border-muted-foreground flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">□</span>
                    </div>
                    <span>Photo ID Proof</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border bg-background text-xs">
                    <div className="w-4 h-4 rounded border-2 border-muted-foreground flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">□</span>
                    </div>
                    <span>Entrance Exam Scorecard</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border bg-background text-xs">
                    <div className="w-4 h-4 rounded border-2 border-muted-foreground flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">□</span>
                    </div>
                    <span>Category Certificate</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded border bg-background text-xs">
                    <div className="w-4 h-4 rounded border-2 border-muted-foreground flex items-center justify-center">
                      <span className="text-muted-foreground text-xs">□</span>
                    </div>
                    <span>Transfer Certificate</span>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  Upload marks cards above. Confirm other documents received.
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-9 text-xs"
                  onClick={() => {
                    setDocDialogOpen(false);
                    setMarks10File(null);
                    setMarks12File(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl h-9 text-xs bg-blue-600 hover:bg-blue-700"
                  disabled={!marks10File || !marks12File}
                  onClick={() => {
                    if (marks10File && marks12File) {
                      // TODO: Upload files to server
                      console.log('Uploading files:', { marks10File, marks12File });
                      handleUpdateStatus(selectedApplicant.id, 'Submitted');
                      setDocDialogOpen(false);
                      setMarks10File(null);
                      setMarks12File(null);
                    }
                  }}
                >
                  <Upload className="w-3 h-3 mr-1.5" />
                  Upload & Submit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
