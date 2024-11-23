import axios from "axios";
import { useState, useEffect } from "react";

const Main = () => {
  const [elementData, setElementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Функция для получения данных от сервера
    const fetchElementData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/element-info"
        );
        setElementData(response.data.elementData);
        setLoading(false);
      } catch (err) {
        setError("Не удалось получить данные");
        setLoading(false);
      }
    };

    fetchElementData();
  }, []);

  if (loading) return <p>Загрузка данных...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      <div className="holy_block">
        <h1 className="holy_icon_txt">HOLY</h1>
        <img
          src="http://res.cloudinary.com/platon1gg/image/upload/v1725792416/r83m9a9pbrejwp3rmqjd.png"
          alt="holy_logo"
          className="holy_logo"
        />
      </div>
      <div className="info_buttons">
        <div className="burn">
          Burned:
          {elementData ? (
            <span id="burned_tokens">
              {161803398 - parseInt(elementData)} HOLY
            </span>
          ) : (
            <p>Данные не найдены</p>
          )}
        </div>
        <a href="https://dedust.io/swap/TON/EQAWVv2x6txoc5Nel9CltbfYSBMOOf0R9sb7GnqY-4ncmjcQ">
          <div className="button_buy">
            <p>Buy on DeDust.io</p>
            <img
              src="http://res.cloudinary.com/platon1gg/image/upload/v1725794381/zvz7e6qrztbct4qxxk86.svg"
              alt="dedust"
            />
          </div>
        </a>
      </div>
    </>
  );
};

export default Main;
