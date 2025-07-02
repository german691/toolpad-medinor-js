import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";

import {
  createNewClient,
  getClientById,
  getClients,
  updateClientById,
} from "../../services/ClientService";

const initialState = {
  clients: [],
  client: null,
  pagination: {
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 1,
  },
  loading: false,
  error: null,
  filters: {},
  sort: {},
};

const ACTION_TYPES = {
  FETCH_START: "FETCH_START",
  FETCH_CLIENTS_SUCCESS: "FETCH_CLIENTS_SUCCESS",
  FETCH_CLIENT_SUCCESS: "FETCH_CLIENT_SUCCESS",
  ACTION_SUCCESS: "ACTION_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  SET_PAGE: "SET_PAGE",
  SET_LIMIT: "SET_LIMIT",
  SET_FILTERS: "SET_FILTERS",
  SET_SORT: "SET_SORT",
  CLEAR_ERROR: "CLEAR_ERROR",
};

const clientsReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.FETCH_START:
      return { ...state, loading: true, error: null };
    case ACTION_TYPES.FETCH_CLIENTS_SUCCESS:
      return {
        ...state,
        loading: false,
        clients: action.payload.items,
        pagination: {
          ...state.pagination,
          page: action.payload.page,
          total: action.payload.totalItems,
          totalPages: action.payload.totalPages,
        },
      };
    case ACTION_TYPES.FETCH_CLIENT_SUCCESS:
      return { ...state, loading: false, client: action.payload.client };
    case ACTION_TYPES.ACTION_SUCCESS:
      return { ...state, loading: false };
    case ACTION_TYPES.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };
    case ACTION_TYPES.SET_PAGE:
      return {
        ...state,
        pagination: { ...state.pagination, page: action.payload },
      };
    case ACTION_TYPES.SET_LIMIT:
      return {
        ...state,
        pagination: { ...state.pagination, limit: action.payload, page: 1 },
      };
    case ACTION_TYPES.SET_FILTERS:
      return {
        ...state,
        filters: action.payload,
        pagination: { ...state.pagination, page: 1 },
      };
    case ACTION_TYPES.SET_SORT:
      return {
        ...state,
        sort: action.payload,
        pagination: { ...state.pagination, page: 1 },
      };
    case ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

const ClientsContext = createContext();

export const ClientsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(clientsReducer, initialState);

  const fetchClients = useCallback(async () => {
    dispatch({ type: ACTION_TYPES.FETCH_START });

    try {
      const { page, limit } = state.pagination;
      const { filter, sort } = state;
      const data = await getClients({ page, limit, filter, sort });
      console.log(data); // <- este console log muestra correctamente el array de items, con una estructura [items[], page, totalItems, totalPages]

      dispatch({
        type: ACTION_TYPES.FETCH_CLIENTS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({ type: ACTION_TYPES.FETCH_ERROR });
    }
  }, [
    state.pagination.page,
    state.pagination.limit,
    state.filters,
    state.sort,
  ]);

  const fetchClientById = useCallback(async (id) => {
    dispatch({ type: ACTION_TYPES.FETCH_START });
    try {
      const data = await getClientById(id);
      dispatch({
        type: ACTION_TYPES.FETCH_CLIENT_SUCCESS,
        payload: { client: data },
      });
    } catch (error) {
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: error });
    }
  }, []);

  const addClient = useCallback(
    async (clientData) => {
      dispatch({ type: ACTION_TYPES.FETCH_START });
      try {
        await createNewClient(clientData);
        dispatch({ type: ACTION_TYPES.ACTION_SUCCESS });
        fetchClients();
      } catch (error) {
        dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: error });
        throw error;
      }
    },
    [fetchClients]
  );

  const updateClient = useCallback(
    async (id, clientData) => {
      dispatch({ type: ACTION_TYPES.FETCH_START });
      try {
        await updateClientById(id, clientData);
        dispatch({ type: ACTION_TYPES.ACTION_SUCCESS });
        fetchClients();
      } catch (error) {
        dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: error });
        throw error;
      }
    },
    [fetchClients]
  );

  const setPage = (page) =>
    dispatch({ type: ACTION_TYPES.SET_PAGE, payload: page });
  const setLimit = (limit) =>
    dispatch({ type: ACTION_TYPES.SET_LIMIT, payload: limit });
  const setFilters = (filters) =>
    dispatch({ type: ACTION_TYPES.SET_FILTERS, payload: filters });
  const setSort = (sort) =>
    dispatch({ type: ACTION_TYPES.SET_SORT, payload: sort });
  const clearError = () => dispatch({ type: ACTION_TYPES.CLEAR_ERROR });

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const value = {
    ...state,
    fetchClients,
    fetchClientById,
    addClient,
    updateClient,
    setPage,
    setLimit,
    setFilters,
    setSort,
    clearError,
  };

  return (
    <ClientsContext.Provider value={value}>{children}</ClientsContext.Provider>
  );
};

export const useClients = () => {
  const context = useContext(ClientsContext);
  if (context === undefined) {
    throw new Error("useClients debe ser usado dentro de un ClientsProvider");
  }
  return context;
};
