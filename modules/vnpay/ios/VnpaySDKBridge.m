#import "VnpaySDKBridge.h"
#import <CallAppSDK/CallAppInterface.h>

@implementation VnpaySDKBridge

+ (void)setHomeViewController:(UIViewController *)viewController {
    if (viewController) {
        [CallAppInterface setHomeViewController:viewController];
    }
}

+ (void)setSchemes:(NSString *)scheme {
    if (scheme && scheme.length > 0) {
        [CallAppInterface setSchemes:scheme];
    }
}

+ (void)setEnableBackAction:(BOOL)enable {
    [CallAppInterface setEnableBackAction:enable];
}

+ (void)setIsSandbox:(BOOL)isSandbox {
    [CallAppInterface setIsSandbox:isSandbox];
}

+ (void)setAppBackAlert:(NSString *)backAlert {
    if (backAlert && backAlert.length > 0) {
        [CallAppInterface setAppBackAlert:backAlert];
    }
}

+ (void)showPushPaymentWithPaymentURL:(NSString *)paymentUrl
                            withTitle:(NSString *)title
                         iconBackName:(NSString *)iconBackName
                           beginColor:(NSString *)beginColor
                             endColor:(NSString *)endColor
                           titleColor:(NSString *)titleColor
                             tmnCode:(NSString *)tmnCode {
    // Validate required parameters
    if (!paymentUrl || paymentUrl.length == 0) {
        NSLog(@"[VnpaySDKBridge] Error: paymentUrl is required");
        return;
    }
    
    if (!tmnCode || tmnCode.length == 0) {
        NSLog(@"[VnpaySDKBridge] Error: tmnCode is required");
        return;
    }
    
    // Call the SDK with all parameters
    [CallAppInterface showPushPaymentwithPaymentURL:paymentUrl
                                          withTitle:title ?: @""
                                       iconBackName:iconBackName ?: @""
                                         beginColor:beginColor ?: @""
                                           endColor:endColor ?: @""
                                         titleColor:titleColor ?: @""
                                           tmn_code:tmnCode];
}

@end