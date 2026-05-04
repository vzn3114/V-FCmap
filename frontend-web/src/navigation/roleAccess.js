export const ROLES = Object.freeze({
  PLAYER: "PLAYER",
  USER: "USER",
  VENUE_OWNER: "VENUE_OWNER",
  ADMIN: "ADMIN",
});

export const PERMISSIONS = Object.freeze({
  VIEW_VENUE: "view_venue",
  CREATE_BOOKING: "create_booking",
  VIEW_BOOKING: "view_booking",
  CREATE_TEAM: "create_team",
  MANAGE_TEAM: "manage_team",
  INVITE_MEMBER: "invite_member",
  CHALLENGE_TEAM: "challenge_team",
});

const permissionLabels = {
  [PERMISSIONS.VIEW_VENUE]: "Xem sân",
  [PERMISSIONS.CREATE_BOOKING]: "Tạo đặt sân",
  [PERMISSIONS.VIEW_BOOKING]: "Xem đặt sân",
  [PERMISSIONS.CREATE_TEAM]: "Tạo đội",
  [PERMISSIONS.MANAGE_TEAM]: "Quản lý đội",
  [PERMISSIONS.INVITE_MEMBER]: "Mời thành viên",
  [PERMISSIONS.CHALLENGE_TEAM]: "Gửi thách đấu",
};

const roleLabels = {
  [ROLES.PLAYER]: "Người chơi",
  [ROLES.USER]: "Người chơi",
  [ROLES.VENUE_OWNER]: "Chủ sân",
  [ROLES.ADMIN]: "Quản trị viên",
};

const navigationByRole = {
  [ROLES.PLAYER]: [
    { key: "home", label: "Trang chủ", path: "/" },
    { key: "venues", label: "Sân bóng", path: "/venues" },
    { key: "bookings", label: "Đặt sân", path: "/bookings" },
    { key: "teams", label: "Đội bóng", path: "/teams" },
    { key: "reviews", label: "Đánh giá", path: "/reviews" },
    { key: "reports", label: "Báo cáo", path: "/reports" },
    { key: "profile", label: "Tài khoản", path: "/profile" },
  ],
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
  [ROLES.PLAYER]: [
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
  [ROLES.PLAYER]: {
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

const basePermissionsByRole = {
  [ROLES.PLAYER]: [
    PERMISSIONS.VIEW_VENUE,
    PERMISSIONS.CREATE_BOOKING,
    PERMISSIONS.VIEW_BOOKING,
  ],
  [ROLES.USER]: [
    PERMISSIONS.VIEW_VENUE,
    PERMISSIONS.CREATE_BOOKING,
    PERMISSIONS.VIEW_BOOKING,
  ],
  [ROLES.VENUE_OWNER]: [
    PERMISSIONS.VIEW_VENUE,
    PERMISSIONS.CREATE_BOOKING,
    PERMISSIONS.VIEW_BOOKING,
    PERMISSIONS.CREATE_TEAM,
    PERMISSIONS.MANAGE_TEAM,
    PERMISSIONS.INVITE_MEMBER,
    PERMISSIONS.CHALLENGE_TEAM,
  ],
  [ROLES.ADMIN]: ["*"],
};

const captainExtendedPermissions = [
  PERMISSIONS.CREATE_TEAM,
  PERMISSIONS.MANAGE_TEAM,
  PERMISSIONS.INVITE_MEMBER,
  PERMISSIONS.CHALLENGE_TEAM,
];

export const getEffectiveRole = (user) => {
  const role = user?.role;
  if (role === ROLES.USER || role === ROLES.PLAYER) {
    return ROLES.PLAYER;
  }
  return role;
};

export const getCaptainTeamIds = (teams = [], userId) =>
  teams
    .filter((team) => (team?.captain?.id ?? team?.captain_id ?? team?.captainId) === userId)
    .map((team) => team.id)
    .filter(Boolean);

export const isCaptain = (user, teams = []) => getCaptainTeamIds(teams, user?.id).length > 0;

export const getUserPermissions = (user, teams = []) => {
  const effectiveRole = getEffectiveRole(user);
  const basePermissions = basePermissionsByRole[effectiveRole] || [];

  if (basePermissions.includes("*")) {
    return new Set(["*"]);
  }

  const permissions = new Set(basePermissions);
  if (effectiveRole === ROLES.PLAYER && isCaptain(user, teams)) {
    captainExtendedPermissions.forEach((permission) => permissions.add(permission));
  }

  return permissions;
};

export const hasPermission = (user, permission, teams = []) => {
  const permissions = getUserPermissions(user, teams);
  return permissions.has("*") || permissions.has(permission);
};

export const getRoleLabel = (role) => roleLabels[role] || "Người dùng";

export const isAdmin = (user) => getEffectiveRole(user) === ROLES.ADMIN;

export const isVenueOwner = (user) => getEffectiveRole(user) === ROLES.VENUE_OWNER;

export const canManageVenues = (user) => isAdmin(user) || isVenueOwner(user);

export const canManageMatches = (user) => isAdmin(user);

export const canCreateTeam = (user, teams = []) => hasPermission(user, PERMISSIONS.CREATE_TEAM, teams);

export const canManageTeam = (user, teams = []) => hasPermission(user, PERMISSIONS.MANAGE_TEAM, teams);

export const canInviteMember = (user, teams = []) => hasPermission(user, PERMISSIONS.INVITE_MEMBER, teams);

export const canChallengeTeam = (user, teams = []) => hasPermission(user, PERMISSIONS.CHALLENGE_TEAM, teams);

export const getNavigationItems = (role) => navigationByRole[role] || navigationByRole[ROLES.PLAYER];

export const getHomeRoleHighlights = (role) => homeCardsByRole[role] || homeCardsByRole[ROLES.PLAYER];

export const getHomeHeroCopy = (role) => homeHeroByRole[role] || homeHeroByRole[ROLES.PLAYER];

export const getPermissionLabel = (permission) => permissionLabels[permission] || permission;

export const getPermissionLabelsArray = (permissions) => 
  Array.from(permissions)
    .filter((p) => p !== "*")
    .map((p) => getPermissionLabel(p))
    .join(", ") || "Không có quyền";