import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Clock, CheckCircle, AlertCircle, Download, MessageCircle, Upload, Info, Loader2 } from "lucide-react";
import { Chatbot } from "@/components/chatbot";

export default function StudentDashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["/api/student/profile", user?.email],
    queryFn: async () => {
      const res = await fetch(`/api/student/profile?email=${encodeURIComponent(user?.email ?? "")}`);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch profile");
      }
      return res.json() as Promise<{
        applicant: any;
        admission: any | null;
        program: any | null;
      }>;
    },
    enabled: !!user?.email,
  });

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed": return "bg-green-500";
      case "allocated": return "bg-blue-500";
      case "pending": return "bg-yellow-500";
      case "cancelled": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getDocStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "verified": return "text-green-600 bg-green-50";
      case "submitted": return "text-blue-600 bg-blue-50";
      case "pending": return "text-yellow-600 bg-yellow-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const handleDownload = () => {
    if (!data?.applicant) return;
    const { applicant, admission, program } = data;
    const lines = [
      `Name: ${applicant.fullName}`,
      `Email: ${applicant.email}`,
      `Phone: ${applicant.phone}`,
      `Date of Birth: ${applicant.dateOfBirth}`,
      `Gender: ${applicant.gender}`,
      `Category: ${applicant.category}`,
      `Qualifying Exam: ${applicant.qualifyingExam}`,
      `Marks: ${applicant.marks}`,
      `Document Status: ${applicant.documentStatus}`,
      ``,
      program ? `Program: ${program.name} (${program.courseType})` : "",
      admission ? `Quota: ${admission.quotaType}` : "",
      admission ? `Admission Status: ${admission.status}` : "",
      admission?.admissionNumber ? `Admission Number: ${admission.admissionNumber}` : "",
      admission?.allotmentNumber ? `Allotment Number: ${admission.allotmentNumber}` : "",
      admission ? `Fee Status: ${admission.feeStatus}` : "",
    ].filter(Boolean);
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${applicant.fullName.replace(/ /g, "_")}_application.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:admissions@institution.edu?subject=Admission Support";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // No applicant record linked to this student email
  if (isError || !data) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Welcome, {user?.name}!</h1>
          <p className="text-muted-foreground mt-1">Your student portal is ready.</p>
        </div>
        <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
          <CardContent className="p-8 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
            <h2 className="text-xl font-semibold">No Application Found</h2>
            <p className="text-muted-foreground">
              No applicant record is linked to <strong>{user?.email}</strong>.<br />
              Please contact the admissions office to register your application.
            </p>
            <Button variant="outline" onClick={handleContactSupport}>
              <MessageCircle className="w-4 h-4 mr-2" />
              Contact Admissions
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { applicant, admission, program } = data;

  // Compute progress based on real data
  let progress = 25; // base: profile exists
  if (applicant.documentStatus === "Submitted") progress = 50;
  if (applicant.documentStatus === "Verified") progress = 75;
  if (admission?.feeStatus === "Paid") progress = 90;
  if (admission?.status === "Confirmed") progress = 100;

  const documents = [
    { name: "10th Marksheet", status: applicant.documentStatus === "Verified" ? "Verified" : applicant.documentStatus === "Submitted" ? "Submitted" : "Pending" },
    { name: "12th Marksheet", status: applicant.documentStatus === "Verified" ? "Verified" : applicant.documentStatus === "Submitted" ? "Submitted" : "Pending" },
  ];

  const nextSteps: string[] = [];
  if (applicant.documentStatus === "Pending") nextSteps.push("Submit required documents");
  if (applicant.documentStatus === "Submitted") nextSteps.push("Await document verification");
  if (!admission) nextSteps.push("Await seat allocation from admissions office");
  if (admission?.feeStatus === "Pending") nextSteps.push("Pay admission fee");
  if (admission?.status === "Allocated" && admission?.feeStatus === "Paid") nextSteps.push("Await admission confirmation");
  if (admission?.status === "Confirmed") nextSteps.push("Admission confirmed — collect your offer letter");

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {applicant.fullName}!
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Track your admission progress and review your application details.
          </p>
        </div>
        <Chatbot dashboardData={{ programsIntake: [], pendingDocuments: 0, pendingFees: 0, quotaStats: [] }} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10"><FileText className="w-6 h-6 text-blue-500" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Application Status</p>
                <h3 className="text-lg font-display font-bold">{admission?.status ?? "Pending Allocation"}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/10"><Clock className="w-6 h-6 text-yellow-500" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Document Status</p>
                <h3 className="text-lg font-display font-bold">{applicant.documentStatus}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10"><CheckCircle className="w-6 h-6 text-green-500" /></div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Fee Status</p>
                <h3 className="text-lg font-display font-bold">{admission?.feeStatus ?? "N/A"}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Application Card */}
      <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="font-display">{program?.name ?? "Program Not Assigned"}</CardTitle>
              <p className="text-sm text-muted-foreground">Applicant ID: {applicant.id} · {applicant.email}</p>
            </div>
            {admission && (
              <Badge className={`${getStatusColor(admission.status)} text-white`}>{admission.status}</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Application Progress</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Details grid */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 text-sm">
            {[
              { label: "Quota", value: admission?.quotaType ?? "—" },
              { label: "Allotment No.", value: admission?.allotmentNumber ?? "—" },
              { label: "Admission No.", value: admission?.admissionNumber ?? "—" },
              { label: "Qualifying Exam", value: applicant.qualifyingExam },
              { label: "Marks", value: applicant.marks },
              { label: "Category", value: applicant.category },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-2xl border border-border/50 bg-muted/70 p-4">
                <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">{label}</p>
                <p className="mt-2 text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* Summary note */}
          <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/80 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="w-4 h-4 text-primary" />
              <span>Personal Details</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {applicant.fatherName && <>Father: {applicant.fatherName} · </>}
              {applicant.motherName && <>Mother: {applicant.motherName} · </>}
              {applicant.city}, {applicant.state} — {applicant.phone}
            </p>
          </div>

          {/* Documents */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="w-4 h-4" /> Document Status
            </h4>
            <div className="space-y-3">
              {documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between rounded-2xl border border-border/50 p-4">
                  <p className="font-medium">{doc.name}</p>
                  <Badge variant="secondary" className={getDocStatusColor(doc.status)}>{doc.status}</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Next Steps */}
          {nextSteps.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Next Steps
              </h4>
              <ul className="space-y-1">
                {nextSteps.map((step, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" /> Download Application
            </Button>
            <Button variant="outline" size="sm" onClick={handleContactSupport}>
              <MessageCircle className="w-4 h-4 mr-2" /> Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const mockApplications = [
  {
    id: "APP001",
    program: "B.Tech Computer Science",
    status: "Under Review",
    submittedDate: "2024-01-15",
    lastUpdated: "2024-01-20",
    progress: 75,
    documents: [
      { name: "10th Marksheet", status: "Verified", uploaded: true, fileName: "10th_marksheet.pdf" },
      { name: "12th Marksheet", status: "Verified", uploaded: true, fileName: "12th_marksheet.pdf" },
      { name: "Entrance Exam Score", status: "Submitted", uploaded: true, fileName: "score_card.pdf" },
      { name: "Photo ID", status: "Verified", uploaded: true, fileName: "student_id.jpg" },
    ],
    nextSteps: ["Complete document verification", "Await admission decision"],
  },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState(mockApplications);

  const handleDocumentUpload = (
    applicationId: string,
    documentIndex: number,
    file: File
  ) => {
    setApplications((prev) =>
      prev.map((app) =>
        app.id === applicationId
          ? {
              ...app,
              lastUpdated: new Date().toISOString(),
              progress: Math.min(app.progress + 8, 100),
              documents: app.documents.map((doc, index) =>
                index === documentIndex
                  ? {
                      ...doc,
                      uploaded: true,
                      fileName: file.name,
                      status: doc.status === "Verified" ? "Verified" : "Submitted",
                    }
                  : doc
              ),
            }
          : app
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-500";
      case "under review":
        return "bg-blue-500";
      case "submitted":
        return "bg-purple-500";
      case "pending":
        return "bg-yellow-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const handleDownloadApplication = (application: typeof mockApplications[0]) => {
    const lines = [
      `Application ID: ${application.id}`,
      `Program: ${application.program}`,
      `Status: ${application.status}`,
      `Submitted: ${new Date(application.submittedDate).toLocaleDateString()}`,
      `Last Updated: ${new Date(application.lastUpdated).toLocaleDateString()}`,
      `Progress: ${application.progress}%`,
      ``,
      `Documents:`,
      ...application.documents.map((d) => `  - ${d.name}: ${d.status}`),
      ``,
      `Next Steps:`,
      ...application.nextSteps.map((s) => `  - ${s}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${application.id}_application.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleContactSupport = () => {
    window.location.href = "mailto:admissions@institution.edu?subject=Admission Support";
  };

  const handleScrollToDocuments = (applicationId: string) => {
    document.getElementById(`docs-${applicationId}`)?.scrollIntoView({ behavior: "smooth" });
  };

  const getDocumentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "text-green-600 bg-green-50";
      case "submitted":
        return "text-blue-600 bg-blue-50";
      case "pending":
        return "text-yellow-600 bg-yellow-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Track your admission progress, upload required documents, and review application details all from one place.
          </p>
        </div>
        <Chatbot dashboardData={{ programsIntake: [], pendingDocuments: 0, pendingFees: 0, quotaStats: [] }} />
      </div>

      {applications.length === 0 ? (
        <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
          <CardContent className="grid gap-6 md:grid-cols-[1.5fr_1fr] items-center">
            <div>
              <h2 className="text-2xl font-semibold">Start your first application</h2>
              <p className="mt-2 text-muted-foreground">
                You currently have no active applications. Begin the admission process and upload documents to get reviewed.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button>Start Application</Button>
                <Button variant="outline">Review Document Checklist</Button>
              </div>
            </div>
            <div className="rounded-3xl border border-dashed border-border/60 bg-muted/80 p-6 text-center">
              <Upload className="mx-auto mb-3 h-10 w-10 text-primary" />
              <p className="font-medium">Upload documents</p>
              <p className="text-sm text-muted-foreground mt-2">
                Required documents help move your application forward faster.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Applications</p>
                    <h3 className="text-2xl font-display font-bold">{applications.length}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-yellow-500/10">
                    <Clock className="w-6 h-6 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Documents Submitted</p>
                    <h3 className="text-2xl font-display font-bold">
                      {applications.reduce((count, app) => count + app.documents.filter((doc) => doc.uploaded).length, 0)}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Verified Documents</p>
                    <h3 className="text-2xl font-display font-bold">
                      {applications.reduce((count, app) => count + app.documents.filter((doc) => doc.status === "Verified").length, 0)}
                    </h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {applications.map((application) => (
              <Card key={application.id} className="rounded-2xl border-border/50 shadow-lg shadow-black/5">
                <CardHeader>
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <CardTitle className="font-display">{application.program}</CardTitle>
                      <p className="text-sm text-muted-foreground">Application ID: {application.id}</p>
                    </div>
                    <Badge className={`${getStatusColor(application.status)} text-white`}>
                      {application.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-[1.25fr_0.75fr]">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">Application Progress</span>
                          <span className="text-muted-foreground">{application.progress}%</span>
                        </div>
                        <Progress value={application.progress} className="h-3" />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 text-sm">
                        <div className="rounded-2xl border border-border/50 bg-muted/70 p-4">
                          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">Submitted</p>
                          <p className="mt-2 text-sm font-medium">
                            {new Date(application.submittedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/50 bg-muted/70 p-4">
                          <p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">Last Updated</p>
                          <p className="mt-2 text-sm font-medium">
                            {new Date(application.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 rounded-2xl border border-border/50 bg-muted/80 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Info className="w-4 h-4 text-primary" />
                          <span>Application summary</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Upload documents to complete verification faster. Once all documents are submitted, your application will move to the final review stage.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/50 bg-muted/80 p-4">
                      <h4 className="text-sm font-semibold">Quick Actions</h4>
                      <div className="mt-4 space-y-3">
                        <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => handleScrollToDocuments(application.id)}>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload New Documents
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-center" onClick={() => handleDownloadApplication(application)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download Summary
                        </Button>
                        <Button variant="outline" size="sm" className="w-full justify-center" onClick={handleContactSupport}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Contact Admissions
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Document checklist
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {application.documents.filter((doc) => doc.uploaded).length}/{application.documents.length} uploaded
                      </span>
                    </div>
                    <div id={`docs-${application.id}`} className="space-y-3">
                      {application.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="grid gap-3 rounded-2xl border border-border/50 p-4 md:grid-cols-[1fr_auto] md:items-center"
                        >
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {doc.uploaded
                                ? `Uploaded: ${doc.fileName ?? "attached"}`
                                : "Upload this document to continue review."}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Badge variant="secondary" className={getDocumentStatusColor(doc.status)}>
                              {doc.status}
                            </Badge>
                            <label
                              htmlFor={`upload-${application.id}-${index}`}
                              className="inline-flex items-center rounded-full border border-border/50 bg-background px-3 py-1.5 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent/80 hover:text-foreground cursor-pointer"
                            >
                              {doc.uploaded ? "Update" : "Upload"}
                            </label>
                            <input
                              id={`upload-${application.id}-${index}`}
                              type="file"
                              className="hidden"
                              onChange={(event) => {
                                const file = event.target.files?.[0];
                                if (!file) return;
                                handleDocumentUpload(application.id, index, file);
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Next Steps
                    </h4>
                    <ul className="space-y-1">
                      {application.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col gap-3 pt-4 border-t md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" size="sm" onClick={() => handleDownloadApplication(application)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Application
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleContactSupport}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Contact Support
                      </Button>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Need help? Upload remaining documents above and wait for verification.
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}