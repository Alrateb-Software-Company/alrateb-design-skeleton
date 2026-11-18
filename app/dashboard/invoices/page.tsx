import { ReceiptText } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export default function InvoicesPage() {
  return <ComingSoon titleKey="nav.invoices" icon={<ReceiptText className="size-5" />} />;
}
