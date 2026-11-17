import { useState, type ReactNode, type ReactElement } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

type Props = {
  children: ReactNode;
  fileName: string;
  renderContent: () => Promise<ReactElement>;
  className?: string;
  variant?: "default" | "ghost";
  label?: string;
};

export default function ExportPdfButton({ children, fileName, renderContent, className, variant, label }: Props) {
  const [loading, setLoading] = useState(false);

  async function download() {
    setLoading(true);
    try {
      const [{ pdf }, { default: PdfDocument }, content] = await Promise.all([
        import("@react-pdf/renderer"),
        import("./PdfDocument"),
        renderContent(),
      ]);
      const blob = await pdf(<PdfDocument>{content}</PdfDocument>).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error("تعذّر تصدير ملف PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" className={className} variant={variant} disabled={loading} onClick={download} aria-label={label}>
      {loading ? "جاري إنشاء PDF..." : children}
    </Button>
  );
}
