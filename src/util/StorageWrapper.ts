export abstract class StorageWrapper { 
    storageName: string;

    constructor(storageName: string) { 
        this.storageName = storageName;
    }

    setItemString(item: string): void { 
        localStorage.setItem(this.storageName, item);        
    }

    getItemString(): string | null { 
        return   localStorage.getItem(this.storageName);
    }

    setItemObject(item: Object) { 
        localStorage.setItem(this.storageName, JSON.stringify(item))
    }

    getItemObject(): any | null {
        const retrievedObject = localStorage.getItem(this.storageName);
        if (!retrievedObject) return null;
        return JSON.parse(retrievedObject);
    }

    clear(): void { 
        localStorage.clear()
    }
}