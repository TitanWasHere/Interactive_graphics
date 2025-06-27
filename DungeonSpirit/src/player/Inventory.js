import * as THREE from 'three';

export class Inventory {
    constructor(){
        // Items:
        // - name
        // - key: itemId
        // - value: item object with properties like name, description, quantity, etc.

        this.items = {
            /*"1": {
                id: "1",
                name: "Key",
                description: "A small key that unlocks a door.",
                quantity: 1
            },*/
            "3":{
                id: "3",
                name: "sword",
                description: "A sharp sword that can be used to fight enemies.",
                quantity: 1
            },
            /*"2": {
                name: "Exit Key",
                description: "The key that unlocks the exit door.",
                quantity: 1,
                id: "2"
            }*/
        };
        
    }

    addItem(item){
        if(!item.id || !item.name) {
            console.error("Item must have an id and a name and a value.");
            return;
        }
        if(this.items[item.id]) {
            this.items[item.id].quantity += item.quantity;
        } else {
            this.items[item.id] = item;
            if(!this.items[item.id].quantity) {
                this.items[item.id].quantity = 1; 
            }
        }
        console.log("items:", this.items);
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

    hasItem(item){
        for (const key in this.items) {
            if (this.items[key].id === item || this.items[key].name === item) {
                return key;
            }
        }
    }

    getItem(itemId) {
        return this.items[itemId] || null;
    }
    getAllItems() {
        return Object.values(this.items);
    }
}