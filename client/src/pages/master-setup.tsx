import { type ReactNode, useMemo, useState } from "react";
import { Redirect } from "wouter";
import { useRole } from "@/lib/role-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import {
  useInstitutions,
  useCreateInstitution,
  useCampuses,
  useCreateCampus,
  useDepartments,
  useCreateDepartment,
  usePrograms,
  useCreateProgram,
  useQuotas,
  useCreateQuota,
} from "@/hooks/use-master-data";
import { useToast } from "@/hooks/use-toast";

function InstitutionsTab() {
  const { data: institutions = [] } = useInstitutions();
  const createMut = useCreateInstitution();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");

  const submit = async () => {
    if (!name.trim() || !code.trim()) return;
    try {
      await createMut.mutateAsync({ name: name.trim(), code: code.trim().toUpperCase() });
      setOpen(false);
      setName("");
      setCode("");
      toast({ title: "Institution created" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <SetupTable
      title="Institutions"
      buttonLabel="Add Institution"
      open={open}
      setOpen={setOpen}
      dialogTitle="Create Institution"
      onSubmit={submit}
      submitDisabled={createMut.isPending}
      form={
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Institution Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Global Engineering College" />
          </div>
          <div className="space-y-2">
            <Label>Code (Short form)</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="GEC" maxLength={10} />
            <p className="text-xs text-muted-foreground">Example: GEC, MIT, RVCE</p>
          </div>
        </div>
      }
      headers={["ID", "Name", "Code"]}
      rows={institutions.map((item: any) => [item.id, item.name, item.code])}
    />
  );
}

function CampusesTab() {
  const { data: campuses = [] } = useCampuses();
  const { data: institutions = [] } = useInstitutions();
  const createMut = useCreateCampus();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [institutionId, setInstitutionId] = useState("");

  const submit = async () => {
    if (!name.trim() || !institutionId) return;
    try {
      await createMut.mutateAsync({ name: name.trim(), institutionId: Number(institutionId) });
      setOpen(false);
      setName("");
      setInstitutionId("");
      toast({ title: "Campus created" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <SetupTable
      title="Campuses"
      buttonLabel="Add Campus"
      open={open}
      setOpen={setOpen}
      dialogTitle="Create Campus"
      onSubmit={submit}
      submitDisabled={createMut.isPending}
      form={
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Campus Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Main Campus" />
          </div>
          <div className="space-y-2">
            <Label>Institution</Label>
            <Select value={institutionId} onValueChange={setInstitutionId}>
              <SelectTrigger><SelectValue placeholder="Select institution" /></SelectTrigger>
              <SelectContent>
                {institutions.map((item: any) => (
                  <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      }
      headers={["ID", "Campus", "Institution ID"]}
      rows={campuses.map((item: any) => [item.id, item.name, item.institutionId])}
    />
  );
}

function DepartmentsTab() {
  const { data: departments = [] } = useDepartments();
  const { data: campuses = [] } = useCampuses();
  const createMut = useCreateDepartment();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [campusId, setCampusId] = useState("");

  const submit = async () => {
    if (!name.trim() || !code.trim() || !campusId) return;
    try {
      await createMut.mutateAsync({ name: name.trim(), code: code.trim().toUpperCase(), campusId: Number(campusId) });
      setOpen(false);
      setName("");
      setCode("");
      setCampusId("");
      toast({ title: "Department created" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <SetupTable
      title="Departments"
      buttonLabel="Add Department"
      open={open}
      setOpen={setOpen}
      dialogTitle="Create Department"
      onSubmit={submit}
      submitDisabled={createMut.isPending}
      form={
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Department Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Computer Science" />
          </div>
          <div className="space-y-2">
            <Label>Code (Short form)</Label>
            <Input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CSE" maxLength={10} />
            <p className="text-xs text-muted-foreground">Example: CSE, ECE, MECH, CIVIL</p>
          </div>
          <div className="space-y-2">
            <Label>Campus</Label>
            <Select value={campusId} onValueChange={setCampusId}>
              <SelectTrigger><SelectValue placeholder="Select campus" /></SelectTrigger>
              <SelectContent>
                {campuses.map((item: any) => (
                  <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      }
      headers={["ID", "Department", "Code", "Campus ID"]}
      rows={departments.map((item: any) => [item.id, item.name, item.code, item.campusId])}
    />
  );
}

function ProgramsTab() {
  const { data: programs = [] } = usePrograms();
  const { data: departments = [] } = useDepartments();
  const createMut = useCreateProgram();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    departmentId: "",
    courseType: "UG",
    entryType: "Regular",
    academicYear: "2026-2027",
    totalIntake: "",
  });

  const submit = async () => {
    if (!form.name || !form.code || !form.departmentId || !form.totalIntake) return;
    try {
      await createMut.mutateAsync({
        ...form,
        code: form.code.toUpperCase(),
        departmentId: Number(form.departmentId),
        totalIntake: Number(form.totalIntake),
      });
      setOpen(false);
      setForm({
        name: "",
        code: "",
        departmentId: "",
        courseType: "UG",
        entryType: "Regular",
        academicYear: "2026-2027",
        totalIntake: "",
      });
      toast({ title: "Program created" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <SetupTable
      title="Programs"
      buttonLabel="Add Program"
      open={open}
      setOpen={setOpen}
      dialogTitle="Create Program"
      onSubmit={submit}
      submitDisabled={createMut.isPending}
      form={
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-2">
            <Label>Program / Branch</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="B.Tech CSE" />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>Code (Short form)</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="BTCSE" maxLength={10} />
            <p className="text-xs text-muted-foreground">Example: BTCSE, MTCSE, BEECE</p>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v })}>
              <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>
                {departments.map((item: any) => (
                  <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Academic Year</Label>
            <Input value={form.academicYear} onChange={(e) => setForm({ ...form, academicYear: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Course Type</Label>
            <Select value={form.courseType} onValueChange={(v) => setForm({ ...form, courseType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="UG">UG</SelectItem>
                <SelectItem value="PG">PG</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Entry Type</Label>
            <Select value={form.entryType} onValueChange={(v) => setForm({ ...form, entryType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Regular">Regular</SelectItem>
                <SelectItem value="Lateral">Lateral</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Total Intake</Label>
            <Input type="number" value={form.totalIntake} onChange={(e) => setForm({ ...form, totalIntake: e.target.value })} />
          </div>
        </div>
      }
      headers={["Program", "Year", "Type", "Mode", "Intake"]}
      rows={programs.map((item: any) => [
        item.name,
        item.academicYear,
        `${item.courseType}/${item.entryType}`,
        item.admissionMode,
        item.totalIntake,
      ])}
    />
  );
}

function QuotasTab() {
  const { data: programs = [] } = usePrograms();
  const { data: quotas = [] } = useQuotas();
  const createMut = useCreateQuota();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    programId: "",
    quotaType: "KCET",
    seatCount: "",
  });

  const quotaSummary = useMemo(() => {
    const summary = new Map<number, number>();
    quotas.forEach((q: any) => {
      summary.set(q.programId, (summary.get(q.programId) || 0) + q.seatCount);
    });
    return summary;
  }, [quotas]);

  const submit = async () => {
    if (!form.programId || !form.quotaType || !form.seatCount) return;
    try {
      await createMut.mutateAsync({
        programId: Number(form.programId),
        quotaType: form.quotaType,
        seatCount: Number(form.seatCount),
      });
      setOpen(false);
      setForm({ programId: "", quotaType: "KCET", seatCount: "" });
      toast({ title: "Quota created" });
    } catch (err: any) {
      toast({ title: "Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <SetupDialog
        title="Seat Matrix & Quotas"
        buttonLabel="Add Quota"
        open={open}
        setOpen={setOpen}
        dialogTitle="Create Quota"
        onSubmit={submit}
        submitDisabled={createMut.isPending}
        form={
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Program</Label>
              <Select value={form.programId} onValueChange={(v) => setForm({ ...form, programId: v })}>
                <SelectTrigger><SelectValue placeholder="Select program" /></SelectTrigger>
                <SelectContent>
                  {programs.map((item: any) => (
                    <SelectItem key={item.id} value={String(item.id)}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quota Type</Label>
              <Select value={form.quotaType} onValueChange={(v) => setForm({ ...form, quotaType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="KCET">KCET</SelectItem>
                  <SelectItem value="COMEDK">COMEDK</SelectItem>
                  <SelectItem value="Management">Management</SelectItem>
                  <SelectItem value="Supernumerary">Supernumerary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Seat Count</Label>
              <Input type="number" value={form.seatCount} onChange={(e) => setForm({ ...form, seatCount: e.target.value })} />
            </div>
          </div>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Program Quota Balance</CardTitle>
          <CardDescription>Quota sum must match intake before seat allocation.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {programs.map((program: any) => {
            const used = quotaSummary.get(program.id) || 0;
            const delta = program.totalIntake - used;
            return (
              <div key={program.id} className="flex items-center justify-between rounded border p-3">
                <div>
                  <div className="font-medium">{program.name}</div>
                  <div className="text-xs text-muted-foreground">Intake {program.totalIntake} | Quotas {used}</div>
                </div>
                <Badge variant={delta === 0 ? "default" : "secondary"}>
                  {delta === 0 ? "Balanced" : `${delta > 0 ? delta : Math.abs(delta)} ${delta > 0 ? "seats remaining" : "excess seats"}`}
                </Badge>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quota List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program ID</TableHead>
                <TableHead>Quota</TableHead>
                <TableHead>Seats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotas.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No quotas configured</TableCell></TableRow>
              ) : (
                quotas.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.programId}</TableCell>
                    <TableCell>{item.quotaType}</TableCell>
                    <TableCell>{item.seatCount}</TableCell>
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

function SetupDialog({
  title,
  buttonLabel,
  open,
  setOpen,
  dialogTitle,
  onSubmit,
  submitDisabled,
  form,
}: {
  title: string;
  buttonLabel: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  dialogTitle: string;
  onSubmit: () => void;
  submitDisabled?: boolean;
  form: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button><Plus className="mr-2 h-4 w-4" />{buttonLabel}</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>{dialogTitle}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {form}
            <Button className="w-full" onClick={onSubmit} disabled={submitDisabled}>Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SetupTable({
  title,
  buttonLabel,
  open,
  setOpen,
  dialogTitle,
  onSubmit,
  submitDisabled,
  form,
  headers,
  rows,
}: {
  title: string;
  buttonLabel: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  dialogTitle: string;
  onSubmit: () => void;
  submitDisabled?: boolean;
  form: ReactNode;
  headers: string[];
  rows: Array<Array<string | number>>;
}) {
  return (
    <div className="space-y-4">
      <SetupDialog
        title={title}
        buttonLabel={buttonLabel}
        open={open}
        setOpen={setOpen}
        dialogTitle={dialogTitle}
        onSubmit={onSubmit}
        submitDisabled={submitDisabled}
        form={form}
      />
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>{headers.map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow><TableCell colSpan={headers.length} className="text-center text-muted-foreground">No records</TableCell></TableRow>
              ) : (
                rows.map((row, idx) => (
                  <TableRow key={idx}>
                    {row.map((cell, cellIdx) => <TableCell key={cellIdx}>{cell}</TableCell>)}
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

export default function MasterSetup() {
  const { canManageSetup } = useRole();
  if (!canManageSetup) return <Redirect to="/" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Master Setup</h1>
        <p className="text-muted-foreground">Configure departments, programs, and quota seat matrix.</p>
      </div>
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="institutions">
            <TabsList className="mb-4 flex flex-wrap gap-2">
              <TabsTrigger value="institutions">Institutions</TabsTrigger>
              <TabsTrigger value="campuses">Campuses</TabsTrigger>
              <TabsTrigger value="departments">Departments</TabsTrigger>
              <TabsTrigger value="programs">Programs</TabsTrigger>
              <TabsTrigger value="quotas">Quotas</TabsTrigger>
            </TabsList>
            <TabsContent value="institutions"><InstitutionsTab /></TabsContent>
            <TabsContent value="campuses"><CampusesTab /></TabsContent>
            <TabsContent value="departments"><DepartmentsTab /></TabsContent>
            <TabsContent value="programs"><ProgramsTab /></TabsContent>
            <TabsContent value="quotas"><QuotasTab /></TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
