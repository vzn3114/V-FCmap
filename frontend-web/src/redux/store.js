import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import venueReducer from "./slices/venueSlice";
import bookingReducer from "./slices/bookingSlice";
import teamReducer from "./slices/teamSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    venues: venueReducer,
    bookings: bookingReducer,
    teams: teamReducer,
  },
});
