export const fieldOptions = [
  { key: "name", label: "Name" },
  { key: "fatherName", label: "Father Name" },
  { key: "semester", label: "Semester" },
  { key: "department", label: "Department" },
  { key: "cnic", label: "CNIC" },
  { key: "contact", label: "Contact" },
];

export const hiddenStudentKeys = new Set(["id", "rollNumber", "degree", "period", "feeDetails"]);

export const exemptionOptions = [
  { key: "scholarship", label: "Scholarship" },
  { key: "financialAid", label: "Financial Aid" },
  { key: "feeWaiver", label: "Fee Waiver" },
];
