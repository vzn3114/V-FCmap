const getUserId = (user) => user?.id ?? null;

const getUserRole = (user) => user?.role ?? "";

export const isVerifiedUser = (user) => Boolean(user?.is_verified ?? user?.isVerified);

const getVenueOwnerId = (venue) => venue?.owner?.id ?? venue?.owner_id ?? venue?.ownerId ?? null;

const getTeamCaptainId = (team) => team?.captain?.id ?? team?.captain_id ?? team?.captainId ?? null;

export const getVisibleVenues = (venues = []) => (Array.isArray(venues) ? venues : []);

export const getLookingForMatchTeams = (teams = []) =>
  (Array.isArray(teams) ? teams : []).filter((team) => Boolean(team?.lookingForMatch));

export const getHomeVenueActions = (venue, user) => {
  const actions = [
    {
      key: `venue-view-${venue.id}`,
      label: "Xem chi tiết",
      kind: "link",
      href: "/venues",
      tone: "secondary",
    },
  ];

  const userId = getUserId(user);
  const isVenueOwner = getUserRole(user) === "VENUE_OWNER" && userId !== null && getVenueOwnerId(venue) === userId;

  if (isVenueOwner) {
    actions.push({
      key: `venue-update-${venue.id}`,
      label: "Cập nhật trạng thái sân",
      kind: "link",
      href: `/venues?manage=${venue.id}`,
      tone: "primary",
    });
  }

  return actions;
};

export const getHomeTeamActions = (team, user, myTeam) => {
  const actions = [
    {
      key: `team-view-${team.id}`,
      label: "Xem chi tiết",
      kind: "link",
      href: "/teams",
      tone: "secondary",
    },
  ];

  const canInvite = isVerifiedUser(user) && myTeam && myTeam.id !== team.id;

  if (canInvite && Boolean(team?.lookingForMatch)) {
    actions.push({
      key: `team-invite-${team.id}`,
      label: "Gửi lời mời giao lưu",
      kind: "challenge",
      tone: "primary",
      payload: {
        teamId: myTeam.id,
        opponentTeamId: team.id,
      },
    });
  }

  return actions;
};

export const buildHomeViewModel = ({ venues = [], teams = [], user }) => {
  const visibleVenues = getVisibleVenues(venues);
  const lookingForMatchTeams = getLookingForMatchTeams(teams);
  const userId = getUserId(user);
  const myTeam = (Array.isArray(teams) ? teams : []).find((team) => getTeamCaptainId(team) === userId) ?? null;

  return {
    venueCards: visibleVenues.map((venue) => ({
      ...venue,
      actions: getHomeVenueActions(venue, user),
      isVerified: Boolean(venue?.is_verified ?? venue?.isVerified),
    })),
    teamCards: lookingForMatchTeams.map((team) => ({
      ...team,
      actions: getHomeTeamActions(team, user, myTeam),
      isVerified: Boolean(team?.is_verified ?? team?.isVerified),
    })),
    myTeam,
    isVerifiedUser: isVerifiedUser(user),
  };
};