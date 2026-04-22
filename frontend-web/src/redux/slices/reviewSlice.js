import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import reviewService from "../../services/reviewService";

const initialState = {
  items: [],
  loading: false,
  creating: false,
  deleting: false,
  error: null,
  createError: null,
  deleteError: null,
};

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Yeu cau that bai";

export const fetchReviews = createAsyncThunk("reviews/fetchReviews", async (params = {}, { rejectWithValue }) => {
  try {
    return await reviewService.getReviews(params);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const createReview = createAsyncThunk("reviews/createReview", async (payload, { rejectWithValue }) => {
  try {
    return await reviewService.createReview(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const deleteReview = createAsyncThunk("reviews/deleteReview", async (reviewId, { rejectWithValue }) => {
  try {
    await reviewService.deleteReview(reviewId);
    return reviewId;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const reviewSlice = createSlice({
  name: "reviews",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Khong the tai danh sach review";
      })
      .addCase(createReview.pending, (state) => {
        state.creating = true;
        state.createError = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.creating = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createReview.rejected, (state, action) => {
        state.creating = false;
        state.createError = action.payload || "Khong the tao review";
      })
      .addCase(deleteReview.pending, (state) => {
        state.deleting = true;
        state.deleteError = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.deleting = false;
        state.items = state.items.filter((item) => item.id !== action.payload);
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.deleting = false;
        state.deleteError = action.payload || "Khong the xoa review";
      });
  },
});

export default reviewSlice.reducer;
