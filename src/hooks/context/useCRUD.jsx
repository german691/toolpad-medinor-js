import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";

const initialState = {
  items: [],
  item: null,
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
  search: "",
};

const ACTION_TYPES = {
  FETCH_START: "FETCH_START",
  FETCH_ITEMS_SUCCESS: "FETCH_ITEMS_SUCCESS",
  FETCH_ITEM_SUCCESS: "FETCH_ITEM_SUCCESS",
  ACTION_SUCCESS: "ACTION_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  SET_PAGE: "SET_PAGE",
  SET_LIMIT: "SET_LIMIT",
  SET_FILTERS: "SET_FILTERS",
  SET_SORT: "SET_SORT",
  CLEAR_ERROR: "CLEAR_ERROR",
};

const crudReducer = (state, action) => {
  switch (action.type) {
    case ACTION_TYPES.FETCH_START:
      return { ...state, loading: true, error: null };
    case ACTION_TYPES.FETCH_ITEMS_SUCCESS:
      return {
        ...state,
        loading: false,
        items: action.payload.items,
        pagination: {
          ...state.pagination,
          page: action.payload.page,
          total: action.payload.totalItems,
          totalPages: action.payload.totalPages,
        },
      };
    case ACTION_TYPES.FETCH_ITEM_SUCCESS:
      return { ...state, loading: false, item: action.payload.item };
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
    case ACTION_TYPES.SET_SEARCH:
      return {
        ...state,
        search: action.payload,
        pagination: { ...state.pagination, page: 1 },
      };
    case ACTION_TYPES.CLEAR_ERROR:
      return { ...state, error: null };
    default:
      return state;
  }
};

const CRUDContext = createContext();

export const CRUDProvider = ({ children, services, initialFilters = {} }) => {
  const [state, dispatch] = useReducer(crudReducer, {
    ...initialState,
    filters: initialFilters,
  });

  const { getItems, getItemById, createItem, updateItem } = services;
  const fetchItems = async () => {
    if (state.loading) return;

    if (!getItems) return;
    dispatch({ type: ACTION_TYPES.FETCH_START });
    try {
      const { page, limit } = state.pagination;
      const { filters, sort, search } = state;
      const data = await getItems({ page, limit, filters, sort, search });
      dispatch({
        type: ACTION_TYPES.FETCH_ITEMS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: error });
    }
  };

  const fetchItemById = useCallback(
    async (id) => {
      if (!getItemById) {
        const err = new Error(
          "La función 'getItemById' no fue proveída en los servicios."
        );
        dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: err });
        console.error(err);
        return;
      }

      dispatch({ type: ACTION_TYPES.FETCH_START });

      try {
        const data = await getItemById(id);

        dispatch({
          type: ACTION_TYPES.FETCH_ITEM_SUCCESS,
          payload: { item: data },
        });
      } catch (error) {
        dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: error });
      }
    },
    [getItemById]
  );

  const addItem = useCallback(
    async (itemData) => {
      if (!createItem)
        throw new Error("La función 'createItem' no fue proveída.");
      dispatch({ type: ACTION_TYPES.FETCH_START });
      try {
        await createItem(itemData);
        dispatch({ type: ACTION_TYPES.ACTION_SUCCESS });
        fetchItems();
      } catch (error) {
        dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: error });
        throw error;
      }
    },
    [createItem, fetchItems]
  );

  const editItem = useCallback(
    async (id, itemData) => {
      if (!updateItem)
        throw new Error("La función 'updateItem' no fue proveída.");
      dispatch({ type: ACTION_TYPES.FETCH_START });
      try {
        await updateItem(id, itemData);
        dispatch({ type: ACTION_TYPES.ACTION_SUCCESS });
        fetchItems();
      } catch (error) {
        dispatch({ type: ACTION_TYPES.FETCH_ERROR, payload: error });
        throw error;
      }
    },
    [updateItem, fetchItems]
  );

  const setPage = useCallback(
    (page) => {
      if (state.loading) return;
      dispatch({ type: ACTION_TYPES.SET_PAGE, payload: page });
    },
    [state.loading]
  );

  const setLimit = useCallback(
    (limit) => {
      if (state.loading) return;
      dispatch({ type: ACTION_TYPES.SET_LIMIT, payload: limit });
    },
    [state.loading]
  );

  const setSort = useCallback(
    (sort) => {
      if (state.loading) return;
      dispatch({ type: ACTION_TYPES.SET_SORT, payload: sort });
    },
    [state.loading]
  );

  const setFilters = useCallback(
    (filters) => {
      if (state.loading) return;
      dispatch({ type: ACTION_TYPES.SET_FILTERS, payload: filters });
    },
    [state.loading]
  );

  const setSearch = useCallback(
    (search) => {
      if (state.loading) return;
      dispatch({ type: ACTION_TYPES.SET_SEARCH, payload: search });
    },
    [state.loading]
  );

  const clearError = useCallback(() => {
    dispatch({ type: ACTION_TYPES.CLEAR_ERROR });
  }, []);

  useEffect(() => {
    fetchItems();
  }, [
    state.pagination.page,
    state.pagination.limit,
    state.filters,
    state.sort,
    state.search,
  ]);

  const value = {
    ...state,
    fetchItems,
    fetchItemById,
    addItem,
    editItem,
    setPage,
    setLimit,
    setFilters,
    setSort,
    clearError,
    setSearch,
  };

  return <CRUDContext.Provider value={value}>{children}</CRUDContext.Provider>;
};

export const useCRUD = () => {
  const context = useContext(CRUDContext);
  if (context === undefined) {
    throw new Error("useCRUD debe ser usado dentro de un CRUDProvider");
  }
  return context;
};
