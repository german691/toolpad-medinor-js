import dayjs from "dayjs";

export const formatDate = (v) => {
  let x = v;
  if (x && typeof x === "object" && "$date" in x) x = x.$date;
  const d = dayjs(x);
  return d.isValid() ? d.format("DD/MM/YYYY") : "";
};
