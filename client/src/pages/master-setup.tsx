import { useState } from "react";
import { useRole } from "@/lib/role-context";
import { Redirect } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useInstitutions, useCreateInstitution, useCampuses, useCreateCampus, useDepartments, useCreateDepartment, usePrograms, useCreateProgram, useQuotas, useCreateQuota } from "@/hooks/use-master-data";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Extracted mini-components for cleanliness
function InstitutionsTab() {
  const { data: insts = [] } = useInstitutions();
  const createMut = useCreateInstitution();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const { toast } = useToast();

  const handleCreate = async () => {
    if(!name) return;
    try {
      await createMut.mutateAsync({ name });
      setOpen(false);
      setName("");
      toast({ title: "Institution Created" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Managed Institutions</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-md"><Plus className="w-4 h-4 mr-2" /> Add Institution</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>Add New Institution</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Institution Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. EduCore University" className="rounded-xl" />
              </div>
              <Button onClick={handleCreate} disabled={createMut.isPending} className="w-full rounded-xl">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {insts.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground py-8">No institutions found</TableCell></TableRow>}
            {insts.map((i: any) => (
              <TableRow key={i.id}><TableCell className="font-medium">#{i.id}</TableCell><TableCell>{i.name}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function CampusesTab() {
  const { data: campuses = [] } = useCampuses();
  const { data: insts = [] } = useInstitutions();
  const createMut = useCreateCampus();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [instId, setInstId] = useState("");
  const { toast } = useToast();

  const handleCreate = async () => {
    if(!name || !instId) return;
    try {
      await createMut.mutateAsync({ name, institutionId: parseInt(instId) });
      setOpen(false); setName(""); setInstId("");
      toast({ title: "Campus Created" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Campuses</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-md"><Plus className="w-4 h-4 mr-2" /> Add Campus</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader><DialogTitle>Add New Campus</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Campus Name</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. North Campus" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <Select value={instId} onValueChange={setInstId}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Institution" /></SelectTrigger>
                  <SelectContent>
                    {insts.map((i: any) => <SelectItem key={i.id} value={i.id.toString()}>{i.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={createMut.isPending} className="w-full rounded-xl">Save</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow><TableHead>ID</TableHead><TableHead>Name</TableHead><TableHead>Institution ID</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {campuses.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">No campuses found</TableCell></TableRow>}
            {campuses.map((c: any) => (
              <TableRow key={c.id}><TableCell className="font-medium">#{c.id}</TableCell><TableCell>{c.name}</TableCell><TableCell>{c.institutionId}</TableCell></TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function ProgramsTab() {
  const { data: programs = [] } = usePrograms();
  const { data: depts = [] } = useDepartments();
  const createMut = useCreateProgram();
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const [form, setForm] = useState({ name: "", departmentId: "", courseType: "UG", entryType: "Regular", admissionMode: "Management", academicYear: "2024-25", totalIntake: "" });

  const handleCreate = async () => {
    try {
      await createMut.mutateAsync({
        ...form,
        departmentId: parseInt(form.departmentId),
        totalIntake: parseInt(form.totalIntake)
      });
      setOpen(false);
      toast({ title: "Program Created" });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Academic Programs</h3>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-md"><Plus className="w-4 h-4 mr-2" /> Add Program</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl rounded-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Program</DialogTitle></DialogHeader>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2 col-span-2">
                <Label>Program Name</Label>
                <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. B.Tech Computer Science" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.departmentId} onValueChange={v => setForm({...form, departmentId: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue placeholder="Select Dept" /></SelectTrigger>
                  <SelectContent>
                    {depts.map((d: any) => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Total Intake</Label>
                <Input type="number" value={form.totalIntake} onChange={e => setForm({...form, totalIntake: e.target.value})} className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label>Course Type</Label>
                <Select value={form.courseType} onValueChange={v => setForm({...form, courseType: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="UG">UG</SelectItem><SelectItem value="PG">PG</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Entry Type</Label>
                <Select value={form.entryType} onValueChange={v => setForm({...form, entryType: v})}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="Regular">Regular</SelectItem><SelectItem value="Lateral">Lateral</SelectItem></SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={createMut.isPending} className="col-span-2 mt-4 w-full rounded-xl">Save Program</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Intake</TableHead><TableHead>Year</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {programs.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No programs found</TableCell></TableRow>}
            {programs.map((p: any) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>{p.courseType} - {p.entryType}</TableCell>
                <TableCell>{p.totalIntake}</TableCell>
                <TableCell>{p.academicYear}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


export default function MasterSetup() {
  const { canManageSetup } = useRole();

  if (!canManageSetup) {
    return <Redirect to="/" />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Master Setup</h1>
        <p className="text-muted-foreground mt-1">Configure structural master data for the institution.</p>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-xl shadow-black/5 overflow-hidden">
        <CardHeader className="bg-muted/30 border-b pb-6">
          <CardTitle className="font-display">System Configuration</CardTitle>
          <CardDescription>Manage core entities that power the admission engine.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="institutions" className="w-full">
            <div className="px-6 pt-4 border-b">
              <TabsList className="bg-transparent h-12 w-full justify-start gap-4 p-0">
                {['institutions', 'campuses', 'programs'].map((tab) => (
                  <TabsTrigger 
                    key={tab}
                    value={tab} 
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary rounded-none h-full px-4 capitalize font-semibold tracking-wide"
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className="p-6">
              <TabsContent value="institutions" className="mt-0"><InstitutionsTab /></TabsContent>
              <TabsContent value="campuses" className="mt-0"><CampusesTab /></TabsContent>
              <TabsContent value="programs" className="mt-0"><ProgramsTab /></TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
