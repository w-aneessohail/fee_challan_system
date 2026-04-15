import toast from "react-hot-toast";

export const usePrintChallan = ({ generatedChalan, layoutMode }) => {
  const handlePrint = () => {
    if (!generatedChalan) {
      toast.error("Generate chalan before printing");
      return;
    }

    const dynamicPrintStyle = document.createElement("style");
    dynamicPrintStyle.id = "dynamic-print-orientation";
    const printOrientation = layoutMode === "landscape" ? "portrait" : "landscape";
    dynamicPrintStyle.innerHTML = `@page { size: A4 ${printOrientation}; margin: 0; }`;
    document.head.appendChild(dynamicPrintStyle);

    const cleanupPrintStyle = () => {
      const existingStyle = document.getElementById("dynamic-print-orientation");
      if (existingStyle) existingStyle.remove();
      window.removeEventListener("afterprint", cleanupPrintStyle);
    };
    window.addEventListener("afterprint", cleanupPrintStyle);

    toast.success("Opening print dialog...");
    window.print();
  };

  return { handlePrint };
};
