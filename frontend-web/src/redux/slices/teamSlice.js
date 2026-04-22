import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import teamService from "../../services/teamService";

const initialState = {
  items: [],
  loading: false,
  creating: false,
  updating: false,
  error: null,
  createError: null,
  updateError: null,
  filters: {
    tier: "",
    minRankingPoints: 0,
  },
};

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Yeu cau that bai";

export const fetchTeams = createAsyncThunk("teams/fetchTeams", async (filters = {}, { rejectWithValue }) => {
  try {
    return await teamService.getTeams(filters);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createTeam = createAsyncThunk("teams/createTeam", async (payload, { rejectWithValue }) => {
  try {
    return await teamService.createTeam(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateTeam = createAsyncThunk("teams/updateTeam", async ({ teamId, payload }, { rejectWithValue }) => {
  try {
    return await teamService.updateTeam(teamId, payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
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
        state.error = null;
      })
      .addCase(fetchTeams.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchTeams.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Khong the tai danh sach doi bong";
      })
      .addCase(createTeam.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createTeam.fulfilled, (state, action) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createTeam.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Khong the tao doi";
      })
      .addCase(updateTeam.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.updating = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(updateTeam.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Khong the cap nhat doi";
      });
  },
});

export const { setTeamFilters } = teamSlice.actions;
export default teamSlice.reducer;
