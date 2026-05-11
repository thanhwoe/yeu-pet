import { ConfigContext, ExpoConfig } from 'expo/config';

type Variant = 'development' | 'preview' | 'production';
type Values = {
  name: string
  bundleIdentifier: string
  package: string
}

const VARIANTS: Record<Variant, Values> = {
  production: {
    name: "YeuPet",
    bundleIdentifier: "com.thanhwoe.petcare",
    package: "com.thanhwoe.petcare"
  },
  development: {
    name: "YeuPet Dev",
    bundleIdentifier: "com.thanhwoe.petcare.dev",
    package: "com.thanhwoe.petcare.dev"
  },
  preview: {
    name: "YeuPet Preview",
    bundleIdentifier: "com.thanhwoe.petcare.preview",
    package: "com.thanhwoe.petcare.preview"
  }
}
export default ({ config }: ConfigContext): ExpoConfig => {
  const variant = process.env.APP_VARIANT as Variant || 'production';

  const value = VARIANTS[variant];

  return {
    ...config,
    slug: 'pet-care',
    name: value.name,
    ios: {
      ...config.ios,
      bundleIdentifier: value.bundleIdentifier,
    },
    android: {
      ...config.android,
      package: value.package,
    },
  };
};
