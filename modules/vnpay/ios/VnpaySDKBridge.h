#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>

NS_ASSUME_NONNULL_BEGIN

@interface VnpaySDKBridge : NSObject

/**
 * Set the home view controller for the VNPAY SDK
 */
+ (void)setHomeViewController:(UIViewController *)viewController;

/**
 * Set the URL scheme for the app
 */
+ (void)setSchemes:(NSString *)scheme;

/**
 * Enable or disable back action
 */
+ (void)setEnableBackAction:(BOOL)enable;

/**
 * Set sandbox mode
 */
+ (void)setIsSandbox:(BOOL)isSandbox;

/**
 * Set the back alert message
 */
+ (void)setAppBackAlert:(NSString *)backAlert;

/**
 * Show payment screen with all parameters
 */
+ (void)showPushPaymentWithPaymentURL:(NSString *)paymentUrl
                            withTitle:(NSString *)title
                         iconBackName:(NSString *)iconBackName
                           beginColor:(NSString *)beginColor
                             endColor:(NSString *)endColor
                           titleColor:(NSString *)titleColor
                             tmnCode:(NSString *)tmnCode;

@end

NS_ASSUME_NONNULL_END