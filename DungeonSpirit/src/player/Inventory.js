import * as THREE from 'three';

export class Inventory {
    constructor(){
        // Items:
        // - name
        // - key: itemId
        // - value: item object with properties like name, description, quantity, etc.

        this.items = {};
        
    }

    addItem(item){
        if(!item.id || !item.name || !item.value) {
            console.error("Item must have an id and a name and a value.");
            return;
        }
        if(this.items[item.id]) {
            this.items[item.id].quantity += item.value.quantity;
        } else {
            this.items[item.id] = item;
        }
    }

    removeItem(itemId, quantity = 1) {
        if(this.items[itemId]) {
            this.items[itemId].quantity -= quantity;
            if(this.items[itemId].quantity <= 0) {
                delete this.items[itemId];
            }
        } else {
            console.error("Item not found in inventory.");
        }
    }

    getItem(itemId) {
        return this.items[itemId] || null;
    }
    getAllItems() {
        return Object.values(this.items);
    }
}