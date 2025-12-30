package expo.modules.vnpay

import android.content.Intent
import com.vnpay.authentication.VNP_AuthenticationActivity
import com.vnpay.authentication.VNP_SdkCompletedCallback
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

class VnpayPaymentParams : Record {
  @Field
  val scheme: String = ""
  
  @Field
  val isSandbox: Boolean = true
  
  @Field
  val paymentUrl: String = ""
  
  @Field
  val tmnCode: String = ""
  
  @Field
  val backAlert: String? = null
  
  @Field
  val title: String? = null
  
  @Field
  val titleColor: String? = null
  
  @Field
  val beginColor: String? = null
  
  @Field
  val endColor: String? = null
  
  @Field
  val iconBackName: String? = null
}


class VnpayModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("Vnpay")

    Events("onPaymentResult")


     /**
     * Mở VNPay payment
     * 
     * @param scheme Scheme của app để VNPay redirect về (vd: "myapp")
     * @param isSandbox true = môi trường sandbox, false = production
     * @param paymentUrl URL thanh toán từ backend merchant tạo
     * @param tmnCode Mã merchant do VNPay cung cấp
     * @param backAlert (Không dùng trong version này)
     * @param title (Không dùng trong version này) 
     * @param titleColor (Không dùng trong version này)
     * @param beginColor (Không dùng trong version này)
     * @param endColor (Không dùng trong version này)
     * @param iconBackName (Không dùng trong version này)
     */
    AsyncFunction("show") { params: VnpayPaymentParams ->
      
      val currentActivity = appContext.currentActivity ?: run {
        throw Exception("No current activity available")
      }

      // Tạo Intent để mở VNP_AuthenticationActivity
      val intent = Intent(currentActivity, VNP_AuthenticationActivity::class.java).apply {
        // URL thanh toán merchant tạo
        putExtra("url", params.paymentUrl)
        
        // Scheme app để VNPay redirect về khi thanh toán xong
        putExtra("scheme", params.scheme)
        
        // Mã merchant VNPay cung cấp
        putExtra("tmn_code", params.tmnCode)
      }

      // Set callback để nhận kết quả từ VNPay SDK
      VNP_AuthenticationActivity.setSdkCompletedCallback(object : VNP_SdkCompletedCallback {
        override fun sdkAction(action: String?) {
          /**
           * VNPay SDK trả về các action sau:
           * 
           * - AppBackAction: User nhấn back để quay lại app
           * - CallMobileBankingApp: User chọn thanh toán qua app ngân hàng/ví
           * - WebBackAction: User hủy thanh toán (vnp_ResponseCode == 24)
           * - FaildBackAction: Thanh toán thất bại (vnp_ResponseCode != 00)
           * - SuccessBackAction: Thanh toán thành công (vnp_ResponseCode == 00)
           */
          
          val resultCode = when (action) {
            "AppBackAction" -> -1          // User back
            "CallMobileBankingApp" -> 10   // Mở app banking/wallet
            "WebBackAction" -> 99          // User hủy
            "FaildBackAction" -> 98        // Thất bại
            "SuccessBackAction" -> 97      // Thành công
            else -> 0                       // Unknown action
          }

          // Gửi event về JavaScript
          this@VnpayModule.sendEvent("onPaymentResult", mapOf(
            "resultCode" to resultCode,
            "action" to (action ?: "Unknown")
          ))
        }
      })

      // Mở VNPay payment activity
      currentActivity.startActivity(intent)
    }
  }
}
