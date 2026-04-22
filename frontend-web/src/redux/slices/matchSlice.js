import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import matchService from "../../services/matchService";

const initialState = {
  items: [],
  loading: false,
  creating: false,
  updating: false,
  error: null,
  createError: null,
  updateError: null,
};

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Yeu cau that bai";

export const fetchMatches = createAsyncThunk("matches/fetchMatches", async (params = {}, { rejectWithValue }) => {
  try {
    return await matchService.getMatches(params);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createMatch = createAsyncThunk("matches/createMatch", async (payload, { rejectWithValue }) => {
  try {
    return await matchService.createMatch(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateMatchResult = createAsyncThunk("matches/updateMatchResult", async ({ matchId, payload }, { rejectWithValue }) => {
  try {
    return await matchService.updateMatchResult(matchId, payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const matchSlice = createSlice({
  name: "matches",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Khong the tai danh sach tran dau";
      })
      .addCase(createMatch.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createMatch.fulfilled, (state, action) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createMatch.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Khong the tao tran dau";
      })
      .addCase(updateMatchResult.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateMatchResult.fulfilled, (state, action) => {
        state.updating = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(updateMatchResult.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload || "Khong the cap nhat ket qua";
      });
  },
});

export default matchSlice.reducer;
