import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import venueService from "../../services/venueService";

const initialState = {
  items: [],
  loading: false,
  creating: false,
  updating: false,
  error: null,
  createError: null,
  updateError: null,
  filters: {
    name: "",
    district: "",
    city: "",
    minPrice: null,
    maxPrice: null,
    hasParking: null,
    verified: null,
    minRating: null,
    fieldType: "",
  },
};

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Yeu cau that bai";

export const fetchVenues = createAsyncThunk("venues/fetchVenues", async (filters, { rejectWithValue }) => {
  try {
    return await venueService.getVenues(filters);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createVenue = createAsyncThunk("venues/createVenue", async (payload, { rejectWithValue }) => {
  try {
    return await venueService.createVenue(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateVenue = createAsyncThunk("venues/updateVenue", async ({ venueId, payload }, { rejectWithValue }) => {
  try {
    return await venueService.updateVenue(venueId, payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const verifyVenue = createAsyncThunk("venues/verifyVenue", async (venueId, { rejectWithValue }) => {
  try {
    return await venueService.verifyVenue(venueId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteVenue = createAsyncThunk("venues/deleteVenue", async (venueId, { rejectWithValue }) => {
  try {
    return await venueService.deleteVenue(venueId);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchNearbyVenues = createAsyncThunk("venues/fetchNearbyVenues", async ({ lat, lng, maxDistance }, { rejectWithValue }) => {
  try {
    return await venueService.getNearbyVenues(lat, lng, maxDistance);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const venueSlice = createSlice({
  name: "venues",
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVenues.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVenues.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Khong the tai danh sach san";
      })
      .addCase(createVenue.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createVenue.fulfilled, (state, action) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createVenue.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Khong the tao san";
      })
      .addCase(updateVenue.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateVenue.fulfilled, (state, action) => {
        state.updating = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(updateVenue.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Khong the cap nhat san";
      })
      // verifyVenue
      .addCase(verifyVenue.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      // deleteVenue
      .addCase(deleteVenue.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { setFilters, resetFilters } = venueSlice.actions;
export default venueSlice.reducer;
