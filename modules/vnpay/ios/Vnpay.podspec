Pod::Spec.new do |s|
  s.name           = 'Vnpay'
  s.version        = '1.0.0'
  s.summary        = 'A sample project summary'
  s.description    = 'A sample project description'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '15.1',
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.vendored_frameworks = 'Frameworks/CallAppSDK.framework'
  s.preserve_paths = 'Frameworks/CallAppSDK.framework/**/*'
  s.xcconfig = {

  }


  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'SWIFT_COMPILATION_MODE' => 'wholemodule'
  }


  # s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
  s.source_files = "**/*.{h,m,swift}"
  s.public_header_files = "VnpaySDKBridge.h"
end
