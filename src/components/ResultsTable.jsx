import React from 'react';
import { useSelector } from 'react-redux';

const ResultsTable = () => {
  const { results, loading, error } = useSelector((state) => state.parts);

  if (loading) {
    return <div className="text-center p-5">Загрузка данных...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Ошибка: {error}
      </div>
    );
  }

  if (results.length === 0) {
    return <p className="text-muted p-3">Результаты не найдены.</p>;
  }

  const rows = results.flatMap((item) => {
    const warehouses = Array.isArray(item.warehouses) ? item.warehouses : [];

    if (warehouses.length === 0) {
      return [{ item, warehouse: null }];
    }

    return warehouses.map((warehouse) => ({
      item,
      warehouse,
    }));
  });

  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover border">
        <thead className="table-dark">
          <tr>
            <th>Название</th>
            <th>Артикул</th>
            <th>Производитель</th>
            <th>Склад</th>
            <th>Цена</th>
            <th>Остаток</th>
          </tr>
        </thead>

        <tbody>
          {rows.map(({ item, warehouse }, index) => (
            <tr
              key={`${item.goodsID || `${item.number}-${item.brand}`}-${warehouse?.id || index}`}
            >
              <td>
                {item.name || 'Без названия'}
                {item.isAnalogue && (
                  <span className="badge text-bg-info ms-2">Аналог</span>
                )}
              </td>

              <td>{item.number || '—'}</td>
              <td>{item.brand || '—'}</td>
              <td>{warehouse?.code || warehouse?.id || 'Нет данных'}</td>
              <td>
                {warehouse?.price != null
                  ? `${warehouse.price} ₽`
                  : 'Нет данных'}
              </td>
              <td>
                {warehouse?.stock != null
                  ? `${warehouse.stock} шт.`
                  : item.count != null
                    ? `${item.count} шт. (всего)`
                    : 'Нет данных'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsTable;
