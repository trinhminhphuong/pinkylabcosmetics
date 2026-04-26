package com.example.pinkylab.payment;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import com.example.pinkylab.shared.base.RestApiV1;
import com.example.pinkylab.shared.base.RestData;
import com.example.pinkylab.shared.base.VsResponseUtil;
import com.example.pinkylab.shared.constant.UrlConstant;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

import com.example.pinkylab.shared.config.VNPayConfig;

@RestApiV1
@RequiredArgsConstructor
@Validated
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentController {

  PaymentService paymentService;
  VNPayConfig vnPayConfig; // Chỉ dùng cho Return URL signature verify (không có business logic)

  // 1. TẠO URL THANH TOÁN
  @Operation(summary = "Tạo URL thanh toán VNPay", description = "Lưu giao dịch (PENDING) vào DB và trả về URL thanh toán VNPay", security = @SecurityRequirement(name = "Bearer Token"))
  @PostMapping(UrlConstant.Payment.CREATE_PAYMENT)
  public ResponseEntity<RestData<String>> createPayment(
      HttpServletRequest request,
      @RequestParam("amount") long amount) throws Exception {

    String paymentUrl = paymentService.createPaymentUrl(amount, request);
    return VsResponseUtil.success(paymentUrl);
  }

  // 2. RETURN URL — VNPay redirect người dùng về sau thanh toán
  // Chỉ dùng để hiển thị UI, KHÔNG update DB (theo khuyến cáo VNPay)
  @Operation(summary = "VNPay Return URL", description = "VNPay redirect về đây sau thanh toán. Chỉ verify chữ ký để hiển thị kết quả UI, không update DB.")
  @GetMapping(UrlConstant.Payment.PAYMENT_RETURN)
  public ResponseEntity<?> paymentReturn(HttpServletRequest request) {
    Map<String, String> fields = extractParams(request);

    String vnpSecureHash = request.getParameter("vnp_SecureHash");
    fields.remove("vnp_SecureHashType");
    fields.remove("vnp_SecureHash");

    String signValue = hashAllFields(fields);
    if (!signValue.equals(vnpSecureHash)) {
      return ResponseEntity.badRequest().body("Chữ ký không hợp lệ");
    }

    if ("00".equals(request.getParameter("vnp_TransactionStatus"))) {
      return ResponseEntity.ok("Giao dịch thành công");
    } else {
      return ResponseEntity.badRequest().body("Giao dịch thất bại");
    }
  }

  // 3. IPN — VNPay gọi ngầm (Server-to-Server) để update DB
  @Operation(summary = "VNPay IPN Webhook", description = "VNPay gọi ngầm để thông báo kết quả thanh toán. Xác minh chữ ký và cập nhật DB.")
  @GetMapping(UrlConstant.Payment.PAYMENT_IPN)
  public ResponseEntity<Map<String, String>> paymentIpn(HttpServletRequest request) {
    return ResponseEntity.ok(paymentService.handleIpn(request));
  }

  // 4. POLLING — FE dùng để kiểm tra trạng thái giao dịch
  @Operation(summary = "Kiểm tra trạng thái giao dịch", description = "FE polling để lấy trạng thái giao dịch sau khi được redirect về từ VNPay", security = @SecurityRequirement(name = "Bearer Token"))
  @GetMapping(UrlConstant.Payment.PAYMENT_STATUS)
  public ResponseEntity<RestData<TransactionStatus>> getPaymentStatus(
      @PathVariable("txnRef") String txnRef) {

    return VsResponseUtil.success(paymentService.getTransactionStatus(txnRef));
  }

  // 5. TRUY VẤN VNPay (Server to VNPay)
  @Operation(summary = "Truy vấn trạng thái giao dịch trực tiếp từ VNPay API", security = @SecurityRequirement(name = "Bearer Token"))
  @GetMapping("/vnpay/query/{txnRef}")
  public ResponseEntity<String> queryTransaction(
      @PathVariable String txnRef,
      HttpServletRequest request) {
    return ResponseEntity.ok(paymentService.queryTransaction(txnRef, request));
  }

  // 6. HOÀN TIỀN (Server to VNPay)
  @Operation(summary = "Hoàn tiền giao dịch VNPay", security = @SecurityRequirement(name = "Bearer Token"))
  @PostMapping("/vnpay/refund/{txnRef}")
  public ResponseEntity<String> refundTransaction(
      @PathVariable String txnRef,
      @RequestParam long amount,
      @RequestParam(defaultValue = "02") String tranType, // 02: Toàn phần, 03: Một phần
      HttpServletRequest request) {
    String createBy = "admin"; // Lấy từ auth user trong thực tế
    return ResponseEntity.ok(paymentService.refundTransaction(txnRef, amount, tranType, createBy, request));
  }

  // ─── PRIVATE UTILS (chỉ dùng cho Return URL) ───────────────────────────
  private Map<String, String> extractParams(HttpServletRequest request) {
    Map<String, String> fields = new HashMap<>();
    for (Enumeration<String> params = request.getParameterNames(); params.hasMoreElements();) {
      String name = params.nextElement();
      String value = request.getParameter(name);
      if (value != null && !value.isEmpty())
        fields.put(name, value);
    }
    return fields;
  }

  private String hashAllFields(Map<String, String> fields) {
    List<String> fieldNames = new ArrayList<>(fields.keySet());
    Collections.sort(fieldNames);
    StringBuilder hashData = new StringBuilder();
    Iterator<String> itr = fieldNames.iterator();
    while (itr.hasNext()) {
      String fieldName = itr.next();
      String fieldValue = fields.get(fieldName);
      if (fieldValue != null && !fieldValue.isEmpty()) {
        hashData.append(fieldName).append('=')
            .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
        if (itr.hasNext())
          hashData.append('&');
      }
    }
    return vnPayConfig.hmacSHA512(vnPayConfig.secretKey, hashData.toString());
  }
}