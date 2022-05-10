import { Product } from "../types";
import { api } from "./api";

const getAllProducts = () => api.get(`/products`);

export { 
    getAllProducts
}