function Loader({ label = "Processing..." }) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-blue-100 bg-blue-50 px-4 py-3 text-blue-700">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export default Loader;
