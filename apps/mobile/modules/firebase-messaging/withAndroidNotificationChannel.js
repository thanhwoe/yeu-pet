const fs = require("fs");
const path = require("path");

const {
  AndroidConfig,
  withAndroidManifest,
  withDangerousMod,
  withMainApplication,
  withXcodeProject,
} = require("@expo/config-plugins");
const {
  mergeContents,
} = require("@expo/config-plugins/build/utils/generateCode");
const { getSourceRoot } = require("@expo/config-plugins/build/ios/Paths");
const {
  addResourceFileToGroup,
  getProjectName,
} = require("@expo/config-plugins/build/ios/utils/Xcodeproj");

const DEFAULT_SOUNDS = [
  {
    androidResourceName: "notification",
    iosFileName: "notification.wav",
    source: "./assets/sounds/notification.wav",
  },
  {
    androidResourceName: "fallback_notification",
    iosFileName: "fallback_notification.wav",
    source: "./assets/sounds/fallback_notification.wav",
  },
];

const DEFAULT_CHANNELS = [
  {
    id: "care-reminders-v1",
    importance: "high",
    name: "Care reminders",
    sound: "notification",
    vibration: true,
  },
  {
    id: "general-notifications-v1",
    importance: "high",
    name: "General notifications",
    sound: "fallback_notification",
    vibration: true,
  },
];

const IMPORTANCE_BY_NAME = {
  default: "NotificationManager.IMPORTANCE_DEFAULT",
  high: "NotificationManager.IMPORTANCE_HIGH",
  low: "NotificationManager.IMPORTANCE_LOW",
  max: "NotificationManager.IMPORTANCE_MAX",
  min: "NotificationManager.IMPORTANCE_MIN",
};

module.exports = function withAndroidNotificationChannel(config, props = {}) {
  const sounds = props.sounds || DEFAULT_SOUNDS;
  const channels = props.channels || DEFAULT_CHANNELS;
  const defaultChannelId =
    props.defaultChannelId || props.channelId || "general-notifications-v1";

  config = withNotificationSoundFiles(config, sounds);
  config = withDefaultNotificationChannel(config, defaultChannelId);

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
        "import android.content.ContentResolver",
        "import android.media.AudioAttributes",
        "import android.net.Uri",
        "import android.os.Build",
      ].join("\n"),
      anchor: /import android\.app\.Application/,
      offset: 0,
      comment: "//",
    });

    const channelSetup = mergeContents({
      tag: "yeupet-firebase-notification-channel",
      src: imports.contents,
      newSrc: "    createYeuPetNotificationChannels()",
      anchor: /super\.onCreate\(\)/,
      offset: 1,
      comment: "//",
    });

    const channelMethod = mergeContents({
      tag: "yeupet-firebase-notification-channel-method",
      src: channelSetup.contents,
      newSrc: buildChannelMethod(channels),
      anchor: /override fun onConfigurationChanged/,
      offset: 0,
      comment: "//",
    });

    config.modResults.contents = channelMethod.contents;
    return config;
  });
};

function withNotificationSoundFiles(config, sounds) {
  config = withDangerousMod(config, [
    "android",
    async (config) => {
      const rawDir = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/res/raw",
      );

      fs.mkdirSync(rawDir, { recursive: true });

      for (const sound of sounds) {
        const androidFileName = `${sound.androidResourceName}.wav`;
        copySoundFile(
          config.modRequest.projectRoot,
          sound.source,
          path.join(rawDir, androidFileName),
        );
      }

      return config;
    },
  ]);

  return withXcodeProject(config, (config) => {
    const projectRoot = config.modRequest.projectRoot;
    const projectName = getProjectName(projectRoot);
    const sourceRoot = getSourceRoot(projectRoot);

    for (const sound of sounds) {
      copySoundFile(
        projectRoot,
        sound.source,
        path.join(sourceRoot, sound.iosFileName),
      );

      const projectFilePath = `${projectName}/${sound.iosFileName}`;
      if (!config.modResults.hasFile(projectFilePath)) {
        config.modResults = addResourceFileToGroup({
          filepath: projectFilePath,
          groupName: projectName,
          isBuildFile: true,
          project: config.modResults,
          verbose: true,
        });
      }
    }

    return config;
  });
}

function withDefaultNotificationChannel(config, defaultChannelId) {
  return withAndroidManifest(config, (config) => {
    const mainApplication = AndroidConfig.Manifest.getMainApplicationOrThrow(
      config.modResults,
    );

    AndroidConfig.Manifest.addMetaDataItemToMainApplication(
      mainApplication,
      "com.google.firebase.messaging.default_notification_channel_id",
      defaultChannelId,
    );

    return config;
  });
}

function copySoundFile(projectRoot, source, destination) {
  const sourcePath = path.resolve(projectRoot, source);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Missing notification sound asset: ${sourcePath}`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(sourcePath, destination);
}

function buildChannelMethod(channels) {
  const channelBlocks = channels.map(buildChannelBlock).join("\n\n");
  const channelVariables = channels
    .map((channel) => `${toKotlinIdentifier(channel.id)}Channel`)
    .join(", ");

  return `  private fun createYeuPetNotificationChannels() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) {
      return
    }

    val notificationManager = getSystemService(NotificationManager::class.java)
    val audioAttributes = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_NOTIFICATION)
      .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
      .build()

${channelBlocks}

    notificationManager.createNotificationChannels(listOf(${channelVariables}))
  }
`;
}

function buildChannelBlock(channel) {
  const channelVariable = `${toKotlinIdentifier(channel.id)}Channel`;
  const soundVariable = `${toKotlinIdentifier(channel.id)}Sound`;
  const importance =
    IMPORTANCE_BY_NAME[channel.importance || "default"] ||
    IMPORTANCE_BY_NAME.default;

  return `    val ${soundVariable} = Uri.parse(
      ContentResolver.SCHEME_ANDROID_RESOURCE + "://" + packageName + "/" + R.raw.${channel.sound}
    )
    val ${channelVariable} = NotificationChannel(
      ${JSON.stringify(channel.id)},
      ${JSON.stringify(channel.name)},
      ${importance},
    ).apply {
      setSound(${soundVariable}, audioAttributes)
      enableVibration(${channel.vibration === false ? "false" : "true"})
    }`;
}

function toKotlinIdentifier(value) {
  return value
    .replace(/[^a-zA-Z0-9]+(.)/g, (_match, char) => char.toUpperCase())
    .replace(/^[0-9]/, "_$&");
}
