import { useEffect, useState } from "react";
import axios from "axios";

const Pools = () => {
  const [poolData, setPoolData] = useState({
    pools: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  poolData.pools.sort((a, b) => b.apr - a.apr)

  useEffect(() => {
    // Функция для получения данных от сервера
    const fetchPoolData = async () => {
      try {
        const response = await axios.get(
          "http://31.129.44.155/api/pool-info"
        );
        setPoolData(response.data);
        setLoading(false);
      } catch (err) {
        setError("Не удалось получить данные");
        setLoading(false);
      }
    };

    fetchPoolData();
  }, []);

  if (loading) return <p>Загрузка данных...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div class="gridStatic" id="gridContainerStatic">
      {poolData.pools.length > 0 ? (
        <div>
          {poolData.pools.map((pool, index) => (
            <div class="itemRowStatic" key={index}>
              <div class="itemCellStatic">
                <span class="itemCellStatic">{pool.name}</span>
              </div>

              <div class="itemCellStatic">
                <span class="itemCellStatic">{pool.apr} %</span>
              </div>

              <div class="itemCellStatic">
                <a
                  href={pool.href}
                  target="_blank"
                  rel="noreferrer"
                  class="itemCellStatic"
                >
                  Link
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>Данные не найдены</p>
      )}
    </div>
  );
};

export default Pools;
