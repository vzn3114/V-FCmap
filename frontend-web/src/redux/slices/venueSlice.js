import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import venueService from "../../services/venueService";

const initialState = {
  items: [],
  loading: false,
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

export const fetchVenues = createAsyncThunk("venues/fetchVenues", async (filters) => {
  return venueService.getVenues(filters);
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
      })
      .addCase(fetchVenues.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchVenues.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setFilters, resetFilters } = venueSlice.actions;
export default venueSlice.reducer;
