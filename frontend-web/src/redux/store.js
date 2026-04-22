import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import venueReducer from "./slices/venueSlice";
import bookingReducer from "./slices/bookingSlice";
import teamReducer from "./slices/teamSlice";
import matchReducer from "./slices/matchSlice";
import reviewReducer from "./slices/reviewSlice";
import reportReducer from "./slices/reportSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    venues: venueReducer,
    bookings: bookingReducer,
    teams: teamReducer,
    matches: matchReducer,
    reviews: reviewReducer,
    reports: reportReducer,
  },
});
