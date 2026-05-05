import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { SEMESTER_PERIOD_VALUES } from "../constants/periodOptions";
import { students } from "../data/students";
import { exemptionOptions } from "../constants/challan";
import { applyPeriodToStudentForBilling } from "../utils/challan/calculationUtils";
import {
  getAvailableFields,
  getDefaultExemptions,
  getDisabledExemptions,
  getFeePreview,
} from "../utils/challan/challanFieldHelpers";
import { createChallanMeta } from "../utils/challan/challanMeta";
import { registerGeneratedChallan } from "../utils/challan/challanRegistry";
import {
  formatCustomPeriodSegments,
  formatPeriodDisplay,
  getCatalogOrdered,
  getDefaultMonthlyCheckboxSelection,
  getDefaultSemesterCheckboxSelection,
  orderSelectedAgainstCatalog,
} from "../utils/challan/periodSelection";

export const buildResolvedPeriod = (periodType, periodValues, customPeriodText) => {
  if (periodType === "custom") {
    const vals = formatCustomPeriodSegments(customPeriodText);
    const display = vals.slice().sort((a, b) => a.localeCompare(b)).join(", ");
    return { type: "custom", values: vals, value: display };
  }
  const catalog = getCatalogOrdered(periodType);
  const ordered = orderSelectedAgainstCatalog(periodValues, catalog);
  const display = formatPeriodDisplay({ periodType, catalogValues: periodValues, customText: "" });
  return { type: periodType, values: ordered, value: display };
};

export const useChallan = () => {
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id ?? "");
  const [layoutMode, setLayoutMode] = useState("portrait");
  const [selectedFields, setSelectedFields] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [customFieldLabel, setCustomFieldLabel] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");
  const [selectedExemptions, setSelectedExemptions] = useState([]);
  const [customExemptions, setCustomExemptions] = useState([]);
  const [customExemptionLabel, setCustomExemptionLabel] = useState("");
  const [customExemptionAmount, setCustomExemptionAmount] = useState("");
  const [isFeeWaiverSelected, setIsFeeWaiverSelected] = useState(false);
  const [additionalFees, setAdditionalFees] = useState([]);
  const [additionalFeeLabel, setAdditionalFeeLabel] = useState("");
  const [additionalFeeAmount, setAdditionalFeeAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("Processing...");
  const [generatedChalan, setGeneratedChalan] = useState(null);
  const [periodType, setPeriodType] = useState(() => {
    const t = students[0]?.period?.type;
    return t === "monthly" ? "monthly" : "semester";
  });
  const [periodValues, setPeriodValues] = useState(() => {
    const s = students[0];
    if (!s?.period || s.period.type === "custom") return [];
    return s.period.type === "monthly"
      ? getDefaultMonthlyCheckboxSelection(s)
      : getDefaultSemesterCheckboxSelection(s);
  });
  const [customPeriodText, setCustomPeriodText] = useState("");

  const selectedStudent = useMemo(
    () => students.find((student) => student.id === selectedStudentId) ?? null,
    [selectedStudentId],
  );

  const availableFields = useMemo(() => getAvailableFields(selectedStudent), [selectedStudent]);
  const disabledExemptions = useMemo(() => getDisabledExemptions(selectedStudent), [selectedStudent]);

  useEffect(() => {
    setSelectedFields(availableFields.map((item) => item.key));
  }, [availableFields]);

  useEffect(() => {
    if (isFeeWaiverSelected) {
      setCustomExemptionLabel("Fee Waiver");
      return;
    }
    setCustomExemptionLabel((prev) => (prev === "Fee Waiver" ? "" : prev));
    setCustomExemptions((prev) => prev.filter((item) => item.label !== "Fee Waiver"));
  }, [isFeeWaiverSelected]);

  useEffect(() => {
    if (!selectedStudent) {
      setSelectedExemptions([]);
      setCustomExemptions([]);
      setCustomExemptionLabel("");
      setCustomExemptionAmount("");
      setIsFeeWaiverSelected(false);
      setPeriodType("semester");
      setPeriodValues([SEMESTER_PERIOD_VALUES[0]]);
      setCustomPeriodText("");
      setAdditionalFees([]);
      setAdditionalFeeLabel("");
      setAdditionalFeeAmount("");
      return;
    }
    setSelectedExemptions(getDefaultExemptions(selectedStudent));
    setCustomExemptions([]);
    setCustomExemptionLabel("");
    setCustomExemptionAmount("");
    setIsFeeWaiverSelected(false);
    setAdditionalFees([]);
    setAdditionalFeeLabel("");
    setAdditionalFeeAmount("");
    const rawType = selectedStudent.period?.type ?? "semester";
    const nextType = rawType === "monthly" ? "monthly" : "semester";
    setPeriodType(nextType);
    setCustomPeriodText("");
    setPeriodValues(
      nextType === "monthly"
        ? getDefaultMonthlyCheckboxSelection(selectedStudent)
        : getDefaultSemesterCheckboxSelection(selectedStudent),
    );
  }, [selectedStudentId, selectedStudent]);

  const updateProcessingState = (active, label = "Processing...") => {
    setIsProcessing(active);
    setProcessingLabel(label);
  };

  const handleStudentChange = (nextStudentId) => {
    setSelectedStudentId(nextStudentId);
    setGeneratedChalan(null);
  };

  const handlePeriodTypeChange = (nextType) => {
    setPeriodType(nextType);
    setCustomPeriodText("");
    if (!selectedStudent) {
      const cat = getCatalogOrdered(nextType);
      setPeriodValues(cat.length ? [cat[0]] : []);
      return;
    }
    setPeriodValues(
      nextType === "monthly"
        ? getDefaultMonthlyCheckboxSelection(selectedStudent)
        : getDefaultSemesterCheckboxSelection(selectedStudent),
    );
  };

  const toggleCatalogPeriodValue = (label) => {
    setPeriodValues((prev) => (prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label]));
  };

  const handleSelectedFieldToggle = (fieldKey) => {
    setSelectedFields((prev) =>
      prev.includes(fieldKey) ? prev.filter((key) => key !== fieldKey) : [...prev, fieldKey],
    );
  };

  const handleAddCustomField = () => {
    const label = customFieldLabel.trim();
    const value = customFieldValue.trim();
    if (!label || !value) {
      toast.error("Please provide both custom field label and value");
      return;
    }
    setCustomFields((prev) => [...prev, { label, value }]);
    setCustomFieldLabel("");
    setCustomFieldValue("");
  };

  const handleRemoveCustomField = (indexToRemove) => {
    setCustomFields((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleExemptionToggle = (key) => {
    if (key === "feeWaiver") {
      setIsFeeWaiverSelected((prev) => !prev);
      return;
    }
    setSelectedExemptions((prev) =>
      prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key],
    );
  };

  const handleAddCustomExemption = () => {
    const label = customExemptionLabel.trim();
    const amount = Number(customExemptionAmount);
    if (!label || !Number.isFinite(amount) || amount <= 0) {
      toast.error("Please provide a valid exemption label and amount");
      return;
    }

    if (label === "Fee Waiver" && customExemptions.some((item) => item.label === "Fee Waiver")) {
      toast.error("Fee Waiver already added");
      return;
    }

    setCustomExemptions((prev) => [...prev, { label, amount }]);
    setCustomExemptionAmount("");
    setCustomExemptionLabel("");
  };

  const handleRemoveCustomExemption = (indexToRemove) => {
    setCustomExemptions((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleAddAdditionalFee = () => {
    const label = additionalFeeLabel.trim();
    const amount = Number(additionalFeeAmount);
    if (!label || !Number.isFinite(amount) || amount <= 0) {
      toast.error("Please provide a valid fee label and amount");
      return;
    }
    setAdditionalFees((prev) => [...prev, { label, amount }]);
    setAdditionalFeeLabel("");
    setAdditionalFeeAmount("");
  };

  const handleRemoveAdditionalFee = (indexToRemove) => {
    setAdditionalFees((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const calculateFeeAdjustments = (student) =>
    getFeePreview({
      student,
      selectedExemptions,
      customExemptions,
      additionalFees,
    });

  const resolvedPeriodPreview = useMemo(
    () => buildResolvedPeriod(periodType, periodValues, customPeriodText),
    [periodType, periodValues, customPeriodText],
  );

  const billingPreviewStudent = useMemo(
    () =>
      selectedStudent
        ? applyPeriodToStudentForBilling(selectedStudent, resolvedPeriodPreview)
        : null,
    [selectedStudent, resolvedPeriodPreview],
  );

  const feePreview = useMemo(
    () =>
      getFeePreview({
        student: billingPreviewStudent,
        selectedExemptions,
        customExemptions,
        additionalFees,
      }),
    [billingPreviewStudent, selectedExemptions, customExemptions, additionalFees],
  );

  const handleGenerateChalan = async () => {
    if (isProcessing) return;
    if (!selectedStudent) {
      toast.error("Please select a student first");
      return;
    }
    const resolvedPeriod = buildResolvedPeriod(periodType, periodValues, customPeriodText);
    if (!resolvedPeriod.values.length) {
      toast.error("Select at least one period");
      return;
    }
    updateProcessingState(true, "Generating chalan...");
    const toastId = toast.loading("Generating chalan...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const studentWithPeriod = applyPeriodToStudentForBilling(selectedStudent, resolvedPeriod);
      const challanMeta = createChallanMeta();
      const feeCalc = getFeePreview({
        student: studentWithPeriod,
        selectedExemptions,
        customExemptions,
        additionalFees,
      });
      registerGeneratedChallan({
        chalanId: challanMeta.chalanId,
        studentId: studentWithPeriod.id,
        studentName: studentWithPeriod.name,
        rollNumber: studentWithPeriod.rollNumber,
        totalAmount: feeCalc.totalFee,
      });
      setGeneratedChalan({
        student: studentWithPeriod,
        challanMeta,
      });
      toast.success("Chalan generated successfully", { id: toastId });
    } catch {
      toast.error("Failed to generate chalan", { id: toastId });
    } finally {
      updateProcessingState(false);
    }
  };

  return {
    students,
    exemptionOptions,
    selectedStudentId,
    selectedStudent,
    generatedChalan,
    layoutMode,
    selectedFields,
    availableFields,
    customFields,
    customFieldLabel,
    customFieldValue,
    selectedExemptions,
    customExemptions,
    customExemptionLabel,
    customExemptionAmount,
    isFeeWaiverSelected,
    additionalFees,
    additionalFeeLabel,
    additionalFeeAmount,
    disabledExemptions,
    isProcessing,
    processingLabel,
    feePreview,
    periodType,
    periodValues,
    customPeriodText,
    setCustomPeriodText,
    toggleCatalogPeriodValue,
    resolvedPeriodPreview,
    handlePeriodTypeChange,
    setLayoutMode,
    setCustomFieldLabel,
    setCustomFieldValue,
    setCustomExemptionLabel,
    setCustomExemptionAmount,
    setAdditionalFeeLabel,
    setAdditionalFeeAmount,
    handleStudentChange,
    handleSelectedFieldToggle,
    handleAddCustomField,
    handleRemoveCustomField,
    handleExemptionToggle,
    handleAddCustomExemption,
    handleRemoveCustomExemption,
    handleAddAdditionalFee,
    handleRemoveAdditionalFee,
    handleGenerateChalan,
    calculateFeeAdjustments,
    updateProcessingState,
  };
};
