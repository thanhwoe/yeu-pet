export const VIETNAM_PROVINCE_CITY_CODES = [
  { code: "tuyen_quang", name: "Tuyên Quang" },
  { code: "cao_bang", name: "Cao Bằng" },
  { code: "lai_chau", name: "Lai Châu" },
  { code: "lao_cai", name: "Lào Cai" },
  { code: "thai_nguyen", name: "Thái Nguyên" },
  { code: "dien_bien", name: "Điện Biên" },
  { code: "lang_son", name: "Lạng Sơn" },
  { code: "son_la", name: "Sơn La" },
  { code: "phu_tho", name: "Phú Thọ" },
  { code: "bac_ninh", name: "Bắc Ninh" },
  { code: "quang_ninh", name: "Quảng Ninh" },
  { code: "ha_noi", name: "Hà Nội" },
  { code: "hai_phong", name: "Hải Phòng" },
  { code: "hung_yen", name: "Hưng Yên" },
  { code: "ninh_binh", name: "Ninh Bình" },
  { code: "thanh_hoa", name: "Thanh Hóa" },
  { code: "nghe_an", name: "Nghệ An" },
  { code: "ha_tinh", name: "Hà Tĩnh" },
  { code: "quang_tri", name: "Quảng Trị" },
  { code: "hue", name: "Huế" },
  { code: "da_nang", name: "Đà Nẵng" },
  { code: "quang_ngai", name: "Quảng Ngãi" },
  { code: "gia_lai", name: "Gia Lai" },
  { code: "khanh_hoa", name: "Khánh Hòa" },
  { code: "lam_dong", name: "Lâm Đồng" },
  { code: "dak_lak", name: "Đắk Lắk" },
  { code: "ho_chi_minh", name: "Thành phố Hồ Chí Minh" },
  { code: "dong_nai", name: "Đồng Nai" },
  { code: "tay_ninh", name: "Tây Ninh" },
  { code: "can_tho", name: "Cần Thơ" },
  { code: "vinh_long", name: "Vĩnh Long" },
  { code: "dong_thap", name: "Đồng Tháp" },
  { code: "ca_mau", name: "Cà Mau" },
  { code: "an_giang", name: "An Giang" },
] as const;

export type VietnamProvinceCityCode =
  (typeof VIETNAM_PROVINCE_CITY_CODES)[number]["code"];

export type VietnamProvinceCityName =
  (typeof VIETNAM_PROVINCE_CITY_CODES)[number]["name"];

const normalizeLocationValue = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("vi")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "");

const LEGACY_CITY_ALIASES: Record<string, VietnamProvinceCityName> = {
  hochiminhcity: "Thành phố Hồ Chí Minh",
};

export const resolveVietnamProvinceCityName = (
  value?: string | null,
): VietnamProvinceCityName | undefined => {
  const normalizedValue = value?.trim();
  if (!normalizedValue) return undefined;

  const normalizedKey = normalizeLocationValue(normalizedValue);
  const option = VIETNAM_PROVINCE_CITY_CODES.find(
    (item) =>
      item.name === normalizedValue ||
      item.code === normalizedValue ||
      normalizeLocationValue(item.name) === normalizedKey ||
      normalizeLocationValue(item.code) === normalizedKey,
  );

  return option?.name ?? LEGACY_CITY_ALIASES[normalizedKey];
};

export const isVietnamProvinceCityName = (
  value: string,
): value is VietnamProvinceCityName =>
  VIETNAM_PROVINCE_CITY_CODES.some((item) => item.name === value);
