import React from "react";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { type PaymentStatus } from "../features/payment/paymentApi";

interface Props {
  status: PaymentStatus;
}

const PaymentStatusBadge: React.FC<Props> = ({ status }) => {
  const styles = {
    completed: "bg-green-100 text-green-700 border-green-200",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    failed: "bg-red-100 text-red-700 border-red-200",
  };

  const icons = {
    completed: <CheckCircle2 size={12} />,
    pending: <Clock size={12} />,
    failed: <XCircle size={12} />,
  };

  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[status]}`}>
      {icons[status]}
      {status}
    </span>
  );
};

export default PaymentStatusBadge;