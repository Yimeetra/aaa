import { useEffect, useState } from "react";
import axios from "axios";

const Pools = () => {
  const [poolData, setPoolData] = useState({
    poolNames: [],
    poolTpr: [],
    poolHref: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Функция для получения данных от сервера
    const fetchPoolData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/pool-info"
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
      {poolData.poolNames.length > 0 && poolData.poolTpr.length > 0 ? (
        <div>
          {poolData.poolNames.map((poolName, index) => (
            <div class="itemRowStatic" key={index}>
              <div class="itemCellStatic">
                <span class="itemCellStatic">{poolName}</span>
              </div>

              <div class="itemCellStatic">
                <span class="itemCellStatic">{poolData.poolTpr[index]} %</span>
              </div>

              <div class="itemCellStatic">
                <a
                  href={poolData.poolHref[index]}
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
