import ExpoModulesCore
import UIKit

struct VnpayPaymentParams: Record {
  @Field
  var scheme: String = ""
  
  @Field
  var isSandbox: Bool = true
  
  @Field
  var paymentUrl: String = ""
  
  @Field
  var tmnCode: String = ""
  
  @Field
  var backAlert: String?
  
  @Field
  var title: String?
  
  @Field
  var titleColor: String?
  
  @Field
  var beginColor: String?
  
  @Field
  var endColor: String?
  
  @Field
  var iconBackName: String?
}

public class VnpayModule: Module {
  private var paymentWindow: UIWindow?

  public func definition() -> ModuleDefinition {
    Name("Vnpay")

    Events("onPaymentResult")

    OnCreate {
      NotificationCenter.default.addObserver(
        self,
        selector: #selector(sdkCompleted(_:)),
        name: NSNotification.Name("SDK_COMPLETED"),
        object: nil
      )
    }

    OnDestroy {
      NotificationCenter.default.removeObserver(self)
      cleanupWindow()
    }

    AsyncFunction("show") { (params: VnpayPaymentParams) in
      await MainActor.run {
        self.showPayment(params: params)
      }
    }
  }

  @MainActor
  private func showPayment(params: VnpayPaymentParams) {
    let screenBounds = UIScreen.main.bounds
    
    paymentWindow = UIWindow(frame: screenBounds)
    paymentWindow?.backgroundColor = .clear
    paymentWindow?.windowLevel = .alert
    
    let rootVC = UIViewController()
    rootVC.view.backgroundColor = .clear
    paymentWindow?.rootViewController = rootVC
    
    paymentWindow?.makeKeyAndVisible()
    
    guard let rootVC = paymentWindow?.rootViewController else {
      return
    }
    
    // Configure VNPAY SDK through bridge
    VnpaySDKBridge.setHomeViewController(rootVC)
    VnpaySDKBridge.setSchemes(params.scheme)
    VnpaySDKBridge.setEnableBackAction(true)
    VnpaySDKBridge.setIsSandbox(params.isSandbox)
    
    if let backAlert = params.backAlert {
      VnpaySDKBridge.setAppBackAlert(backAlert)
    }

    // Show payment screen
    VnpaySDKBridge.showPushPayment(
      withPaymentURL: params.paymentUrl,
      withTitle: params.title ?? "",
      iconBackName: params.iconBackName ?? "",
      beginColor: params.beginColor ?? "",
      endColor: params.endColor ?? "",
      titleColor: params.titleColor ?? "",
      tmnCode: params.tmnCode
    )
  }
  
  @objc private func sdkCompleted(_ notification: Notification) {
    // Clean up on main thread
    DispatchQueue.main.async { [weak self] in
      self?.cleanupWindow()
    }
    
    // Parse notification data
    guard let userInfo = notification.object as? [String: Any],
          let action = userInfo["Action"] as? String else {
      return
    }
    
    // Map action to result code
    let resultCode: Int
    switch action {
    case "AppBackAction":
      // User pressed back button in SDK
      resultCode = -1
    case "CallMobileBankingApp":
      // User selected payment via mobile banking app
      resultCode = 10
    case "WebBackAction":
      // User cancelled payment (vnp_ResponseCode == 24)
      resultCode = 99
    case "FaildBackAction":
      // Payment failed (vnp_ResponseCode != 00)
      resultCode = 98
    case "SuccessBackAction":
      // Payment successful (vnp_ResponseCode == 00)
      resultCode = 97
    default:
      return
    }
    
    // Send event to JavaScript
    sendEvent("onPaymentResult", [
      "resultCode": resultCode,
      "action": action
    ])
  }
  
  private func cleanupWindow() {
    paymentWindow?.isHidden = true
    paymentWindow = nil
  }
}
