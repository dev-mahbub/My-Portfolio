export default function Toast({ message, isError }) {
  return <div className={`toast ${isError ? "error" : ""}`}>{message}</div>;
}
