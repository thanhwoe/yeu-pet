import type { SupportedLanguage } from './localization.types';

type TranslationDictionary = Record<SupportedLanguage, Record<string, string>>;

export const TRANSLATIONS: TranslationDictionary = {
  vi: {
    'notifications.reminder.due.title': 'Đến giờ nhắc: {title}',
    'notifications.reminder.due.body': 'Đã đến giờ thực hiện nhắc nhở {title}.',
    'notifications.reminder.due.bodyWithDescription': '{description}',
    'notifications.booking.request.title': 'Yêu cầu đặt lịch mới',
    'notifications.booking.request.body':
      'Bạn có một yêu cầu đặt lịch mới cho {petName}.',
    'notifications.booking.message.title': 'Tin nhắn mới từ lịch chăm sóc',
    'notifications.booking.message.body':
      'Bạn có tin nhắn mới về lịch đặt chăm sóc.',
    'notifications.booking.confirmed.title': 'Lịch đặt đã được xác nhận',
    'notifications.booking.confirmed.body':
      'Yêu cầu đặt lịch cho {petName} đã được chấp nhận.',
    'notifications.booking.rejected.title': 'Yêu cầu đặt lịch bị từ chối',
    'notifications.booking.rejected.body':
      'Yêu cầu đặt lịch cho {petName} đã bị từ chối.',
    'notifications.booking.completed.title': 'Lịch chăm sóc đã hoàn tất',
    'notifications.booking.completed.body':
      'Lịch chăm sóc của {petName} đã được đánh dấu hoàn tất.',
    'notifications.booking.cancelled.title': 'Lịch chăm sóc đã bị hủy',
    'notifications.booking.cancelled.body':
      'Lịch chăm sóc của {petName} đã bị người chăm sóc hủy.',
    'notifications.booking.expired.title': 'Yêu cầu đặt lịch đã hết hạn',
    'notifications.booking.expired.body':
      'Yêu cầu đặt lịch cho {petName} đã hết hạn trước khi được chấp nhận.',

    'emails.otp.subject': 'Mã xác minh YeuPet của bạn',
    'emails.otp.heading': 'Chào mừng đến với YeuPet',
    'emails.otp.greeting': 'Xin chào {userName},',
    'emails.otp.intro':
      'Cảm ơn bạn đã đăng ký YeuPet. Hãy dùng mã sau để kích hoạt tài khoản:',
    'emails.otp.expiry': 'Vui lòng nhập mã này trong vòng {minutes} phút.',
    'emails.otp.ignore':
      'Nếu bạn không đăng ký tài khoản YeuPet, bạn có thể bỏ qua email này.',
    'emails.otp.support': 'Nếu cần hỗ trợ, bạn có thể liên hệ với YeuPet.',
    'emails.otp.body':
      'Mã xác minh của bạn là {code}. Mã này sẽ hết hạn sau {minutes} phút.',
    'emails.emailChange.subject': 'Xác minh email mới cho YeuPet',
    'emails.emailChange.heading': 'Xác minh email mới',
    'emails.emailChange.greeting': 'Xin chào {name},',
    'emails.emailChange.intro':
      'Dùng mã này để hoàn tất thay đổi email tài khoản YeuPet:',
    'emails.emailChange.expiry': 'Mã này sẽ hết hạn sau {minutes} phút.',
    'emails.emailChange.ignore':
      'Nếu bạn không yêu cầu thay đổi email, bạn có thể bỏ qua email này.',
    'emails.bookingHoldExpired.owner.subject':
      'Lịch giữ chỗ YeuPet của bạn đã hết hạn',
    'emails.bookingHoldExpired.owner.body':
      'Xin chào {name}, lịch giữ chỗ chăm sóc cho {petName} đã hết hạn vì chưa được xác nhận kịp thời.',
    'emails.bookingHoldExpired.sitter.subject':
      'Một lịch giữ chỗ YeuPet đã hết hạn',
    'emails.bookingHoldExpired.sitter.body':
      'Một lịch giữ chỗ đang chờ cho {petName} đã hết hạn và không còn giữ chỗ nữa.',

    'errors.common.validationFailed': 'Dữ liệu gửi lên không hợp lệ.',
    'errors.common.badRequest': 'Yêu cầu không hợp lệ.',
    'errors.common.unauthorized': 'Bạn cần đăng nhập để tiếp tục.',
    'errors.common.forbidden': 'Bạn không có quyền thực hiện thao tác này.',
    'errors.common.notFound': 'Không tìm thấy tài nguyên.',
    'errors.common.conflict': 'Yêu cầu bị xung đột với dữ liệu hiện có.',
    'errors.common.tooManyRequests':
      'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
    'errors.common.internalServerError':
      'Máy chủ gặp sự cố. Vui lòng thử lại sau.',
    'errors.common.recordNotFound': 'Không tìm thấy bản ghi.',
    'errors.common.uniqueConstraint': 'Dữ liệu này đã tồn tại.',
    'errors.common.foreignKeyConstraint':
      'Dữ liệu liên quan không hợp lệ hoặc không tồn tại.',
    'errors.common.dataValidation': 'Dữ liệu không hợp lệ.',
    'errors.auth.invalidCredentials': 'Thông tin đăng nhập không chính xác.',
    'errors.auth.emailAlreadyExists': 'Email này đã tồn tại.',
    'errors.auth.otpInvalid': 'Mã OTP không hợp lệ.',
    'errors.auth.otpExpired': 'Mã OTP đã hết hạn.',
    'errors.subscription.petLimitReached':
      'Bạn đã đạt giới hạn số thú cưng của gói hiện tại.',
    'errors.subscription.reminderLimitReached':
      'Bạn đã đạt giới hạn nhắc nhở của gói hiện tại.',
    'errors.subscription.aiLimitReached':
      'Bạn đã đạt giới hạn AI của gói hiện tại.',
    'errors.subscription.photoLimitReached':
      'Bạn đã đạt giới hạn ảnh của gói hiện tại.',
    'errors.subscription.premiumRequired': 'Tính năng này cần gói Premium.',
    'errors.subscription.medicalRecordLimitReached':
      'Bạn đã đạt giới hạn hồ sơ y tế của gói hiện tại.',
    'errors.subscription.budgetTransactionLimitReached':
      'Bạn đã đạt giới hạn giao dịch ngân sách của gói hiện tại.',
  },
  en: {
    'notifications.reminder.due.title': 'Reminder due: {title}',
    'notifications.reminder.due.body': 'Your reminder {title} is due now.',
    'notifications.reminder.due.bodyWithDescription': '{description}',
    'notifications.booking.request.title': 'New booking request',
    'notifications.booking.request.body':
      'You have a new booking request for {petName}.',
    'notifications.booking.message.title': 'New sitter message',
    'notifications.booking.message.body':
      'You have a new message about your booking.',
    'notifications.booking.confirmed.title': 'Booking confirmed',
    'notifications.booking.confirmed.body':
      "{petName}'s booking request was accepted.",
    'notifications.booking.rejected.title': 'Booking request declined',
    'notifications.booking.rejected.body':
      "{petName}'s booking request was declined.",
    'notifications.booking.completed.title': 'Booking completed',
    'notifications.booking.completed.body':
      "{petName}'s booking was marked as completed.",
    'notifications.booking.cancelled.title': 'Booking cancelled',
    'notifications.booking.cancelled.body':
      "{petName}'s booking was cancelled by the sitter.",
    'notifications.booking.expired.title': 'Booking request expired',
    'notifications.booking.expired.body':
      "{petName}'s booking request expired before it was accepted.",

    'emails.otp.subject': 'Your YeuPet verification code',
    'emails.otp.heading': 'Welcome to YeuPet',
    'emails.otp.greeting': 'Hello {userName},',
    'emails.otp.intro':
      'Thank you for registering with YeuPet. To activate your account, use this code:',
    'emails.otp.expiry':
      'Please enter this code within the next {minutes} minutes.',
    'emails.otp.ignore':
      'If you did not register for a YeuPet account, you can ignore this email.',
    'emails.otp.support': 'If you have any questions, please contact YeuPet.',
    'emails.otp.body':
      'Your verification code is {code}. It expires in {minutes} minutes.',
    'emails.emailChange.subject': 'Verify your new email for YeuPet',
    'emails.emailChange.heading': 'Verify your new email',
    'emails.emailChange.greeting': 'Hi {name},',
    'emails.emailChange.intro':
      'Use this code to finish changing your YeuPet account email:',
    'emails.emailChange.expiry': 'This code expires in {minutes} minutes.',
    'emails.emailChange.ignore':
      'If you did not request this email change, you can ignore this email.',
    'emails.bookingHoldExpired.owner.subject':
      'Your YeuPet booking hold expired',
    'emails.bookingHoldExpired.owner.body':
      'Hi {name}, your booking hold for {petName} has expired because it was not confirmed in time.',
    'emails.bookingHoldExpired.sitter.subject': 'A YeuPet booking hold expired',
    'emails.bookingHoldExpired.sitter.body':
      'A pending booking hold for {petName} has expired and no longer reserves capacity.',

    'errors.common.validationFailed': 'Validation failed.',
    'errors.common.badRequest': 'Bad request.',
    'errors.common.unauthorized': 'Authentication is required.',
    'errors.common.forbidden': 'You do not have permission.',
    'errors.common.notFound': 'Resource not found.',
    'errors.common.conflict': 'The request conflicts with existing data.',
    'errors.common.tooManyRequests':
      'Too many requests. Please try again later.',
    'errors.common.internalServerError':
      'Internal server error. Please try again later.',
    'errors.common.recordNotFound': 'Record not found.',
    'errors.common.uniqueConstraint': 'This value already exists.',
    'errors.common.foreignKeyConstraint': 'Related data is invalid or missing.',
    'errors.common.dataValidation': 'Data validation error.',
    'errors.auth.invalidCredentials': 'Invalid credentials.',
    'errors.auth.emailAlreadyExists': 'Email already exists.',
    'errors.auth.otpInvalid': 'Invalid OTP code.',
    'errors.auth.otpExpired': 'OTP code has expired.',
    'errors.subscription.petLimitReached':
      'You have reached the pet limit for your current plan.',
    'errors.subscription.reminderLimitReached':
      'You have reached the reminder limit for your current plan.',
    'errors.subscription.aiLimitReached':
      'You have reached the AI limit for your current plan.',
    'errors.subscription.photoLimitReached':
      'You have reached the photo limit for your current plan.',
    'errors.subscription.premiumRequired':
      'This feature requires a Premium subscription.',
    'errors.subscription.medicalRecordLimitReached':
      'You have reached the medical record limit for your current plan.',
    'errors.subscription.budgetTransactionLimitReached':
      'You have reached the budget transaction limit for your current plan.',
  },
};
