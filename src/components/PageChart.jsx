import CandleChart from './CandleChart';
import SparklineChart from './SparklineChart';

export default function PageChart({ candleSeries = [], points = [], height = 240 }) {
  if (Array.isArray(candleSeries) && candleSeries.length > 0) {
    return <CandleChart seriesData={candleSeries} height={height} />;
  }
  return <SparklineChart points={points} height={Math.max(160, height - 40)} />;
}