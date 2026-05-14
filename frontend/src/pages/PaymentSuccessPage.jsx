import { CheckCircle2, Home } from "lucide-react";
import { useEffect, useState } from "react";

import { registrationApi } from "../api/registrationApi.js";

function PaymentSuccessPage({ onGoLogin }) {
  const [status, setStatus] = useState("Đang xác nhận thanh toán...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderCode = params.get("orderCode");
    const payStatus = params.get("status");
    const code = params.get("code");
    const cancel = params.get("cancel");

    async function confirm() {
      if (!orderCode || payStatus !== "PAID") {
        setStatus("Không tìm thấy giao dịch đã thanh toán hoặc giao dịch chưa hoàn tất.");
        return;
      }

      try {
        await registrationApi.confirmPayment({ orderCode: Number(orderCode), status: payStatus, code, cancel });
        setStatus("Thanh toán thành công. Hồ sơ của bạn đang chờ admin duyệt, thông báo đã được gửi qua email.");
      } catch {
        setStatus("Thanh toán đã hoàn tất trên PayOS. Hệ thống sẽ đối soát và cập nhật hồ sơ trong ít phút.");
      }
    }

    confirm();
  }, []);

  return (
    <main className="login-page">
      <section className="card border-0 shadow login-card">
        <div className="card-body p-4 p-md-5 text-center">
          <CheckCircle2 className="text-success mb-3" size={54} />
          <h1 className="h4 fw-bold">Thanh toán thành công</h1>
          <p className="text-secondary">{status}</p>
          <button className="btn btn-primary d-inline-flex align-items-center justify-content-center gap-2 w-100 mt-3" onClick={onGoLogin} type="button">
            <Home size={16} />
            Về trang đăng nhập
          </button>
        </div>
      </section>
    </main>
  );
}

export default PaymentSuccessPage;
