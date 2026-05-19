import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import bookingService from "../../services/bookingService";

const initialState = {
  items: [],
  loading: false,
  creating: false,
  paymentLoading: false,
  lastCreatedBooking: null,
  selectedVenueId: null,
};

export const fetchMyBookings = createAsyncThunk("bookings/fetchMyBookings", async () => {
  return bookingService.getMyBookings();
});

export const fetchAllBookings = createAsyncThunk("bookings/fetchAllBookings", async (params = {}) => {
  return bookingService.getAllBookings(params);
});

export const createBooking = createAsyncThunk("bookings/createBooking", async (payload) => {
  return bookingService.createBooking(payload);
});

export const checkInBooking = createAsyncThunk("bookings/checkInBooking", async (bookingId, { rejectWithValue }) => {
  try {
    return await bookingService.checkInBooking(bookingId);
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || error?.message || "Check-in thất bại");
  }
});

export const processPayment = createAsyncThunk("bookings/processPayment", async ({ bookingId, payload }) => {
  return bookingService.processPayment(bookingId, payload);
});

export const cancelBooking = createAsyncThunk("bookings/cancelBooking", async ({ bookingId, payload }) => {
  return bookingService.cancelBooking(bookingId, payload);
});

const bookingSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearLastCreatedBooking: (state) => {
      state.lastCreatedBooking = null;
    },
    setSelectedVenueId: (state, action) => {
      state.selectedVenueId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMyBookings.rejected, (state) => {
        state.loading = false;
      })
      .addCase(createBooking.pending, (state) => {
        state.creating = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.creating = false;
        state.lastCreatedBooking = action.payload;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createBooking.rejected, (state) => {
        state.creating = false;
      })
      .addCase(processPayment.pending, (state) => {
        state.paymentLoading = true;
      })
      .addCase(processPayment.fulfilled, (state) => {
        state.paymentLoading = false;
      })
      .addCase(processPayment.rejected, (state) => {
        state.paymentLoading = false;
      })
      .addCase(fetchAllBookings.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.allItems = action.payload;
      })
      .addCase(fetchAllBookings.rejected, (state) => {
        state.loading = false;
      })
      .addCase(checkInBooking.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
        const idx = (state.allItems || []).findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.allItems[idx] = action.payload;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
        const idx = (state.allItems || []).findIndex((i) => i.id === action.payload.id);
        if (idx !== -1) state.allItems[idx] = action.payload;
      });
  },
});

export const { clearLastCreatedBooking, setSelectedVenueId } = bookingSlice.actions;
export default bookingSlice.reducer;
