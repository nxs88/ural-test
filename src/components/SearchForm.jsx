import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import {
  setNumber,
  setBrand,
  setManufacturers,
  setResults,
  setLoading,
  setError,
} from '../features/partsSlice';

const API_URL = 'http://api.favorit-parts.ru/hs/hsprice/';
const API_KEY = import.meta.env.VITE_FAVORIT_API_KEY;

const getErrorMessage = (error) => {
  const apiError = error.response?.data?.error || error.message;

  switch (apiError) {
    case 'Request quota exceeded!':
      return 'Превышен лимит запросов к API. Попробуйте позже.';

    case 'Empty key!':
    case 'Invalid key client!':
      return 'Ошибка авторизации в API.';

    case 'Empty number goods!':
      return 'Укажите артикул для поиска.';

    case 'Некорректный формат ответа API.':
      return apiError;

    default:
      break;
  }

  if (error.code === 'ERR_CANCELED') {
    return null;
  }

  if (error.response) {
    return `Ошибка сервера (HTTP ${error.response.status}).`;
  }

  if (error.request) {
    return 'Не удалось связаться с сервером. Проверьте подключение к интернету.';
  }

  return 'Не удалось выполнить запрос. Попробуйте позже.';
};

const getGoods = (response) => {
  if (response.data?.error) {
    throw new Error(response.data.error);
  }

  if (!Array.isArray(response.data?.goods)) {
    throw new Error('Некорректный формат ответа API.');
  }

  return response.data.goods;
};

const SearchForm = () => {
  const dispatch = useDispatch();

  const { number, brand, manufacturers } = useSelector((state) => state.parts);

  const [inputValue, setInputValue] = useState('');

  const handleNumberChange = (event) => {
    const value = event.target.value;

    setInputValue(value);
    dispatch(setNumber(value));
    dispatch(setBrand(''));
    dispatch(setManufacturers([]));
    dispatch(setResults([]));
    dispatch(setError(null));
  };

  useEffect(() => {
    const article = number.trim();

    if (article.length < 3) {
      dispatch(setManufacturers([]));
      dispatch(setResults([]));
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      dispatch(setLoading(true));
      dispatch(setError(null));

      try {
        const response = await axios.get(API_URL, {
          params: {
            key: API_KEY,
            number: article,
          },
          signal: controller.signal,
        });

        const goods = getGoods(response);
        const brands = [
          ...new Set(goods.map((item) => item.brand).filter(Boolean)),
        ];

        dispatch(setManufacturers(brands));
      } catch (error) {
        if (error.code !== 'ERR_CANCELED') {
          dispatch(setManufacturers([]));
          dispatch(setError(getErrorMessage(error)));
        }
      } finally {
        if (!controller.signal.aborted) {
          dispatch(setLoading(false));
        }
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [number, dispatch]);

  const handleBrandChange = async (event) => {
    const selectedBrand = event.target.value;

    dispatch(setBrand(selectedBrand));
    dispatch(setResults([]));
    dispatch(setError(null));

    if (!selectedBrand || !number.trim()) return;

    dispatch(setLoading(true));

    try {
      const response = await axios.get(API_URL, {
        params: {
          key: API_KEY,
          number: number.trim(),
          brand: selectedBrand,
          analogues: 'on',
        },
      });

      const goods = getGoods(response);

      const items = goods.flatMap((item) => [
        { ...item, isAnalogue: false },
        ...(Array.isArray(item.analogues)
          ? item.analogues.map((analogue) => ({
              ...analogue,
              isAnalogue: true,
            }))
          : []),
      ]);

      const uniqueItems = [
        ...new Map(
          items.map((item) => [
            item.goodsID || `${item.number}-${item.brand}`,
            item,
          ]),
        ).values(),
      ];

      dispatch(setResults(uniqueItems));
    } catch (error) {
      dispatch(setResults([]));
      dispatch(setError(getErrorMessage(error)));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="bg-light p-4 border rounded shadow-sm mb-4">
      <div className="mb-3">
        <label className="form-label fw-bold" htmlFor="article">
          Артикул
        </label>

        <input
          id="article"
          type="text"
          className="form-control"
          value={inputValue}
          onChange={handleNumberChange}
          placeholder="Введите артикул..."
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-bold" htmlFor="brand">
          Производитель
        </label>

        <select
          id="brand"
          className="form-select"
          value={brand}
          onChange={handleBrandChange}
          disabled={manufacturers.length === 0}
        >
          <option value="">Выберите производителя</option>

          {manufacturers.map((manufacturer) => (
            <option key={manufacturer} value={manufacturer}>
              {manufacturer}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SearchForm;
