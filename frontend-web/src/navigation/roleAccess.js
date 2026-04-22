export const ROLES = Object.freeze({
  USER: "USER",
  VENUE_OWNER: "VENUE_OWNER",
  ADMIN: "ADMIN",
});

const roleLabels = {
  [ROLES.USER]: "Người chơi",
  [ROLES.VENUE_OWNER]: "Chủ sân",
  [ROLES.ADMIN]: "Quản trị viên",
};

const navigationByRole = {
  [ROLES.USER]: [
    { key: "home", label: "Trang chủ", path: "/" },
    { key: "venues", label: "Sân bóng", path: "/venues" },
    { key: "bookings", label: "Đặt sân", path: "/bookings" },
    { key: "teams", label: "Đội bóng", path: "/teams" },
    { key: "reviews", label: "Đánh giá", path: "/reviews" },
    { key: "reports", label: "Báo cáo", path: "/reports" },
    { key: "profile", label: "Tài khoản", path: "/profile" },
  ],
  [ROLES.VENUE_OWNER]: [
    { key: "home", label: "Trang chủ", path: "/" },
    { key: "venues", label: "Quản lý sân", path: "/venues" },
    { key: "bookings", label: "Đặt sân", path: "/bookings" },
    { key: "teams", label: "Đội bóng", path: "/teams" },
    { key: "reviews", label: "Đánh giá", path: "/reviews" },
    { key: "reports", label: "Báo cáo", path: "/reports" },
    { key: "profile", label: "Tài khoản", path: "/profile" },
  ],
  [ROLES.ADMIN]: [
    { key: "home", label: "Trang chủ", path: "/" },
    { key: "venues", label: "Quản trị sân", path: "/venues" },
    { key: "bookings", label: "Đặt sân", path: "/bookings" },
    { key: "teams", label: "Đội bóng", path: "/teams" },
    { key: "matches", label: "Trận đấu", path: "/matches" },
    { key: "reviews", label: "Đánh giá", path: "/reviews" },
    { key: "reports", label: "Báo cáo", path: "/reports" },
    { key: "profile", label: "Tài khoản", path: "/profile" },
  ],
};

const homeCardsByRole = {
  [ROLES.USER]: [
    {
      title: "Tìm sân bóng",
      description: "Khám phá sân theo khu vực, mức giá và trạng thái xác minh.",
      href: "/venues",
      cta: "Đi tới danh sách sân",
    },
    {
      title: "Đặt sân của tôi",
      description: "Tạo booking, thanh toán và theo dõi lịch sử đặt sân.",
      href: "/bookings",
      cta: "Mở trang đặt sân",
    },
    {
      title: "Đội bóng",
      description: "Xem các đội đang hoạt động và tìm đối thủ phù hợp.",
      href: "/teams",
      cta: "Khám phá đội bóng",
    },
  ],
  [ROLES.VENUE_OWNER]: [
    {
      title: "Quản lý sân",
      description: "Đăng sân mới, cập nhật thông tin và theo dõi trạng thái vận hành.",
      href: "/venues",
      cta: "Mở trang quản lý sân",
    },
    {
      title: "Theo dõi booking",
      description: "Nắm nhanh tình hình đặt sân từ phía khách hàng.",
      href: "/bookings",
      cta: "Xem booking",
    },
    {
      title: "Phản hồi & báo cáo",
      description: "Theo dõi các báo cáo liên quan đến sân và người dùng.",
      href: "/reports",
      cta: "Mở báo cáo",
    },
  ],
  [ROLES.ADMIN]: [
    {
      title: "Duyệt sân",
      description: "Kiểm soát dữ liệu sân, trạng thái xác minh và nội dung hiển thị.",
      href: "/venues",
      cta: "Đi tới quản trị sân",
    },
    {
      title: "Kiểm duyệt báo cáo",
      description: "Xử lý report, cập nhật trạng thái và ghi chú phản hồi.",
      href: "/reports",
      cta: "Mở trung tâm báo cáo",
    },
    {
      title: "Quản lý trận đấu",
      description: "Tạo trận, cập nhật kết quả và giữ lịch thi đấu ổn định.",
      href: "/matches",
      cta: "Vào trang trận đấu",
    },
  ],
};

const homeHeroByRole = {
  [ROLES.USER]: {
    eyebrow: "Dành cho người chơi",
    title: "Tìm sân nhanh, đặt sân gọn và theo dõi đội bóng của bạn",
    subtitle: "Tập trung vào các tác vụ hàng ngày: khám phá sân, tạo booking, xem đội đang tìm đối thủ và theo dõi hồ sơ cá nhân.",
    primary: {
      label: "Khám phá sân bóng",
      href: "/venues",
    },
    secondary: {
      label: "Xem booking của tôi",
      href: "/bookings",
    },
  },
  [ROLES.VENUE_OWNER]: {
    eyebrow: "Dành cho chủ sân",
    title: "Quản lý sân bóng, booking và phản hồi từ một bảng điều khiển",
    subtitle: "Màn hình chính ưu tiên các tác vụ vận hành: đăng sân, cập nhật nội dung, theo dõi booking và xử lý báo cáo liên quan đến sân.",
    primary: {
      label: "Mở trang quản lý sân",
      href: "/venues",
    },
    secondary: {
      label: "Xem báo cáo",
      href: "/reports",
    },
  },
  [ROLES.ADMIN]: {
    eyebrow: "Dành cho quản trị",
    title: "Điều phối sân bóng, báo cáo và trận đấu từ một trung tâm kiểm soát",
    subtitle: "Bố cục ưu tiên kiểm duyệt nội dung, xử lý báo cáo, theo dõi sân và quản lý trận đấu để giữ dữ liệu hệ thống sạch và nhất quán.",
    primary: {
      label: "Mở trung tâm báo cáo",
      href: "/reports",
    },
    secondary: {
      label: "Quản lý trận đấu",
      href: "/matches",
    },
  },
};

export const getRoleLabel = (role) => roleLabels[role] || "Người dùng";

export const isAdmin = (user) => user?.role === ROLES.ADMIN;

export const isVenueOwner = (user) => user?.role === ROLES.VENUE_OWNER;

export const canManageVenues = (user) => isAdmin(user) || isVenueOwner(user);

export const canManageMatches = (user) => isAdmin(user);

export const getNavigationItems = (role) => navigationByRole[role] || navigationByRole[ROLES.USER];

export const getHomeRoleHighlights = (role) => homeCardsByRole[role] || homeCardsByRole[ROLES.USER];

export const getHomeHeroCopy = (role) => homeHeroByRole[role] || homeHeroByRole[ROLES.USER];