import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import authService from "../../services/authService";
import { TOKEN_KEY, USER_KEY } from "../../services/apiClient";

const storedToken = localStorage.getItem(TOKEN_KEY);
const storedUser = localStorage.getItem(USER_KEY);

const initialState = {
  token: storedToken || null,
  user: storedUser ? JSON.parse(storedUser) : null,
  loading: false,
  error: null,
  profileUpdating: false,
  profileError: null,
};

const getErrorMessage = (error) =>
  error?.response?.data?.message || error?.message || "Yêu cầu thất bại";

export const login = createAsyncThunk("auth/login", async (payload, { rejectWithValue }) => {
  try {
    return await authService.login(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const register = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
  try {
    return await authService.register(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchCurrentUser = createAsyncThunk("auth/fetchCurrentUser", async (_, { rejectWithValue }) => {
  try {
    return await authService.me();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (payload, { rejectWithValue }) => {
  try {
    return await authService.updateMe(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...action.payload };
        state.token = action.payload.token;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        localStorage.setItem(USER_KEY, JSON.stringify(state.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Dang nhap that bai";
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = { ...action.payload };
        state.token = action.payload.token;
        localStorage.setItem(TOKEN_KEY, action.payload.token);
        localStorage.setItem(USER_KEY, JSON.stringify(state.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Dang ky that bai";
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Khong the tai thong tin nguoi dung";
        state.token = null;
        state.user = null;
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      })
      .addCase(updateProfile.pending, (state) => {
        state.profileUpdating = true;
        state.profileError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.profileUpdating = false;
        state.user = action.payload;
        localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.profileUpdating = false;
        state.profileError = action.payload || "Khong the cap nhat ho so";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
