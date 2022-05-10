import { Product } from "../types";
import { StorageWrapper } from "./StorageWrapper"; 
export class ProductStorage extends StorageWrapper { 

    constructor() {
        super("@RocketShoes:cart");
    }
    // get MAIN_STORAGE_NAME()  {
    //     return "@RocketShoes"
    // };

    // get CART_NAME () {
    //    return  `${this.MAIN_STORAGE_NAME}:cart`;
    // }

    save(products: Product[]): void { 
        this.setItemObject(products);
    }

    load(): Product[] | null {
        const cartProducts = this.getItemObject() as Product[];
        return cartProducts
    }
}