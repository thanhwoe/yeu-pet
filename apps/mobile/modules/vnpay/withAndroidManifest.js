const { withAndroidManifest, AndroidConfig } = require("@expo/config-plugins");

/**
 * Config plugin để thêm deep linking scheme cho VNPay
 *
 * @param {object} config - Expo config
 * @param {object} props - Plugin props với scheme
 * @returns {object} Modified config
 */
function withVnpayModule(config, props = {}) {
  const scheme = props.scheme || config.scheme || "petcare";

  return withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Tìm main activity
    const mainActivity =
      AndroidConfig.Manifest.getMainActivityOrThrow(androidManifest);

    // Thêm intent-filter cho deep linking nếu chưa có
    if (!mainActivity["intent-filter"]) {
      mainActivity["intent-filter"] = [];
    }

    // Kiểm tra xem đã có intent-filter cho scheme chưa
    const hasScheme = mainActivity["intent-filter"].some((filter) => {
      const data = filter.data;
      if (!data) return false;
      const dataArray = Array.isArray(data) ? data : [data];
      return dataArray.some((d) => d.$?.["android:scheme"] === scheme);
    });

    // Nếu chưa có, thêm intent-filter mới
    if (!hasScheme) {
      mainActivity["intent-filter"].push({
        action: [
          {
            $: {
              "android:name": "android.intent.action.VIEW",
            },
          },
        ],
        category: [
          {
            $: {
              "android:name": "android.intent.category.DEFAULT",
            },
          },
          {
            $: {
              "android:name": "android.intent.category.BROWSABLE",
            },
          },
        ],
        data: [
          {
            $: {
              "android:scheme": scheme,
            },
          },
        ],
      });
    }

    return config;
  });
}

module.exports = withVnpayModule;
