import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import reportService from "../../services/reportService";

const initialState = {
  items: [],
  loading: false,
  creating: false,
  reviewing: false,
  deleting: false,
  error: null,
  createError: null,
  reviewError: null,
  deleteError: null,
};

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Yeu cau that bai";

export const fetchReports = createAsyncThunk("reports/fetchReports", async (params = {}, { rejectWithValue }) => {
  try {
    return await reportService.getReports(params);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createReport = createAsyncThunk("reports/createReport", async (payload, { rejectWithValue }) => {
  try {
    return await reportService.createReport(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const reviewReport = createAsyncThunk("reports/reviewReport", async ({ reportId, payload }, { rejectWithValue }) => {
  try {
    return await reportService.reviewReport(reportId, payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteReport = createAsyncThunk("reports/deleteReport", async (reportId, { rejectWithValue }) => {
  try {
    await reportService.deleteReport(reportId);
    return reportId;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const reportSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Khong the tai danh sach report";
      })
      .addCase(createReport.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createReport.fulfilled, (state, action) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createReport.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Khong the tao report";
      })
      .addCase(reviewReport.pending, (state) => {
        state.reviewing = true;
        state.reviewError = null;
      })
      .addCase(reviewReport.fulfilled, (state, action) => {
        state.reviewing = false;
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(reviewReport.rejected, (state, action) => {
        state.reviewing = false;
        state.reviewError = action.payload || "Khong the cap nhat report";
      })
      .addCase(deleteReport.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteReport.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteReport.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || "Khong the xoa report";
      });
  },
});

export default reportSlice.reducer;
