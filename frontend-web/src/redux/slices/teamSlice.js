import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import teamService from "../../services/teamService";

const initialState = {
  items: [],
  loading: false,
  filters: {
    tier: "",
    minRankingPoints: 0,
  },
};

export const fetchTeams = createAsyncThunk("teams/fetchTeams", async (filters = {}) => {
  return teamService.getTeams(filters);
});

const teamSlice = createSlice({
  name: "teams",
  initialState,
  reducers: {
    setTeamFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeams.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTeams.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { setTeamFilters } = teamSlice.actions;
export default teamSlice.reducer;
