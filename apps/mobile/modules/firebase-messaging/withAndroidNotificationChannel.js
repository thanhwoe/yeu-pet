const { withMainApplication } = require("@expo/config-plugins");
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");

module.exports = function withAndroidNotificationChannel(config, props = {}) {
  const channelId = props.channelId || "yeu-pet";
  const channelName = props.channelName || "YeuPet notifications";

  return withMainApplication(config, (config) => {
    if (config.modResults.language !== "kt") {
      throw new Error(
        "YeuPet Firebase notification channel setup requires MainApplication.kt.",
      );
    }

    const imports = mergeContents({
      tag: "yeupet-firebase-notification-channel-imports",
      src: config.modResults.contents,
      newSrc: [
        "import android.app.NotificationChannel",
        "import android.app.NotificationManager",
        "import android.os.Build",
      ].join("\n"),
      anchor: /import android\.app\.Application/,
      offset: 0,
      comment: "//",
    });

    const channelSetup = mergeContents({
      tag: "yeupet-firebase-notification-channel",
      src: imports.contents,
      newSrc: `    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel = NotificationChannel(
        ${JSON.stringify(channelId)},
        ${JSON.stringify(channelName)},
        NotificationManager.IMPORTANCE_HIGH,
      )
      channel.enableVibration(true)
      getSystemService(NotificationManager::class.java).createNotificationChannel(channel)
    }`,
      anchor: /super\.onCreate\(\)/,
      offset: 1,
      comment: "//",
    });

    config.modResults.contents = channelSetup.contents;
    return config;
  });
};
