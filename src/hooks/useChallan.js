import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { students } from "../data/students";
import {
  exemptionOptions,
  getAvailableFields,
  getDefaultExemptions,
  getDisabledExemptions,
  getFeePreview,
} from "../services/challanService";
import { createChallanMeta } from "../utils/challan/challanMeta";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingLabel, setProcessingLabel] = useState("Processing...");
  const [generatedChalan, setGeneratedChalan] = useState(null);

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
    if (!selectedStudent) {
      setSelectedExemptions([]);
      setCustomExemptions([]);
      setCustomExemptionLabel("");
      setCustomExemptionAmount("");
      return;
    }
    setSelectedExemptions(getDefaultExemptions(selectedStudent));
    setCustomExemptions([]);
    setCustomExemptionLabel("");
    setCustomExemptionAmount("");
  }, [selectedStudentId, selectedStudent]);

  const updateProcessingState = (active, label = "Processing...") => {
    setIsProcessing(active);
    setProcessingLabel(label);
  };

  const handleStudentChange = (nextStudentId) => {
    setSelectedStudentId(nextStudentId);
    setGeneratedChalan(null);
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
    setSelectedExemptions((prev) => {
      const next = prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key];
      if (key === "feeWaiver" && next.includes("feeWaiver")) {
        setCustomExemptionLabel("Fee Waiver");
      }
      if (key === "feeWaiver" && !next.includes("feeWaiver") && customExemptionLabel === "Fee Waiver") {
        setCustomExemptionLabel("");
      }
      return next;
    });
  };

  const handleAddCustomExemption = () => {
    const label = selectedExemptions.includes("feeWaiver") ? "Fee Waiver" : customExemptionLabel.trim();
    const amount = Number(customExemptionAmount);
    if (!label || !Number.isFinite(amount) || amount <= 0) {
      toast.error("Please provide a valid exemption label and amount");
      return;
    }

    setCustomExemptions((prev) => {
      if (label === "Fee Waiver") {
        const withoutWaiver = prev.filter((item) => item.label !== "Fee Waiver");
        return [...withoutWaiver, { label, amount }];
      }
      return [...prev, { label, amount }];
    });
    if (!selectedExemptions.includes("feeWaiver")) setCustomExemptionLabel("");
    setCustomExemptionAmount("");
  };

  const handleRemoveCustomExemption = (indexToRemove) => {
    setCustomExemptions((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const calculateFeeAdjustments = (student) =>
    getFeePreview({
      student,
      selectedExemptions,
      customExemptions,
    });

  const feePreview = useMemo(
    () =>
      getFeePreview({
        student: selectedStudent,
        selectedExemptions,
        customExemptions,
      }),
    [selectedStudent, selectedExemptions, customExemptions],
  );

  const handleGenerateChalan = async () => {
    if (isProcessing) return;
    if (!selectedStudent) {
      toast.error("Please select a student first");
      return;
    }
    updateProcessingState(true, "Generating chalan...");
    const toastId = toast.loading("Generating chalan...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setGeneratedChalan({
        student: selectedStudent,
        challanMeta: createChallanMeta(),
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
    disabledExemptions,
    isProcessing,
    processingLabel,
    feePreview,
    setLayoutMode,
    setCustomFieldLabel,
    setCustomFieldValue,
    setCustomExemptionLabel,
    setCustomExemptionAmount,
    handleStudentChange,
    handleSelectedFieldToggle,
    handleAddCustomField,
    handleRemoveCustomField,
    handleExemptionToggle,
    handleAddCustomExemption,
    handleRemoveCustomExemption,
    handleGenerateChalan,
    calculateFeeAdjustments,
    updateProcessingState,
  };
};
