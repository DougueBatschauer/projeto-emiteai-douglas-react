import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from '@mui/material';

const CsvRelatorio = () => {
  const [loading, setLoading] = useState(false);
  const [reportId, setReportId] = useState(null);
  const [reportUrl, setReportUrl] = useState(localStorage.getItem("reportUrl") || "");

  useEffect(() => {
    if (reportUrl) {
      localStorage.setItem("reportUrl", reportUrl);
    } else {
      localStorage.removeItem("reportUrl");
    }
  }, [reportUrl]);

  const generateCsv = async () => {
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:8080/relatorio-csv/pessoa-fisica/gerar");
      setReportId(data.reportId);

      const interval = setInterval(async () => {
        const response = await axios.get(`http://localhost:8080/relatorio-csv/pessoa-fisica/check/${data.reportId}`);
        if (response.data.ready) {
          clearInterval(interval);
          setReportUrl(`http://localhost:8080/relatorio-csv/pessoa-fisica/get-relatorio/${data.reportId}`);
          setLoading(false);
        }
      }, 2000);
    } catch (error) {
      console.error("Erro ao solicitar relatório:", error);
      setLoading(false);
    }
  };

  const downloadCsv = () => {
    if (!reportUrl) {
        return;
    }

    const a = document.createElement("a");
    a.href = reportUrl;
    a.download = "report.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <Button onClick={generateCsv} disabled={loading}>
        {loading ? "Gerando..." : "Gerar Relatório"}
      </Button>

      {reportUrl && (
        <Button onClick={downloadCsv} className="mt-4">
           Baixar Relatório
        </Button>
      )}
    </div>
  );
};

export default CsvRelatorio;