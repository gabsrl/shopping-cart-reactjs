import { Stock } from "../types";
import { api } from "./api";

const getAllStockData = () => api.get<Stock[]>("/stock");

export { 
    getAllStockData
};