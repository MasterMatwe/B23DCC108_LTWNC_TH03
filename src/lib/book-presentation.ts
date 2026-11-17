import type { Category } from "@/types";

export const CATEGORY_DETAILS: Record<
  Category,
  { className: string; symbol: string; description: string }
> = {
  "Lập trình": {
    className: "programming",
    symbol: "</>",
    description: "Ngôn ngữ, kỹ thuật và tư duy giải thuật.",
  },
  "Mạng máy tính": {
    className: "networks",
    symbol: "↗",
    description: "Kết nối, hệ thống và an toàn thông tin.",
  },
  "Cơ sở dữ liệu": {
    className: "databases",
    symbol: "≋",
    description: "Tổ chức, lưu trữ và khai thác dữ liệu.",
  },
  "Toán rời rạc": {
    className: "mathematics",
    symbol: "∑",
    description: "Nền tảng toán học cho khoa học máy tính.",
  },
};
