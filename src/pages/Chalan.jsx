import { useState } from "react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";

function Chalan() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateChalan = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    const toastId = toast.loading("Generating chalan...");

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Chalan generated successfully", { id: toastId });
    } catch {
      toast.error("Failed to generate chalan", { id: toastId });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Chalan</h1>
        <p className="text-gray-600">Generate a placeholder fee chalan document.</p>

        {isGenerating && <Loader label="Generating chalan..." />}

        <button
          type="button"
          onClick={handleGenerateChalan}
          disabled={isGenerating}
          className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
        >
          {isGenerating ? "Generating..." : "Generate Chalan"}
        </button>
      </div>
    </section>
  );
}

export default Chalan;
